#!/usr/bin/env node

/**
 * HiStudy 데모 삭제(T2) 경로 문자열 검사 CLI
 *
 * 사용법:
 *   node scripts/demo-removal/check-route-links.mjs [--root DIR] [--report-only]
 *
 * 작업 트리에서 KEEP 진입점이 닿는 코드 파일의 경로 문자열을 라우트 표와 대조해
 * 삭제(예정) 라우트를 가리키는 것(del-route)과 어느 라우트에도 없는 것(missing)을 낸다.
 * 출력 첫 줄: del-route=<n> missing=<m> nav-missing=<k>
 * 이후 줄:   <file>:<line> <del-route|missing> <원문 리터럴>
 * exit: del-route>0 또는 nav-missing>0이면 1(--report-only면 0), 스크립트 오류는 2
 *
 * 계약의 원문은 docs/work-plans/histudy-demo-cleanup.md T003 Spec 1~6이다.
 * NOTE: 파일을 고치지 않는다(stdout 출력만). 라우트 표와 KEEP/DEL 분류는 graph.mjs에서 온다.
 */

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

const USAGE = 'usage: check-route-links.mjs [--root DIR] [--report-only]';

// Spec 1 — 라우트 표에 넣는 진입점(layout·not-found 등은 URL이 아니다)
const ROUTE_FILE_RE = /^(page|route)\.[^/]+$/;
// Spec 3 — 자산 제외(확장자 또는 접두)
const ASSET_EXT_RE =
  /\.(png|jpg|jpeg|gif|svg|webp|ico|css|scss|mp4|pdf|woff|woff2|ttf|json|txt|xml)$/i;
const ASSET_PREFIX_RE = /^\/(images|fonts|_next)\//;
// Spec 5 — nav-missing 집계 대상(D9: 헤더·푸터 데이터)
const NAV_FILES = new Set(['data/MegaMenu.json', 'data/footer.json']);
// ${…} 자리 표시(원문에 나올 수 없는 문자)
const DYN = String.fromCharCode(0);

function parseArgs(argv) {
  const opts = { reportOnly: false, root: null };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key === '--report-only') {
      opts.reportOnly = true;
    } else if (key === '--root') {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) {
        throw new Error('missing value for --root');
      }
      opts.root = value;
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

/** Spec 1 — 작업 트리의 page.*·route.* → URL 패턴과 T002 분류 */
function routeTable(workEntries) {
  return workEntries
    .filter((e) => ROUTE_FILE_RE.test(path.posix.basename(e.path)))
    .map((e) => ({
      class: e.class,
      segs: e.route
        .split('/')
        .filter((s) => s.length > 0)
        .map(routeSegment),
    }));
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

function classify(litSegs, routes) {
  let del = false;
  for (const r of routes) {
    if (!routeMatches(litSegs, r.segs)) continue;
    if (r.class === 'keep') return null;
    del = true;
  }
  return del ? 'del-route' : 'missing';
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
  const root = repoTopLevel(
    opts.root ? path.resolve(opts.root) : process.cwd()
  );
  const work = readWorkTree(root);
  const plan = computeDeletion(buildTagContext(readTagTree(root)), work);
  const routes = routeTable(plan.workEntries);

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
  const out = [
    `del-route=${delRoute} missing=${missing.length} nav-missing=${navMissing}`,
    ...findings.map((f) => `${f.file}:${f.line} ${f.kind} ${f.raw}`),
  ];
  process.stdout.write(out.join('\n') + '\n');
  if (opts.reportOnly) return 0;
  return delRoute > 0 || navMissing > 0 ? 1 : 0;
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
