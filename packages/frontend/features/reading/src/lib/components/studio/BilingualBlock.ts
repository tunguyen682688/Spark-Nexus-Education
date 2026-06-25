import { API, BlockTool, BlockToolData, ToolConfig } from '@editorjs/editorjs';

export interface BilingualBlockData extends BlockToolData {
  original: string;
  translation: string;
}

export default class BilingualBlock implements BlockTool {
  private data: BilingualBlockData;
  private wrapper: HTMLDivElement | null = null;
  private originalInput: HTMLDivElement | null = null;
  private translationInput: HTMLDivElement | null = null;

  static get toolbox() {
    return {
      title: 'Bilingual Paragraph',
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M12 2v20"/><path d="M12 12h8"/></svg>'
    };
  }

  constructor({ data }: { data: BilingualBlockData; config: ToolConfig; api: API }) {
    this.data = {
      original: data.original || '',
      translation: data.translation || '',
    };
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'bilingual-block flex flex-col md:flex-row gap-4 p-4 border rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 my-4';

    const createEditableDiv = (placeholder: string, initialData: string) => {
      const div = document.createElement('div');
      div.contentEditable = 'true';
      // EditorJS will handle Enter key within block. But if we want simple multiline, contentEditable=true allows it.
      div.className = 'flex-1 p-3 min-h-[100px] border border-transparent hover:border-slate-300 dark:hover:border-slate-600 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 transition-colors text-slate-800 dark:text-slate-200 leading-relaxed';
      div.dataset.placeholder = placeholder;
      div.innerHTML = initialData;

      return div;
    };

    const originalCol = document.createElement('div');
    originalCol.className = 'flex-1 flex flex-col gap-2';
    const originalLabel = document.createElement('div');
    originalLabel.className = 'text-xs font-bold text-slate-500 uppercase tracking-wider ml-1';
    originalLabel.innerText = 'Bản gốc';
    this.originalInput = createEditableDiv('Nhập nội dung gốc...', this.data.original);
    originalCol.appendChild(originalLabel);
    originalCol.appendChild(this.originalInput);

    const translationCol = document.createElement('div');
    translationCol.className = 'flex-1 flex flex-col gap-2';
    const translationLabel = document.createElement('div');
    translationLabel.className = 'text-xs font-bold text-slate-500 uppercase tracking-wider ml-1';
    translationLabel.innerText = 'Bản dịch';
    this.translationInput = createEditableDiv('Nhập bản dịch...', this.data.translation);
    translationCol.appendChild(translationLabel);
    translationCol.appendChild(this.translationInput);

    this.wrapper.appendChild(originalCol);
    this.wrapper.appendChild(translationCol);

    return this.wrapper;
  }

  save(blockContent: HTMLElement): BilingualBlockData {
    return {
      original: this.originalInput?.innerHTML || '',
      translation: this.translationInput?.innerHTML || '',
    };
  }

  validate(savedData: BilingualBlockData) {
    if (!savedData.original.trim() && !savedData.translation.trim()) {
      return false;
    }
    return true;
  }
}
