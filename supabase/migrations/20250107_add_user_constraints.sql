-- Migration: Add essential constraints to user table
-- Description: Adds PRIMARY KEY, UNIQUE constraints, and joined_at column for better data integrity
-- Date: 2025-01-07
-- Author: System

-- Step 1: Add PRIMARY KEY if not exists
-- Note: This should already exist, but adding for completeness
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'user' 
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE "user" ADD PRIMARY KEY (id);
        RAISE NOTICE 'PRIMARY KEY added to user table';
    ELSE
        RAISE NOTICE 'PRIMARY KEY already exists on user table';
    END IF;
END $$;

-- Step 2: Add UNIQUE constraint on email
-- This prevents duplicate email registrations
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'user' 
        AND constraint_name = 'unique_email'
    ) THEN
        ALTER TABLE "user" ADD CONSTRAINT unique_email UNIQUE (email);
        RAISE NOTICE 'UNIQUE constraint added to email column';
    ELSE
        RAISE NOTICE 'UNIQUE constraint already exists on email column';
    END IF;
END $$;

-- Step 3: Add joined_at column for tracking signup time
-- This is separate from created_at which might be used for different purposes
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();

-- Step 4: Add UNIQUE constraint on username (optional but recommended)
-- This ensures usernames are unique across the platform
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'user' 
        AND constraint_name = 'unique_username'
    ) THEN
        -- First, check if there are any duplicate usernames
        IF EXISTS (
            SELECT username, COUNT(*) 
            FROM "user" 
            WHERE username IS NOT NULL 
            GROUP BY username 
            HAVING COUNT(*) > 1
        ) THEN
            RAISE NOTICE 'Duplicate usernames found. Skipping unique constraint on username.';
            RAISE NOTICE 'Please resolve duplicate usernames before adding this constraint.';
        ELSE
            ALTER TABLE "user" ADD CONSTRAINT unique_username UNIQUE (username);
            RAISE NOTICE 'UNIQUE constraint added to username column';
        END IF;
    ELSE
        RAISE NOTICE 'UNIQUE constraint already exists on username column';
    END IF;
END $$;

-- Step 5: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "user"(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON "user"(role);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON "user"(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_joined_at ON "user"(joined_at DESC);

-- Step 6: Add helpful comments
COMMENT ON COLUMN "user".email IS 'User email address - must be unique';
COMMENT ON COLUMN "user".joined_at IS 'Timestamp when user first signed up';
COMMENT ON COLUMN "user".created_at IS 'Timestamp when record was created in database';
COMMENT ON COLUMN "user".username IS 'Unique username for the user';

-- Migration complete!
-- Summary:
-- 1. Added PRIMARY KEY on id (if not exists)
-- 2. Added UNIQUE constraint on email
-- 3. Added joined_at column for signup tracking
-- 4. Added UNIQUE constraint on username (if no duplicates)
-- 5. Added indexes for performance
-- 6. Added column comments for documentation