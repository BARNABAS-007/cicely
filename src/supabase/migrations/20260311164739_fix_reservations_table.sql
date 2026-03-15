/*
  # Fix reservations table

  1. Changes
    - Drop the incorrectly named 'resevations' table
    - Create properly named 'reservations' table with correct column names
    - Add proper constraints and defaults
  
  2. Table Structure
    - `reservations`
      - `id` (uuid, primary key) - Auto-generated reservation ID
      - `name` (text, required) - Guest full name
      - `phone` (text, required) - Contact phone number
      - `guests` (integer, required) - Number of guests (1-10)
      - `date` (date, required) - Reservation date
      - `time` (text, required) - Reservation time
      - `status` (text, default 'pending') - Reservation status
      - `created_at` (timestamptz, default now()) - When reservation was made
  
  3. Security
    - Enable RLS on `reservations` table
    - Allow anonymous users to insert reservations (public booking)
    - Allow anonymous users to read reservations (public confirmation)
    - Authenticated users can manage all reservations (restaurant staff)
*/

-- Drop the misspelled table if it exists
DROP TABLE IF EXISTS resevations CASCADE;

-- Create the correct reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  guests integer NOT NULL CHECK (guests >= 1 AND guests <= 10),
  date date NOT NULL,
  time text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to create reservations
CREATE POLICY "Anyone can create reservations"
  ON reservations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow anyone to view reservations
CREATE POLICY "Anyone can view reservations"
  ON reservations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only authenticated users can update reservations
CREATE POLICY "Authenticated users can update reservations"
  ON reservations
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users can delete reservations
CREATE POLICY "Authenticated users can delete reservations"
  ON reservations
  FOR DELETE
  TO authenticated
  USING (true);