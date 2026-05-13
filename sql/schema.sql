-- ============================================================
-- UniPark — AUST Campus Parking System
-- Run this once in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- TABLES

CREATE TABLE IF NOT EXISTS zones (
  id          SERIAL PRIMARY KEY,
  zone_name   TEXT    NOT NULL,
  total_spots INTEGER NOT NULL DEFAULT 10
);

CREATE TABLE IF NOT EXISTS parked_cars (
  id               SERIAL PRIMARY KEY,
  student_name     TEXT        NOT NULL,
  student_id       TEXT        NOT NULL,
  phone_number     TEXT        NOT NULL,
  plate_number     TEXT        NOT NULL,
  zone_id          INTEGER     NOT NULL REFERENCES zones(id),
  spot_number      INTEGER     NOT NULL,
  arrival_time     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  departure_time   TIMESTAMPTZ NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'exited'))
);

-- SEED DATA — Zones A through F, 10 spots each

INSERT INTO zones (zone_name, total_spots) VALUES
  ('A', 10),
  ('B', 10),
  ('C', 10),
  ('D', 10),
  ('E', 10),
  ('F', 10);

-- ROW LEVEL SECURITY

ALTER TABLE zones       ENABLE ROW LEVEL SECURITY;
ALTER TABLE parked_cars ENABLE ROW LEVEL SECURITY;

-- Zones: public read only
CREATE POLICY "public_read_zones"
  ON zones FOR SELECT
  USING (true);

-- Parked cars: public read
CREATE POLICY "public_read_parked_cars"
  ON parked_cars FOR SELECT
  USING (true);

-- Parked cars: anyone can register (insert)
CREATE POLICY "public_insert_parked_cars"
  ON parked_cars FOR INSERT
  WITH CHECK (true);

-- Parked cars: only authenticated admin can update (mark as exited)
CREATE POLICY "auth_update_parked_cars"
  ON parked_cars FOR UPDATE
  USING (auth.role() = 'authenticated');
