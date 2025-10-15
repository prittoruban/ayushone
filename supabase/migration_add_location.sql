-- Migration: Add location column to doctors table
-- Run this SQL in your Supabase SQL Editor to add the location column to existing doctors table

-- Add location column to store GPS coordinates as JSONB { lat: number, lng: number }
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS location jsonb;

-- Add comment to describe the column format
COMMENT ON COLUMN public.doctors.location IS 'GPS coordinates stored as JSON: { "lat": number, "lng": number }';
