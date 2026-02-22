import React from "react";

function RiskGauge({ score = 0 }) {
  const radius = 70;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const getColor = () => {
    if (score > 70) return "#ef4444";
    if (score > 40) return "#f59e0b";
    return "#22c55e";
  };

  return (
    <div style={{ width: 180, height: 180, margin: "0 auto" }}>
      <svg height={radius * 2} width={radius * 2} style={{ overflow: "visible" }}>
        <circle
          stroke="#1f2937"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={getColor()}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            transition: "stroke-dashoffset 1s ease-out",
          }}
          strokeLinecap="round"
          transform={`rotate(-90 ${radius} ${radius})`}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill={getColor()}
          fontSize="22"
          fontWeight="bold"
        >
          {Math.round(score)}
        </text>
      </svg>
    </div>
  );
}

export default RiskGauge;
