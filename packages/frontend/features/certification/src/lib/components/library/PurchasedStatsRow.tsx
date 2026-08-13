import {
  ShoppingBag,
  DollarSign,
  CheckCircle2,
  BookOpen,
  Award,
} from 'lucide-react';
import {
  Card,
} from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';

interface PurchasedStatsRowProps {
  items: Array<{
    id: string;
    pricePaid?: string;
    progressPercent?: number;
    totalTests?: number;
  }>;
  text: typeof CERTIFICATION_UI_TEXT.purchasedCollections;
}

export const PurchasedStatsRow = ({
  items,
  text,
}: PurchasedStatsRowProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
      <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card">
        <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.metrics.purchasedItems}
          </span>
          <div className="text-xl font-black text-foreground">{items.length}</div>
          <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
            Lifetime Access
          </span>
        </div>
      </Card>

      <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card">
        <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <DollarSign className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.metrics.totalValue}
          </span>
          <div className="text-xl font-black text-foreground">
            ${items.reduce((acc, item) => acc + (parseFloat((item.pricePaid ?? '').replace('$', '')) || 0), 0)}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold flex items-center">
            Active subscriptions
          </span>
        </div>
      </Card>

      <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card">
        <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.metrics.avgCompletion}
          </span>
          <div className="text-xl font-black text-foreground">
            {items.length > 0
              ? `${Math.round(
                  items.reduce((acc, item) => acc + (item.progressPercent || 0), 0) /
                    items.length
                )}%`
              : '0%'}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">Progress rate</span>
        </div>
      </Card>

      <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card">
        <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.metrics.unlockedMocks}
          </span>
          <div className="text-xl font-black text-foreground">
            {items.reduce((acc, item) => acc + (item.totalTests || 0), 0)}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">Practice tests</span>
        </div>
      </Card>

      <Card className="border-border shadow-sm p-4 flex items-center gap-3 bg-card col-span-2 sm:col-span-1">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center flex-shrink-0">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <span className="text-[10px] text-muted-foreground font-bold block uppercase tracking-wider">
            {text.metrics.certificatesEligible}
          </span>
          <div className="text-xl font-black text-foreground">{items.length}</div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
            Available upon completion
          </span>
        </div>
      </Card>
    </div>
  );
};
