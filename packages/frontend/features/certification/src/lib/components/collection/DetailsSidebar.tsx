import {
  ChevronUp,
  Image as ImageIcon,
  X,
} from 'lucide-react';
import { Card, Input, Badge, useToast } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import type { EditorLogicState } from '../../types/container-collection-editor.types';

const text = CERTIFICATION_UI_TEXT.collectionEditor;

type Props = Pick<EditorLogicState, 'details' | 'setDetails' | 'newTagInput' | 'setNewTagInput' | 'isDetailsCollapsed' | 'setIsDetailsCollapsed' | 'handleRemoveTag' | 'handleAddTag'>;

export function DetailsSidebar({ details, setDetails, newTagInput, setNewTagInput, isDetailsCollapsed, setIsDetailsCollapsed, handleRemoveTag, handleAddTag }: Props) {
  const { toast } = useToast();

  return (
    <div className="xl:col-span-3 space-y-4">
      <Card className="border-border shadow-sm bg-card p-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-foreground">{text.detailsSidebar.title}</h3>
          <button onClick={() => setIsDetailsCollapsed(!isDetailsCollapsed)} className="text-muted-foreground hover:text-foreground cursor-pointer">
            <ChevronUp className={`w-4 h-4 transition-transform ${isDetailsCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {!isDetailsCollapsed && (
          <div className="space-y-4 text-xs font-medium">
            {/* COVER IMAGE */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">{text.detailsSidebar.coverImage}</label>
              <div className="relative rounded-xl overflow-hidden border border-border group bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 p-6 text-center text-white shadow-md">
                <div className="font-black text-sm uppercase tracking-wider">TOEIC MASTERY</div>
                <div className="text-[10px] font-bold tracking-widest opacity-80 mt-0.5">COLLECTION</div>
                <button onClick={() => toast({ title: 'Đổi ảnh bìa', description: 'Tính năng tải ảnh sẽ sớm ra mắt.', variant: 'default' as never })} className="mt-3 inline-flex items-center gap-1 text-[10px] font-extrabold bg-white/20 hover:bg-white/30 backdrop-blur px-2.5 py-1 rounded-lg transition-colors cursor-pointer">
                  <ImageIcon className="w-3 h-3" />
                  <span>{text.detailsSidebar.changeImage}</span>
                </button>
              </div>
            </div>

            {/* TITLE INPUT */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{text.detailsSidebar.titleLabel}</label>
                <span className="text-[10px] text-muted-foreground">{details.title.length}/100</span>
              </div>
              <Input value={details.title} onChange={(e) => setDetails({ ...details, title: e.target.value })} className="text-xs bg-background py-1.5 h-9 rounded-xl font-bold" />
            </div>

            {/* SUBTITLE INPUT */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{text.detailsSidebar.subtitleLabel}</label>
                <span className="text-[10px] text-muted-foreground">{details.subtitle.length}/160</span>
              </div>
              <Input value={details.subtitle} onChange={(e) => setDetails({ ...details, subtitle: e.target.value })} className="text-xs bg-background py-1.5 h-9 rounded-xl" />
            </div>

            {/* DESCRIPTION TEXTAREA */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{text.detailsSidebar.descriptionLabel}</label>
                <span className="text-[10px] text-muted-foreground">{details.description.length}/500</span>
              </div>
              <textarea value={details.description} onChange={(e) => setDetails({ ...details, description: e.target.value })} rows={3} className="w-full text-xs font-medium text-foreground bg-background border border-border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            {/* LEVEL DROPDOWN */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">{text.detailsSidebar.levelLabel}</label>
              <select value={details.level} onChange={(e) => setDetails({ ...details, level: e.target.value })} className="w-full bg-background border border-border text-xs font-bold text-foreground py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                {CERTIFICATION_UI_TEXT.collectionEditorLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* TAGS SECTION */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">{text.detailsSidebar.tagsLabel}</label>
              <div className="flex flex-wrap gap-1.5">
                {(details.tags ?? []).map((tag) => (
                  <Badge key={tag} className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] px-2 py-0.5 rounded-lg border-none flex items-center gap-1">
                    <span>{tag}</span>
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-indigo-900 cursor-pointer"><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
              <Input value={newTagInput} onChange={(e) => setNewTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Type tag and press Enter..." className="text-[11px] bg-background py-1 h-8 rounded-xl mt-1" />
            </div>

            {/* VISIBILITY RADIO OPTIONS */}
            <div className="space-y-2 pt-1 border-t border-border">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">{text.detailsSidebar.visibilityLabel}</label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="radio" name="visibility" value="Public" checked={details.visibility === 'Public'} onChange={() => setDetails({ ...details, visibility: 'Public' })} className="mt-0.5 text-indigo-600 focus:ring-indigo-500" />
                <div>
                  <div className="font-extrabold text-foreground">{text.detailsSidebar.publicOption}</div>
                  <div className="text-[10px] text-muted-foreground leading-snug">{text.detailsSidebar.publicDesc}</div>
                </div>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="radio" name="visibility" value="Private" checked={details.visibility === 'Private'} onChange={() => setDetails({ ...details, visibility: 'Private' })} className="mt-0.5 text-indigo-600 focus:ring-indigo-500" />
                <div>
                  <div className="font-extrabold text-foreground">{text.detailsSidebar.privateOption}</div>
                  <div className="text-[10px] text-muted-foreground leading-snug">{text.detailsSidebar.privateDesc}</div>
                </div>
              </label>
            </div>

            {/* ALLOW DOWNLOADS SWITCH TOGGLE */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <div className="font-extrabold text-foreground">{text.detailsSidebar.allowDownloads}</div>
                <div className="text-[10px] text-muted-foreground leading-snug">{text.detailsSidebar.allowDownloadsDesc}</div>
              </div>
              <button onClick={() => setDetails({ ...details, allowDownloads: !details.allowDownloads })} className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${details.allowDownloads ? 'bg-indigo-600' : 'bg-secondary'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${details.allowDownloads ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* METADATA FOOTER */}
            <div className="pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
              <div>
                <span className="block">{text.detailsSidebar.created}</span>
                <span className="text-foreground">{details.createdDate}</span>
              </div>
              <div className="text-right">
                <span className="block">{text.detailsSidebar.lastUpdated}</span>
                <span className="text-foreground">{details.lastUpdatedDate}</span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
