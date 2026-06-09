import { useState } from 'react';
import {
  FileText,
  Image,
  Video,
  Music,
  File,
  Folder,
  ChevronRight,
  ChevronDown,
  Settings,
  Layers,
} from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { ScrollArea } from '@spark-nest-ed/frontend-shared-components';
import { cn } from '@spark-nest-ed/frontend-shared-utils';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  icon: React.ComponentType<{ className?: string }>;
  children?: FileItem[];
}

const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'Documents',
    type: 'folder',
    icon: Folder,
    children: [
      { id: '1-1', name: 'document.pdf', type: 'file', icon: FileText },
      { id: '1-2', name: 'presentation.pptx', type: 'file', icon: File },
    ],
  },
  {
    id: '2',
    name: 'Media',
    type: 'folder',
    icon: Folder,
    children: [
      { id: '2-1', name: 'image.jpg', type: 'file', icon: Image },
      { id: '2-2', name: 'video.mp4', type: 'file', icon: Video },
      { id: '2-3', name: 'audio.mp3', type: 'file', icon: Music },
    ],
  },
];

const SidebarEditor = () => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['1', '2'])
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileItem = (item: FileItem, level = 0) => {
    const isExpanded = expandedFolders.has(item.id);
    const isSelected = selectedFile === item.id;
    const Icon = item.icon;

    if (item.type === 'folder') {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleFolder(item.id)}
            className={cn(
              'w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors',
              'hover:bg-accent hover:text-accent-foreground',
              'text-muted-foreground',
              level > 0 && 'pl-6'
            )}
            style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <Icon className="h-4 w-4" />
            <span className="flex-1 text-left">{item.name}</span>
          </button>
          {isExpanded && item.children && (
            <div>
              {item.children.map((child) => renderFileItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => setSelectedFile(item.id)}
        className={cn(
          'w-full flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          isSelected
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground',
          level > 0 && 'pl-6'
        )}
        style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1 text-left">{item.name}</span>
      </button>
    );
  };

  return (
    <aside className="w-64 h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="h-12 border-b border-sidebar-border flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <Layers className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-sm">Tệp tin</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">{mockFiles.map((item) => renderFileItem(item))}</div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="border-t border-sidebar-border p-2">
        <Button variant="outline" size="sm" className="w-full">
          <File className="h-4 w-4 mr-2" />
          Tạo mới
        </Button>
      </div>
    </aside>
  );
};

export default SidebarEditor;
