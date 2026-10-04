const { Client } = require('pg');

async function updateFleet() {
  const clientConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5433,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'omniverify'
      };

  const client = new Client(clientConfig);

  await client.connect();
  console.log('Connected to PostgreSQL...');

  // Baseline Bari Sadri Designated Planned Corridor
  const plannedCorridor = [
    { lat: 24.41078, lng: 74.46997, name: 'Municipal Depot / Nagori Hospital' },
    { lat: 24.41134, lng: 74.47025, name: 'CHC Central Ward Road' },
    { lat: 24.41210, lng: 74.47046, name: 'Main Road Junction' },
    { lat: 24.41289, lng: 74.47086, name: 'India Dental Clinic Street' },
    { lat: 24.41327, lng: 74.47126, name: 'Commercial Sector Cross' },
    { lat: 24.41370, lng: 74.47415, name: 'Basanti Clinic North Lane' },
    { lat: 24.41408, lng: 74.47527, name: 'Ward 12 Residential Spine' },
    { lat: 24.41507, lng: 74.47757, name: 'East Ring Road' },
    { lat: 24.41648, lng: 74.47782, name: 'Upper North Ring' },
    { lat: 24.41624, lng: 74.47333, name: 'Sahu Sho Market Link' },
    { lat: 24.41580, lng: 74.47176, name: 'West Sector Collector' },
    { lat: 24.41161, lng: 74.46975, name: 'South Return Corridor' },
    { lat: 24.40451, lng: 74.46928, name: 'Waste Transfer Station (WTS)' }
  ];

  // Fleet definition with realistic, distinct metrics
  const vehicles = [
    {
      code: 'VEHICLE 01',
      ward: 'Ward 12 (Bari Sadri)',
      title: 'Vehicle 01 • Waste Fleet Compliance Audit',
      dist: 71.2,
      pings: 3324,
      score: '94%',
      status: 'Pass',
      fails: 0,
      flags: 1,
      passes: 15,
      penalty: 1500,
      stops: '13.4',
      late: '2.1%',
      adherence: 95.8,
      checks: [
        { rule: 'WM-DEV-01', check: 'Designated corridor adherence', finding: '95.8% on-route corridor adherence — 1 minor detour (<45m)', status: 'Pass' },
        { rule: 'WM-TAM-02', check: 'Telemetry latency < 15 min', finding: '2.1% packet delay — real-time wireless streaming compliant', status: 'Pass' },
        { rule: 'WM-GIS-01', check: 'Min ward coverage >= 8 km', finding: '71.2 km logged — full municipal coverage achieved (142% of target)', status: 'Pass' },
        { rule: 'WM-D2D-01', check: 'D2D collection stops >= 12/km', finding: '13.4 stops/km — meets door-to-door density mandate', status: 'Pass' },
        { rule: 'WM-SPD-01', check: 'No speeding > 18 km/h', finding: '5.8% speed violations — occasional transit segment fly-by flagged', status: 'Flag' },
        { rule: 'WM-TIME-01', check: 'Start window 06:00–07:00', finding: 'Average start 06:14 AM — prompt shift start confirmed', status: 'Pass' },
        { rule: 'WM-TIME-02', check: '4.5 h active collection', finding: '5.2 h average daily collection duration', status: 'Pass' },
        { rule: 'WM-TAM-01', check: 'Min 500 pings/month', finding: '3,324 pings logged — comprehensive telematics density', status: 'Pass' },
        { rule: 'WM-GIS-02', check: 'Route continuity (gaps < 2 km)', finding: '0 coverage gaps — continuous breadcrumbs logged', status: 'Pass' },
        { rule: 'WM-LOD-01', check: 'Vehicle loaded at depot start', finding: 'Depot entry cluster confirmed at 06:12 AM daily', status: 'Pass' },
        { rule: 'WM-LOD-02', check: 'Disposal at designated WTS', finding: 'Daily trip to Bari Sadri WTS verified by geo-stamp', status: 'Pass' },
        { rule: 'WM-PKG-01', check: 'No unauthorized zone entry', finding: '0 restricted polygon ingress detected', status: 'Pass' },
        { rule: 'WM-ENV-01', check: 'Stationary idling < 10 min', finding: 'Idling within acceptable limits (max idle 3.2 min)', status: 'Pass' },
        { rule: 'WM-TAM-03', check: 'Ping interval <= 60s moving', finding: 'Interval variance < 4s — GPS transmitter calibrated', status: 'Pass' },
        { rule: 'WM-DOC-01', check: 'Driver biometric / log match', finding: 'Shift biometric punch matches vehicle start log', status: 'Pass' },
        { rule: 'WM-GIS-03', check: 'Ward boundary coverage >= 85%', finding: 'Ward 12 GIS boundary verified (89.4% covered)', status: 'Pass' },
        { rule: 'WM-BILL-01', check: 'Odometer vs track tolerance', finding: '71.2 km odometer vs 69.8 km GPS track (+2.0% variance)', status: 'Pass' }
      ]
    },
    {
      code: 'VEHICLE 03',
      ward: 'Ward 12 (Bari Sadri)',
      title: 'Vehicle 03 • Waste Fleet Compliance Audit',
      dist: 46.8,
      pings: 3045,
      score: '84%',
      status: 'Flag',
      fails: 0,
      flags: 3,
      passes: 13,
      penalty: 4500,
      stops: '10.8',
      late: '6.4%',
      adherence: 89.2,
      checks: [
        { rule: 'WM-DEV-01', check: 'Designated corridor adherence', finding: '89.2% on-route adherence — 3 corridor excursions (>75m off route)', status: 'Flag' },
        { rule: 'WM-TAM-02', check: 'Telemetry latency < 15 min', finding: '6.4% packet delay — sporadic transmission latency', status: 'Pass' },
        { rule: 'WM-GIS-01', check: 'Min ward coverage >= 8 km', finding: '46.8 km logged — 93.6% target coverage achieved', status: 'Pass' },
        { rule: 'WM-D2D-01', check: 'D2D collection stops >= 12/km', finding: '10.8 stops/km — slight collection density shortfall in sub-lanes', status: 'Flag' },
        { rule: 'WM-SPD-01', check: 'No speeding > 18 km/h', finding: '9.2% speed violations — multiple transit segments above limit', status: 'Flag' },
        { rule: 'WM-TIME-01', check: 'Start window 06:00–07:00', finding: 'Average start 06:48 AM — inside permissible morning window', status: 'Pass' },
        { rule: 'WM-TIME-02', check: '4.5 h active collection', finding: '4.7 h average daily collection duration', status: 'Pass' },
        { rule: 'WM-TAM-01', check: 'Min 500 pings/month', finding: '3,045 pings logged — adequate density', status: 'Pass' },
        { rule: 'WM-GIS-02', check: 'Route continuity (gaps < 2 km)', finding: '1 momentary signal drop on 14-Aug (1.4 km gap)', status: 'Pass' },
        { rule: 'WM-LOD-01', check: 'Vehicle loaded at depot start', finding: 'Depot departure cluster logged', status: 'Pass' },
        { rule: 'WM-LOD-02', check: 'Disposal at designated WTS', finding: 'Regular return trip to municipal disposal depot', status: 'Pass' },
        { rule: 'WM-PKG-01', check: 'No unauthorized zone entry', finding: 'No restricted zone ingress', status: 'Pass' },
        { rule: 'WM-ENV-01', check: 'Stationary idling < 10 min', finding: 'Idle within limits (longest stop 4.1 min)', status: 'Pass' },
        { rule: 'WM-TAM-03', check: 'Ping interval <= 60s moving', finding: 'Mean packet cadence 58 seconds', status: 'Pass' },
        { rule: 'WM-DOC-01', check: 'Driver biometric / log match', finding: 'Attendance sheet cross-referenced with ignition-on', status: 'Pass' },
        { rule: 'WM-GIS-03', check: 'Ward boundary coverage >= 85%', finding: '86.1% ward polygon coverage verified', status: 'Pass' },
        { rule: 'WM-BILL-01', check: 'Odometer vs track tolerance', finding: '46.8 km odometer vs 45.4 km GPS (+3.0%)', status: 'Pass' }
      ]
    },
    {
      code: 'VEHICLE 05',
      ward: 'Ward 12 (Bari Sadri)',
      title: 'Vehicle 05 • Waste Fleet Comprehensive Audit',
      dist: 38.7,
      pings: 3297,
      score: '54%',
      status: 'Fail',
      fails: 8,
      flags: 4,
      passes: 4,
      penalty: 14200,
      stops: '11.3',
      late: '72.0%',
      adherence: 73.5,
      checks: [
        { rule: 'WM-DEV-01', check: 'Designated corridor adherence', finding: '73.5% corridor adherence — 8 major off-route deviations up to 210m', status: 'Fail' },
        { rule: 'WM-TAM-02', check: 'Latency under 15 min', finding: '72% of pings over 30 min late; 1,416 received before sent', status: 'Fail' },
        { rule: 'WM-TAM-02b', check: 'Received >= packet time', finding: 'Impossible order on 1,416 pings; batch-like 153–165 s steps', status: 'Fail' },
        { rule: 'WM-TAM-01', check: 'No gap over 5 min', finding: '20 gaps inside a day, up to 150 min (20-Aug)', status: 'Fail' },
        { rule: 'WM-TIME-01', check: 'Start 06:00–07:00', finding: '24 of 31 days start after 07:20 AM', status: 'Fail' },
        { rule: 'WM-TIME-02', check: '4.5 h active collection', finding: 'No day reaches 4.5 h; export cut at ~105 pings/day', status: 'Fail' },
        { rule: 'WM-COV-03', check: '12+ stops per km', finding: '11.3 overall; 16 days below 12; 18-Aug has 0', status: 'Fail' },
        { rule: 'WM-COV-02', check: 'Speed 3–18 km/h', finding: '17% of pings over 18; 205 over 25; 7 over 30', status: 'Flag' },
        { rule: 'WM-TIME-04', check: 'No off-hours movement', finding: 'Evening run 11–13 Aug (~4.8 km after 18:00)', status: 'Flag' },
        { rule: 'WM-TAM-03', check: 'No static coordinate spoof', finding: '8 pings repeat position at over 5 km/h', status: 'Flag' },
        { rule: 'WM-GIS-01', check: 'Address vs coordinates', finding: '305 pings say Chittaurgarh, all inside Bari Sadri', status: 'Flag' },
        { rule: 'WM-TIME-03', check: 'Idle under 15 min', finding: 'Longest idle 2.1 min', status: 'Pass' },
        { rule: 'WM-BILL-01', check: 'Odometer vs track', finding: '38.73 km vs 37.96 km computed (+2%)', status: 'Pass' },
        { rule: 'WM-LOD-01', check: 'Vehicle loaded at depot start', finding: 'Depot dispatch verified', status: 'Pass' },
        { rule: 'WM-LOD-02', check: 'Disposal at designated WTS', finding: 'Dump cluster verified at Bari Sadri WTS', status: 'Pass' },
        { rule: 'WM-GIS-03', check: 'Ward boundary coverage >= 85%', finding: 'Ward GeoJSON pending verification', status: 'Not testable' }
      ]
    },
    {
      code: 'VEHICLE 06',
      ward: 'Ward 12 (Bari Sadri)',
      title: 'Vehicle 06 • High-Compliance Fleet Audit',
      dist: 68.3,
      pings: 3254,
      score: '97%',
      status: 'Pass',
      fails: 0,
      flags: 0,
      passes: 16,
      penalty: 0,
      stops: '13.8',
      late: '1.2%',
      adherence: 97.4,
      checks: [
        { rule: 'WM-DEV-01', check: 'Designated corridor adherence', finding: '97.4% on-route corridor adherence — exemplary municipal route compliance', status: 'Pass' },
        { rule: 'WM-TAM-02', check: 'Telemetry latency < 15 min', finding: '1.2% late pings — instant real-time telemetry streaming', status: 'Pass' },
        { rule: 'WM-GIS-01', check: 'Min ward coverage >= 8 km', finding: '68.3 km logged — extensive residential and commercial coverage', status: 'Pass' },
        { rule: 'WM-D2D-01', check: 'D2D collection stops >= 12/km', finding: '13.8 stops/km — high stop frequency across all ward sectors', status: 'Pass' },
        { rule: 'WM-SPD-01', check: 'No speeding > 18 km/h', finding: '2.8% pings > 18 km/h — fully within safe transit threshold', status: 'Pass' },
        { rule: 'WM-TIME-01', check: 'Start window 06:00–07:00', finding: '06:08 AM average start time across 31 days', status: 'Pass' },
        { rule: 'WM-TIME-02', check: '4.5 h active collection', finding: '5.4 h daily average active route collection', status: 'Pass' },
        { rule: 'WM-TAM-01', check: 'Min 500 pings/month', finding: '3,254 pings logged — signal coverage unbroken', status: 'Pass' },
        { rule: 'WM-GIS-02', check: 'Route continuity (gaps < 2 km)', finding: '0 transmission gaps throughout billing cycle', status: 'Pass' },
        { rule: 'WM-LOD-01', check: 'Vehicle loaded at depot start', finding: 'Depot departure authenticated at 06:05 AM', status: 'Pass' },
        { rule: 'WM-LOD-02', check: 'Disposal at designated WTS', finding: '2 daily disposal runs to WTS verified', status: 'Pass' },
        { rule: 'WM-PKG-01', check: 'No unauthorized zone entry', finding: 'Strict route adherence — 0 prohibited area pings', status: 'Pass' },
        { rule: 'WM-ENV-01', check: 'Stationary idling < 10 min', finding: 'Maximum idle duration 1.8 min', status: 'Pass' },
        { rule: 'WM-TAM-03', check: 'Ping interval <= 60s moving', finding: 'Strict 45s interval maintenance', status: 'Pass' },
        { rule: 'WM-DOC-01', check: 'Driver biometric / log match', finding: 'Driver roster and GPS ignition synchronized', status: 'Pass' },
        { rule: 'WM-GIS-03', check: 'Ward boundary coverage >= 85%', finding: '94.2% municipal ward boundary coverage', status: 'Pass' },
        { rule: 'WM-BILL-01', check: 'Odometer vs track tolerance', finding: '68.3 km odometer vs 67.9 km GPS track (+0.6%)', status: 'Pass' }
      ]
    },
    {
      code: 'VEHICLE 08',
      ward: 'Ward 12 (Bari Sadri)',
      title: 'Vehicle 08 • Waste Fleet Audit',
      dist: 32.1,
      pings: 2840,
      score: '82%',
      status: 'Flag',
      fails: 1,
      flags: 3,
      passes: 12,
      penalty: 4500,
      stops: '14.8',
      late: '18.0%',
      adherence: 87.0,
      checks: [
        { rule: 'WM-DEV-01', check: 'Designated corridor adherence', finding: '87.0% corridor adherence — 4 detour events recorded on market days', status: 'Flag' },
        { rule: 'WM-TAM-02', check: 'Telemetry latency < 15 min', finding: '18% late packets — local network congestion observed', status: 'Flag' },
        { rule: 'WM-GIS-01', check: 'Min ward coverage >= 8 km', finding: '32.1 km logged — 64.2% target coverage (partial shift)', status: 'Fail' },
        { rule: 'WM-D2D-01', check: 'D2D collection stops >= 12/km', finding: '14.8 stops/km — high density collection in compact old city area', status: 'Pass' },
        { rule: 'WM-SPD-01', check: 'No speeding > 18 km/h', finding: 'Speed compliant — 97.4% under 18 km/h', status: 'Pass' },
        { rule: 'WM-TIME-01', check: 'Start window 06:00–07:00', finding: '06:35 AM average start time', status: 'Pass' },
        { rule: 'WM-TIME-02', check: '4.5 h active collection', finding: '4.6 h active collection time', status: 'Pass' },
        { rule: 'WM-TAM-01', check: 'Min 500 pings/month', finding: '2,840 pings logged', status: 'Pass' },
        { rule: 'WM-GIS-02', check: 'Route continuity (gaps < 2 km)', finding: 'Continuous route logging', status: 'Pass' },
        { rule: 'WM-LOD-01', check: 'Vehicle loaded at depot start', finding: 'Depot departure verified', status: 'Pass' },
        { rule: 'WM-LOD-02', check: 'Disposal at designated WTS', finding: 'WTS delivery verified', status: 'Pass' },
        { rule: 'WM-ENV-01', check: 'Stationary idling < 10 min', finding: 'Stationary idle within limits', status: 'Pass' },
        { rule: 'WM-BILL-01', check: 'Odometer vs track tolerance', finding: 'Calculated within 2.5% tolerance', status: 'Pass' }
      ]
    },
    {
      code: 'VEHICLE 12',
      ward: 'Ward 04 (Zone B)',
      title: 'Vehicle 12 • Standard Fleet Audit',
      dist: 45.8,
      pings: 4110,
      score: '96%',
      status: 'Pass',
      fails: 0,
      flags: 1,
      passes: 15,
      penalty: 0,
      stops: '16.2',
      late: '4.0%',
      adherence: 96.8,
      checks: [
        { rule: 'WM-DEV-01', check: 'Designated corridor adherence', finding: '96.8% corridor adherence — compliant Ward 04 route tracking', status: 'Pass' },
        { rule: 'WM-TAM-02', check: 'Telemetry latency < 15 min', finding: '4% late packets — optimal telemetry transmission', status: 'Pass' },
        { rule: 'WM-GIS-01', check: 'Min ward coverage >= 8 km', finding: '45.8 km logged — complete Zone B coverage', status: 'Pass' },
        { rule: 'WM-D2D-01', check: 'D2D collection stops >= 12/km', finding: '16.2 stops/km — optimal door-to-door frequency', status: 'Pass' },
        { rule: 'WM-SPD-01', check: 'No speeding > 18 km/h', finding: '3.5% speed violations — within permitted margin', status: 'Pass' },
        { rule: 'WM-TIME-01', check: 'Start window 06:00–07:00', finding: '06:12 AM start time confirmed', status: 'Pass' },
        { rule: 'WM-TIME-02', check: '4.5 h active collection', finding: '5.1 h active collection duration', status: 'Pass' },
        { rule: 'WM-TAM-01', check: 'Min 500 pings/month', finding: '4,110 pings logged', status: 'Pass' },
        { rule: 'WM-GIS-02', check: 'Route continuity (gaps < 2 km)', finding: '0 gaps detected', status: 'Pass' },
        { rule: 'WM-LOD-01', check: 'Vehicle loaded at depot start', finding: 'Depot start authenticated', status: 'Pass' },
        { rule: 'WM-LOD-02', check: 'Disposal at designated WTS', finding: 'WTS trip confirmed', status: 'Pass' },
        { rule: 'WM-ENV-01', check: 'Stationary idling < 10 min', finding: 'Maximum idle 2.4 min', status: 'Pass' },
        { rule: 'WM-BILL-01', check: 'Odometer vs track tolerance', finding: 'Odometer match (+0.8%)', status: 'Pass' }
      ]
    },
    {
      code: 'VEHICLE 19',
      ward: 'Ward 07 (Central)',
      title: 'Vehicle 19 • High Latency Audit',
      dist: 21.4,
      pings: 1980,
      score: '48%',
      status: 'Fail',
      fails: 9,
      flags: 3,
      passes: 3,
      penalty: 18500,
      stops: '8.4',
      late: '84.0%',
      adherence: 64.2,
      checks: [
        { rule: 'WM-DEV-01', check: 'Designated corridor adherence', finding: '64.2% corridor adherence — 11 off-route excursions detected', status: 'Fail' },
        { rule: 'WM-TAM-02', check: 'Telemetry latency < 15 min', finding: '84% pings > 30 min late — batch dumping confirmed', status: 'Fail' },
        { rule: 'WM-GIS-01', check: 'Min ward coverage >= 8 km', finding: '21.4 km logged — severe coverage deficit for Ward 07', status: 'Fail' },
        { rule: 'WM-D2D-01', check: 'D2D collection stops >= 12/km', finding: '8.4 stops/km — well below SLA target (target 12+)', status: 'Fail' },
        { rule: 'WM-SPD-01', check: 'No speeding > 18 km/h', finding: '22% speed violations — excessive speed during collection', status: 'Fail' },
        { rule: 'WM-TIME-01', check: 'Start window 06:00–07:00', finding: 'Late start at 07:45 AM', status: 'Fail' },
        { rule: 'WM-TIME-02', check: '4.5 h active collection', finding: 'Only 2.4 h active duration', status: 'Fail' },
        { rule: 'WM-TAM-01', check: 'Min 500 pings/month', finding: '1,980 pings logged', status: 'Pass' },
        { rule: 'WM-GIS-02', check: 'Route continuity (gaps < 2 km)', finding: '5 large route gaps (>2.5 km) detected', status: 'Fail' },
        { rule: 'WM-LOD-01', check: 'Vehicle loaded at depot start', finding: 'Depot departure unconfirmed on 8 days', status: 'Fail' },
        { rule: 'WM-ENV-01', check: 'Stationary idling < 10 min', finding: '38 idle pings > 15 min — excessive unauthorized stoppage', status: 'Fail' }
      ]
    },
    {
      code: 'VEHICLE 23',
      ward: 'Ward 09 (North Zone)',
      title: 'Vehicle 23 • Rapid Deployment Check',
      dist: 28.5,
      pings: 1850,
      score: '76%',
      status: 'Flag',
      fails: 2,
      flags: 3,
      passes: 10,
      penalty: 5400,
      stops: '11.8',
      late: '14.0%',
      adherence: 86.4,
      checks: [
        { rule: 'WM-DEV-01', check: 'Designated corridor adherence', finding: '86.4% corridor adherence — 3 off-route turns in North Zone', status: 'Flag' },
        { rule: 'WM-TAM-02', check: 'Telemetry latency < 15 min', finding: '14% late packets — intermittent signal latency', status: 'Flag' },
        { rule: 'WM-GIS-01', check: 'Min ward coverage >= 8 km', finding: '28.5 km logged — moderate ward coverage', status: 'Pass' },
        { rule: 'WM-D2D-01', check: 'D2D collection stops >= 12/km', finding: '11.8 stops/km — marginally below 12.0 target', status: 'Flag' },
        { rule: 'WM-SPD-01', check: 'No speeding > 18 km/h', finding: '4.8% speed violations — within tolerance', status: 'Pass' },
        { rule: 'WM-TIME-01', check: 'Start window 06:00–07:00', finding: '06:40 AM start time confirmed', status: 'Pass' },
        { rule: 'WM-TIME-02', check: '4.5 h active collection', finding: '4.2 h active duration — slight shortfall', status: 'Flag' },
        { rule: 'WM-TAM-01', check: 'Min 500 pings/month', finding: '1,850 pings logged', status: 'Pass' },
        { rule: 'WM-BILL-01', check: 'Odometer vs track tolerance', finding: '28.5 km logged (+2.1%)', status: 'Pass' }
      ]
    }
  ];

  for (const v of vehicles) {
    // 1. Monitored Assets
    await client.query(`
      INSERT INTO monitored_assets (asset_code, assigned_ward, is_active)
      VALUES ($1, $2, TRUE)
      ON CONFLICT (asset_code) DO UPDATE SET assigned_ward = $2
    `, [v.code, v.ward]);

    // 2. Daily Audit Reports
    await client.query(`DELETE FROM daily_audit_reports WHERE asset_code = $1`, [v.code]);
    await client.query(`
      INSERT INTO daily_audit_reports (
        asset_code, report_title, period, distance_km, days_reviewed,
        failed_checks, flagged_checks, pass_checks, late_pings_pct, stops_per_km,
        penalty_inr, total_pings, compliance_score, status
      ) VALUES ($1, $2, '01-31 Aug 2026', $3, 31, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      v.code, v.title, v.dist, v.fails, v.flags, v.passes,
      v.late, v.stops, v.penalty, v.pings, v.score, v.status
    ]);

    // 3. Dynamic Audit Rule Checks
    await client.query(`DELETE FROM audit_rule_checks WHERE asset_code = $1`, [v.code]);
    for (const c of v.checks) {
      await client.query(`
        INSERT INTO audit_rule_checks (asset_code, rule_code, check_name, finding, status)
        VALUES ($1, $2, $3, $4, $5)
      `, [v.code, c.rule, c.check, c.finding, c.status]);
    }
  }

  // Ensure telemetry pings exist for ALL vehicles
  // Load base coordinates from Vehicle 05 pings
  const v05PingsRes = await client.query(`SELECT lat, lng, speed, address FROM telemetry_pings WHERE asset_code = 'VEHICLE 05' ORDER BY id ASC LIMIT 500`);
  let basePings = v05PingsRes.rows;

  if (basePings.length === 0) {
    basePings = plannedCorridor;
  }

  // Populate or refresh telemetry for vehicles needing pings
  for (const v of vehicles) {
    const existing = await client.query('SELECT count(1) FROM telemetry_pings WHERE asset_code = $1', [v.code]);
    const cnt = parseInt(existing.rows[0].count);
    if (cnt < 100) {
      console.log(`Synthesizing rich telemetry for ${v.code} (${v.ward})...`);
      await client.query('DELETE FROM telemetry_pings WHERE asset_code = $1', [v.code]);

      // Generate ~350 distinct GPS points along the ward route with realistic offsets
      const numPoints = 350;
      for (let i = 0; i < numPoints; i++) {
        const base = basePings[i % basePings.length];
        // add small realistic offset depending on vehicle ward & corridor deviation
        const offsetLat = (Math.sin(i * 0.15) * 0.0005) + ((i % 25 === 0 && v.adherence < 90) ? 0.0018 : 0);
        const offsetLng = (Math.cos(i * 0.18) * 0.0006) + ((i % 25 === 0 && v.adherence < 90) ? 0.0016 : 0);
        const lat = (parseFloat(base.lat) + offsetLat).toFixed(6);
        const lng = (parseFloat(base.lng) + offsetLng).toFixed(6);

        // Speed profile
        let speed = Math.round(10 + Math.sin(i * 0.3) * 8);
        if (i % 8 === 0) speed = 0; // stop
        if (v.code === 'VEHICLE 19' && i % 6 === 0) speed = 26; // speeding

        const status = speed === 0 ? 'Idle' : 'Moving';
        const addr = base.address || `${v.ward}, Rajasthan, India`;

        await client.query(`
          INSERT INTO telemetry_pings (asset_code, lat, lng, speed, status, address)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [v.code, lat, lng, speed, status, addr]);
      }
    }
  }

  const checkAssets = await client.query('SELECT a.asset_code, r.compliance_score, r.status, r.penalty_inr, count(p.id) as pings FROM monitored_assets a LEFT JOIN daily_audit_reports r ON a.asset_code=r.asset_code LEFT JOIN telemetry_pings p ON a.asset_code=p.asset_code GROUP BY a.asset_code, r.compliance_score, r.status, r.penalty_inr ORDER BY a.asset_code');
  console.table(checkAssets.rows);

  await client.end();
  console.log('Dynamic Fleet Sync Complete!');
}

updateFleet().catch(console.error);
