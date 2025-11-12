import * as vscode from 'vscode';
import { modifyTextWithClaude } from './bedrockClient';
import { gatherFolderContext } from './contextGatherer';

export function activate(context: vscode.ExtensionContext) {
  console.log('AI Markdown Assistant is now active');

  const command = vscode.commands.registerCommand(
    'aiMarkdownAssistant.modifySelection',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const selectedText = editor.document.getText(editor.selection);
      if (!selectedText) {
        vscode.window.showErrorMessage('No text selected');
        return;
      }

      // Get full document content
      const fullDocContent = editor.document.getText();

      // Show input box for user prompt
      const userPrompt = await vscode.window.showInputBox({
        prompt: 'How should I modify this text?',
        placeHolder: 'e.g., make it more concise'
      });

      if (!userPrompt) {
        return;
      }

      // Ask if user wants to include context
      const includeContext = await vscode.window.showQuickPick(
        ['No context', 'Include folder files'],
        { placeHolder: 'Include context from folder?' }
      );

      if (!includeContext) {
        return;
      }

      let folderContext = '';
      if (includeContext === 'Include folder files') {
        folderContext = await gatherFolderContext(editor.document.uri.fsPath);
      }

      try {
        let modifiedText = await vscode.window.withProgress({
          location: vscode.ProgressLocation.Notification,
          title: 'Modifying with Claude...'
        }, async () => {
          return await modifyTextWithClaude(selectedText, userPrompt, fullDocContent, folderContext);
        });

        // Trim any extra whitespace/newlines
        modifiedText = modifiedText.trim();

        // Replace selected text
        await editor.edit(editBuilder => {
          editBuilder.replace(editor.selection, modifiedText);
        });

        vscode.window.showInformationMessage('✓ Text modified');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage('Error: ' + errorMessage);
      }
    }
  );

  context.subscriptions.push(command);
}

export function deactivate() {}
