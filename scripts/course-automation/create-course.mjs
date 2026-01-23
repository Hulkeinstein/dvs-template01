#!/usr/bin/env node
/**
 * Course Creator CLI
 *
 * Claude Code Agent가 호출하는 코스 생성 스크립트
 *
 * Usage:
 *   node scripts/course-automation/create-course.mjs \
 *     --title="React 강의" \
 *     --category="Web Development" \
 *     --level="intermediate" \
 *     --price=0 \
 *     --language="Korean"
 *
 *   # Dry-run (DB 저장 없이 미리보기)
 *   node scripts/course-automation/create-course.mjs --title="테스트" --dry-run
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parseArgs } from 'util';

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..', '..');

// Load environment variables
dotenv.config({ path: join(projectRoot, '.env.local') });

// Check if dry-run or help mode early (for conditional env validation)
const isDryRunMode = process.argv.includes('--dry-run');
const isHelpMode = process.argv.includes('--help');

// Skip all validation for help mode
if (isHelpMode) {
  console.log(`
Course Creator CLI

Usage:
  node create-course.mjs --title="코스 제목" [options]

Required:
  --title           코스 제목

Options:
  --category        카테고리 (default: Programming)
                    허용값: Programming, Web Development, Design, Business, Marketing, Language
  --level           난이도 (default: beginner)
                    허용값: beginner, intermediate, advanced
  --price           가격 (default: 0, 무료)
  --language        언어 (default: Korean)
  --shortDescription  짧은 설명
  --description     상세 설명 (HTML 가능)
  --maxStudents     최대 수강생 수 (default: 100)
  --requirements    수강 요구사항
  --targetedAudience  대상 학습자
  --courseTags      태그 (쉼표로 구분)
  --introVideoUrl   소개 영상 URL

Flags:
  --dry-run         DB 저장 없이 미리보기만
  --help            도움말 표시

Examples:
  node create-course.mjs --title="Python 기초"
  node create-course.mjs --title="React" --category="Web Development" --level="intermediate"
  node create-course.mjs --title="테스트" --dry-run
`);
  process.exit(0);
}

// Validate required environment variables
const requiredEnvVars = isDryRunMode
  ? ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
  : ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'COURSE_AUTOMATION_ADMIN_EMAIL'];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Error: Missing environment variable: ${envVar}`);
    console.error('   Please check your .env.local file');
    process.exit(1);
  }
}

// Parse CLI arguments
const { values: args } = parseArgs({
  options: {
    title: { type: 'string' },
    category: { type: 'string', default: 'Programming' },
    level: { type: 'string', default: 'beginner' },
    price: { type: 'string', default: '0' },
    language: { type: 'string', default: 'Korean' },
    shortDescription: { type: 'string' },
    description: { type: 'string' },
    maxStudents: { type: 'string', default: '100' },
    requirements: { type: 'string' },
    targetedAudience: { type: 'string' },
    courseTags: { type: 'string' },
    introVideoUrl: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    help: { type: 'boolean', default: false },
  },
});

// Help is handled early (before env validation)

// Validate required arguments
if (!args.title) {
  console.error('❌ Error: --title is required');
  console.error('   Usage: node create-course.mjs --title="코스 제목"');
  process.exit(1);
}

// Validate category
const validCategories = [
  'Programming',
  'Web Development',
  'Design',
  'Business',
  'Marketing',
  'Language',
];
if (!validCategories.includes(args.category)) {
  console.error(`❌ Error: Invalid category "${args.category}"`);
  console.error(`   Valid categories: ${validCategories.join(', ')}`);
  process.exit(1);
}

// Validate level
const validLevels = ['beginner', 'intermediate', 'advanced'];
if (!validLevels.includes(args.level)) {
  console.error(`❌ Error: Invalid level "${args.level}"`);
  console.error(`   Valid levels: ${validLevels.join(', ')}`);
  process.exit(1);
}

// Create Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Generate unique slug from title
 */
