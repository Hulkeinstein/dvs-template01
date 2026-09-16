#!/usr/bin/env node

/**
 * HiStudy 데모 삭제(T2) 매핑 문서 생성기
 *
 * 사용법:
 *   node scripts/demo-removal/render-doc.mjs --date YYYY-MM-DD --links FILE [--final]
 *
 * `.tmp/demo-removal/route-map.json`(route-map.mjs map의 출력)과 `--links` 경로 검사 결과를
 * 읽어 `docs/library/histudy-demo-removal.md`를 생성한다. 삭제 집합은 기본(계획본)은
 * route-map.json의 `deleteFiles`, `--final`은 `pre-demo-removal` 태그 대비 실제 git diff의
 * 삭제(D) 파일이다.
 *
 * 계약의 원문은 docs/work-plans/histudy-demo-cleanup.md T004 "문서 구조 계약" 1~12이다.
 * NOTE: 이 파일이 문서의 유일한 생성 경로다 — 산출물(docs/library/histudy-demo-removal.md)을
 * 손으로 고치지 않는다. 손으로 고칠 게 있으면 이 생성기를 고친다.
 * NOTE: 결정성 — 같은 입력이면 같은 바이트를 낸다. 시각·절대 경로·사용자명을 넣지 않는다.
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import {
  TAG,
  extractImportSpecs,
  isCodeFile,
  repoTopLevel,
  sorted,
} from './graph.mjs';

const USAGE =
  'usage: render-doc.mjs --date YYYY-MM-DD --links FILE [--final] [--out FILE]';
const OUT_REL = 'docs/library/histudy-demo-removal.md';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// (B) 실데이터 코드 판정 — import 지정자 접두사(하나라도 시작하면 실데이터로 본다)
const REAL_DATA_IMPORT_STARTS = [
  '@/app/lib/supabase',
  '@/app/lib/actions',
  '@/app/lib/services',
  'next-auth',
];
// (B) 정확히 일치해야 하는 지정자
const REAL_DATA_IMPORT_EXACT = new Set(['@supabase/supabase-js']);
// (B) 본문에 Supabase 테이블 조회(`.from('table')`)가 있으면 실데이터로 본다
const SUPABASE_FROM_RE = /\.from\(\s*['"]([A-Za-z_]+)['"]\s*\)/;

// Spec 5 (check-route-links.mjs와 동일) — 헤더·푸터 데이터는 nav-missing으로 따로 집계된다
const NAV_FILES = new Set(['data/MegaMenu.json', 'data/footer.json']);

// 그룹(삭제 Phase) 표시 순서·제목 — route-map.json sections[].phase는 3|4|5|6 고정
const PHASE_GROUPS = [
  { phase: 3, title: '번호 데모 홈' },
  { phase: 4, title: '요소·페이지·코스·퀴즈 데모' },
  { phase: 5, title: 'lesson 데모·profile' },
  { phase: 6, title: '블로그' },
];

function parseArgs(argv) {
  const opts = { date: null, links: null, final: false, out: null };
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key === '--final') {
      opts.final = true;
      continue;
    }
    if (key === '--date' || key === '--links' || key === '--out') {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) {
        throw new Error(`missing value for ${key}\n${USAGE}`);
      }
      opts[key.slice(2)] = value;
      i += 1;
      continue;
    }
    throw new Error(`unknown option ${key}\n${USAGE}`);
  }
  if (!opts.date || !opts.links) throw new Error(USAGE);
  if (!DATE_RE.test(opts.date)) {
    throw new Error(`--date must be YYYY-MM-DD, got ${opts.date}`);
  }
  return opts;
}

function git(root, args) {
  return execFileSync('git', ['-C', root, ...args], {
    maxBuffer: 1024 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'inherit'],
  }).toString('utf8');
}

function gitLines(root, args) {
  return sorted(
    git(root, args)
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
  );
}

function readRouteMap(root) {
  const file = path.join(root, '.tmp/demo-removal/route-map.json');
  if (!fs.existsSync(file)) {
    throw new Error(
      `missing ${path.relative(root, file)} — run: node scripts/demo-removal/route-map.mjs map`
    );
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/** --links 파일: 첫 줄 헤더 제외, `<file>:<line> <kind> <raw>` 줄만 파싱 */
function readLinks(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const lines = raw.split('\n').filter((l) => l.length > 0);
  const entries = [];
  for (const line of lines.slice(1)) {
    const m = line.match(/^(.+):(\d+) (del-route|missing) (.*)$/);
    if (!m) continue;
    entries.push({ file: m[1], line: Number(m[2]), kind: m[3], raw: m[4] });
  }
  return entries;
}

