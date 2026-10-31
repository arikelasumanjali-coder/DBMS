const { Op } = require('sequelize');
const { Reading, Meter, Building } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// Consumption = difference between consecutive readings of the same meter.
// GET /api/consumption?buildingId=&meterId=&from=YYYY-MM-DD&to=YYYY-MM-DD
exports.summary = asyncHandler(async (req, res) => {
  const { buildingId, meterId, from, to } = req.query;
  const where = {};
  if (to) where.readingDate = { [Op.lte]: to };
  if (meterId) where.MeterId = meterId;
  const meterWhere = buildingId ? { BuildingId: buildingId } : undefined;

  const readings = await Reading.findAll({
    where,
    include: [{ model: Meter, where: meterWhere, required: true, include: [Building] }],
    order: [['MeterId', 'ASC'], ['readingDate', 'ASC'], ['id', 'ASC']],
  });

  const byMeter = {}, byBuilding = {}, byMonth = {};
  let total = 0, prev = null;
  for (const r of readings) {
    const value = Number(r.value);
    if (prev && prev.MeterId === r.MeterId && (!from || r.readingDate >= from)) {
      const used = Math.max(0, value - Number(prev.value)); // guards against meter resets
      const m = r.Meter, b = m.Building;
      byMeter[m.id] ??= { meterId: m.id, meterNumber: m.meterNumber, building: b.name, unit: m.unit, consumption: 0 };
      byBuilding[b.id] ??= { buildingId: b.id, building: b.name, consumption: 0 };
      const month = r.readingDate.slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + used;
      byMeter[m.id].consumption += used;
      byBuilding[b.id].consumption += used;
      total += used;
    }
    prev = r;
  }
  const round = (n) => Math.round(n * 1000) / 1000;
  const list = (o) => Object.values(o).map((x) => ({ ...x, consumption: round(x.consumption) }));
  res.json({
    total: round(total),
    byBuilding: list(byBuilding),
    byMeter: list(byMeter),
    byMonth: Object.entries(byMonth).sort().map(([month, c]) => ({ month, consumption: round(c) })),
  });
});
