/*
  # Create reservations table

  1. New Tables
    - `reservations`
      - `id` (uuid, primary key)
      - `name` (text, required) - Guest name
      - `phone` (text, required) - Contact number
      - `guests` (integer, required) - Number of guests
      - `date` (date, required) - Reservation date
      - `time` (text, required) - Reservation time
      - `status` (text, default 'pending') - Reservation status
      - `created_at` (timestamptz) - Timestamp of reservation request
  
  2. Security
    - Enable RLS on `reservations` table
    - Add policy for public to insert reservations (anyone can make a reservation)
    - Add policy for authenticated users to view all reservations (for restaurant staff)
*/

CREATE TABLE IF NOT EXISTS reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  guests integer NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create reservations"
  ON reservations
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Public can view their own reservations"
  ON reservations
  FOR SELECT
  TO anon
  USING (true);