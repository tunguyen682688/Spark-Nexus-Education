import {
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Receipt,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@spark-nest-ed/frontend-shared-components';
import { PurchasedCollectionCard } from '../../components/library/PurchasedCollectionCard';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import type { PurchasedCollectionItem } from '../../hooks/container-logic/library/use-purchased-collections-container-logic';

interface PurchasedGridProps {
  items: PurchasedCollectionItem[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  handleOpenCollection: (id: string) => void;
  handleViewReceipt: (id: string) => void;
  handleBackToLearning: () => void;
  text: typeof CERTIFICATION_UI_TEXT.purchasedCollections;
}

export const PurchasedGrid = ({
  items,
  currentPage,
  setCurrentPage,
  handleOpenCollection,
  handleViewReceipt,
  handleBackToLearning,
  text,
}: PurchasedGridProps) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        {items.length === 0 ? (
          <Card className="border-border p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-foreground">{text.emptyState.title}</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {text.emptyState.description}
              </p>
            </div>
            <Button
              onClick={handleBackToLearning}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              {text.emptyState.exploreBtn}
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {items.map((item) => (
              <PurchasedCollectionCard
                key={item.id}
                item={item}
                onOpenCollection={handleOpenCollection}
                onViewReceipt={handleViewReceipt}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-border rounded-xl bg-card gap-3 text-xs text-muted-foreground shadow-sm">
          <span>Showing 1 to 6 of 12 collections</span>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className="p-1.5 rounded-lg border border-border hover:bg-secondary disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === 1
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'border border-border hover:bg-secondary'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPage === 2
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'border border-border hover:bg-secondary'
              }`}
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(2, currentPage + 1))}
              className="p-1.5 rounded-lg border border-border hover:bg-secondary cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Show</span>
            <select className="bg-background border border-border text-xs font-bold py-1 px-2 rounded-lg">
              <option value="6">6</option>
              <option value="12">12</option>
            </select>
            <span>per page</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold">{text.widgets.recentPurchasesTitle}</CardTitle>
            <button className="text-xs text-indigo-600 hover:underline font-bold cursor-pointer">
              {text.widgets.viewReceiptsBtn}
            </button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Receipt className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <span className="font-extrabold text-foreground truncate">
                  IELTS Academic Masterclass
                </span>
              </div>
              <span className="font-black text-emerald-600">$49.00</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Receipt className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span className="font-extrabold text-foreground truncate">
                  TOEIC 900+ Exam Package
                </span>
              </div>
              <span className="font-black text-emerald-600">$39.00</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Receipt className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="font-extrabold text-foreground truncate">
                  VSTEP B2/C1 Test Collection
                </span>
              </div>
              <span className="font-black text-emerald-600">$29.00</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-200 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-900/40 shadow-sm">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h5 className="font-extrabold text-xs text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                {text.widgets.benefitsTitle}
              </h5>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground font-medium">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{text.benefits.b1}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{text.benefits.b2}</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span>{text.benefits.b3}</span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full text-xs font-bold py-2 border-indigo-300 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 rounded-xl flex items-center justify-center gap-1 cursor-pointer"
            >
              {text.widgets.browseStoreBtn}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
