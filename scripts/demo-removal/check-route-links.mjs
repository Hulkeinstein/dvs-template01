#!/usr/bin/env node

/**
 * HiStudy 데모 삭제(T2) 경로 문자열 검사 CLI
 *
 * 사용법:
 *   node scripts/demo-removal/check-route-links.mjs [--root DIR] [--report-only] [--baseline FILE]
 *
 * 작업 트리에서 KEEP 진입점이 닿는 코드 파일의 경로 문자열을 라우트 표와 대조해
 * 삭제(예정) 라우트를 가리키는 것(del-route)과 어느 라우트에도 없는 것(missing)을 낸다.
 * 유지 라우트는 작업 트리의 KEEP 진입점, 삭제 라우트는 태그 트리의 DEL 진입점에서 만든다.
 * 출력 첫 줄: del-route=<n> missing=<m> nav-missing=<k> (--baseline이면 끝에 new-missing=<j>)
 * 이후 줄:   <file>:<line> <del-route|missing|missing-new> <원문 리터럴>
 * --baseline FILE: 기준선 출력에 (파일, 리터럴) 쌍이 없는 missing을 missing-new로 표시한다
 * exit: del-route>0 · nav-missing>0 · new-missing>0 중 하나면 1(--report-only면 0), 스크립트 오류는 2
 *
 * 계약의 원문은 docs/work-plans/histudy-demo-cleanup.md T003 Spec 1~6이다.
 * NOTE: 파일을 고치지 않는다(stdout 출력만). 라우트 표와 KEEP/DEL 분류는 graph.mjs에서 온다.
 */

import fs from 'fs';
import path from 'path';
import {
  buildTagContext,
  byString,
  closure,
  computeDeletion,
  isCodeFile,
  isConsumer,
  readTagTree,
  readWorkTree,
  repoTopLevel,
  sorted,
} from './graph.mjs';

const USAGE =
  'usage: check-route-links.mjs [--root DIR] [--report-only] [--baseline FILE]';

// Spec 1 — 라우트 표에 넣는 진입점(layout·not-found 등은 URL이 아니다)
const ROUTE_FILE_RE = /^(page|route)\.[^/]+$/;
// Spec 3 — 자산 제외(확장자 또는 접두)
const ASSET_EXT_RE =
  /\.(png|jpg|jpeg|gif|svg|webp|ico|css|scss|mp4|pdf|woff|woff2|ttf|json|txt|xml)$/i;
const ASSET_PREFIX_RE = /^\/(images|fonts|_next)\//;
// Spec 5 — nav-missing 집계 대상(D9: 헤더·푸터 데이터)
const NAV_FILES = new Set(['data/MegaMenu.json', 'data/footer.json']);
// Spec 6 — --baseline 파일의 첫 줄(links-baseline.txt 형식)
const BASELINE_HEAD_RE = /^del-route=(\d+) missing=(\d+) nav-missing=(\d+)$/;
// ${…} 자리 표시(원문에 나올 수 없는 문자)
const DYN = String.fromCharCode(0);

function parseArgs(argv) {
  const opts = { reportOnly: false, root: null, baseline: null };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key === '--report-only') {
      opts.reportOnly = true;
    } else if (key === '--root' || key === '--baseline') {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) {
        throw new Error(`missing value for ${key}`);
      }
      opts[key.slice(2)] = value;
      i += 1;
    } else {
      throw new Error(`unknown option ${key}\n${USAGE}`);
    }
  }
  return opts;
}

/**
 * 라우트 세그먼트 하나의 패턴.
 * [[...x]] = 나머지 0개 이상, [...x] = 나머지 1개 이상, [x] = 동적 1세그먼트
 */
function routeSegment(seg) {
  if (/^\[\[\.\.\.[^\]]+\]\]$/.test(seg)) return { kind: 'rest', min: 0 };
  if (/^\[\.\.\.[^\]]+\]$/.test(seg)) return { kind: 'rest', min: 1 };
  if (/^\[[^\]]+\]$/.test(seg)) return { kind: 'param' };
  return { kind: 'static', value: seg };
}

/**
 * Spec 1 — 진입점 목록 중 T002 분류가 cls인 page.*·route.* → URL 패턴 목록.
 * 유지 라우트는 작업 트리, 삭제 라우트는 태그 트리 진입점으로 부른다. 화면 파일을 지운 뒤에도
 * 그 주소를 가리키는 링크가 missing이 아니라 del-route로 남아 게이트에 걸리게 하기 위해서다.
 */
function routeTable(entries, cls) {
  return entries
    .filter(
      (e) => e.class === cls && ROUTE_FILE_RE.test(path.posix.basename(e.path))
    )
    .map((e) =>
      e.route
        .split('/')
        .filter((s) => s.length > 0)
        .map(routeSegment)
    );
}

