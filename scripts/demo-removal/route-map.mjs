#!/usr/bin/env node

/**
 * HiStudy 데모 삭제(T2) 라우트·파일 판정 CLI
 *
 * 사용법:
 *   node scripts/demo-removal/route-map.mjs map [--out F]
 *     태그 트리 기준 분류·매핑 → 기본 .tmp/demo-removal/route-map.json
 *   node scripts/demo-removal/route-map.mjs plan [--root DIR] [--out F] [--phase N --list]
 *     작업 트리 기준 삭제 목록 → 기본 .tmp/demo-removal/plan.json
 *     --phase N --list: 그 Phase 경로만 한 줄에 하나(stdout)
 *   node scripts/demo-removal/route-map.mjs verify [--root DIR]
 *     완료 판정. 남은 DEL 진입점·삭제 후보가 0이고 KEEP 진입점이 전부 있을 때만 exit 0
 *
 * 계약의 원문은 docs/work-plans/histudy-demo-cleanup.md T002 Spec 1~11이다.
 * NOTE: 파일을 지우거나 고치지 않는다(출력 JSON 쓰기만). 삭제는 각 Phase task가 명령으로 한다.
 */

import fs from 'fs';
import path from 'path';
import {
  buildTagContext,
  computeDeletion,
  countNonAsset,
  readTagTree,
  readWorkTree,
  repoTopLevel,
  sorted,
} from './graph.mjs';

const USAGE =
  'usage: route-map.mjs map [--out F] | plan [--root DIR] [--out F] [--phase N --list] | verify [--root DIR]';

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const allowed = {
    map: ['--out'],
    plan: ['--root', '--out', '--phase', '--list'],
    verify: ['--root'],
  };
  if (!allowed[command]) throw new Error(USAGE);
  const opts = {};
  for (let i = 0; i < rest.length; i += 1) {
    const key = rest[i];
    if (!allowed[command].includes(key)) {
      throw new Error(`unknown option ${key}\n${USAGE}`);
    }
    if (key === '--list') {
      opts.list = true;
      continue;
    }
    const value = rest[i + 1];
    if (value === undefined || value.startsWith('--')) {
      throw new Error(`missing value for ${key}`);
    }
    opts[key.slice(2)] = value;
    i += 1;
  }
  if (command === 'plan' && Boolean(opts.phase) !== Boolean(opts.list)) {
    throw new Error('--phase and --list must be used together');
  }
  if (opts.phase !== undefined && !/^[3-7]$/.test(opts.phase)) {
    throw new Error('--phase must be one of 3..7');
  }
  return { command, opts };
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

function phaseCounts(deleteFiles) {
  const counts = {};
  for (const f of deleteFiles) counts[f.phase] = (counts[f.phase] || 0) + 1;
  return sorted(Object.keys(counts))
    .map((p) => `phase${p}=${counts[p]}`)
    .join(' ');
}