/** 계획본: route-map.json의 deleteFiles. --final: 실제 git diff 삭제(D) 파일 */
function buildDeleteFiles(root, routeMap, final) {
  if (!final) return routeMap.deleteFiles;
  const phaseByPath = new Map(
    routeMap.deleteFiles.map((f) => [f.path, f.phase])
  );
  const paths = gitLines(root, [
    'diff',
    '--name-only',
    '--diff-filter=D',
    `${TAG}^{commit}`,
    'HEAD',
    '--',
    'app',
    'components',
    'data',
    'mdx',
  ]);
  return paths.map((p) => ({
    path: p,
    phase: phaseByPath.has(p) ? phaseByPath.get(p) : null,
    reason: phaseByPath.has(p) ? 'plan' : 'final-only',
  }));
}

/** 되살릴 때 알아둘 점 (a) — 계획본은 아직 없음, --final은 실제 수정된 유지 파일 목록 */
function modifiedKeepFiles(root, final) {
  if (!final) return null;
  return gitLines(root, [
    'diff',
    '--name-only',
    '--diff-filter=M',
    `${TAG}^{commit}`,
    'HEAD',
    '--',
    'app',
    'components',
    'data',
    'mdx',
  ]);
}

/** 되살릴 때 알아둘 점 (e) — 계획본은 아직 없음, --final은 .prettierignore에서 빠진 줄 */
function removedPrettierIgnoreLines(root, final) {
  if (!final) return null;
  const raw = git(root, [
    'diff',
    `${TAG}^{commit}`,
    'HEAD',
    '--',
    '.prettierignore',
  ]);
  const removed = [];
  for (const line of raw.split('\n')) {
    if (line.startsWith('---') || line.startsWith('+++')) continue;
    if (line.startsWith('-')) {
      const value = line.slice(1).trim();
      if (value) removed.push(value);
    }
  }
  return sorted(removed);
}

/**
 * (A) 되살릴 때 알아둘 점 — 태그 대비 현재 작업 트리에서 내용이 바뀐 공유 파일.
 * HEAD가 아니라 작업 트리와 비교한다(커밋 안 된 변경 포함). --final 여부와 무관하게 항상 계산한다.
 */
function modifiedSharedFilesFromTag(root) {
  return new Set(
    gitLines(root, [
      'diff',
      '--name-only',
      '--diff-filter=M',
      `${TAG}^{commit}`,
      '--',
      'app',
      'components',
      'data',
      'mdx',
    ])
  );
}

/** 태그 시점 소스를 읽는다(작업 트리 파일은 읽지 않는다 — 삭제 후에도 같은 결과) */
function readTagSource(root, filePath) {
  return git(root, ['show', `${TAG}:${filePath}`]);
}

/**
 * (B) 실데이터 코드 판정. import 지정자 또는 `.from('table')` 본문 패턴 중 하나라도 맞으면
 * 실데이터로 보고 근거(첫 1건)를 반환한다. 아니면 null.
 */
function classifyRealDataFile(root, filePath) {
  if (!isCodeFile(filePath)) return null;
  const src = readTagSource(root, filePath);
  const specs = extractImportSpecs(src);
  const matchedImport = specs.find(
    (s) =>
      REAL_DATA_IMPORT_EXACT.has(s) ||
      REAL_DATA_IMPORT_STARTS.some((prefix) => s.startsWith(prefix))
  );
  if (matchedImport) return { evidence: matchedImport };
  const tableMatch = src.match(SUPABASE_FROM_RE);
  if (tableMatch) return { evidence: `from('${tableMatch[1]}')` };
  return null;
}

