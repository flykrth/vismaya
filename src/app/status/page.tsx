import React from 'react';
import { createClient } from '@/models/supabaseServer';

async function fetchStatusRows() {
  const supabase = await createClient();
  // The `status` view does not expose a `created_at` column; don't order by it.
  // Order by workshop_title then slot_label for a sensible default ordering.
  const { data, error } = await supabase
    .from('status')
    .select('*')
    .order('workshop_title', { ascending: true })
    .order('slot_label', { ascending: true });
  if (error) {
    console.error('Error fetching status view:', error);
    return { rows: [], error: error.message };
  }

  return { rows: data || [], error: null };
}

export default async function StatusPage() {
  const { rows, error } = await fetchStatusRows();

  return (
    <section className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-4">Workshops registration status</h1>
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
              {rows.map((row: Record<string, unknown>, i: number) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-surface-container-lowest/50'}>
                  {Object.keys(row).map((k) => {
                    const v = row[k] as unknown;
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