function runMap(top, opts) {
  const out = opts.out
    ? path.resolve(opts.out)
    : path.join(top, '.tmp/demo-removal/route-map.json');
  const tag = readTagTree(top);
  const ctx = buildTagContext(tag);
  const plan = computeDeletion(ctx, tag);
  const deleteSet = new Set(plan.deleteFiles.map((f) => f.path));

  // 태그 시점 어느 진입점·소비자에서도 안 닿던 코드 파일(삭제 대상 제외) — 기록만
  const alreadyDead = ctx.graph.nodes.filter(
    (p) => !ctx.reachFromAll.has(p) && !deleteSet.has(p)
  );
  // 삭제 파일만 import하는 npm 패키지 — 제거하지 않고 후보로만 기록(D10)
  const usedByDeleted = new Set();
  const usedByRemaining = new Set();
  for (const p of ctx.graph.nodes) {
    const target = deleteSet.has(p) ? usedByDeleted : usedByRemaining;
    for (const name of ctx.graph.packages.get(p)) target.add(name);
  }
  const packagesOnlyInDeleted = [...usedByDeleted].filter(
    (n) => !usedByRemaining.has(n)
  );

  const keep = ctx.entries.filter((e) => e.class === 'keep').length;
  const del = ctx.entries.length - keep;
  writeJson(out, {
    baseCommit: tag.baseCommit,
    entries: ctx.entries,
    sections: ctx.sections.map((s) => ({
      dir: s.dir,
      route: s.route,
      phase: s.phase,
      entries: s.entries,
      reachFiles: s.reachFiles,
    })),
    deleteFiles: plan.deleteFiles,
    notDeletedCandidates: plan.notDeletedCandidates,
    alreadyDead: sorted(alreadyDead),
    packagesOnlyInDeleted: sorted(packagesOnlyInDeleted),
    unresolved: ctx.graph.unresolved,
  });

  console.log(
    `entries=${ctx.entries.length} keep=${keep} del=${del} sections=${ctx.sections.length}`
  );
  console.log(`unresolvedNonAsset=${countNonAsset(ctx.graph.unresolved)}`);
  console.log(
    [
      `deleteFiles=${plan.deleteFiles.length}`,
      phaseCounts(plan.deleteFiles),
      `notDeletedCandidates=${plan.notDeletedCandidates.length}`,
      `alreadyDead=${alreadyDead.length}`,
      `packagesOnlyInDeleted=${packagesOnlyInDeleted.length}`,
      `unresolved=${ctx.graph.unresolved.length}`,
      `blockedByKeep=${plan.blockedByKeep.length}`,
    ]
      .filter(Boolean)
      .join(' ')
  );
  return 0;
}

function loadWork(top, opts) {
  const root = opts.root ? path.resolve(opts.root) : top;
  const ctx = buildTagContext(readTagTree(root));
  const work = readWorkTree(root);
  return { ctx, work, plan: computeDeletion(ctx, work) };
}

function runPlan(top, opts) {
  const out = opts.out
    ? path.resolve(opts.out)
    : path.join(top, '.tmp/demo-removal/plan.json');
  const { plan } = loadWork(top, opts);
  const keepEntries = plan.workEntries
    .filter((e) => e.class === 'keep')
    .map((e) => e.path);
  writeJson(out, {
    deleteFiles: plan.deleteFiles,
    notDeletedCandidates: plan.notDeletedCandidates,
    keepEntries: sorted(keepEntries),
  });

  if (opts.list) {
    const phase = Number(opts.phase);
    for (const f of plan.deleteFiles) {
      if (f.phase === phase) console.log(f.path);
    }
    return 0;
  }
  console.log(
    [
      `deleteFiles=${plan.deleteFiles.length}`,
      phaseCounts(plan.deleteFiles),
      `notDeletedCandidates=${plan.notDeletedCandidates.length}`,
      `keepEntries=${keepEntries.length}`,
      `unresolvedNonAsset=${countNonAsset(plan.workGraph.unresolved)}`,
      `blockedByKeep=${plan.blockedByKeep.length}`,
    ]
      .filter(Boolean)
      .join(' ')
  );
  return 0;
}

function runVerify(top, opts) {
  const { ctx, work, plan } = loadWork(top, opts);
  const delRemaining = ctx.entries.filter(
    (e) => e.class === 'del' && work.fileSet.has(e.path)
  ).length;
  const keepTag = ctx.entries.filter((e) => e.class === 'keep');
  const keepPresent = keepTag.filter((e) => work.fileSet.has(e.path)).length;
  const candidates = plan.deleteFiles.length;
  console.log(
    `del-entries-remaining=${delRemaining} delete-candidates-remaining=${candidates} keep-entries-present=${keepPresent}/${keepTag.length}`
  );
  return delRemaining === 0 &&
    candidates === 0 &&
    keepPresent === keepTag.length
    ? 0
    : 1;
}

function main() {
  let parsed;
  try {
    parsed = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    return 2;
  }
  const top = repoTopLevel(process.cwd());
  const run = { map: runMap, plan: runPlan, verify: runVerify };
  return run[parsed.command](top, parsed.opts);
}

process.exitCode = main();
