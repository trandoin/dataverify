const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function updateDb() {
  const client = new Client({
    host: 'localhost',
    port: 5433,
    user: 'postgres',
    password: 'root',
    database: 'omniverify'
  });

  await client.connect();
  console.log('Connected to PostgreSQL on localhost:5433 (omniverify)...');

  // Add missing columns if they don't exist
  await client.query(`
    ALTER TABLE daily_audit_reports ADD COLUMN IF NOT EXISTS total_pings INT DEFAULT 0;
    ALTER TABLE daily_audit_reports ADD COLUMN IF NOT EXISTS compliance_score VARCHAR(20) DEFAULT '50%';
    ALTER TABLE daily_audit_reports ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Fail';
    ALTER TABLE daily_audit_reports ADD COLUMN IF NOT EXISTS pass_checks INT DEFAULT 0;
  `);

  // Update or insert all fleet assets
  const fleetVehicles = [
    {
      code: 'VEHICLE 05',
      ward: 'Ward 12 (Bari Sadri)',
      title: 'Vehicle 05 • Waste Fleet Audit',
      period: '01-31 Aug 2026',
      dist: 38.7,
      days: 31,
      fails: 8,
      flags: 4,
      passes: 2,
      late: '72%',
      stops: '11.3',
      penalty: 14200,
      pings: 3297,
      score: '54%',
      status: 'Fail'
    },
    {
      code: 'VEHICLE 08',
      ward: 'Ward 12 (Bari Sadri)',
      title: 'Vehicle 08 • Waste Fleet Audit',
      period: '01-31 Aug 2026',
      dist: 32.1,
      days: 31,
      fails: 2,
      flags: 5,
      passes: 7,
      late: '18%',
      stops: '14.8',
      penalty: 4500,
      pings: 2840,
      score: '82%',
      status: 'Flag'
    },
    {
      code: 'VEHICLE 12',
      ward: 'Ward 04 (Zone B)',
      title: 'Vehicle 12 • Standard Fleet Audit',
      period: '01-31 Aug 2026',
      dist: 45.8,
      days: 31,
      fails: 0,
      flags: 2,
      passes: 12,
      late: '4%',
      stops: '16.2',
      penalty: 0,
      pings: 4110,
      score: '96%',
      status: 'Pass'
    },
    {
      code: 'VEHICLE 19',
      ward: 'Ward 07 (Central)',
      title: 'Vehicle 19 • High Latency Audit',
      period: '01-31 Aug 2026',
      dist: 21.4,
      days: 31,
      fails: 9,
      flags: 3,
      passes: 2,
      late: '84%',
      stops: '8.4',
      penalty: 18500,
      pings: 1980,
      score: '48%',
      status: 'Fail'
    }
  ];

  for (const v of fleetVehicles) {
    // Monitored Assets
    await client.query(`
      INSERT INTO monitored_assets (asset_code, assigned_ward)
      VALUES ($1, $2)
      ON CONFLICT (asset_code) DO UPDATE SET assigned_ward = $2
    `, [v.code, v.ward]);

    // Daily Audit Reports
    await client.query(`DELETE FROM daily_audit_reports WHERE asset_code = $1`, [v.code]);
    await client.query(`
      INSERT INTO daily_audit_reports (
        asset_code, report_title, period, distance_km, days_reviewed,
        failed_checks, flagged_checks, pass_checks, late_pings_pct, stops_per_km,
        penalty_inr, total_pings, compliance_score, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      v.code, v.title, v.period, v.dist, v.days,
      v.fails, v.flags, v.passes, v.late, v.stops,
      v.penalty, v.pings, v.score, v.status
    ]);

    // If Vehicle 08, 12, 19 need sample rule checks
    if (v.code !== 'VEHICLE 05') {
      await client.query(`DELETE FROM audit_rule_checks WHERE asset_code = $1`, [v.code]);
      const defaultChecks = [
        { rule: 'WM-TAM-02', check: 'Latency under 15 min', finding: `${v.late} delayed beyond SLA threshold`, status: v.fails > 0 ? 'Fail' : 'Pass' },
        { rule: 'WM-COV-03', check: '12+ stops per km', finding: `Logged ${v.stops} stops/km average`, status: parseFloat(v.stops) >= 12 ? 'Pass' : 'Fail' },
        { rule: 'WM-COV-02', check: 'Speed 3–18 km/h', finding: 'Nominal street collection velocity', status: v.flags > 0 ? 'Flag' : 'Pass' },
        { rule: 'WM-TIME-03', check: 'Idle under 15 min', finding: 'No extended unauthorized stoppage', status: 'Pass' },
        { rule: 'WM-BILL-01', check: 'Odometer vs track', finding: 'Calculated within 3% tolerance', status: 'Pass' }
      ];
      for (const c of defaultChecks) {
        await client.query(`
          INSERT INTO audit_rule_checks (asset_code, rule_code, check_name, finding, status)
          VALUES ($1, $2, $3, $4, $5)
        `, [v.code, c.rule, c.check, c.finding, c.status]);
      }
    }
  }

  const assetsRes = await client.query('SELECT count(1) FROM monitored_assets');
  const reportsRes = await client.query('SELECT count(1) FROM daily_audit_reports');
  console.log(`Database sync complete: ${assetsRes.rows[0].count} monitored assets, ${reportsRes.rows[0].count} audit reports in PostgreSQL.`);

  await client.end();
}

updateDb().catch(console.error);
