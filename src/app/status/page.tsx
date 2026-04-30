import React from 'react';
import { createClient } from '@/models/supabaseServer';

type StatusRow = Record<string, unknown>;

async function fetchStatusRows() {
  const supabase = await createClient();
  const [{ data, error }, { count: parentCount, error: parentCountError }, { count: camperCount, error: camperCountError }] =
    await Promise.all([
      supabase.from('status').select('*').order('workshop_title', { ascending: true }).order('slot_label', { ascending: true }),
      supabase.from('parents').select('*', { count: 'exact', head: true }),
      supabase.from('campers').select('*', { count: 'exact', head: true }),
    ]);

  if (error) {
    console.error('Error fetching status view:', error);
  }

  if (parentCountError) {
    console.error('Error fetching parents count:', parentCountError);
  }

  if (camperCountError) {
    console.error('Error fetching campers count:', camperCountError);
  }

  const rows: StatusRow[] = (data || []).map((row) => {
    const rest = { ...row };
    delete (rest as { slot_label?: unknown }).slot_label;
    return rest;
  });

  return {
    rows,
    error: error ? error.message : null,
    totalParents: parentCount ?? 0,
    totalCampers: camperCount ?? 0,
  };
}

export default async function StatusPage() {
  const { rows, error, totalParents, totalCampers } = await fetchStatusRows();

  return (
    <section className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-4">Workshops registration status</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border-2 border-surface-container-lowest bg-white p-5 shadow-sm">
          <p className="text-sm text-on-surface-variant font-medium">Total unique parents</p>
          <p className="text-3xl font-headline font-bold text-on-surface mt-1">{totalParents}</p>
        </div>
        <div className="rounded-2xl border-2 border-surface-container-lowest bg-white p-5 shadow-sm">
          <p className="text-sm text-on-surface-variant font-medium">Total campers added</p>
          <p className="text-3xl font-headline font-bold text-on-surface mt-1">{totalCampers}</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-6 shadow-lg border-2 border-surface-container-lowest overflow-auto">
        {error ? (
          <div className="p-6 text-center text-error">Failed to load status: {error}</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-center text-on-surface-variant">No registrations found.</div>
        ) : (
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest text-on-surface-variant text-sm">
                {Object.keys(rows[0]).map((key) => (
                  <th key={key} className="px-3 py-3 text-left font-semibold">
                    {key.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: StatusRow, i: number) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-surface-container-lowest/50'}>
                  {Object.keys(row).map((k) => {
                    const v = row[k];
                    let display = String(v ?? '');
                    // Friendly date/time formatting for ISO timestamps
                    if (typeof v === 'string' && /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
                      try {
                        display = new Date(v).toLocaleString();
                      } catch {}
                    }

                    return (
                      <td key={k} className="px-3 py-3 align-top text-sm text-on-surface">
                        <div className="truncate max-w-[20rem]">{display}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}