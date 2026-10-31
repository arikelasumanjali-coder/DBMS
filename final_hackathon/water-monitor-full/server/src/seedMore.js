// Adds extra demo data. Run from the server folder:  node src/seedMore.js
// Safe to run more than once: existing buildings/meters are reused and
// meters that already have readings are skipped.
require('dotenv').config();
const { sequelize, Building, Meter, Reading } = require('./models');

const buildings = [
  { name: 'Library', address: 'Central Campus', type: 'campus', meters: [['LIB-001', 'Main inlet', 30], ['LIB-002', 'Cafeteria', 45]] },
  { name: 'Boys Hostel A', address: 'East Campus', type: 'building', meters: [['BHA-001', 'Block 1', 120], ['BHA-002', 'Block 2', 110], ['BHA-003', 'Mess', 80]] },
  { name: 'Girls Hostel B', address: 'West Campus', type: 'building', meters: [['GHB-001', 'Block 1', 105], ['GHB-002', 'Mess', 75]] },
  { name: 'Sunrise Residency', address: '45 Park Street', type: 'apartment', meters: [['SR-101', 'Tower A', 60], ['SR-102', 'Tower B', 55], ['SR-103', 'Garden', 25]] },
  { name: 'Engineering Lab Complex', address: 'North Campus', type: 'facility', meters: [['ELC-001', 'Cooling plant', 90], ['ELC-002', 'Labs', 40]] },
  { name: 'Sports Complex', address: 'South Campus', type: 'facility', meters: [['SPC-001', 'Pool', 150], ['SPC-002', 'Showers', 50]] },
];

// Seasonal multiplier: summer months use more water.
const season = [0.8, 0.8, 0.9, 1.1, 1.3, 1.4, 1.3, 1.2, 1.0, 0.9, 0.8, 0.8];
let seed = 7;
const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

(async () => {
  await sequelize.sync();
  let added = 0;
  for (const b of buildings) {
    const [building] = await Building.findOrCreate({
      where: { name: b.name }, defaults: { address: b.address, type: b.type },
    });
    for (const [meterNumber, location, monthly] of b.meters) {
      const [meter] = await Meter.findOrCreate({
        where: { meterNumber }, defaults: { location, BuildingId: building.id },
      });
      if (await Reading.count({ where: { MeterId: meter.id } })) continue;

      let value = 1000 + Math.round(rand() * 500);
      for (let i = 0; i < 12; i++) {          // Nov 2025 -> Oct 2026
        const d = new Date(Date.UTC(2025, 10 + i, 1));
        const month = d.getUTCMonth();
        value += monthly * season[month] * (0.85 + rand() * 0.3);
        await Reading.create({
          MeterId: meter.id,
          value: value.toFixed(3),
          readingDate: d.toISOString().slice(0, 10),
          notes: i === 0 ? 'Opening reading' : null,
        });
        added++;
      }
    }
  }
  console.log(`Done. Added ${added} readings.`);
  await sequelize.close();
})();
