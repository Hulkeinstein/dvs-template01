/**
 * HiStudy 데모 삭제(T2) 판정 공용 모듈
 *
 * 목적: 트리 읽기(태그 트리·작업 트리) · import 해석 · 진입점 분류 · 도달 계산 ·
 * 삭제 판정을 한 곳에 둔다. route-map.mjs와 이후 검사 스크립트가 재사용한다.
 * 계약의 원문은 docs/work-plans/histudy-demo-cleanup.md T002 Spec 1~11이다.
 *
 * NOTE: 이 모듈은 파일을 지우거나 고치지 않는다. 목록만 계산한다.
 * NOTE: Node 20 내장 모듈만 쓴다. 출력에 시각·절대 경로·사용자명을 넣지 않는다.
 */

import { execFileSync } from 'child_process';
import { builtinModules } from 'module';
import fs from 'fs';
import path from 'path';

export const TAG = 'pre-demo-removal';

// Spec 3 — 코드 파일 확장자
const CODE_EXT_RE = /\.(js|jsx|ts|tsx|mjs|json)$/;
// Spec 3 — 해석 대상 폴더
const RESOLVE_DIRS = [
  'app',
  'components',
  'context',
  'redux',
  'hooks',
  'lib',
  'constants',
  'data',
  'types',
  'mdx',
];
// Spec 3 — 소비자 루트(여기서 닿는 파일은 유지)
const CONSUMER_RE =
  /^(scripts\/|__tests__\/|tests\/|jest\.setup\.[^/]+$)|(^|\/)__tests__\//;
