const { Client } = require('pg');
const fs = require('fs');
const bcrypt = require('bcryptjs');

async function setup() {
  console.log('Connecting to PostgreSQL on localhost:5433...');
  const rootClient = new Client({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'root',
    database: 'postgres'
  });
  await rootClient.connect();
  
  const dbCheck = await rootClient.query("SELECT 1 FROM pg_database WHERE datname = 'omniverify'");
  if (dbCheck.rows.length === 0) {
    await rootClient.query('CREATE DATABASE omniverify');
    console.log('Created database omniverify.');
  } else {
    console.log('Database omniverify already exists.');
  }
  await rootClient.end();

  // Connect to omniverify db
  const client = new Client({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'root',
    database: 'omniverify'
  });
  await client.connect();

  console.log('Connected to omniverify DB. Creating tables...');

  // Create tables
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(100) NOT NULL,
      role VARCHAR(50) DEFAULT 'auditor',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS monitored_assets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_code VARCHAR(100) NOT NULL UNIQUE,
      assigned_ward VARCHAR(100) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE
    );

    CREATE TABLE IF NOT EXISTS daily_audit_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_code VARCHAR(100) NOT NULL,
      report_title VARCHAR(255) NOT NULL,
      period VARCHAR(100) NOT NULL,
      distance_km NUMERIC(8, 2),
      days_reviewed INT,
      failed_checks INT,
      flagged_checks INT,
      late_pings_pct VARCHAR(20),
      stops_per_km VARCHAR(20),
      penalty_inr NUMERIC(10, 2),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_rule_checks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_code VARCHAR(100) NOT NULL,
      rule_code VARCHAR(50) NOT NULL,
      check_name VARCHAR(255) NOT NULL,
      finding TEXT NOT NULL,
      status VARCHAR(50) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS telemetry_pings (
      id BIGSERIAL PRIMARY KEY,
      asset_code VARCHAR(100) NOT NULL,
      lat NUMERIC(10, 6) NOT NULL,
      lng NUMERIC(10, 6) NOT NULL,
      speed NUMERIC(5, 2) DEFAULT 0,
      status VARCHAR(50),
      address TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('Tables created successfully.');

  // Seed default admin user: admin@omniverify.gov / password123
  const hashed = await bcrypt.hash('password123', 10);
  await client.query(`
    INSERT INTO users (email, password_hash, full_name, role)
    VALUES ('admin@omniverify.gov', $1, 'Chief Audit Officer', 'admin')
    ON CONFLICT (email) DO UPDATE SET password_hash = $1
  `, [hashed]);
  console.log('Seeded admin user: admin@omniverify.gov / password123');

  // Load and seed Vehicle 05 data
  const v05 = JSON.parse(fs.readFileSync('E:\\NexTeir\\DataVerify\\src\\data\\vehicle05_data.json', 'utf8'));

  // Seed asset
  await client.query(`
    INSERT INTO monitored_assets (asset_code, assigned_ward)
    VALUES ('VEHICLE 05', 'Ward 12 (Bari Sadri)')
    ON CONFLICT (asset_code) DO NOTHING
  `);

  // Seed audit report
  await client.query(`DELETE FROM daily_audit_reports WHERE asset_code = 'VEHICLE 05'`);
  await client.query(`
    INSERT INTO daily_audit_reports (asset_code, report_title, period, distance_km, days_reviewed, failed_checks, flagged_checks, late_pings_pct, stops_per_km, penalty_inr)
    VALUES ('VEHICLE 05', $1, '01-31 Aug 2026', 38.7, 31, 8, 4, '72%', '11.3', 14200)
  `, [v05.reportTitle]);

  // Seed checks
  await client.query(`DELETE FROM audit_rule_checks WHERE asset_code = 'VEHICLE 05'`);
  for (const c of v05.checks) {
    await client.query(`
      INSERT INTO audit_rule_checks (asset_code, rule_code, check_name, finding, status)
      VALUES ('VEHICLE 05', $1, $2, $3, $4)
    `, [c.rule, c.check, c.finding, c.status]);
  }
  console.log(`Seeded ${v05.checks.length} rule checks into PostgreSQL.`);

  // Seed sample telemetry pings
  const pingCheck = await client.query("SELECT count(1) as cnt FROM telemetry_pings WHERE asset_code = 'VEHICLE 05'");
  if (parseInt(pingCheck.rows[0].cnt) === 0) {
    console.log(`Inserting ${v05.mapPoints.length} GPS telemetry pings...`);
    for (const p of v05.mapPoints) {
      await client.query(`
        INSERT INTO telemetry_pings (asset_code, lat, lng, speed, status, address)
        VALUES ('VEHICLE 05', $1, $2, $3, $4, $5)
      `, [p.lat, p.lng, p.speed || 0, p.status || 'Moving', p.address || 'Bari Sadri']);
    }
  }

  const finalCheck = await client.query("SELECT count(1) as cnt FROM telemetry_pings");
  console.log('Total verified telemetry pings in PostgreSQL:', finalCheck.rows[0].cnt);

  await client.end();
  console.log('PostgreSQL database omniverify is 100% READY!');
}

setup().catch(console.error);
