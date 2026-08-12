import { CERTIFICATION_UI_TEXT } from '../../constants/certification.constants';
import type { EditorLogicState } from '../../types/container-collection-editor.types';

type Props = Pick<EditorLogicState, 'activeTab' | 'setActiveTab'>;

export function EditorTabs({ activeTab, setActiveTab }: Props) {
  return (
    <div className="border-b border-border">
      <div className="flex items-center gap-6">
        {(
          [
            CERTIFICATION_UI_TEXT.collectionEditorTabs.structure,
            CERTIFICATION_UI_TEXT.collectionEditorTabs.settings,
            CERTIFICATION_UI_TEXT.collectionEditorTabs.collaborators,
          ] as const
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === tab
                ? 'text-indigo-600 font-extrabold border-b-2 border-indigo-600'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
