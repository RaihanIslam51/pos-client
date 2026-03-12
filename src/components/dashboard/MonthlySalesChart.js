"use client";
import { useState, useMemo, useRef, useEffect } from "react";

export default function MonthlySalesChart({ data = [], month, year }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [svgWidth, setSvgWidth] = useState(1000);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSvgWidth(Math.floor(entry.contentRect.width));
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const monthName = new Date(year, month - 1, 1).toLocaleString("default", {
    month: "long",
  });

  const daysInMonth = new Date(year, month, 0).getDate();

  const dayData = useMemo(() => {
    const arr = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const found = data.find((item) => item._id === d);
      arr.push({ day: d, total: found?.total || 0, count: found?.count || 0 });
    }
    return arr;
  }, [data, daysInMonth]);

  const maxValue = Math.max(...dayData.map((d) => d.total), 0);
  // Always at least 10000, then round up to next 1000
  const niceMax = Math.max(Math.ceil(maxValue / 1000) * 1000, 10000);
  const ySteps = niceMax / 1000; // each step = 1000

  const padLeft = 72;
  const padRight = 16;
  const padTop = 30;
  const padBottom = 50;
  const svgHeight = 440;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const slotW = plotW / daysInMonth;
  const barW = Math.max(slotW * 0.65, 5);

  return (
    <div className="bg-white rounded-xl p-4 lg:p-6 shadow-sm w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            Monthly Sales Overview
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Daily sales for{" "}
            <span className="font-medium text-[#1E3A8A]">
              {monthName} {year}
            </span>
          </p>
        </div>
        {hoveredDay ? (
          <div className="text-right">
            <p className="text-xs text-gray-500">Day {hoveredDay.day}</p>
            <p className="text-base font-bold text-[#1E3A8A]">
              ৳{hoveredDay.total.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">{hoveredDay.count} sales</p>
          </div>
        ) : (
          <div className="text-right">
            <p className="text-xs text-gray-400">Hover a bar</p>
          </div>
        )}
      </div>

      {/* SVG Chart — full width via ResizeObserver */}
      <div ref={containerRef} className="w-full">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ display: "block", width: "100%" }}
        >
          {/* Y-axis grid lines and labels — every 1k */}
          {Array.from({ length: ySteps + 1 }, (_, i) => {
            const value = 1000 * i;
            const y = padTop + plotH - (value / niceMax) * plotH;
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke={i === 0 ? "#e5e7eb" : "#f3f4f6"}
                  strokeWidth={i === 0 ? 1.5 : 1}
                  strokeDasharray={i === 0 ? "0" : "5 4"}
                />
                <text
                  x={padLeft - 8}
                  y={y + 5}
                  textAnchor="end"
                  fontSize="13"
                  fontWeight="500"
                  fill="#4b5563"
                  fontFamily="sans-serif"
                >
                  {value.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Y-axis vertical line */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft}
            y2={padTop + plotH}
            stroke="#e5e7eb"
            strokeWidth="1.5"
          />

          {/* Bars */}
          {dayData.map(({ day, total, count }) => {
            const barH = Math.max((total / niceMax) * plotH, total > 0 ? 3 : 0);
            const x = padLeft + (day - 1) * slotW + (slotW - barW) / 2;
            const y = padTop + plotH - barH;
            const isHovered = hoveredDay?.day === day;
            const tooltipW = 72;
            const tooltipX = Math.min(
              Math.max(x + barW / 2 - tooltipW / 2, padLeft),
              svgWidth - padRight - tooltipW
            );

            return (
              <g key={day}>
                {/* Bar background (hit area) */}
                <rect
                  x={padLeft + (day - 1) * slotW}
                  y={padTop}
                  width={slotW}
                  height={plotH}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredDay({ day, total, count })}
                  onMouseLeave={() => setHoveredDay(null)}
                />
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  fill={isHovered ? "#2563eb" : "#1E3A8A"}
                  rx="3"
                  ry="3"
                  opacity={isHovered ? 1 : 0.82}
                  style={{ pointerEvents: "none", transition: "fill 0.1s, opacity 0.1s" }}
                />

                {/* Tooltip above bar */}
                {isHovered && total > 0 && (
                  <g style={{ pointerEvents: "none" }}>
                    <rect
                      x={tooltipX}
                      y={y - 34}
                      width={tooltipW}
                      height={26}
                      fill="#1E3A8A"
                      rx="5"
                    />
                    {/* triangle pointer */}
                    <polygon
                      points={`${tooltipX + tooltipW / 2 - 5},${y - 8} ${tooltipX + tooltipW / 2 + 5},${y - 8} ${tooltipX + tooltipW / 2},${y - 2}`}
                      fill="#1E3A8A"
                    />
                    <text
                      x={tooltipX + tooltipW / 2}
                      y={y - 16}
                      textAnchor="middle"
                      fontSize="12"
                      fill="white"
                      fontFamily="sans-serif"
                      fontWeight="700"
                    >
                      ৳{total.toLocaleString()}
                    </text>
                  </g>
                )}

                {/* X-axis day number */}
                <text
                  x={x + barW / 2}
                  y={padTop + plotH + 20}
                  textAnchor="middle"
                  fontSize="12"
                  fill={isHovered ? "#1E3A8A" : "#374151"}
                  fontFamily="sans-serif"
                  fontWeight={isHovered ? "700" : "500"}
                >
                  {day}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer summary */}
      <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#1E3A8A] opacity-80" />
          Sales per day
        </div>
        <span>
          Active days:{" "}
          <span className="font-semibold text-gray-700">
            {dayData.filter((d) => d.total > 0).length}
          </span>
        </span>
        <span>
          Highest:{" "}
          <span className="font-semibold text-gray-700">
            ৳{Math.max(...dayData.map((d) => d.total)).toLocaleString()}
          </span>
        </span>
        <span>
          Total:{" "}
          <span className="font-semibold text-gray-700">
            ৳{dayData.reduce((s, d) => s + d.total, 0).toLocaleString()}
          </span>
        </span>
      </div>
    </div>
  );
}
