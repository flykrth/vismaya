import React from 'react';
import { createClient } from '@/models/supabaseServer';

type StatusRow = Record<string, any>;

async function fetchStatusRows() {
  const supabase = await createClient();

  // Execute all queries in parallel
  const [statusRes, parentRes, camperRes] = await Promise.all([
    supabase
      .from('status')
      .select('*')
      .order('workshop_title', { ascending: true })
      .order('slot_label', { ascending: true }),

    // Fetch total parents count
    supabase
      .from('parents')
      .select('id', { count: 'exact' }),

    // Fetch total campers count
    supabase
      .from('campers')
      .select('id', { count: 'exact' }),
  ]);

  // Error logging
  if (statusRes.error) {
    console.error('Error fetching status view:', statusRes.error);
  }

  if (parentRes.error) {
    console.error('Error fetching parents count:', parentRes.error);
  }

  if (camperRes.error) {
    console.error('Error fetching campers count:', camperRes.error);
  }

  // Process rows
  const rows: StatusRow[] = (statusRes.data || []).map((row) => {
    const { ...visibleData } = row;
    return visibleData;
  });

  return {
    rows,
    error: statusRes.error ? statusRes.error.message : null,
    totalParents: parentRes.count ?? 0,
    totalCampers: camperRes.count ?? 0,
  };
}

export default async function StatusPage() {
  const { rows, error, totalParents, totalCampers } =
    await fetchStatusRows();

  return (
    <section className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface mb-4">
          Workshop Registration Status
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border-2 border-surface-container-lowest bg-white p-5 shadow-sm">
          <p className="text-sm text-on-surface-variant font-medium">
            Total Unique Parents
          </p>
          <p className="text-3xl font-headline font-bold text-on-surface mt-1">
            {totalParents}
          </p>
        </div>

        <div className="rounded-2xl border-2 border-surface-container-lowest bg-white p-5 shadow-sm">
          <p className="text-sm text-on-surface-variant font-medium">
            Total Campers Added
          </p>
          <p className="text-3xl font-headline font-bold text-on-surface mt-1">
            {totalCampers}
          </p>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-[2rem] p-6 shadow-lg border-2 border-surface-container-lowest overflow-x-auto">
        {error ? (
          <div className="p-6 text-center text-error font-medium">
            Failed to load status: {error}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-center text-on-surface-variant font-medium">
            No registration data found.
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest text-on-surface-variant text-sm border-b-2 border-surface-container">
                {Object.keys(rows[0]).map((key) => (
                  <th
                    key={key}
                    className="px-4 py-4 text-left font-bold uppercase tracking-wider"
                  >
                    {key.replaceAll('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-surface-container">
              {rows.map((row: StatusRow, i: number) => (
                <tr
                  key={i}
                  className={`transition-colors hover:bg-surface-container-lowest ${
                    i % 2 === 0
                      ? 'bg-white'
                      : 'bg-surface-container-lowest/30'
                  }`}
                >
                  {Object.keys(row).map((k) => {
                    const v = row[k];
                    let display = String(v ?? '—');

                    // Format timestamps
                    if (
                      typeof v === 'string' &&
                      /^\d{4}-\d{2}-\d{2}T/.test(v)
                    ) {
                      try {
                        display = new Date(v).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        });
                      } catch {
                        display = v;
                      }
                    }

                    return (
                      <td
                        key={k}
                        className="px-4 py-4 text-sm text-on-surface"
                      >
                        <div className="font-medium">{display}</div>
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