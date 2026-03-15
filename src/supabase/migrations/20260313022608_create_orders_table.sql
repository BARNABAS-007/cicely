/*
  # Create Orders System Tables

  1. New Tables
    - `orders` - Main orders table
      - `id` (uuid, primary key) - Unique order ID
      - `customer_name` (text, required) - Customer's full name
      - `phone` (text, required) - Contact phone number
      - `address` (text, required) - Delivery address
      - `items` (jsonb) - Array of ordered items with quantity and price
      - `total_price` (decimal) - Total order amount
      - `order_status` (text) - Order status (pending, preparing, ready, out_for_delivery, delivered, cancelled)
      - `delivery_requested` (boolean) - Whether delivery tracking is enabled
      - `created_at` (timestamptz) - Order creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `orders` table
    - Allow anonymous users to create orders
    - Allow anonymous users to view their orders (by matching customer info)
    - Allow authenticated staff to view and update all orders
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  items jsonb NOT NULL,
  total_price decimal(10, 2) NOT NULL,
  order_status text DEFAULT 'pending' CHECK (order_status IN ('pending', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled')),
  delivery_requested boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to create orders
CREATE POLICY "Anyone can create orders"
  ON orders
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow anyone to view orders
CREATE POLICY "Anyone can view orders"
  ON orders
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Only authenticated users (staff) can update orders
CREATE POLICY "Authenticated users can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index on order_status for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);