import { FC, useState } from 'react';
import { GRAMMAR_UI_TEXT } from '../constants';

interface Certificate3DCardProps {
  level: string;
  percentage: number;
}

export const Certificate3DCard: FC<Certificate3DCardProps> = ({ level, percentage }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    setRotate({ x: -(y / (box.height / 2)) * 12, y: (x / (box.width / 2)) * 12 });
  };

  const handleMouseLeave = () => setRotate({ x: 0, y: 0 });

  return (
    <div className="w-80 h-[420px] relative select-none">
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full rounded-3xl bg-gradient-to-br from-card/85 to-card border border-amber-500/30 p-6 flex flex-col justify-between text-center shadow-2xl transition-all duration-200 ease-out cursor-pointer relative overflow-hidden"
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: 'preserve-3d',
          boxShadow: '0 25px 50px -12px rgba(245, 158, 11, 0.15)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-70 pointer-events-none" />
        <div className="mx-auto h-16 w-16 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center text-4xl shadow-inner animate-pulse">
          <span role="img" aria-label="Graduation">🎓</span>
        </div>
        <div className="space-y-2 mt-4" style={{ transform: 'translateZ(30px)' }}>
          <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase block">{GRAMMAR_UI_TEXT.levelGraduation.certAcademyName}</span>
          <h3 className="text-xl font-black text-white tracking-wide leading-none">{GRAMMAR_UI_TEXT.levelGraduation.certTitle}</h3>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{GRAMMAR_UI_TEXT.levelGraduation.certSub}</p>
        </div>
        <div className="py-3 border-y border-border/60 my-2" style={{ transform: 'translateZ(20px)' }}>
          <h4 className="text-lg font-extrabold text-white uppercase tracking-wider">{GRAMMAR_UI_TEXT.levelGraduation.certUserVal}</h4>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            {GRAMMAR_UI_TEXT.levelGraduation.certDesc.replace('{level}', level).replace('{percentage}', percentage.toString())}
          </p>
        </div>
        <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 tracking-wider">
          <span>{GRAMMAR_UI_TEXT.levelGraduation.certDateLabel.replace('{date}', new Date().toISOString().split('T')[0])}</span>
          <span className="text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
            {GRAMMAR_UI_TEXT.levelGraduation.certCompliant.replace('{level}', level)}
          </span>
        </div>
      </div>
    </div>
  );
};
