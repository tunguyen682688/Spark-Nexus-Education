import { API } from '@editorjs/editorjs';

export default class VocabularyTool {
  static get isInline() {
    return true;
  }

  static get title() {
    return 'Vocabulary';
  }

  static get sanitize() {
    return {
      mark: {
        class: 'vocab-highlight',
        'data-vocab-id': true,
        'data-level': true,
        'data-def': true,
        'data-pron': true,
        'data-ex': true,
        'data-ex-trans': true,
      },
    };
  }

  private api: API;
  private button: HTMLButtonElement | null = null;
  private tag = 'MARK';
  private class = 'vocab-highlight';
  private iconClasses: { base: string; active: string };

  constructor({ api }: { api: API }) {
    this.api = api;
    this.iconClasses = {
      base: this.api.styles.inlineToolButton,
      active: this.api.styles.inlineToolButtonActive,
    };
  }

  render() {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.classList.add(this.iconClasses.base);
    // Simple icon for vocabulary
    this.button.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`;

    return this.button;
  }

  surround(range: Range) {
    if (!range) {
      return;
    }

    const termWrapper = this.api.selection.findParentTag(this.tag, this.class);

    if (termWrapper) {
      this.unwrap(termWrapper);
    } else {
      this.wrap(range);
    }
  }

  wrap(range: Range) {
    const mark = document.createElement(this.tag);
    mark.classList.add(this.class);
    
    // Generate a unique ID for this vocabulary word
    const vocabId = `vocab_${Math.random().toString(36).substr(2, 9)}`;
    mark.setAttribute('data-vocab-id', vocabId);
    
    // Add default empty data attributes
    mark.setAttribute('data-level', '');
    mark.setAttribute('data-def', '');
    mark.setAttribute('data-pron', '');
    mark.setAttribute('data-ex', '');
    mark.setAttribute('data-ex-trans', '');

    mark.appendChild(range.extractContents());
    range.insertNode(mark);
    this.api.selection.expandToTag(mark);
  }

  unwrap(termWrapper: HTMLElement) {
    this.api.selection.expandToTag(termWrapper);
    const sel = window.getSelection();
    if (sel) {
      const range = sel.getRangeAt(0);
      const unwrappedContent = range.extractContents();
      termWrapper.parentNode?.removeChild(termWrapper);
      range.insertNode(unwrappedContent);
      sel.removeAllRanges();
      sel.addRange(range);
      
      // Emit event indicating no vocab is selected
      window.dispatchEvent(new CustomEvent('vocab-selected', { detail: null }));
    }
  }

  checkState(selection: Selection) {
    const termTag = this.api.selection.findParentTag(this.tag, this.class);

    if (this.button) {
      this.button.classList.toggle(this.iconClasses.active, !!termTag);
    }

    if (termTag) {
      // Emit event with the active mark to open the React Panel
      window.dispatchEvent(new CustomEvent('vocab-selected', { 
        detail: {
          id: termTag.getAttribute('data-vocab-id'),
          element: termTag
        } 
      }));
    } else {
      window.dispatchEvent(new CustomEvent('vocab-selected', { detail: null }));
    }
  }
}
