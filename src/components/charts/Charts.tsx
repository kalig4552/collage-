/**
 * Interactive SVG charting components for Library Analytics
 * Clean, accessible, zero-external-dependency visualizations.
 */

import React, { useState } from 'react';

// Monthly Trend Line Chart
export function LineTrendChart({
  data,
  title,
  xLabel = 'Month',
  yLabel = 'Transactions',
}: {
  data: { label: string; value: number }[];
  title?: string;
  xLabel?: string;
  yLabel?: string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-slate-400 text-sm">No trend data available</div>;
  }

  const width = 640;
  const height = 240;
  const padding = { top: 30, right: 30, bottom: 45, left: 55 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(...data.map(d => d.value), 10);
  const minVal = 0;

  const points = data.map((d, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * innerWidth;
    const y = padding.top + innerHeight - ((d.value - minVal) / (maxVal - minVal)) * innerHeight;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${padding.top + innerHeight} L ${points[0].x} ${padding.top + innerHeight} Z`
    : '';

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col">
      {title && (
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
          <span className="text-xs text-slate-400">Monthly Circulation</span>
        </div>
      )}
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px] overflow-visible">
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + innerHeight * (1 - pct);
            const val = Math.round(minVal + (maxVal - minVal) * pct);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#trendGradient)" />

          {/* Line stroke */}
          <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />

          {/* Points */}
          {points.map((p, i) => (
            <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === i ? 6 : 4}
                fill={hoveredIdx === i ? '#818cf8' : '#4f46e5'}
                stroke="#1e1b4b"
                strokeWidth="2"
                className="transition-all"
              />
              {/* X Axis Labels */}
              <text
                x={p.x}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-medium"
              >
                {p.label}
              </text>
            </g>
          ))}

          {/* Tooltip */}
          {hoveredIdx !== null && points[hoveredIdx] && (
            <g transform={`translate(${points[hoveredIdx].x}, ${points[hoveredIdx].y - 35})`}>
              <rect
                x="-40"
                y="-15"
                width="80"
                height="26"
                rx="6"
                fill="#0f172a"
                stroke="#6366f1"
                strokeWidth="1"
              />
              <text x="0" y="2" textAnchor="middle" className="text-[11px] fill-slate-100 font-semibold font-mono">
                {points[hoveredIdx].value} borrows
              </text>
            </g>
          )}
        </svg>
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 px-1 border-t border-slate-800/80">
        <span>X: {xLabel}</span>
        <span>Y: {yLabel}</span>
      </div>
    </div>
  );
}

// Horizontal Bar Chart
export function HorizontalBarChart({
  data,
  title,
  color = '#6366f1',
  maxItems = 10,
}: {
  data: { label: string; value: number; secondary?: string }[];
  title?: string;
  color?: string;
  maxItems?: number;
}) {
  const items = data.slice(0, maxItems);
  const maxVal = Math.max(...items.map(d => d.value), 1);

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col">
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
          <span className="text-xs text-slate-400">Top {items.length}</span>
        </div>
      )}
      <div className="space-y-2.5">
        {items.map((item, idx) => {
          const pct = Math.round((item.value / maxVal) * 100);
          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium truncate max-w-[70%]" title={item.label}>
                  <span className="text-slate-500 font-mono mr-1.5">{idx + 1}.</span>
                  {item.label}
                  {item.secondary && (
                    <span className="text-slate-400 font-normal ml-1.5">({item.secondary})</span>
                  )}
                </span>
                <span className="text-indigo-300 font-mono font-semibold">{item.value.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 group-hover:brightness-125"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Donut Chart for Categories / Transaction Status
export function DonutChart({
  data,
  title,
}: {
  data: { label: string; value: number; color: string }[];
  title?: string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;

  let currentAngle = 0;
  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const rOuter = 75;
    const rInner = 45;
    const cx = 100;
    const cy = 100;

    const x1 = cx + rOuter * Math.cos(startRad);
    const y1 = cy + rOuter * Math.sin(startRad);
    const x2 = cx + rOuter * Math.cos(endRad);
    const y2 = cy + rOuter * Math.sin(endRad);

    const x3 = cx + rInner * Math.cos(endRad);
    const y3 = cy + rInner * Math.sin(endRad);
    const x4 = cx + rInner * Math.cos(startRad);
    const y4 = cy + rInner * Math.sin(startRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData = `
      M ${x1} ${y1}
      A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;

    return {
      ...d,
      pathData,
      pct: ((d.value / total) * 100).toFixed(1),
    };
  });

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col">
      {title && <h4 className="text-sm font-semibold text-slate-200 mb-3">{title}</h4>}
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-48 h-48 flex-shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full transform hover:scale-105 transition-transform">
            {slices.map((s, i) => (
              <path
                key={i}
                d={s.pathData}
                fill={s.color}
                stroke="#0f172a"
                strokeWidth="2"
                className="cursor-pointer transition-opacity"
                opacity={hoveredIdx === null || hoveredIdx === i ? 1 : 0.4}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs text-slate-400">Total</span>
            <span className="text-lg font-bold font-mono text-slate-100">{total.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex-1 space-y-1.5 w-full">
          {slices.map((s, i) => (
            <div
              key={i}
              className={`flex items-center justify-between text-xs p-1.5 rounded transition-colors cursor-pointer ${
                hoveredIdx === i ? 'bg-slate-800' : 'hover:bg-slate-800/40'
              }`}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-slate-300 truncate">{s.label}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 font-mono">
                <span className="text-slate-400">{s.pct}%</span>
                <span className="text-slate-200 font-semibold">{s.value.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Correlation Heatmap Component
export function CorrelationHeatmap({
  columns,
  matrix,
}: {
  columns: string[];
  matrix: number[][];
}) {
  const getColor = (val: number) => {
    if (val === 1) return 'bg-indigo-600 text-white';
    if (val >= 0.7) return 'bg-indigo-500/80 text-white';
    if (val >= 0.4) return 'bg-indigo-400/50 text-indigo-100';
    if (val >= 0.1) return 'bg-indigo-300/30 text-indigo-200';
    if (val > -0.1) return 'bg-slate-800 text-slate-300';
    if (val > -0.4) return 'bg-rose-400/30 text-rose-200';
    if (val > -0.7) return 'bg-rose-500/60 text-white';
    return 'bg-rose-600 text-white';
  };

  return (
    <div className="overflow-x-auto w-full bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-200">Pearson Correlation Matrix</h4>
        <span className="text-xs text-slate-400 font-mono">Ranges: -1.0 to +1.0</span>
      </div>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left text-slate-400 font-medium">Variable</th>
            {columns.map((c, i) => (
              <th key={i} className="p-2 text-center text-slate-300 font-mono text-[11px]">
                {c.replace('_', ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, rIdx) => (
            <tr key={rIdx} className="border-t border-slate-800/60">
              <td className="p-2 text-slate-300 font-medium whitespace-nowrap">
                {columns[rIdx].replace('_', ' ')}
              </td>
              {row.map((val, cIdx) => (
                <td key={cIdx} className="p-1.5 text-center">
                  <div
                    className={`w-full py-1.5 px-2 rounded font-mono font-semibold text-[11px] transition-transform hover:scale-105 ${getColor(
                      val
                    )}`}
                    title={`${columns[rIdx]} vs ${columns[cIdx]}: ${val}`}
                  >
                    {val > 0 && val !== 1 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
