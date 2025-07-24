'use server'

import { supabase } from '@/app/lib/supabase/client'

export async function debugCategoryIssue() {
  try {
    console.log('=== Starting Category Column Debug ===')
    
    // Test 1: Simple select without category
    console.log('Test 1: Selecting courses without category column...')
    const { data: test1, error: error1 } = await supabase
      .from('courses')
      .select('id, title, instructor_id')
      .limit(1)
    
    if (error1) {
      console.error('Test 1 Error:', error1)
    } else {
      console.log('Test 1 Success:', test1)
    }
    
    // Test 2: Select with category column
    console.log('\nTest 2: Selecting courses WITH category column...')
    const { data: test2, error: error2 } = await supabase
      .from('courses')
      .select('id, title, category')
      .limit(1)
    
    if (error2) {
      console.error('Test 2 Error - Category column issue confirmed:', {
        message: error2.message,
        details: error2.details,
        hint: error2.hint,
        code: error2.code
      })
    } else {
      console.log('Test 2 Success - Category column exists:', test2)
    }
    
    // Test 3: Select all columns
    console.log('\nTest 3: Selecting all columns with *...')
    const { data: test3, error: error3 } = await supabase
      .from('courses')
      .select('*')
      .limit(1)
    
    if (error3) {
      console.error('Test 3 Error:', error3)
    } else {
      console.log('Test 3 Success - Available columns:', test3 ? Object.keys(test3[0] || {}) : [])
    }
    
    // Test 4: RLS check - testing if it's a permissions issue
    console.log('\nTest 4: Testing with service role (bypasses RLS)...')
    // Note: This would require service role key, which we don't have in client-side code
    // This is just to document that RLS might be the issue
    
    console.log('\n=== Debug Complete ===')
    
    return {
      test1: { success: !error1, error: error1 },
      test2: { success: !error2, error: error2 },
      test3: { success: !error3, columns: test3 ? Object.keys(test3[0] || {}) : [] }
    }
    
  } catch (error) {
    console.error('Debug script error:', error)
    return { error: 'Debug script failed' }
  }
}