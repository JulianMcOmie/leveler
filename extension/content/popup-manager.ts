import { parseTokens } from '../shared/utils';
import { Token } from '../shared/types';

export class PopupManager {
  private container: HTMLDivElement;
  private shadowRoot: ShadowRoot;
  private popupContent: HTMLDivElement;
  private closeButton: HTMLButtonElement;
  private headerSection: HTMLDivElement;
  private backButton: HTMLButtonElement;
  private termTitle: HTMLDivElement;
  private onCloseCallback?: () => void;
  private onWordSelectionCallback?: (selectedText: string) => void;
  private onBackCallback?: () => void;

  // Selection state for recursive exploration
  private isSelecting = false;
  private selectionStart = -1;
  private selectedIndices = new Set<number>();
  private tokens: Token[] = [];

  constructor() {
    // Create container element
    this.container = document.createElement('div');
    this.container.id = 'leveler-popup';
    this.container.style.position = 'absolute'; // Scrolls with page
    this.container.style.zIndex = '2147483647'; // Maximum z-index
    this.container.style.pointerEvents = 'none'; // Allow clicks through container

    // Attach Shadow DOM for style isolation
    this.shadowRoot = this.container.attachShadow({ mode: 'open' });

    // Create popup content
    this.popupContent = document.createElement('div');
    this.popupContent.className = 'popup-content';
    this.popupContent.style.pointerEvents = 'auto'; // But enable clicks on popup itself

    // Create header section
    this.headerSection = document.createElement('div');
    this.headerSection.className = 'popup-header';

    // Create back button
    this.backButton = document.createElement('button');
    this.backButton.className = 'back-button';
    this.backButton.innerHTML = '← Back';
    this.backButton.onclick = () => {
      if (this.onBackCallback) {
        this.onBackCallback();
      }
    };
    this.backButton.style.display = 'none'; // Hidden by default

    // Create term title
    this.termTitle = document.createElement('div');
    this.termTitle.className = 'term-title';

    // Create close button
    this.closeButton = document.createElement('button');
    this.closeButton.className = 'close-button';
    this.closeButton.innerHTML = '×';
    this.closeButton.onclick = () => this.close();

    // Assemble header
    this.headerSection.appendChild(this.backButton);
    this.headerSection.appendChild(this.termTitle);

    // Add styles
    this.shadowRoot.appendChild(this.createStyles());
    this.shadowRoot.appendChild(this.popupContent);
    this.popupContent.appendChild(this.closeButton);
    this.popupContent.appendChild(this.headerSection);

    // Add to document
    document.body.appendChild(this.container);
  }

  private createStyles(): HTMLStyleElement {
    const style = document.createElement('style');
    style.textContent = `
      .popup-content {
        background: #ffffff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        min-width: 200px;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #202123;
        animation: fadeIn 0.2s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .close-button {
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        font-size: 24px;
        line-height: 1;
        color: #6b7280;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.15s ease;
      }

      .close-button:hover {
        background: #f3f4f6;
        color: #202123;
      }

      .popup-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e5e7eb;
      }

      .back-button {
        background: #3b82f6;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 13px;
        color: white;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .back-button:hover {
        background: #2563eb;
      }

      .term-title {
        font-weight: 600;
        color: #202123;
        font-size: 14px;
        flex: 1;
      }

      .definition-text {
        user-select: none;
      }

      .loading-text {
        color: #6b7280;
        font-style: italic;
      }

      .error-text {
        color: #ef4444;
      }

      /* Selectable word styles (ported from Leveler) */
      .selectable-word {
        cursor: pointer;
        transition: all 0.15s ease;
        user-select: none;
        display: inline;
        position: relative;
        z-index: 1;
      }

      .selectable-word::before {
        content: '';
        position: absolute;
        top: -2px;
        bottom: -2px;
        left: -0.1em;
        right: 0.15em;
        border-radius: 3px;
        z-index: -1;
        transition: background 0.15s ease;
        pointer-events: none;
      }

      .selectable-word:hover::before {
        background: #f3f4f6;
      }

      /* Single word selected */
      .word-selected-single::before {
        background: #10a37f !important;
        border-radius: 3px;
      }

      /* First word in selection */
      .word-selected-first::before {
        background: #10a37f !important;
        border-radius: 3px 0 0 3px;
        right: -0.25em;
      }

      /* Middle words in selection */
      .word-selected-middle::before {
        background: #10a37f !important;
        border-radius: 0;
        left: -0.25em;
        right: -0.25em;
      }

      /* Last word in selection */
      .word-selected-last::before {
        background: #10a37f !important;
        border-radius: 0 3px 3px 0;
        left: -0.25em;
      }

      .word-selected-single,
      .word-selected-first,
      .word-selected-middle,
      .word-selected-last {
        color: white !important;
        position: relative;
        z-index: 1;
      }

      .breadcrumb {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e5e7eb;
      }
    `;
    return style;
  }