function computeSectionView(section, deleteSet) {
  const dirPrefix = `${section.dir}/`;
  const entryFiles = section.entries;
  const entrySet = new Set(entryFiles);
  const underDir = sorted(
    [...deleteSet].filter((p) => p.startsWith(dirPrefix))
  );
  const reachDeleted = section.reachFiles.filter((p) => deleteSet.has(p));
  const reachDeletedSet = new Set(reachDeleted);
  const reachKept = section.reachFiles.filter(
    (p) =>
      (p.startsWith('components/') || p.startsWith('data/')) &&
      !deleteSet.has(p)
  );
  const componentsDeleted = reachDeleted.filter((p) =>
    p.startsWith('components/')
  );
  const dataDeleted = reachDeleted.filter((p) => p.startsWith('data/'));
  // (B) 섹션 폴더 안에 있지만 그 섹션 진입점에서 import로 닿지 않던 삭제 파일
  const folderOnly = underDir.filter(
    (p) => !entrySet.has(p) && !reachDeletedSet.has(p)
  );
  const restoreSet = sorted(
    new Set([...entryFiles, ...underDir, ...reachDeleted])
  );
  return {
    entryFiles,
    componentsDeleted,
    dataDeleted,
    folderOnly,
    reachKept,
    restoreSet,
  };
}

// ---- markdown 조립 helper -------------------------------------------------

function heading(level, text) {
  return `${'#'.repeat(level)} ${text}`;
}

function bulletList(items) {
  return items.map((p) => `- ${p}`).join('\n');
}

/**
 * 항상 chunk 배열을 반환한다(빈 목록은 한 줄, 있으면 라벨+목록 두 chunk).
 * 라벨 끝의 `:`는 장식이 아니라 MD036(순수 emphasis 줄을 제목으로 오인)을 피하기 위한 것 —
 * markdownlint-cli2가 emphasis 바로 뒤 구두점이 있으면 제목 후보로 보지 않는다.
 */
function labeledList(label, items, emptyText = '없음') {
  if (items.length === 0) return [`**${label}**: ${emptyText}`];
  return [`**${label}**:`, bulletList(items)];
}

/** labeledList와 같으나 항목마다 접미사를 붙인다(예: ` — T2에서 수정됨`) */
function labeledListWithSuffix(label, items, suffixFn, emptyText = '없음') {
  if (items.length === 0) return [`**${label}**: ${emptyText}`];
  return [`**${label}**:`, bulletList(items.map((p) => `${p}${suffixFn(p)}`))];
}

function restoreCommandBlock(paths) {
  const lines = ['git checkout pre-demo-removal -- \\'];
  paths.forEach((p, i) => {
    const isLast = i === paths.length - 1;
    lines.push(`  '${p}'${isLast ? '' : ' \\'}`);
  });
  return ['```bash', ...lines, '```'].join('\n');
}

function frontMatter(opts) {
  const lifecycle = opts.final ? 'active' : 'draft';
  const progressTag = opts.final
    ? 'progress/completed'
    : 'progress/in-progress';
  return [
    '---',
    'title: "HiStudy 데모 삭제 기록 (T2)"',
    'tags:',
    '  - type/docs',
    '  - component/ui',
    `  - ${progressTag}`,
    'created: 2026-09-16',
    `updated: ${opts.date}`,
    `lifecycle: ${lifecycle}`,
    '---',
  ].join('\n');
}

