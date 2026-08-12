import { Plus, Users } from 'lucide-react';
import { Card, Button } from '@spark-nest-ed/frontend-shared-components';

export function CollaboratorsTab() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-6 xl:col-start-4 space-y-4">
        <Card className="border-border shadow-sm bg-card p-5 space-y-5">
          <h3 className="font-extrabold text-base text-foreground pb-2 border-b border-border">Cộng tác viên</h3>
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-secondary/50 flex items-center justify-center">
              <Users className="w-7 h-7 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">Chưa có cộng tác viên</p>
            <p className="text-xs text-muted-foreground max-w-xs">Mời người khác cùng chỉnh sửa bộ sưu tập này. Tính năng cộng tác sẽ sớm ra mắt.</p>
            <Button variant="outline" className="text-xs font-bold mt-2 opacity-50 cursor-not-allowed" disabled>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Mời cộng tác viên
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
