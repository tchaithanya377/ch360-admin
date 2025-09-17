import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SelectLoaders, TransportAPI } from '../../../services/transportApiService';

export default function RouteDetailPage() {
  const { id } = useParams();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [stopsData, setStopsData] = useState({ results: [] });
  const [form, setForm] = useState({ stop_id: '', order_index: '', arrival_offset_min: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true); setError('');
      try {
        const r = await TransportAPI.routes.retrieve(id);
        if (mounted) setRoute(r);
        const s = await SelectLoaders.stops();
        if (mounted) setStopsData(s);
      } catch (e) {
        if (mounted) setError(e?.message || 'Failed to load');
      } finally { if (mounted) setLoading(false); }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  const orderedStops = useMemo(() => {
    if (!route?.route_stops) return [];
    return [...route.route_stops].sort((a, b) => a.order_index - b.order_index);
  }, [route]);

  const submit = async (e) => {
    e.preventDefault(); setSubmitting(true); setFormError('');
    try {
      const payload = {
        route: Number(id),
        stop_id: Number(form.stop_id),
        order_index: Number(form.order_index),
        arrival_offset_min: Number(form.arrival_offset_min),
      };
      await TransportAPI.routeStops.create(payload);
      const r = await TransportAPI.routes.retrieve(id);
      setRoute(r);
      setForm({ stop_id: '', order_index: '', arrival_offset_min: '' });
    } catch (e) {
      if (e?.status === 400) {
        const p = e.payload || {};
        const msg = Object.entries(p).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('; ');
        setFormError(msg || e.message);
      } else {
        setFormError(e.message || 'Failed');
      }
    } finally { setSubmitting(false); }
  };

  const removeRouteStop = async (routeStopId) => {
    if (!confirm('Delete this route stop?')) return;
    try {
      await TransportAPI.routeStops.remove(routeStopId);
      const r = await TransportAPI.routes.retrieve(id);
      setRoute(r);
    } catch (e) {
      alert(e.message || 'Failed');
    }
  };

  const [editStop, setEditStop] = useState(null);
  const [editForm, setEditForm] = useState({ order_index: '', arrival_offset_min: '' });
  const [editErr, setEditErr] = useState('');
  const saveEdit = async () => {
    if (!editStop) return;
    try {
      await TransportAPI.routeStops.patch(editStop.id, {
        order_index: Number(editForm.order_index),
        arrival_offset_min: Number(editForm.arrival_offset_min),
      });
      const r = await TransportAPI.routes.retrieve(id);
      setRoute(r);
      setEditStop(null);
    } catch (e) {
      if (e.status === 400 && e.payload) {
        const msg = Object.entries(e.payload).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('; ');
        setEditErr(msg || e.message);
      } else setEditErr(e.message || 'Failed');
    }
  };

  return (
    <div className="space-y-4">
      {loading && <div className="text-sm text-gray-500">Loading…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      {route && (
        <>
          <div>
            <h2 className="text-lg font-semibold">{route.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{route.description}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Route Stops</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">Order</th>
                    <th className="p-2">Stop</th>
                    <th className="p-2">Arrival +min</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orderedStops.map(rs => (
                    <tr key={rs.id} className="border-b">
                      <td className="p-2">
                        {editStop?.id === rs.id ? (
                          <input type="number" value={editForm.order_index} onChange={(e) => setEditForm(f => ({ ...f, order_index: e.target.value }))} className="w-20 px-2 py-1 border rounded" />
                        ) : rs.order_index}
                      </td>
                      <td className="p-2">{rs.stop?.name}</td>
                      <td className="p-2">
                        {editStop?.id === rs.id ? (
                          <input type="number" value={editForm.arrival_offset_min} onChange={(e) => setEditForm(f => ({ ...f, arrival_offset_min: e.target.value }))} className="w-24 px-2 py-1 border rounded" />
                        ) : rs.arrival_offset_min}
                      </td>
                      <td className="p-2 flex gap-2">
                        {editStop?.id === rs.id ? (
                          <>
                            <button onClick={saveEdit} className="text-blue-600 hover:underline">Save</button>
                            <button onClick={() => setEditStop(null)} className="text-gray-600 hover:underline">Cancel</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditStop(rs); setEditForm({ order_index: rs.order_index, arrival_offset_min: rs.arrival_offset_min }); setEditErr(''); }} className="text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => removeRouteStop(rs.id)} className="text-red-600 hover:underline">Delete</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {editErr && <div className="text-sm text-red-600">{editErr}</div>}
          </div>

          <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
            <div>
              <label className="block text-xs mb-1">Stop</label>
              <select value={form.stop_id} onChange={(e) => setForm(f => ({ ...f, stop_id: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900">
                <option value="">Select stop…</option>
                {stopsData.results.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Order Index</label>
              <input type="number" value={form.order_index} onChange={(e) => setForm(f => ({ ...f, order_index: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
            </div>
            <div>
              <label className="block text-xs mb-1">Arrival Offset (min)</label>
              <input type="number" value={form.arrival_offset_min} onChange={(e) => setForm(f => ({ ...f, arrival_offset_min: e.target.value }))} className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900" />
            </div>
            <div>
              <button disabled={submitting} className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50">Add Stop</button>
            </div>
            {formError && <div className="md:col-span-4 text-sm text-red-600">{formError}</div>}
          </form>
        </>
      )}
    </div>
  );
}


