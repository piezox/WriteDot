import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import * as vscode from 'vscode';

export async function modifyTextWithClaude(
  selectedText: string,
  userPrompt: string,
  fullDocContent: string,
  folderContext: string = ''
): Promise<string> {
  // Get configuration
  const config = vscode.workspace.getConfiguration('writedot');
  const region = config.get<string>('awsRegion', 'us-west-2');
  const modelId = config.get<string>('modelId', 'global.anthropic.claude-sonnet-4-5-20250929-v1:0');
  const maxTokens = config.get<number>('maxTokens', 4096);

  try {
    const client = new BedrockRuntimeClient({ region });

    const systemPrompt = 'You are a text editing assistant. Modify ONLY the selected text according to instructions. Return ONLY the modified selected text with no additional content, explanations, or formatting markers.';

    const folderContextSection = folderContext ? `\n\n## Additional Files in Folder:\n${folderContext}` : '';

    const body = JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `## Full Document Content:\n${fullDocContent}\n\n## Selected Text to Modify:\n${selectedText}\n\n## Modification Instructions:\n${userPrompt}${folderContextSection}\n\nReturn ONLY the modified version of the selected text above, with no explanations or additional content:`
      }]
    });

    const command = new InvokeModelCommand({
      modelId: modelId,
      body: body
    });

    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content[0].text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AWS Bedrock error: ${error.message}. Please check your AWS credentials in ~/.aws/credentials`);
    }
    throw error;
  }
}