function build(root, opts) {
  const routeMap = readRouteMap(root);
  const links = readLinks(opts.links);
  const deleteFiles = buildDeleteFiles(root, routeMap, opts.final);
  const deleteSet = new Set(deleteFiles.map((f) => f.path));

  const sectionViews = new Map();
  for (const section of routeMap.sections) {
    sectionViews.set(section.route, computeSectionView(section, deleteSet));
  }

  const claimed = new Set();
  for (const view of sectionViews.values()) {
    for (const p of view.restoreSet) claimed.add(p);
  }
  const orphanFiles = sorted([...deleteSet].filter((p) => !claimed.has(p)));

  // (B) 실데이터 코드가 들어 있던 삭제 파일 — import 지정자·Supabase 테이블 조회 판정
  const realDataFiles = deleteFiles
    .map((f) => {
      const hit = classifyRealDataFile(root, f.path);
      if (!hit) return null;
      const owningSections = sorted(
        [...sectionViews.entries()]
          .filter(([, view]) => view.restoreSet.includes(f.path))
          .map(([route]) => route)
      );
      const importedAtDeletion = routeMap.sections.some((s) =>
        s.reachFiles.includes(f.path)
      );
      return {
        path: f.path,
        sections: owningSections,
        evidence: hit.evidence,
        imported: importedAtDeletion,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  const generateCmd = [
    'node scripts/demo-removal/render-doc.mjs',
    `--date ${opts.date}`,
    `--links ${opts.linksArg}`,
    opts.final ? '--final' : null,
    opts.out ? `--out ${opts.out}` : null,
  ]
    .filter(Boolean)
    .join(' ');

  const modifiedSharedSet = modifiedSharedFilesFromTag(root);

  const chunks = [];

  // ## 개요
  chunks.push(heading(2, '개요'));
  chunks.push(
    'HiStudy 데모 화면(번호 데모 홈·요소·페이지·코스·퀴즈·lesson·profile·블로그)을 걷어내면서, ' +
      '어떤 화면이 어떤 컴포넌트·데이터를 함께 썼는지와 되살리는 명령을 기록한다. ' +
      '화면 하나를 되살려야 하면 이 문서의 해당 라우트 섹션의 **복구 명령**을 그대로 실행하면 된다.'
  );
  chunks.push(
    `기준 태그: \`${TAG}\` (커밋 \`${routeMap.baseCommit}\`)${opts.final ? ' · 확정 기준: 실제 git diff(D)' : ' · 계획 기준: route-map.json의 deleteFiles'}`
  );
  chunks.push(`생성 명령: \`${generateCmd}\``);
  chunks.push(
    '이 문서는 `scripts/demo-removal/render-doc.mjs`의 생성물이다 — 손으로 고치지 말고 다시 생성한다.'
  );

  // ## 복구 방법
  chunks.push(heading(2, '복구 방법'));
  chunks.push(
    '전체 복구 — 아래 **삭제한 파일 전체 목록** 블록을 읽어 한 번에 되살린다.'
  );
  chunks.push(
    [
      '```bash',
      "awk '/^## 삭제한 파일 전체 목록/{f=1;next} f&&/^```text/{g=1;next} g&&/^```/{exit} g' \\",
      '  docs/library/histudy-demo-removal.md \\',
      "  | xargs -d '\\n' git checkout pre-demo-removal --",
      '```',
    ].join('\n')
  );
  chunks.push(
    '화면 하나만 되살리려면 해당 라우트 섹션(`### /...`)의 **복구 명령** 블록만 실행한다.'
  );

  // ## 되살릴 때 알아둘 점
  const modifiedKeep = modifiedKeepFiles(root, opts.final);
  const removedIgnore = removedPrettierIgnoreLines(root, opts.final);
  chunks.push(heading(2, '되살릴 때 알아둘 점'));
  chunks.push(
    '**(a)** 메뉴·링크·경로 분기는 유지 파일에서 지웠으므로 화면 파일만 되살리면 메뉴에는 나오지 않는다.'
  );
  chunks.push(
    ...(modifiedKeep === null
      ? ['수정한 유지 파일 목록: Phase 2 이후 채워짐']
      : labeledList('수정한 유지 파일 목록', modifiedKeep))
  );
  chunks.push(
    '**(b)** 섹션 복구 명령에는 다른 삭제 화면과 함께 쓰던 파일도 들어 있을 수 있다 — 중복 복구는 무해하다.'
  );
  chunks.push(
    '**(c)** T5(Next 15·React 19 전환) 이후에는 되살린 파일이 전환되지 않은 상태다.'
  );
  chunks.push('**(d)** SCSS·이미지는 지우지 않았다.');
  chunks.push(
    ...(removedIgnore === null
      ? ['**(e)** `.prettierignore`에서 뺀 항목: 아직 없음(T013 이후 채워짐)']
      : labeledList('(e) `.prettierignore`에서 뺀 항목', removedIgnore))
  );
  chunks.push(
    '**(f)** 화면 파일을 되살려도 그 화면이 쓰던 공유 파일은 T2에서 경로·분기가 수정됐을 수 있다. ' +
      "섹션의 'T2에서 수정됨' 표시와 `git diff pre-demo-removal -- <파일>`로 확인하고, " +
      '태그 시점 그대로 보려면 해당 공유 파일도 함께 되돌려야 한다(유지 화면에 영향이 가므로 주의).'
  );

  // ## 요약
  chunks.push(heading(2, '요약'));
  const summaryRows = PHASE_GROUPS.map(({ phase, title }) => {
    const sections = routeMap.sections.filter((s) => s.phase === phase);
    const entryCount = sections.reduce((n, s) => n + s.entries.length, 0);
    const fileCount = deleteFiles.filter((f) => f.phase === phase).length;
    return {
      title: `Phase ${phase} — ${title}`,
      sections: sections.length,
      entryCount,
      fileCount,
    };
  });
  const totalSections = summaryRows.reduce((n, r) => n + r.sections, 0);
  const totalEntries = summaryRows.reduce((n, r) => n + r.entryCount, 0);
  const totalFiles = summaryRows.reduce((n, r) => n + r.fileCount, 0);
  chunks.push(
    [
      '| 그룹 | 라우트 섹션 수 | 진입점 수 | 삭제 파일 수 |',
      '| --- | --- | --- | --- |',
      ...summaryRows.map(
        (r) =>
          `| ${r.title} | ${r.sections} | ${r.entryCount} | ${r.fileCount} |`
      ),
      `| 합계 | ${totalSections} | ${totalEntries} | ${totalFiles} |`,
    ].join('\n')
  );
  if (deleteFiles.length !== totalFiles) {
    chunks.push(
      `참고: 어느 Phase 그룹에도 속하지 않는 삭제 파일 ${deleteFiles.length - totalFiles}개는 표에서 빠져 있다(아래 **화면에 속하지 않는 삭제 파일** 참고).`
    );
  }

  // 그룹별 ## Phase N — <title> / ### <route>
  for (const { phase, title } of PHASE_GROUPS) {
    const sections = routeMap.sections.filter((s) => s.phase === phase);
    if (sections.length === 0) continue;
    chunks.push(heading(2, `Phase ${phase} — ${title}`));
    for (const section of sections) {
      const view = sectionViews.get(section.route);
      chunks.push(heading(3, section.route));
      chunks.push(...labeledList('진입 파일', view.entryFiles));
      chunks.push(
        ...labeledList('함께 삭제한 컴포넌트', view.componentsDeleted)
      );
      chunks.push(...labeledList('함께 삭제한 데이터', view.dataDeleted));
      if (view.folderOnly.length > 0) {
        chunks.push(
          ...labeledList(
            '폴더 안에 있었지만 화면이 쓰지 않던 파일',
            view.folderOnly
          )
        );
      }
      const modifiedInSection = view.reachKept.filter((p) =>
        modifiedSharedSet.has(p)
      );
      chunks.push(
        ...labeledListWithSuffix(
          '쓰던 유지 파일(삭제 안 함)',
          view.reachKept,
          (p) => (modifiedSharedSet.has(p) ? ' — T2에서 수정됨' : '')
        )
      );
      if (modifiedInSection.length > 0) {
        chunks.push(
          `이 화면이 쓰던 유지 파일 ${modifiedInSection.length}개가 T2에서 수정됐다. ` +
            '되살려도 태그 시점과 다르게 동작할 수 있으니 `git diff pre-demo-removal -- <파일>`로 차이를 확인한다.'
        );
      }
      chunks.push('**복구 명령**:');
      chunks.push(restoreCommandBlock(view.restoreSet));
    }
  }

  // ## 화면에 속하지 않는 삭제 파일
  chunks.push(heading(2, '화면에 속하지 않는 삭제 파일'));
  if (orphanFiles.length === 0) {
    chunks.push(
      '없음 — 삭제 집합 전부가 위 라우트 섹션의 복구 명령에 들어 있다.'
    );
  } else {
    chunks.push(bulletList(orphanFiles));
    chunks.push('**복구 명령**:');
    chunks.push(restoreCommandBlock(orphanFiles));
  }

  // ## 실데이터 코드가 들어 있던 삭제 파일
  chunks.push(heading(2, '실데이터 코드가 들어 있던 삭제 파일'));
  chunks.push(
    '나중에 실제 기능을 만들 때 참고할 수 있는 코드다. 복구 명령은 소속 섹션에 있다.'
  );
  if (realDataFiles.length === 0) {
    chunks.push('없음');
  } else {
    chunks.push(
      bulletList(
        realDataFiles.map((f) => {
          const sectionText = f.sections.length
            ? f.sections.map((r) => `\`${r}\``).join(', ')
            : '없음(화면에 속하지 않음)';
          const importedText = f.imported
            ? '삭제 시점에 화면에서 import됨'
            : '삭제 시점에 화면에서 import 안 됨';
          return `\`${f.path}\` — 소속: ${sectionText} · 근거: \`${f.evidence}\` · ${importedText}`;
        })
      )
    );
  }

  // ## 삭제하지 않은 후보
  chunks.push(heading(2, '삭제하지 않은 후보'));
  chunks.push(
    ...labeledList('notDeletedCandidates', routeMap.notDeletedCandidates)
  );
  chunks.push(
    '`alreadyDead`는 태그 시점에 어느 진입점·소비자에서도 import로 닿지 않던 코드 파일이다(예: 이미 죽은 위젯). ' +
      'import로 안 보일 뿐 실제로 쓰일 수 있음(예: `types/*.d.ts`, `components/ui/*`) — 미사용으로 단정하지 말 것.'
  );
  chunks.push(...labeledList('alreadyDead', routeMap.alreadyDead));
  chunks.push(
    '`packagesOnlyInDeleted`는 삭제 파일만 import하던 npm 의존성이다 — 지금 제거하지 않고 후보로만 남긴다(T5 참고).'
  );
  chunks.push(
    ...labeledList('packagesOnlyInDeleted', routeMap.packagesOnlyInDeleted)
  );

  // ## 기존 링크 결함
  chunks.push(heading(2, '기존 링크 결함'));
  const existingMissing = links.filter(
    (l) => l.kind === 'missing' && !NAV_FILES.has(l.file)
  );
  chunks.push(
    '아래는 데모 삭제와 무관하게 `--links` 검사에서 이미 나와 있던 `missing`(헤더·푸터 데이터 밖) 항목이다 — ' +
      '기록만 한다. 일부는 실제 라우트 링크가 아닐 수 있다(예: `revalidatePath` 인자, 옛 주소 별칭 키, Admin 앱 경로, `/404`).'
  );
  if (existingMissing.length === 0) {
    chunks.push('없음');
  } else {
    chunks.push(
      bulletList(
        existingMissing.map((l) => `\`${l.file}:${l.line}\` — \`${l.raw}\``)
      )
    );
  }

  // ## 삭제한 파일 전체 목록
  chunks.push(heading(2, '삭제한 파일 전체 목록'));
  const allDeleted = sorted(deleteFiles.map((f) => f.path));
  chunks.push(['```text', ...allDeleted, '```'].join('\n'));

  return `${frontMatter(opts)}\n\n${chunks.join('\n\n')}\n`;
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    return 2;
  }
  opts.linksArg = opts.links;
  try {
    const root = repoTopLevel(process.cwd());
    const doc = build(root, opts);
    const outRel = opts.out || OUT_REL;
    const out = path.join(root, outRel);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, doc);
    console.log(`wrote ${outRel}`);
    return 0;
  } catch (err) {
    console.error(err.message);
    return 2;
  }
}

process.exitCode = main();
