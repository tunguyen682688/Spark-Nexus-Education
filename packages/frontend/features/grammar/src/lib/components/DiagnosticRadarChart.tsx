import React from 'react';

export interface DiagnosticRadarChartProps {
  skillFactors: {
    syntax: number;
    tenses: number;
    morphology: number;
    modality: number;
  };
}

export const DiagnosticRadarChart: React.FC<DiagnosticRadarChartProps> = ({
  skillFactors,
}) => {
  const cx = 100;
  const cy = 100;
  const maxRadius = 65;

  const ptSyntax = `${cx},${cy - maxRadius * (skillFactors.syntax || 0.8)}`;
  const ptTenses = `${cx + maxRadius * (skillFactors.tenses || 0.8)},${cy}`;
  const ptMorphology = `${cx},${cy + maxRadius * (skillFactors.morphology || 0.8)}`;
  const ptModality = `${cx - maxRadius * (skillFactors.modality || 0.8)},${cy}`;

  const radarPolygonPoints = `${ptSyntax} ${ptTenses} ${ptMorphology} ${ptModality}`;

  return (
    <svg className="h-full w-full" viewBox="0 0 200 200">
      <circle
        cx="100"
        cy="100"
        r="65"
        className="stroke-slate-850 fill-none"
        strokeDasharray="3 3"
        strokeWidth="1"
      />
      <circle
        cx="100"
        cy="100"
        r="45"
        className="stroke-slate-850 fill-none"
        strokeDasharray="3 3"
        strokeWidth="1"
      />
      <circle
        cx="100"
        cy="100"
        r="25"
        className="stroke-slate-850 fill-none"
        strokeDasharray="3 3"
        strokeWidth="1"
      />

      <line
        x1="100"
        y1="35"
        x2="100"
        y2="165"
        className="stroke-slate-850"
        strokeWidth="1"
      />
      <line
        x1="35"
        y1="100"
        x2="165"
        y2="100"
        className="stroke-slate-850"
        strokeWidth="1"
      />

      <polygon
        points={radarPolygonPoints}
        className="fill-blue-500/20 stroke-blue-500 transition-all duration-1000 ease-out"
        strokeWidth="2"
      />

      <circle
        cx="100"
        cy={cy - maxRadius * (skillFactors.syntax || 0.8)}
        r="3"
        className="fill-blue-400 stroke-slate-950"
        strokeWidth="1"
      />
      <circle
        cx={cx + maxRadius * (skillFactors.tenses || 0.8)}
        cy="100"
        r="3"
        className="fill-blue-400 stroke-slate-950"
        strokeWidth="1"
      />
      <circle
        cx="100"
        cy={cy + maxRadius * (skillFactors.morphology || 0.8)}
        r="3"
        className="fill-blue-400 stroke-slate-950"
        strokeWidth="1"
      />
      <circle
        cx={cx - maxRadius * (skillFactors.modality || 0.8)}
        cy="100"
        r="3"
        className="fill-blue-400 stroke-slate-950"
        strokeWidth="1"
      />

      <text
        x="100"
        y="27"
        className="fill-slate-400 font-extrabold text-[10px]"
        textAnchor="middle"
      >
        Cú Pháp
      </text>
      <text
        x="172"
        y="103"
        className="fill-slate-400 font-extrabold text-[10px]"
        textAnchor="start"
      >
        Thì
      </text>
      <text
        x="100"
        y="180"
        className="fill-slate-400 font-extrabold text-[10px]"
        textAnchor="middle"
      >
        Hình Thái
      </text>
      <text
        x="28"
        y="103"
        className="fill-slate-400 font-extrabold text-[10px]"
        textAnchor="end"
      >
        Sắc Thái
      </text>
    </svg>
  );
};

export default DiagnosticRadarChart;
