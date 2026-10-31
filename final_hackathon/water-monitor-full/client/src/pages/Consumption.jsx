import { useEffect, useState } from 'react';
import { api, getConsumption } from '../api';

const Bars = ({ rows, label, unit }) => {
  const max = Math.max(1, ...rows.map((r) => r.consumption));
  return (
    <div className="bars">
      {rows.map((r) => (
        <div className="bar-row" key={label(r)}>
          <span>{label(r)}</span>
          <div className="track"><div className="fill" style={{ width: `${(r.consumption / max) * 100}%` }} /></div>
          <b>{r.consumption} {unit}</b>
        </div>
      ))}
      {!rows.length && <p className="empty">Not enough readings in this range. Consumption needs at least two readings per meter.</p>}
    </div>
  );
};

export default function Consumption() {
  const [filters, setFilters] = useState({ buildingId: '', from: '', to: '' });
  const [buildings, setBuildings] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const run = async () => {
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      setData(await getConsumption(params)); setError('');
    } catch (e) { setError(e.message); }
  };
  useEffect(() => { api('buildings').list().then(setBuildings); run(); }, []);
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });

  return (
    <section>
      <h2>Consumption</h2>
      <div className="form">
        <label>Building
          <select value={filters.buildingId} onChange={set('buildingId')}>
            <option value="">All buildings</option>
            {buildings.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
        <label>From<input type="date" value={filters.from} onChange={set('from')} /></label>
        <label>To<input type="date" value={filters.to} onChange={set('to')} /></label>
        <div className="actions"><button className="primary" onClick={run}>Update</button></div>
      </div>
      {error && <p className="error">{error}</p>}
      {data && (
        <>
          <div className="total"><span>Total used</span><strong>{data.total}</strong><span>m³</span></div>
          <h3>By building</h3><Bars rows={data.byBuilding} label={(r) => r.building} unit="m³" />
          <h3>By meter</h3><Bars rows={data.byMeter} label={(r) => `${r.meterNumber} (${r.building})`} unit="m³" />
          <h3>By month</h3><Bars rows={data.byMonth} label={(r) => r.month} unit="m³" />
        </>
      )}
    </section>
  );
}
