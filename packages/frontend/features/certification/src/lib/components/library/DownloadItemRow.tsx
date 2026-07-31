import React from 'react';
import { Download, Trash2, MoreVertical, FileText, FolderArchive, Music } from 'lucide-react';
import { Badge } from '@spark-nest-ed/frontend-shared-components';
import type { DownloadFileItem } from '../../hooks/container-logic/library/use-downloads-container-logic';

interface DownloadItemRowProps {
  file: DownloadFileItem;
  onOpenFile: (id: string) => void;
  onDeleteFile: (id: string, e: React.MouseEvent) => void;
}

export const DownloadItemRow = ({
  file,
  onOpenFile,
  onDeleteFile,
}: DownloadItemRowProps) => {
  const renderFormatIcon = (format: string) => {
    switch (format) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'DOCX':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'XLSX':
        return <FileText className="w-5 h-5 text-emerald-500" />;
      case 'ZIP':
        return <FolderArchive className="w-5 h-5 text-purple-500" />;
      case 'MP3':
        return <Music className="w-5 h-5 text-purple-500" />;
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <tr
      className="hover:bg-secondary/20 transition-colors group cursor-pointer"
      onClick={() => onOpenFile(file.id)}
    >
      {/* File Name & Subtitle */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${file.fileIconBgClass}`}
          >
            {renderFormatIcon(file.fileFormat)}
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-foreground group-hover:text-purple-600 transition-colors">
              {file.name}
            </h4>
            <span className="text-[10px] text-muted-foreground block line-clamp-1">
              {file.subtitle}
            </span>
          </div>
        </div>
      </td>

      {/* Type Badge */}
      <td className="py-3.5 px-4">
        <Badge
          className={`text-[10px] font-bold border-none px-2 py-0.5 ${file.fileFormatBadgeClass}`}
        >
          {file.category}
        </Badge>
      </td>

      {/* Date */}
      <td className="py-3.5 px-4 text-[11px] text-muted-foreground font-medium">
        {file.downloadedOn}
      </td>

      {/* Size */}
      <td className="py-3.5 px-4 font-bold text-foreground">{file.size}</td>

      {/* Expires */}
      <td className="py-3.5 px-4 text-[11px] text-muted-foreground">
        {file.expiresOn}
      </td>

      {/* Actions */}
      <td className="py-3.5 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenFile(file.id);
            }}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-purple-600 transition-colors cursor-pointer"
            title="Tải lại tệp"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => onDeleteFile(file.id, e)}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
            title="Xóa tệp offline"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
