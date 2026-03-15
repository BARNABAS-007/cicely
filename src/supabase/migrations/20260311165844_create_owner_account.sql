/*
  # Create owner user account

  1. Details
    - Creates an owner account for the restaurant dashboard
    - Email: admin@cicely.com
    - Password: demo123
    - This is a demo account for testing the dashboard

  Note: In production, use a secure password and proper user management system.
  The account is created using Supabase Auth directly.
*/

-- This migration creates the owner account via Supabase Auth
-- Run this query in Supabase dashboard or use the Auth API

-- The owner account details:
-- Email: admin@cicely.com
-- Password: demo123

-- To create this programmatically, use:
-- POST /auth/v1/signup with email and password