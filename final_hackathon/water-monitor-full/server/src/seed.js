const { Building, Meter, Reading } = require('./models');

module.exports = async () => {
  if (await Building.count()) return;
  const b1 = await Building.create({ name: 'Science Block', address: 'North Campus', type: 'campus' });
  const b2 = await Building.create({ name: 'Lakeview Apartments', address: '12 Lake Rd', type: 'apartment' });
  const m1 = await Meter.create({ meterNumber: 'SB-001', location: 'Main inlet', BuildingId: b1.id });
  const m2 = await Meter.create({ meterNumber: 'LV-101', location: 'Tower A', BuildingId: b2.id });
  const data = [[m1, [100, 142, 190, 236]], [m2, [500, 531, 566, 590]]];
  for (const [m, vals] of data)
    for (let i = 0; i < vals.length; i++)
      await Reading.create({ MeterId: m.id, value: vals[i], readingDate: `2026-0${i + 6}-01` });
};