  show(rect: DOMRect, message: string, isRecursive: boolean = false, term?: string, showBack?: boolean): void {
    // Calculate popup position
    const POPUP_MARGIN = 10;
    const viewportHeight = window.innerHeight;

    console.log('PopupManager.show() called:', {
      isRecursive,
      rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right },
      scrollY: window.scrollY,
      scrollX: window.scrollX
    });

    let top: number;
    let left: number;

    if (isRecursive) {
      // For recursive popups, position at the same location as the previous popup
      // The rect here is from getBoundingClientRect() which gives viewport coordinates
      // Since container uses position: absolute, we ADD scroll offset
      top = rect.top + window.scrollY;
      left = rect.left + window.scrollX + (rect.width / 2);
      console.log('Recursive positioning:', { top, left });
    } else {
      // For initial selection, position below the selected text
      // getBoundingClientRect() gives viewport coordinates
      // Since we use position: absolute, we ADD scrollY for document coordinates
      top = rect.bottom + window.scrollY + POPUP_MARGIN;
      console.log('Initial positioning (before viewport check):', { top });

      // If not enough space below, position above
      if (rect.bottom + 200 > viewportHeight) {
        top = rect.top + window.scrollY - POPUP_MARGIN;
        this.popupContent.style.transform = 'translateY(-100%)';
      } else {
        this.popupContent.style.transform = 'none';
      }

      // Center horizontally relative to selection
      left = rect.left + window.scrollX + (rect.width / 2);
    }

    this.container.style.top = `${top}px`;
    this.container.style.left = `${left}px`;
    this.container.style.transform = 'translateX(-50%)';

    // Set term title if provided
    if (term) {
      this.termTitle.textContent = term;
    }

    // Show/hide back button
    if (showBack !== undefined) {
      console.log('Setting back button display:', showBack ? 'flex' : 'none', 'showBack value:', showBack);
      this.backButton.style.display = showBack ? 'flex' : 'none';
    } else {
      console.log('showBack is undefined, not changing display');
    }

