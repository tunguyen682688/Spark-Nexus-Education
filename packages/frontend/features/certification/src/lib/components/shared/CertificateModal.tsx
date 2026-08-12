import { Award, Download, Copy, Check, ShieldCheck, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
} from '@spark-nest-ed/frontend-shared-components';

export interface CertificateData {
  id: string;
  title: string;
  category?: string;
  issuedDate: string;
  score: string;
  credentialCode: string;
  recipientName?: string;
}

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: CertificateData | null;
  onDownload?: (id: string) => void;
  onCopyCode: (code: string) => void;
  copied: boolean;
}

export const CertificateModal = ({
  isOpen,
  onClose,
  certificate,
  onDownload,
  onCopyCode,
  copied,
}: CertificateModalProps) => {
  if (!certificate) return null;

  const handleCopyCode = () => {
    onCopyCode(certificate.credentialCode);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-card border-border p-0 overflow-hidden rounded-2xl shadow-2xl">
        <DialogHeader className="p-6 pb-2 border-b border-border bg-secondary/30 flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-lg font-black flex items-center gap-2 text-foreground">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Chứng nhận hoàn thành chính thức
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Chứng chỉ được xác thực bảo mật điện tử bởi Spark Nexus Education
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* CERTIFICATE CANVAS PREVIEW */}
        <div className="p-6">
          <div className="relative border-4 border-double border-amber-400/60 dark:border-amber-500/40 rounded-xl p-8 bg-gradient-to-br from-amber-50/40 via-background to-purple-50/40 dark:from-purple-950/20 dark:to-amber-950/20 shadow-inner space-y-6 text-center">
            {/* TOP EMBLEM */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 text-white flex items-center justify-center shadow-lg">
                <Award className="w-7 h-7" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                Spark Nexus Educational Certification
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                CHỨNG NHẬN HOÀN THÀNH BỘ ĐỀ
              </h2>
            </div>

            <div className="space-y-2 py-2">
              <p className="text-xs text-muted-foreground italic">Chứng nhận cho học viên</p>
              <h3 className="text-lg sm:text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {certificate.recipientName || 'Học viên Spark Nexus Ed'}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Đã hoàn thành 100% các bài thi và đạt chuẩn năng lực tại bộ sưu tập đề thi:
              </p>
              <div className="p-3 rounded-xl bg-card border border-border inline-block shadow-sm">
                <h4 className="font-extrabold text-sm text-foreground">{certificate.title}</h4>
                <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground mt-1">
                  <span>Kết quả: <strong className="text-emerald-600">{certificate.score}</strong></span>
                  <span>•</span>
                  <span>Ngày cấp: <strong>{certificate.issuedDate}</strong></span>
                </div>
              </div>
            </div>

            {/* CREDENTIAL VERIFICATION BAR */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-border/60 text-[10px] text-muted-foreground">
              <div className="flex items-center gap-1.5 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Mã xác thực: <strong className="text-foreground">{certificate.credentialCode}</strong></span>
                <button
                  onClick={handleCopyCode}
                  className="p-1 hover:text-foreground transition-colors cursor-pointer"
                  title="Sao chép mã"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>

              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                <Sparkles className="w-3 h-3" />
                <span>Verified Credential</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="p-4 bg-secondary/30 border-t border-border flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-xs font-bold py-2 px-4 rounded-xl border-border cursor-pointer"
          >
            Đóng
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCopyCode}
              className="text-xs font-bold py-2 px-3 rounded-xl border-border flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Đã chép mã' : 'Sao chép mã'}
            </Button>

            <Button
              onClick={() => onDownload && onDownload(certificate.id)}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              Tải bản PDF chính thức
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
