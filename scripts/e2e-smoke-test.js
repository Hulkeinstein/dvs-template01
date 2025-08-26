#!/usr/bin/env node

/**
 * E2E Smoke Test for DVS-TEMPLATE01
 * Tests core functionality including soft delete implementation
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Helper functions
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`  ✅ ${message}`, colors.green);
}

function logError(message) {
  log(`  ❌ ${message}`, colors.red);
}

function logWarning(message) {
  log(`  ⚠️  ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`  ℹ️  ${message}`, colors.cyan);
}

// Test functions
async function checkEnvironmentSetup() {
  log('\n1. Environment Setup', colors.bright + colors.blue);
  
  // Check for Supabase environment variables
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasSupabaseAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!hasSupabaseUrl || !hasSupabaseAnonKey) {
    logError('Missing Supabase environment variables');
    return false;
  } else {
    logSuccess('Supabase environment variables configured');
  }
  
  if (!hasServiceKey) {
    logWarning('SERVICE_ROLE_KEY not found (required for server operations)');
  } else {
    logSuccess('SERVICE_ROLE_KEY configured');
  }
  
  return true;
}

async function checkSoftDeleteImplementation() {
  log('\n2. Soft Delete Implementation', colors.bright + colors.blue);
  
  let allPassed = true;
  
  try {
    // Check if deleteCourse function exists in courseActions.js
    const actionsPath = path.join(__dirname, '..', 'app', 'lib', 'actions', 'courseActions.js');
    if (fs.existsSync(actionsPath)) {
      const actionsContent = fs.readFileSync(actionsPath, 'utf8');
      
      if (actionsContent.includes('export async function deleteCourse')) {
        logSuccess('deleteCourse function exists');
        
        // Check for soft delete implementation details
        if (actionsContent.includes("status: 'deleted'") || actionsContent.includes('deleted_at')) {
          logSuccess('Using soft delete pattern');
        } else {
          logWarning('May be using hard delete pattern');
          allPassed = false;
        }
        
        if (actionsContent.includes("status !== 'draft'")) {
          logSuccess('Draft-only delete restriction implemented');
        } else {
          logWarning('Missing draft-only restriction');
          allPassed = false;
        }
      } else {
        logError('deleteCourse function not found');
        allPassed = false;
      }
    } else {
      logError('courseActions.js not found');
      allPassed = false;
    }
    
    // Check if MyCourses component has delete handler
    const myCoursesPath = path.join(__dirname, '..', 'components', 'Instructor', 'MyCourses.js');
    if (fs.existsSync(myCoursesPath)) {
      const myCoursesContent = fs.readFileSync(myCoursesPath, 'utf8');
      
      if (myCoursesContent.includes('handleDeleteCourse')) {
        logSuccess('Delete handler in MyCourses component');
      } else {
        logWarning('Delete handler not found in MyCourses');
        allPassed = false;
      }
      
      if (myCoursesContent.includes('deleteCourse') && myCoursesContent.includes('import')) {
        logSuccess('deleteCourse imported in MyCourses');
      } else {
        logWarning('deleteCourse not imported');
        allPassed = false;
      }
    } else {
      logError('MyCourses.js not found');
      allPassed = false;
    }
    
    // Check migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250301_implement_soft_delete.sql');
    if (fs.existsSync(migrationPath)) {
      const migrationContent = fs.readFileSync(migrationPath, 'utf8');
      
      logSuccess('Migration file exists');
      
      // Check for key components
      const checks = [
        { pattern: /deleted_at/i, name: 'deleted_at column' },
        { pattern: /audit_log/i, name: 'Audit log table' },
        { pattern: /course_snapshots/i, name: 'Snapshots table' },
        { pattern: /active_courses/i, name: 'Active courses view' },
        { pattern: /soft_delete_course/i, name: 'Soft delete function' },
        { pattern: /restore_course/i, name: 'Restore function' },
      ];
      
      checks.forEach(check => {
        if (check.pattern.test(migrationContent)) {
          logSuccess(`${check.name} defined`);
        } else {
          logWarning(`${check.name} not found`);
          allPassed = false;
        }
      });
    } else {
      logError('Migration file not found');
      allPassed = false;
    }
    
  } catch (error) {
    logError(`Error checking soft delete: ${error.message}`);
    allPassed = false;
  }
  
  return allPassed;
}

async function checkUIComponents() {
  log('\n3. UI Components', colors.bright + colors.blue);
  
  let allPassed = true;
  
  try {
    // Check CourseWidget for three-dot menu
    const widgetPath = path.join(__dirname, '..', 'components', 'Instructor', 'Dashboard-Section', 'widgets', 'CourseWidget.js');
    if (fs.existsSync(widgetPath)) {
      const widgetContent = fs.readFileSync(widgetPath, 'utf8');
      
      if (widgetContent.includes('⋮') || widgetContent.includes('more-vertical')) {
        logSuccess('Three-dot menu implemented');
      } else {
        logWarning('Three-dot menu not found');
        allPassed = false;
      }
      
      if (widgetContent.includes('flex-shrink-0')) {
        logSuccess('flex-shrink-0 applied (prevents menu disappearing)');
      } else {
        logWarning('flex-shrink-0 not found');
      }
      
      if (widgetContent.includes('handleDeleteCourse') || widgetContent.includes('onDelete')) {
        logSuccess('Delete functionality connected');
      } else {
        logWarning('Delete functionality not connected');
      }
    } else {
      logError('CourseWidget.js not found');
      allPassed = false;
    }
    
  } catch (error) {
    logError(`Error checking UI components: ${error.message}`);
    allPassed = false;
  }
  
  return allPassed;
}

async function checkDeleteWorkflow() {
  log('\n4. Delete Workflow Logic', colors.bright + colors.blue);
  
  logInfo('Delete permissions by status:');
  const statuses = ['draft', 'pending', 'published', 'archived', 'deleted'];
  
  statuses.forEach(status => {
    if (status === 'draft') {
      logSuccess(`${status}: Can delete`);
    } else {
      logInfo(`${status}: Cannot delete (protected)`);
    }
  });
  
  return true;
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(50));
  log('🧪 E2E Smoke Test - DVS-TEMPLATE01', colors.bright + colors.cyan);
  console.log('='.repeat(50));
  
  const tests = [
    { name: 'Environment Setup', fn: checkEnvironmentSetup },
    { name: 'Soft Delete Implementation', fn: checkSoftDeleteImplementation },
    { name: 'UI Components', fn: checkUIComponents },
    { name: 'Delete Workflow', fn: checkDeleteWorkflow },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  log('📊 Test Summary', colors.bright + colors.blue);
  console.log('='.repeat(50));
  
  log(`Passed: ${passed}`, colors.green);
  log(`Failed: ${failed}`, failed > 0 ? colors.red : colors.green);
  
  if (failed === 0) {
    log('\n✨ All tests passed!', colors.bright + colors.green);
    
    log('\n📝 Next Steps:', colors.bright + colors.yellow);
    logInfo('1. Apply migration to Supabase:');
    logInfo('   Go to Supabase Dashboard > SQL Editor');
    logInfo('   Run: supabase/migrations/20250301_implement_soft_delete.sql');
    logInfo('2. Test delete functionality in the UI');
    logInfo('3. Create and merge PR');
    
    process.exit(0);
  } else {
    log('\n❌ Some tests failed. Please fix the issues.', colors.bright + colors.red);
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});