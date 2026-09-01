import React from 'react';

export interface TableProps {
  headers: string[];
  rows: React.ReactNode[][];
  emptyMessage?: string;
}

export function Table({
  headers,
  rows,
  emptyMessage = 'No data available',
}: TableProps) {
  if (rows.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-500 border border-[#1e2738] rounded bg-[#111622]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto border border-[#1e2738] rounded bg-[#111622]">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-[#1e2738] bg-[#131926] text-slate-400 font-medium uppercase tracking-wider">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e2738] text-slate-300">
          {rows.map((rowCells, rIdx) => (
            <tr key={rIdx} className="transition-colors hover:bg-[#171f30]">
              {rowCells.map((cell, cIdx) => (
                <td key={cIdx} className="px-4 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