    // Set initial message
    const messageDiv = document.createElement('div');
    messageDiv.className = 'definition-text loading-text';
    messageDiv.textContent = message;
    this.popupContent.appendChild(messageDiv);
  }

  showDefinition(
    definition: string,
    currentTerm: string,
    showBackButton: boolean = false,
    onClose?: () => void,
    onWordSelection?: (selectedText: string) => void,
    onBack?: () => void
  ): void {
    this.onCloseCallback = onClose;
    this.onWordSelectionCallback = onWordSelection;
    this.onBackCallback = onBack;

    // Set term title
    this.termTitle.textContent = currentTerm;

    // Show/hide back button
    this.backButton.style.display = showBackButton ? 'flex' : 'none';

    // Clear previous content (except close button and header)
    while (this.popupContent.children.length > 2) {
      this.popupContent.removeChild(this.popupContent.lastChild!);
    }

    // Parse definition into selectable words
    this.tokens = parseTokens(definition);

    // Create definition container
    const definitionDiv = document.createElement('div');
    definitionDiv.className = 'definition-text';

    // Render selectable words
    this.renderSelectableWords(definitionDiv);

    this.popupContent.appendChild(definitionDiv);
  }

  showError(error: string): void {
    // Clear previous content (except close button)
    while (this.popupContent.children.length > 1) {
      this.popupContent.removeChild(this.popupContent.lastChild!);
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'definition-text error-text';
    errorDiv.textContent = error;
    this.popupContent.appendChild(errorDiv);
  }

  private renderSelectableWords(container: HTMLElement): void {
    this.tokens.forEach((token, index) => {
      const span = document.createElement('span');
      span.className = 'selectable-word';
      span.textContent = token.word;
      span.dataset.index = index.toString();

      // Mouse event handlers for selection
      span.addEventListener('mousedown', () => this.handleWordMouseDown(index));
      span.addEventListener('mouseenter', () => this.handleWordMouseEnter(index));
      span.addEventListener('mouseup', () => this.handleWordMouseUp());

      container.appendChild(span);

      // Add delimiter (space or dash)
      if (token.delimiter) {
        container.appendChild(document.createTextNode(token.delimiter));
      }
    });

    // Handle mouse leave to cancel selection
    container.addEventListener('mouseleave', () => this.handleMouseLeave());
  }

  private handleWordMouseDown(index: number): void {
    this.isSelecting = true;
    this.selectionStart = index;
    this.selectedIndices = new Set([index]);
    this.updateSelectionUI();
  }

  private handleWordMouseEnter(index: number): void {
    if (!this.isSelecting) return;

    const start = Math.min(this.selectionStart, index);
    const end = Math.max(this.selectionStart, index);

    this.selectedIndices = new Set();
    for (let i = start; i <= end; i++) {
      this.selectedIndices.add(i);
    }

    this.updateSelectionUI();
  }

  private handleWordMouseUp(): void {
    console.log('handleWordMouseUp:', {
      isSelecting: this.isSelecting,
      selectedCount: this.selectedIndices.size,
      selectedIndices: Array.from(this.selectedIndices)
    });

    if (!this.isSelecting || this.selectedIndices.size === 0) {
      console.log('No selection or empty selection, ignoring mouseup');
      this.isSelecting = false;
      this.selectedIndices.clear();
      this.updateSelectionUI();
      return;
    }

    this.isSelecting = false;

    // Get selected text
    const selectedWords = Array.from(this.selectedIndices)
      .sort((a, b) => a - b)
      .map(i => this.tokens[i].word)
      .join(' ');

    console.log('Triggering word selection callback with:', selectedWords);

    // Clear selection UI
    this.selectedIndices.clear();
    this.updateSelectionUI();

    // Trigger recursive definition lookup
    if (this.onWordSelectionCallback) {
      this.onWordSelectionCallback(selectedWords);
    }
  }

  private handleMouseLeave(): void {
    this.isSelecting = false;
    this.selectedIndices.clear();
    this.updateSelectionUI();
  }

  private updateSelectionUI(): void {
    const words = this.shadowRoot.querySelectorAll('.selectable-word');
    words.forEach((word, index) => {
      const el = word as HTMLElement;

      // Remove all selection classes
      el.classList.remove(
        'word-selected-single',
        'word-selected-first',
        'word-selected-middle',
        'word-selected-last'
      );

      // Add appropriate class if selected
      if (this.selectedIndices.has(index)) {
        const size = this.selectedIndices.size;
        if (size === 1) {
          el.classList.add('word-selected-single');
        } else {
          const sortedIndices = Array.from(this.selectedIndices).sort((a, b) => a - b);
          const position = sortedIndices.indexOf(index);

          if (position === 0) {
            el.classList.add('word-selected-first');
          } else if (position === size - 1) {
            el.classList.add('word-selected-last');
          } else {
            el.classList.add('word-selected-middle');
          }
        }
      }
    });
  }

  getRect(): DOMRect {
    return this.popupContent.getBoundingClientRect();
  }

  close(): void {
    // Clear any text selection on the page to prevent re-triggering
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }

    if (this.onCloseCallback) {
      this.onCloseCallback();
    }
    this.container.remove();
  }
}
