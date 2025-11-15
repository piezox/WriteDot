import * as vscode from 'vscode';

export class PromptPanel {
  public static currentPanel: PromptPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private _resolvePrompt: ((value: { prompt: string; includeContext: boolean } | undefined) => void) | undefined;
  private _currentSelection: string = '';

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, initialSelection: string) {
    this._panel = panel;
    this._currentSelection = initialSelection;
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = this._getHtmlContent(initialSelection);

    // Listen for selection changes
    this._disposables.push(
      vscode.window.onDidChangeTextEditorSelection(e => {
        const newSelection = e.textEditor.document.getText(e.selections[0]);
        if (newSelection && newSelection !== this._currentSelection) {
          this._currentSelection = newSelection;
          this._panel.webview.postMessage({
            command: 'updateSelection',
            selection: this._truncateSelection(newSelection)
          });
        }
      })
    );

    this._panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'submit':
            if (this._resolvePrompt) {
              this._resolvePrompt({
                prompt: message.text,
                includeContext: message.includeContext
              });
              this._resolvePrompt = undefined;
            }
            // Don't dispose the panel - keep it open for more modifications
            return;
          case 'cancel':
            if (this._resolvePrompt) {
              this._resolvePrompt(undefined);
              this._resolvePrompt = undefined;
            }
            this._panel.dispose();
            return;
        }
      },
      null,
      this._disposables
    );
  }

  public static async getPrompt(extensionUri: vscode.Uri, selectedText: string): Promise<{ prompt: string; includeContext: boolean } | undefined> {
    if (PromptPanel.currentPanel) {
      PromptPanel.currentPanel._currentSelection = selectedText;
      PromptPanel.currentPanel._panel.webview.postMessage({
        command: 'updateSelection',
        selection: PromptPanel.currentPanel._truncateSelection(selectedText)
      });
      PromptPanel.currentPanel._panel.reveal();
    } else {
      const panel = vscode.window.createWebviewPanel(
        'aiPromptInput',
        'WriteDot AI',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );

      PromptPanel.currentPanel = new PromptPanel(panel, extensionUri, selectedText);
    }

    // Always create a new promise for each call, even if panel already exists
    return new Promise((resolve) => {
      PromptPanel.currentPanel!._resolvePrompt = resolve;
    });
  }

  public getCurrentSelection(): string {
    return this._currentSelection;
  }

  public clearPrompt(): void {
    this._panel.webview.postMessage({ command: 'clearPrompt' });
  }

  private _truncateSelection(text: string): string {
    if (text.length <= 100) {
      return text;
    }
    return text.substring(0, 100) + '...';
  }

  public dispose() {
    PromptPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _getHtmlContent(selectedText: string): string {
    const truncatedSelection = this._truncateSelection(selectedText);
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Prompt</title>
    <style>
        body {
            padding: 20px;
            padding-right: 30px;
            font-family: var(--vscode-font-family);
            color: var(--vscode-foreground);
            box-sizing: border-box;
        }
        h2 {
            margin-top: 0;
            margin-bottom: 10px;
            color: var(--vscode-foreground);
        }
        .selection-preview {
            background: var(--vscode-textBlockQuote-background);
            border-left: 3px solid var(--vscode-textBlockQuote-border);
            padding: 10px 12px;
            margin-bottom: 15px;
            font-family: var(--vscode-editor-font-family);
            font-size: 12px;
            color: var(--vscode-foreground);
            border-radius: 2px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .selection-label {
            font-size: 11px;
            color: var(--vscode-descriptionForeground);
            margin-bottom: 5px;
            font-weight: 500;
        }
        textarea {
            width: 100%;
            min-height: 150px;
            padding: 10px;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 2px;
            resize: vertical;
            box-sizing: border-box;
        }
        textarea:focus {
            outline: 1px solid var(--vscode-focusBorder);
        }
        .checkbox-container {
            margin-top: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .checkbox-container input[type="checkbox"] {
            cursor: pointer;
        }
        .checkbox-container label {
            cursor: pointer;
            font-size: 13px;
        }
        .button-group {
            margin-top: 15px;
            display: flex;
            gap: 10px;
        }
        button {
            padding: 8px 16px;
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 2px;
            cursor: pointer;
            font-size: 13px;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        button.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        button.secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        .examples {
            margin-top: 10px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }
        .examples strong {
            color: var(--vscode-foreground);
        }
    </style>
</head>
<body>
    <h2>How should I modify this text?</h2>
    <div class="selection-label">Selected text:</div>
    <div class="selection-preview" id="selectionPreview">${truncatedSelection}</div>
    <textarea id="promptInput" placeholder="Enter your modification instructions...
Examples:
- make it more concise
- fix grammar and spelling
- translate to Spanish
- rewrite in a professional tone"></textarea>
    <div class="examples">
        <strong>Tip:</strong> You can use multi-line prompts for complex instructions
    </div>
    <div class="checkbox-container">
        <input type="checkbox" id="includeContextCheckbox" />
        <label for="includeContextCheckbox">Include context from folder files</label>
    </div>
    <div class="button-group">
        <button id="submitBtn">Modify with AI</button>
        <button id="cancelBtn" class="secondary">Cancel</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const textarea = document.getElementById('promptInput');
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const includeContextCheckbox = document.getElementById('includeContextCheckbox');
        const selectionPreview = document.getElementById('selectionPreview');

        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'updateSelection') {
                selectionPreview.textContent = message.selection;
            } else if (message.command === 'clearPrompt') {
                textarea.value = '';
                textarea.focus();
            }
        });

        // Focus the textarea
        textarea.focus();

        // Submit on button click
        submitBtn.addEventListener('click', () => {
            const text = textarea.value.trim();
            if (text) {
                vscode.postMessage({
                    command: 'submit',
                    text: text,
                    includeContext: includeContextCheckbox.checked
                });
            }
        });

        // Cancel button
        cancelBtn.addEventListener('click', () => {
            vscode.postMessage({ command: 'cancel' });
        });

        // Submit on Ctrl/Cmd + Enter
        textarea.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                const text = textarea.value.trim();
                if (text) {
                    vscode.postMessage({
                        command: 'submit',
                        text: text,
                        includeContext: includeContextCheckbox.checked
                    });
                }
            }
        });
    </script>
</body>
</html>`;
  }
}
