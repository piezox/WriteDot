import * as vscode from 'vscode';
import { modifyTextWithClaude } from './bedrockClient';
import { gatherFolderContext } from './contextGatherer';
import { PromptPanel } from './promptPanel';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  console.log('WriteDot is now active');

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'writedot.modifySelection';
  statusBarItem.text = "$(sparkle) AI Edit";
  statusBarItem.tooltip = "Modify selection with AI";
  context.subscriptions.push(statusBarItem);

  // Show status bar item when editing text files
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem)
  );
  updateStatusBarItem();

  const command = vscode.commands.registerCommand(
    'writedot.modifySelection',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      let selectedText = editor.document.getText(editor.selection);
      if (!selectedText) {
        vscode.window.showErrorMessage('No text selected');
        return;
      }

      // Store reference to the original editor and document
      const originalEditor = editor;
      const originalDocument = editor.document;

      // Get full document content
      const fullDocContent = editor.document.getText();

      // Show multi-line prompt panel and keep it open for multiple modifications
      while (true) {
        const result = await PromptPanel.getPrompt(context.extensionUri, selectedText);

        if (!result) {
          // User cancelled or closed the panel
          break;
        }

        const { prompt: userPrompt, includeContext } = result;

        // Use the stored editor reference instead of activeTextEditor
        const currentSelectedText = originalEditor.document.getText(originalEditor.selection);
        if (!currentSelectedText) {
          vscode.window.showErrorMessage('No text selected');
          continue;
        }

        // Get configuration
        const config = vscode.workspace.getConfiguration('writedot');
        const defaultContextBehavior = config.get<string>('defaultContextBehavior', 'ask');

        let folderContext = '';

        // Check if context should be included based on checkbox or config
        if (defaultContextBehavior === 'always' || includeContext) {
          folderContext = await gatherFolderContext(originalEditor.document.uri.fsPath);
        }

        // Update full document content in case it changed
        const currentFullDocContent = originalEditor.document.getText();

        try {
          let modifiedText = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Modifying with Claude...'
          }, async () => {
            return await modifyTextWithClaude(currentSelectedText, userPrompt, currentFullDocContent, folderContext);
          });

          // Trim any extra whitespace/newlines
          modifiedText = modifiedText.trim();

          // Replace current selection
          await originalEditor.edit(editBuilder => {
            editBuilder.replace(originalEditor.selection, modifiedText);
          });

          vscode.window.showInformationMessage('✓ Text modified');

          // Clear the prompt input for next modification
          PromptPanel.currentPanel?.clearPrompt();

          // Update the selected text for the next iteration
          selectedText = originalEditor.document.getText(originalEditor.selection);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          vscode.window.showErrorMessage('Error: ' + errorMessage);
        }
      }
    }
  );

  context.subscriptions.push(command);
}

function updateStatusBarItem(): void {
  const editor = vscode.window.activeTextEditor;
  if (editor && editor.selection && !editor.selection.isEmpty) {
    statusBarItem.show();
  } else {
    statusBarItem.hide();
  }
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