// Spec 4 — 확장자 해석 순서. Next 14 webpack resolve.extensions와 같다
// (node_modules/next/dist/build/webpack-config.js resolveConfig.extensions).
// 같은 이름의 .js와 .tsx가 공존하면 .js가 이긴다.
const RESOLVE_EXTS = ['.js', '.mjs', '.tsx', '.ts', '.jsx', '.json'];
// Spec 4 — import 인식 정규식(선행 계산 스크립트와 같음) + jest.mock 문자열 경로
const IMPORT_RE =
  /(?:import\s[^'"]*?from\s*|import\s*\(\s*|require\s*\(\s*|export\s[^'"]*?from\s*|import\s*)['"]([^'"]+)['"]/g;
const JEST_MOCK_RE = /jest\.mock\(\s*['"]([^'"]+)['"]/g;
// 해석 실패 중 이미지·스타일 등 자산으로 보는 확장자(unresolvedNonAsset 산출용)
const ASSET_RE =
  /\.(png|jpe?g|gif|svg|webp|avif|ico|bmp|css|scss|sass|less|mp4|webm|mp3|pdf|woff2?|ttf|otf|eot)$/i;
// Spec 5 — 진입점
const ENTRY_RE =
  /^app\/(?:.*\/)?(page|layout|route|not-found|loading|error|template|default)\.(js|jsx|ts|tsx)$/;
// Spec 6 — 분류(사용자 확정). 맞으면 DEL, 아니면 KEEP. 규칙으로만 판정한다.
const DEL_RULES = [
  { group: 'numbered-home', phase: 3, re: /^app\/(0[2-9]|1\d|2\d)-/ },
  { group: 'elements', phase: 4, re: /^app\/\(elements\)\// },
  {
    group: 'pages',
    phase: 4,
    re: /^app\/\(pages\)\/(about-us-02|academy-gallery|admission-guide|event-[^/]+|shop|single-product|subscription|my-account)\//,
  },
  {
    group: 'courses',
    phase: 4,
    re: /^app\/\(courses\)\/(course-detail-[2-8]|course-card-[23]|course-filter-[^/]+|course-with-tab|course-with-sidebar|course-masonry|course-withtab-two)\//,
  },
  {
    group: 'quiz',
    phase: 4,
    re: /^app\/\(courses\)\/\(lessons\)\/(all-questions|pagination-quiz|questions-types|quiz-with-custom-timer|quiz-with-point|single-question)\//,
  },
  {
    group: 'lesson',
    phase: 5,
    re: /^app\/\(courses\)\/\(lessons\)\/(lesson\/page|lesson-intro|lesson-quiz\/|lesson-quiz-result|lesson-assignments)/,
  },
  { group: 'profile', phase: 5, re: /^app\/\(pages\)\/profile\// },
  { group: 'blog', phase: 6, re: /^app\/\(blogs\)\// },
];
// Spec 7 — 편집으로 생긴 고아(DEL 진입점에서도 닿지 않음)의 Phase
export const ORPHAN_PHASE = 7;
// Spec 7 — 삭제 허용 루트(섹션 폴더 외)
const DELETE_ROOT_RE = /^(components|data|mdx)\//;
// Spec 7 — 런타임 읽기 규칙: mdx/index.js가 fs로 data/blog를 읽는다(import 그래프에 안 보임)
const RUNTIME_READERS = [{ reader: 'mdx/index.js', prefix: 'data/blog/' }];

const BUILTINS = new Set(builtinModules);

/** 결정성: 로캘과 무관한 코드 단위 정렬 */
export function byString(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function sorted(iterable) {
  return [...iterable].sort(byString);
}

function git(cwd, args, input) {
  return execFileSync('git', ['-C', cwd, ...args], {
    input,
    maxBuffer: 1024 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'inherit'],
  });
}

function splitZ(buf) {
  return buf
    .toString('utf8')
    .split('\0')
    .filter((s) => s.length > 0);
}

export function repoTopLevel(cwd) {
  return git(cwd, ['rev-parse', '--show-toplevel']).toString('utf8').trim();
}

export function isCodeFile(p) {
  return CODE_EXT_RE.test(p);
}

export function isConsumer(p) {
  return CONSUMER_RE.test(p);
}

/** Spec 4 — 소스에서 import 지정자만 뽑는다(순서 보존). buildGraph와 render-doc.mjs가 재사용. */
export function extractImportSpecs(src) {
  const specs = [];
  const seen = new Set();
  for (const re of [IMPORT_RE, JEST_MOCK_RE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src))) {
      if (!seen.has(m[1])) {
        seen.add(m[1]);
        specs.push(m[1]);
      }
    }
  }
  return specs;
}

/** 그래프 노드(해석 대상 폴더 또는 소비자 루트 안의 코드 파일) */
function isScanned(p) {
  if (!isCodeFile(p)) return false;
  return RESOLVE_DIRS.includes(p.split('/')[0]) || isConsumer(p);
}

/**
 * 태그 트리(Spec 2): git ls-tree + git cat-file --batch. 작업 트리 파일은 읽지 않는다.
 */
export function readTagTree(cwd) {
  const baseCommit = git(cwd, ['rev-parse', `${TAG}^{commit}`])
    .toString('utf8')
    .trim();
  const files = sorted(
    splitZ(git(cwd, ['ls-tree', '-r', '-z', '--name-only', TAG]))
  );
  const wanted = files.filter((p) => isScanned(p) && !p.endsWith('.json'));
  const input = wanted.map((p) => `${baseCommit}:${p}\n`).join('');
  const out = git(cwd, ['cat-file', '--batch'], input);
  const contents = new Map();
  let pos = 0;
  for (const p of wanted) {
    const nl = out.indexOf(0x0a, pos);
    const header = out.toString('utf8', pos, nl).split(' ');
    if (header.length !== 3 || header[1] !== 'blob') {
      throw new Error(`cat-file: unexpected header for ${p}`);
    }
    const size = Number(header[2]);
    contents.set(p, out.toString('utf8', nl + 1, nl + 1 + size));
    pos = nl + 1 + size + 1;
  }
  return {
    kind: 'tag',
    baseCommit,
    files,
    fileSet: new Set(files),
    read: (p) => contents.get(p),
  };
}

/**
 * 작업 트리(Spec 2): --root의 git ls-files + 파일 읽기.
 * 디스크에서 지워졌지만 index에 남은 파일(ls-files --deleted)은 작업 트리에 없는 것으로 본다.
 */
export function readWorkTree(root) {
  const deleted = new Set(splitZ(git(root, ['ls-files', '-z', '--deleted'])));
  const files = sorted(
    splitZ(git(root, ['ls-files', '-z'])).filter((p) => !deleted.has(p))
  );
  return {
    kind: 'work',
    files,
    fileSet: new Set(files),
    read: (p) => fs.readFileSync(path.join(root, p), 'utf8'),
  };
}

function packageName(spec) {
  const bare = spec.startsWith('node:') ? spec.slice(5) : spec;
  const parts = bare.split('/');
  const name = bare.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];
  if (BUILTINS.has(name) || spec.startsWith('node:')) return null;
  return name;
}

/**
 * import 그래프(Spec 3·4).
 * @returns {{ nodes: string[], deps: Map<string,string[]>, packages: Map<string,string[]>, unresolved: {from:string,spec:string,asset:boolean}[] }}
 */
export function buildGraph(tree) {
  const nodes = tree.files.filter(isScanned);
  const nodeSet = new Set(nodes);
  const deps = new Map();
  const packages = new Map();
  const unresolved = [];

  const resolve = (from, spec) => {
    let base;
    if (spec.startsWith('@/')) base = path.posix.normalize(spec.slice(2));
    else if (spec === '.' || spec === '..' || /^\.\.?\//.test(spec)) {
      base = path.posix.normalize(
        path.posix.join(path.posix.dirname(from), spec)
      );
    } else if (spec.startsWith('/')) return undefined;
    else return null; // bare specifier(npm 패키지)
    if (base.startsWith('../')) return undefined;
    if (nodeSet.has(base)) return base;
    for (const ext of RESOLVE_EXTS) {
      if (nodeSet.has(base + ext)) return base + ext;
    }
    for (const ext of RESOLVE_EXTS) {
      if (nodeSet.has(`${base}/index${ext}`)) return `${base}/index${ext}`;
    }
    return undefined;
  };

  for (const f of nodes) {
    if (f.endsWith('.json')) {
      deps.set(f, []);
      packages.set(f, []);
      continue;
    }
    const src = tree.read(f);
    const specs = new Set(extractImportSpecs(src));
    const out = new Set();
    const pkgs = new Set();
    for (const spec of sorted(specs)) {
      const r = resolve(f, spec);
      if (r === null) {
        const name = packageName(spec);
        if (name) pkgs.add(name);
      } else if (r === undefined) {
        unresolved.push({ from: f, spec, asset: ASSET_RE.test(spec) });
      } else if (r !== f) {
        out.add(r);
      }
    }
    deps.set(f, sorted(out));
    packages.set(f, sorted(pkgs));
  }
  unresolved.sort(
    (a, b) => byString(a.from, b.from) || byString(a.spec, b.spec)
  );
  return { nodes, deps, packages, unresolved };
}

/** starts에서 import로 닿는 파일 전부(시작 파일 포함) */
export function closure(graph, starts) {
  const seen = new Set();
  const stack = [];
  for (const s of starts) {
    if (!seen.has(s)) {
      seen.add(s);
      stack.push(s);
    }
  }
  while (stack.length) {
    for (const d of graph.deps.get(stack.pop()) || []) {
      if (!seen.has(d)) {
        seen.add(d);
        stack.push(d);
      }
    }
  }
  return seen;
}

/** app 경로의 URL 패턴: (group) 세그먼트 제거 */
function routeOfDir(dir) {
  const segs = dir
    .split('/')
    .slice(1)
    .filter((s) => s && !/^\(.*\)$/.test(s));
  return '/' + segs.join('/');
}

/** Spec 5·6 — 진입점 목록과 분류 */
export function listEntries(tree) {
  return tree.files
    .filter((p) => ENTRY_RE.test(p))
    .map((p) => {
      const rule = DEL_RULES.find((r) => r.re.test(p));
      return {
        path: p,
        class: rule ? 'del' : 'keep',
        group: rule ? rule.group : 'keep',
        phase: rule ? rule.phase : null,
        route: routeOfDir(path.posix.dirname(p)),
      };
    });
}

/** 섹션 폴더 = app 아래 첫 번째 비그룹 세그먼트까지(동적 하위 라우트 포함) */
function sectionDirOf(entryPath) {
  const segs = entryPath.split('/').slice(1, -1);
  const i = segs.findIndex((s) => !/^\(.*\)$/.test(s));
  if (i < 0) return path.posix.dirname(entryPath);
  return ['app', ...segs.slice(0, i + 1)].join('/');
}

function under(dir, p) {
  return p.startsWith(dir + '/');
}

function runtimeReadFiles(tree, reached) {
  const out = [];
  for (const { reader, prefix } of RUNTIME_READERS) {
    if (reached.has(reader)) {
      out.push(...tree.files.filter((p) => p.startsWith(prefix)));
    }
  }
  return out;
}

/**
 * 태그 기준 컨텍스트: 진입점 분류, 태그 시점 도달 집합, 섹션(Spec 9).
 * 섹션은 DEL 진입점만으로 만든다. keepMixed = 같은 폴더 아래 KEEP 진입점이 있는지.
 */
export function buildTagContext(tree) {
  const graph = buildGraph(tree);
  const entries = listEntries(tree);
  const keepEntries = entries.filter((e) => e.class === 'keep');
  const delEntries = entries.filter((e) => e.class === 'del');
  const consumers = graph.nodes.filter(isConsumer);
  const reachFromEntries = closure(
    graph,
    entries.map((e) => e.path)
  );
  const reachFromAll = closure(graph, [
    ...entries.map((e) => e.path),
    ...consumers,
  ]);

  const byDir = new Map();
  for (const e of delEntries) {
    const dir = sectionDirOf(e.path);
    if (!byDir.has(dir)) byDir.set(dir, []);
    byDir.get(dir).push(e);
  }
  const sections = sorted(byDir.keys()).map((dir) => {
    const list = byDir.get(dir);
    const entryPaths = sorted(list.map((e) => e.path));
    const reached = closure(graph, entryPaths);
    const reach = new Set(reached);
    for (const p of runtimeReadFiles(tree, reached)) reach.add(p);
    for (const p of entryPaths) reach.delete(p);
    return {
      dir,
      route: routeOfDir(dir),
      phase: Math.max(...list.map((e) => e.phase)),
      entries: entryPaths,
      reachFiles: sorted(reach),
      keepMixed: keepEntries.some((k) => under(dir, k.path)),
    };
  });

  return {
    tree,
    graph,
    entries,
    sections,
    reachFromEntries,
    reachFromAll,
  };
}

/**
 * Spec 7·8 — 삭제 판정. work가 태그 컨텍스트와 같은 트리면 map의 deleteFiles가 된다.
 * f가 삭제 대상 ⇔ (a) DEL 진입점이거나, 지금 KEEP 진입점·소비자에서 도달 불가이면서
 * 태그 시점에 어떤 진입점에서든 도달 가능했던 코드 파일 · (b) 삭제 허용 루트 안.
 */
export function computeDeletion(tagCtx, work) {
  const workGraph = work === tagCtx.tree ? tagCtx.graph : buildGraph(work);
  const workEntries = listEntries(work);
  const consumers = workGraph.nodes.filter(isConsumer);
  const keepReach = closure(workGraph, [
    ...workEntries.filter((e) => e.class === 'keep').map((e) => e.path),
    ...consumers,
  ]);

  // Spec 8 — 파일에 닿는(지금 트리 기준) DEL 진입점 Phase의 최댓값
  const delPhase = new Map();
  for (const e of workEntries.filter((x) => x.class === 'del')) {
    for (const p of closure(workGraph, [e.path])) {
      delPhase.set(p, Math.max(delPhase.get(p) || 0, e.phase));
    }
  }
  const delEntrySet = new Set(
    workEntries.filter((e) => e.class === 'del').map((e) => e.path)
  );

  const del = new Map();
  const blockedByKeep = [];
  const notDeletedCandidates = [];
  for (const f of work.files) {
    const section = tagCtx.sections.find((s) => under(s.dir, f));
    const pureSection = section && !section.keepMixed ? section : null;
    const reachedAtTag = tagCtx.reachFromEntries.has(f);
    const isDelEntry = delEntrySet.has(f);

    if (keepReach.has(f)) {
      // 유지 진입점·소비자가 쓰는 파일은 어떤 규칙으로도 지우지 않는다(G1).
      // 삭제 범위(DEL 진입점·DEL 전용 섹션 폴더)에 있으면 기록해 드러낸다.
      if (isDelEntry || pureSection) blockedByKeep.push(f);
      continue;
    }
    const a = isDelEntry || (isCodeFile(f) && reachedAtTag);
    let reason = null;
    if (isDelEntry) reason = 'del-entry';
    else if (pureSection) reason = 'del-section';
    else if (a && (section || DELETE_ROOT_RE.test(f))) reason = 'unreachable';
    else if (a) notDeletedCandidates.push(f);
    if (!reason) continue;

    let phase = delPhase.get(f) || 0;
    if (pureSection) phase = Math.max(phase, pureSection.phase);
    del.set(f, { path: f, phase: phase || ORPHAN_PHASE, reason });
  }

  // Spec 7 — 런타임 읽기 규칙
  for (const { reader, prefix } of RUNTIME_READERS) {
    const r = del.get(reader);
    if (!r) continue;
    for (const f of work.files.filter((p) => p.startsWith(prefix))) {
      const cur = del.get(f);
      if (cur) cur.phase = Math.max(cur.phase, r.phase);
      else del.set(f, { path: f, phase: r.phase, reason: 'runtime-read' });
    }
  }

  return {
    workGraph,
    workEntries,
    keepReach,
    deleteFiles: sorted(del.keys()).map((p) => del.get(p)),
    notDeletedCandidates: sorted(notDeletedCandidates),
    blockedByKeep: sorted(blockedByKeep),
  };
}

/** 이미지·스타일 외 해석 실패 수 */
export function countNonAsset(unresolved) {
  return unresolved.filter((u) => !u.asset).length;
}