/** 백틱 안 `${`의 짝 `}` 위치(중첩 중괄호·문자열 고려), 없으면 -1 */
function exprEnd(line, from) {
  let depth = 1;
  for (let j = from; j < line.length; j += 1) {
    const c = line[j];
    if (c === "'" || c === '"' || c === '`') {
      const e = closeOf(line, j);
      if (e < 0) return -1;
      j = e;
    } else if (c === '{') {
      depth += 1;
    } else if (c === '}') {
      depth -= 1;
      if (depth === 0) return j;
    }
  }
  return -1;
}

/** start의 따옴표·백틱과 짝인 닫는 문자 위치(같은 줄), 없으면 -1 */
function closeOf(line, start) {
  const q = line[start];
  for (let j = start + 1; j < line.length; j += 1) {
    const c = line[j];
    if (c === '\\') {
      j += 1;
    } else if (c === q) {
      return j;
    } else if (q === '`' && c === '$' && line[j + 1] === '{') {
      const e = exprEnd(line, j + 2);
      if (e < 0) return -1;
      j = e;
    }
  }
  return -1;
}

/**
 * Spec 3 — 한 줄의 문자열 리터럴 내용을 왼쪽부터 짝 맞춰 꺼낸다.
 * 짝이 없는 따옴표(JSX 본문의 아포스트로피 등)는 리터럴 시작으로 보지 않는다.
 */
function literalsOf(line) {
  const out = [];
  let i = 0;
  while (i < line.length) {
    const c = line[i];
    if (c === "'" || c === '"' || c === '`') {
      const end = closeOf(line, i);
      if (end > i) {
        out.push(line.slice(i + 1, end));
        i = end + 1;
        continue;
      }
    }
    i += 1;
  }
  return out;
}

/** `${…}`를 자리 표시 하나로 바꾼다(식 안의 `?`·`#`이 경로를 자르지 않게) */
function maskExpressions(raw) {
  let out = '';
  for (let i = 0; i < raw.length; i += 1) {
    if (raw[i] === '$' && raw[i + 1] === '{') {
      const e = exprEnd(raw, i + 2);
      if (e > 0) {
        out += DYN;
        i = e;
        continue;
      }
    }
    out += raw[i];
  }
  return out;
}

/**
 * Spec 3 — 리터럴 원문 → 비교용 세그먼트. 검사 대상이 아니면 null.
 * 세그먼트: { dynamic: true } 또는 { dynamic: false, value }
 */
