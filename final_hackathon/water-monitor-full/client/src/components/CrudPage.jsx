import { useEffect, useState } from 'react';
import { api } from '../api';

// Reusable list + form for any resource.
// fields: [{ name, label, type: text|number|date|select, options?, optionsFrom?: {resource, label} }]
export default function CrudPage({ title, resource, fields, columns }) {
  const svc = api(resource);
  const [rows, setRows] = useState([]);
  const [lookups, setLookups] = useState({});
  const [form, setForm] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => setRows(await svc.list());
  useEffect(() => {
    load().catch((e) => setError(e.message));
    fields.filter((f) => f.optionsFrom).forEach(async (f) => {
      const items = await api(f.optionsFrom.resource).list();
      setLookups((l) => ({ ...l, [f.name]: items.map((i) => ({ value: i.id, label: i[f.optionsFrom.label] })) }));
    });
  }, []);

  const reset = () => { setForm({}); setEditingId(null); setError(''); };
  const submit = async (e) => {
    e.preventDefault();
    try {
      editingId ? await svc.update(editingId, form) : await svc.create(form);
      reset(); load();
    } catch (err) { setError(err.message); }
  };
  const edit = (row) => {
    setEditingId(row.id);
    setForm(Object.fromEntries(fields.map((f) => [f.name, row[f.name] ?? ''])));
  };
  const remove = async (row) => {
    if (!confirm('Delete this record? Related records will also be removed.')) return;
    try { await svc.remove(row.id); load(); } catch (err) { setError(err.message); }
  };

  return (
    <section>
      <h2>{title}</h2>
      <form className="form" onSubmit={submit}>
        {fields.map((f) => {
          const opts = f.options?.map((o) => ({ value: o, label: o })) || lookups[f.name] || [];
          return (
            <label key={f.name}>{f.label}
              {f.type === 'select' ? (
                <select required={f.required} value={form[f.name] ?? ''} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}>
                  <option value="">Select…</option>
                  {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input type={f.type || 'text'} step="any" required={f.required} value={form[f.name] ?? ''}
                  onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} />
              )}
            </label>
          );
        })}
        <div className="actions">
          <button className="primary">{editingId ? 'Save changes' : `Add ${title.slice(0, -1).toLowerCase()}`}</button>
          {editingId && <button type="button" onClick={reset}>Cancel</button>}
        </div>
      </form>
      {error && <p className="error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead><tr>{columns.map((c) => <th key={c.label}>{c.label}</th>)}<th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                {columns.map((c) => <td key={c.label}>{c.render ? c.render(r) : r[c.key]}</td>)}
                <td className="row-actions"><button onClick={() => edit(r)}>Edit</button><button className="danger" onClick={() => remove(r)}>Delete</button></td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={columns.length + 1} className="empty">No {title.toLowerCase()} yet. Add the first one above.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
