import { Loader2, Save, X } from 'lucide-react';
import { Card, Button, Input, Badge } from '@spark-nest-ed/frontend-shared-components';
import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import type { EditorLogicState } from '../../types/container-collection-editor.types';

type Props = Pick<EditorLogicState, 'details' | 'setDetails' | 'newTagInput' | 'setNewTagInput' | 'isDirty' | 'isSaving' | 'handleSaveSettings' | 'handleResetSettings' | 'handleRemoveTag' | 'handleAddTag'>;

export function SettingsTab({ details, setDetails, newTagInput, setNewTagInput, isDirty, isSaving, handleSaveSettings, handleResetSettings, handleRemoveTag, handleAddTag }: Props) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-6 xl:col-start-4 space-y-4">
        <Card className="border-border shadow-sm bg-card p-5 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-extrabold text-base text-foreground">Collection Settings</h3>
            {isDirty && (
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">Unsaved changes</span>
            )}
          </div>

          <div className="space-y-4 text-xs font-medium">
            {/* TITLE */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Title <span className="text-rose-500">*</span></label>
                <span className={`text-[10px] font-bold ${details.title.length > 90 ? 'text-rose-500' : 'text-muted-foreground'}`}>{details.title.length}/100</span>
              </div>
              <Input value={details.title} onChange={(e) => setDetails({ ...details, title: e.target.value })} placeholder="Enter collection title..." maxLength={100} className="text-xs bg-background py-1.5 h-9 rounded-xl font-bold" />
            </div>

            {/* SUBTITLE */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Subtitle</label>
                <span className={`text-[10px] font-bold ${details.subtitle.length > 140 ? 'text-rose-500' : 'text-muted-foreground'}`}>{details.subtitle.length}/160</span>
              </div>
              <Input value={details.subtitle} onChange={(e) => setDetails({ ...details, subtitle: e.target.value })} placeholder="Brief description of your collection..." maxLength={160} className="text-xs bg-background py-1.5 h-9 rounded-xl" />
            </div>

            {/* DESCRIPTION */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                <span className={`text-[10px] font-bold ${details.description.length > 450 ? 'text-rose-500' : 'text-muted-foreground'}`}>{details.description.length}/500</span>
              </div>
              <textarea value={details.description} onChange={(e) => setDetails({ ...details, description: e.target.value })} placeholder="Describe what learners will gain from this collection..." maxLength={500} rows={3} className="w-full text-xs font-medium text-foreground bg-background border border-border rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            {/* LEVEL */}
            <div className="space-y-1 pt-2 border-t border-border">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Difficulty Level</label>
              <select value={details.level} onChange={(e) => setDetails({ ...details, level: e.target.value })} className="w-full bg-background border border-border text-xs font-bold text-foreground py-2 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                {CERTIFICATION_UI_TEXT.collectionEditorLevels.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* VISIBILITY */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Visibility</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="settingsVisibility" value="Public" checked={details.visibility === 'Public'} onChange={() => setDetails({ ...details, visibility: 'Public' })} className="text-indigo-600 focus:ring-indigo-500" />
                  <div>
                    <span className="font-bold text-foreground">Public</span>
                    <span className="text-[10px] text-muted-foreground block">Anyone can view</span>
                  </div>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="settingsVisibility" value="Private" checked={details.visibility === 'Private'} onChange={() => setDetails({ ...details, visibility: 'Private' })} className="text-indigo-600 focus:ring-indigo-500" />
                  <div>
                    <span className="font-bold text-foreground">Private</span>
                    <span className="text-[10px] text-muted-foreground block">Only you can view</span>
                  </div>
                </label>
              </div>
            </div>

            {/* ALLOW DOWNLOADS */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div>
                <div className="font-extrabold text-foreground">Allow Downloads</div>
                <div className="text-[10px] text-muted-foreground">Let learners download study materials</div>
              </div>
              <button onClick={() => setDetails({ ...details, allowDownloads: !details.allowDownloads })} className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${details.allowDownloads ? 'bg-indigo-600' : 'bg-secondary'}`}>
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${details.allowDownloads ? 'right-0.5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* TAGS */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Tags</label>
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

            {/* SAVE / CANCEL BUTTONS */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
              <Button onClick={handleResetSettings} disabled={!isDirty || isSaving} variant="outline" className="text-xs font-bold py-1.5 px-4 h-8 rounded-xl border-border hover:bg-secondary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Cancel</Button>
              <Button onClick={handleSaveSettings} disabled={!isDirty || isSaving || !details.title.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-4 h-8 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
