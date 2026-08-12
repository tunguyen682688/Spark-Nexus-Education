import {
  ChevronDown,
  Wallet,
  ArrowRight,
} from 'lucide-react';
import {
  Card,
  Button,
} from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

const tf = CERTIFICATION_UI_TEXT.timeframeOptions;

interface CreatorRevenueSectionProps {
  revenue: {
    totalRevenue: string;
    revenueGrowth: string;
    payoutBalance: string;
    dailyData: Array<{ day: string; amount: number }>;
  };
  revenueTimeframe: string;
  setRevenueTimeframe: (tf: string) => void;
  handleWithdraw: () => void;
  handleViewAnalytics: () => void;
  text: {
    title: string;
    totalRevenue: string;
    payoutBalance: string;
    withdrawBtn: string;
    viewEarningsDetails: string;
  };
}

export const CreatorRevenueSection = ({
  revenue,
  revenueTimeframe,
  setRevenueTimeframe,
  handleWithdraw,
  handleViewAnalytics,
  text,
}: CreatorRevenueSectionProps) => {
  return (
    <Card className="border-border shadow-sm bg-card p-5 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="font-extrabold text-base text-foreground">
          {text.title}
        </h3>

        <div className="relative">
          <select
            value={revenueTimeframe}
            onChange={(e) => setRevenueTimeframe(e.target.value)}
            className="appearance-none bg-background border border-border text-xs font-bold text-foreground py-1 pl-2.5 pr-7 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value={tf.thisMonth}>{tf.thisMonth}</option>
            <option value={tf.lastMonth}>{tf.lastMonth}</option>
            <option value={tf.thisYear}>{tf.thisYear}</option>
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-secondary/30 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span>{text.totalRevenue}</span>
          </div>
          <div className="text-xl font-black text-foreground">
            {revenue.totalRevenue}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold">
            {revenue.revenueGrowth}
          </span>
        </div>

        <div className="p-3 bg-secondary/30 rounded-xl space-y-1">
          <div className="text-xs text-muted-foreground font-semibold">
            {text.payoutBalance}
          </div>
          <div className="text-xl font-black text-foreground">
            {revenue.payoutBalance}
          </div>
          <Button
            onClick={handleWithdraw}
            className="w-full mt-1 bg-indigo-100 dark:bg-indigo-950/60 hover:bg-indigo-200 text-indigo-700 dark:text-indigo-300 font-extrabold text-[11px] py-1 h-7 rounded-lg border-none cursor-pointer"
          >
            {text.withdrawBtn}
          </Button>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <div className="h-32 flex items-end justify-between gap-1 pt-4 border-b border-border">
          {revenue.dailyData.map((d, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <div
                className="w-full bg-indigo-400 dark:bg-indigo-600 rounded-t transition-all hover:bg-indigo-600"
                style={{ height: `${(d.amount / 120) * 100}%` }}
                title={`${d.day}: $${d.amount}`}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between text-[9px] text-muted-foreground font-semibold pt-1">
          <span>May 1</span>
          <span>May 5</span>
          <span>May 9</span>
          <span>May 13</span>
          <span>May 16</span>
        </div>
      </div>

      <button
        onClick={handleViewAnalytics}
        className="w-full flex items-center justify-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer pt-1"
      >
        <span>{text.viewEarningsDetails}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </Card>
  );
};