function literalPath(raw) {
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;
  if (raw === '/' || /\s/.test(raw)) return null;
  const cut = maskExpressions(raw).split(/[?#]/)[0];
  if (ASSET_EXT_RE.test(cut) || ASSET_PREFIX_RE.test(cut)) return null;
  return cut
    .split('/')
    .filter((s) => s.length > 0)
    .map((s) =>
      s.includes(DYN) || /^\[[^\]]+\]$/.test(s)
        ? { dynamic: true }
        : { dynamic: false, value: s }
    );
}

function segmentMatches(lit, route) {
  if (route.kind === 'param') return true;
  // 동적 리터럴 세그먼트는 값을 모르므로 동적 라우트 세그먼트하고만 맞다고 본다
  return !lit.dynamic && lit.value === route.value;
}

/** Spec 4 — 세그먼트 수가 다르면 불일치(나머지 라우트 세그먼트만 예외) */
function routeMatches(litSegs, routeSegs) {
  for (let i = 0; i < routeSegs.length; i += 1) {
    const r = routeSegs[i];
    if (r.kind === 'rest') return litSegs.length - i >= r.min;
    if (i >= litSegs.length || !segmentMatches(litSegs[i], r)) return false;
  }
  return litSegs.length === routeSegs.length;
}

/** Spec 4 — 유지 라우트 일치 → 보고 안 함, 삭제 라우트 일치 → del-route, 둘 다 아니면 missing */
function classify(litSegs, routes) {
  if (routes.keep.some((r) => routeMatches(litSegs, r))) return null;
  if (routes.del.some((r) => routeMatches(litSegs, r))) return 'del-route';
  return 'missing';
}

/** (파일, 리터럴) 비교 키. 둘 다 한 줄 안의 값이라 줄바꿈으로 이어도 겹치지 않는다 */
function pairKey(file, raw) {
  return `${file}\n${raw}`;
}

/**
 * Spec 6 — --baseline 파일의 missing (파일, 리터럴) 쌍. 줄 번호는 편집으로 바뀌므로 키에서 뺀다.
 * 형식이 어긋나거나 첫 줄 수치와 본문 줄 수가 다르면 오류(잘린 기준선을 조용히 쓰지 않는다).
 */
function readBaseline(file) {
  const lines = fs.readFileSync(file, 'utf8').replace(/\r/g, '').split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  const head = BASELINE_HEAD_RE.exec(lines[0] || '');
  if (!head) throw new Error(`baseline: unexpected first line in ${file}`);
  const counts = { delRoute: 0, missing: 0 };
  const pairs = new Set();
  for (const l of lines.slice(1)) {
    // <file>:<line> <kind> <raw> — raw·kind에는 공백이 없다(Spec 3)
    const rawAt = l.lastIndexOf(' ');
    const kindAt = rawAt > 0 ? l.lastIndexOf(' ', rawAt - 1) : -1;
    const loc = kindAt > 0 ? l.slice(0, kindAt) : '';
    const colon = loc.lastIndexOf(':');
    const kind = l.slice(kindAt + 1, rawAt);
    if (colon <= 0 || !/^\d+$/.test(loc.slice(colon + 1))) {
      throw new Error(`baseline: unexpected line in ${file}: ${l}`);
    }
    if (kind === 'del-route') {
      counts.delRoute += 1;
    } else if (kind === 'missing') {
      counts.missing += 1;
      pairs.add(pairKey(loc.slice(0, colon), l.slice(rawAt + 1)));
    } else {
      throw new Error(`baseline: unexpected kind in ${file}: ${l}`);
    }
  }
  if (
    counts.delRoute !== Number(head[1]) ||
    counts.missing !== Number(head[2])
  ) {
    throw new Error(`baseline: first line does not match body in ${file}`);
  }
  return pairs;
}

function isCommentLine(line) {
  const t = line.trimStart();
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*');
}

function scanFile(file, source, routes) {
  const findings = [];
  const lines = source.split('\n');
  for (let n = 0; n < lines.length; n += 1) {
    const line = lines[n].replace(/\r$/, '');
    if (isCommentLine(line)) continue;
    for (const raw of literalsOf(line)) {
      const segs = literalPath(raw);
      if (!segs) continue;
      const kind = classify(segs, routes);
      if (kind) findings.push({ file, line: n + 1, kind, raw });
    }
  }
  return findings;
}

function run(opts) {
  // 상대 경로는 실행 위치(cwd) 기준. --root와 무관하다
  const baseline = opts.baseline ? readBaseline(opts.baseline) : null;
  const root = repoTopLevel(
    opts.root ? path.resolve(opts.root) : process.cwd()
  );
  const work = readWorkTree(root);
  const tagCtx = buildTagContext(readTagTree(root));
  const plan = computeDeletion(tagCtx, work);
  // Spec 1 — 태그에만 남은 KEEP 진입점(작업 트리에서 사라짐)은 유지 라우트로 치지 않는다
  const routes = {
    keep: routeTable(plan.workEntries, 'keep'),
    del: routeTable(tagCtx.entries, 'del'),
  };

  // Spec 2 — KEEP 진입점이 닿는 코드 파일. 소비자 루트·삭제 대상(plan)은 스캔하지 않는다
  const deleteSet = new Set(plan.deleteFiles.map((f) => f.path));
  const keepEntries = plan.workEntries
    .filter((e) => e.class === 'keep')
    .map((e) => e.path);
  const scan = sorted(closure(plan.workGraph, keepEntries)).filter(
    (p) => isCodeFile(p) && !isConsumer(p) && !deleteSet.has(p)
  );

  const seen = new Set();
  const findings = [];
  for (const file of scan) {
    for (const f of scanFile(file, work.read(file), routes)) {
      const key = `${f.file}:${f.line} ${f.kind} ${f.raw}`;
      if (seen.has(key)) continue;
      seen.add(key);
      findings.push(f);
    }
  }
  findings.sort(
    (a, b) =>
      byString(a.file, b.file) ||
      a.line - b.line ||
      byString(a.kind, b.kind) ||
      byString(a.raw, b.raw)
  );

  const delRoute = findings.filter((f) => f.kind === 'del-route').length;
  const missing = findings.filter((f) => f.kind === 'missing');
  const navMissing = missing.filter((f) => NAV_FILES.has(f.file)).length;
  // Spec 6 — 기준선에 없는 missing. 정렬은 원래 분류로 한 뒤 표시만 바꾼다(--baseline 없는 출력과 순서 동일)
  const isNew = (f) =>
    baseline !== null &&
    f.kind === 'missing' &&
    !baseline.has(pairKey(f.file, f.raw));
  const newMissing = missing.filter(isNew).length;
  const head = `del-route=${delRoute} missing=${missing.length} nav-missing=${navMissing}`;
  const out = [
    baseline ? `${head} new-missing=${newMissing}` : head,
    ...findings.map(
      (f) => `${f.file}:${f.line} ${isNew(f) ? 'missing-new' : f.kind} ${f.raw}`
    ),
  ];
  process.stdout.write(out.join('\n') + '\n');
  if (opts.reportOnly) return 0;
  return delRoute > 0 || navMissing > 0 || newMissing > 0 ? 1 : 0;
}

function main() {
  try {
    return run(parseArgs(process.argv.slice(2)));
  } catch (err) {
    console.error(err.message);
    return 2;
  }
}

process.exitCode = main();