function generateSlug(title) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${baseSlug}-${Date.now()}`;
}

/**
 * Main function
 */
async function createCourse() {
  const adminEmail = process.env.COURSE_AUTOMATION_ADMIN_EMAIL;
  const isDryRun = args['dry-run'];

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎓 Course Creator CLI');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let userData = null;

  // Step 1: Validate admin user (skip in dry-run mode)
  if (isDryRun) {
    console.log('Step 1: Admin 권한 검증... (dry-run: 건너뜀)');
    userData = { id: 'dry-run-user-id', role: 'admin', email: adminEmail };
    console.log(`   ⏩ Dry-run 모드: Admin 검증 생략\n`);
  } else {
    console.log('Step 1: Admin 권한 검증...');
    const { data, error: userError } = await supabaseAdmin
      .from('user')
      .select('id, role, email')
      .eq('email', adminEmail.trim().toLowerCase())
      .single();

    if (userError || !data) {
      console.error(`❌ Admin user not found: ${adminEmail}`);
      process.exit(1);
    }

    if (data.role !== 'admin') {
      console.error(`❌ Permission denied. User role is "${data.role}", not "admin"`);
      process.exit(1);
    }
    userData = data;
    console.log(`   ✅ Admin 확인: ${userData.email}\n`);
  }

  // Step 2: Prepare course data
  console.log('Step 2: 코스 데이터 준비...');

  const price = parseFloat(args.price) || 0;
  const slug = generateSlug(args.title);

  const courseData = {
    instructor_id: userData.id,
    slug,
    status: 'draft',
    is_public: false,
    enable_qa: false,

    // Basic info
    title: args.title,
    description: args.shortDescription || `${args.title} 코스입니다.`,
    about_course: args.description || `<h2>${args.title}</h2><p>이 코스에서 배울 내용을 설명합니다.</p>`,
    category: args.category,
    difficulty_level: args.level,
    language: args.language,

    // Pricing
    price: price,
    regular_price: price,
    discounted_price: null,
    is_free: price === 0,

    // Settings
    max_students: parseInt(args.maxStudents) || 100,
    requirements: args.requirements || null,
    targeted_audience: args.targetedAudience || null,
    course_tags: args.courseTags
      ? args.courseTags.split(',').map((t) => t.trim())
      : [],
    intro_video_url: args.introVideoUrl || null,

    // Duration (defaults)
    total_duration_hours: 0,
    total_duration_minutes: 0,

    // Certificate settings
    certificate_settings: {
      enabled: false,
      auto_issue: true,
      template_id: 'default',
      passing_grade: 70,
      certificate_title: '',
    },
  };

  // Display course data
  console.log('\n📋 코스 정보:');
  console.log('┌────────────────────┬─────────────────────────────────────────┐');
  console.log(`│ 제목               │ ${courseData.title.padEnd(39)} │`);
  console.log(`│ 카테고리           │ ${courseData.category.padEnd(39)} │`);
  console.log(`│ 레벨               │ ${courseData.difficulty_level.padEnd(39)} │`);
  console.log(`│ 가격               │ ${(courseData.is_free ? '무료' : courseData.price + '원').padEnd(39)} │`);
  console.log(`│ 언어               │ ${courseData.language.padEnd(39)} │`);
  console.log(`│ 최대 수강생        │ ${String(courseData.max_students).padEnd(39)} │`);
  console.log(`│ 상태               │ ${courseData.status.padEnd(39)} │`);
  console.log(`│ Slug               │ ${courseData.slug.substring(0, 39).padEnd(39)} │`);
  console.log('└────────────────────┴─────────────────────────────────────────┘\n');

  // Dry-run mode
  if (args['dry-run']) {
    console.log('🔍 Dry-run 모드: DB에 저장하지 않습니다.');
    console.log('\n✅ 미리보기 완료!');
    console.log('   실제 생성하려면 --dry-run 옵션을 제거하세요.');
    process.exit(0);
  }

  // Step 3: Create course
  console.log('Step 3: 코스 생성 중...');
  const { data: course, error: courseError } = await supabaseAdmin
    .from('courses')
    .insert(courseData)
    .select()
    .single();

  if (courseError) {
    console.error('❌ 코스 생성 실패:', courseError.message);
    process.exit(1);
  }

  // Success
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ 코스 생성 완료!');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   📌 Course ID: ${course.id}`);
  console.log(`   📝 제목: ${course.title}`);
  console.log(`   🔗 Slug: ${course.slug}`);
  console.log(`   💰 가격: ${course.is_free ? '무료' : course.price + '원'}`);
  console.log(`   📋 상태: ${course.status}`);
  console.log(`\n   🔗 편집 페이지: http://localhost:3000/create-course?courseId=${course.id}`);
}

// Run
createCourse().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
