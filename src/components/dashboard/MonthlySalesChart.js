"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export default function MonthlySalesChart({ data = [], month, year }) {
  const { language, t } = useLanguage();
  const [hoveredDay, setHoveredDay] = useState(null);
  const [svgWidth, setSvgWidth] = useState(700);
  const containerRef = useRef(null);

  useEffect(() => {
    const update = (w) => { if (w > 0) setSvgWidth(Math.floor(w)); };
    if (containerRef.current) {
      update(containerRef.current.getBoundingClientRect().width);
    }
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) update(entry.contentRect.width);
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isMobile = svgWidth < 480;
  const isTablet = svgWidth < 768;

  const monthName = new Date(year, month - 1, 1).toLocaleString(language === "bn" ? "bn-BD" : "en-US", {
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

  // Responsive Y-axis step: mobile=5k, tablet=2k, desktop=1k
  const yStepSize = isMobile ? 5000 : isTablet ? 2000 : 1000;
  const niceMax = Math.max(Math.ceil(maxValue / yStepSize) * yStepSize, yStepSize * 4);
  const ySteps = niceMax / yStepSize;

  // Responsive layout
  const padLeft  = isMobile ? 44 : 72;
  const padRight = isMobile ? 6  : 16;
  const padTop   = 30;
  const padBottom = isMobile ? 36 : 50;
  const svgHeight = isMobile ? 260 : isTablet ? 340 : 440;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const slotW = plotW / daysInMonth;
  const barW  = Math.max(slotW * 0.65, 3);

  // Responsive typography
  const yFontSize = isMobile ? 9  : 13;
  const xFontSize = isMobile ? 9  : 12;

  // X-axis: skip labels on narrow screens to prevent overlap
  const xLabelStep = isMobile ? 5 : isTablet ? 3 : 1;
  const showXLabel = (d) => xLabelStep === 1 || d === 1 || d % xLabelStep === 0;

  const yLabel = (val) => isMobile ? `${val / 1000}k` : val.toLocaleString();

  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm w-full">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-800">
            {t("Monthly Sales Overview")}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {t("Daily sales for")}{" "}
            <span className="font-medium text-[#1E3A8A]">
              {monthName} {year}
            </span>
          </p>
        </div>
        {hoveredDay ? (
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500">{t("Day")} {hoveredDay.day}</p>
            <p className="text-sm sm:text-base font-bold text-[#1E3A8A]">
              ৳{hoveredDay.total.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">{hoveredDay.count} {t("sales")}</p>
          </div>
        ) : (
          <div className="text-right shrink-0 hidden sm:block">
            <p className="text-xs text-gray-400">{t("Hover a bar")}</p>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <div ref={containerRef} className="w-full overflow-hidden">
        <svg
          width={svgWidth}
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ display: "block", width: "100%" }}
        >
          {/* Y-axis grid lines + labels */}
          {Array.from({ length: ySteps + 1 }, (_, i) => {
            const value = yStepSize * i;
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
                  x={padLeft - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={yFontSize}
                  fontWeight="500"
                  fill="#4b5563"
                  fontFamily="sans-serif"
                >
                  {yLabel(value)}
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
            const barH = Math.max((total / niceMax) * plotH, total > 0 ? 2 : 0);
            const x = padLeft + (day - 1) * slotW + (slotW - barW) / 2;
            const y = padTop + plotH - barH;
            const isHovered = hoveredDay?.day === day;
            const tooltipW = isMobile ? 56 : 72;
            const tooltipX = Math.min(
              Math.max(x + barW / 2 - tooltipW / 2, padLeft),
              svgWidth - padRight - tooltipW
            );

            return (
              <g key={day}>
                {/* Hit area (mouse + touch) */}
                <rect
                  x={padLeft + (day - 1) * slotW}
                  y={padTop}
                  width={slotW}
                  height={plotH}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredDay({ day, total, count })}
                  onMouseLeave={() => setHoveredDay(null)}
                  onTouchStart={(e) => { e.preventDefault(); setHoveredDay({ day, total, count }); }}
                  onTouchEnd={() => setHoveredDay(null)}
                />
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  fill={isHovered ? "#2563eb" : "#1E3A8A"}
                  rx="2"
                  ry="2"
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
                    <polygon
                      points={`${tooltipX + tooltipW / 2 - 5},${y - 8} ${tooltipX + tooltipW / 2 + 5},${y - 8} ${tooltipX + tooltipW / 2},${y - 2}`}
                      fill="#1E3A8A"
                    />
                    <text
                      x={tooltipX + tooltipW / 2}
                      y={y - 16}
                      textAnchor="middle"
                      fontSize={isMobile ? 10 : 12}
                      fill="white"
                      fontFamily="sans-serif"
                      fontWeight="700"
                    >
                      ৳{total.toLocaleString()}
                    </text>
                  </g>
                )}

                {/* X-axis day label (skipped on small screens) */}
                {showXLabel(day) && (
                  <text
                    x={x + barW / 2}
                    y={padTop + plotH + (isMobile ? 14 : 20)}
                    textAnchor="middle"
                    fontSize={xFontSize}
                    fill={isHovered ? "#1E3A8A" : "#374151"}
                    fontFamily="sans-serif"
                    fontWeight={isHovered ? "700" : "500"}
                  >
                    {day}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer summary */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm bg-[#1E3A8A] opacity-80" />
          {t("Sales/day")}
        </div>
        <span>
          {t("Active")}:{" "}
          <span className="font-semibold text-gray-700">
            {dayData.filter((d) => d.total > 0).length}
          </span>
        </span>
        <span>
          {t("High")}:{" "}
          <span className="font-semibold text-gray-700">
            ৳{Math.max(...dayData.map((d) => d.total)).toLocaleString()}
          </span>
        </span>
        <span>
          {t("Total")}:{" "}
          <span className="font-semibold text-gray-700">
            ৳{dayData.reduce((s, d) => s + d.total, 0).toLocaleString()}
          </span>
        </span>
      </div>
    </div>
  );
}
