import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

export async function modifyTextWithClaude(
  selectedText: string,
  userPrompt: string,
  fullDocContent: string,
  folderContext: string = ''
): Promise<string> {
  const client = new BedrockRuntimeClient({ region: 'us-west-2' });

  const systemPrompt = 'You are a text editing assistant. Modify ONLY the selected text according to instructions. Return ONLY the modified selected text with no additional content, explanations, or formatting markers.';

  const folderContextSection = folderContext ? `\n\n## Additional Files in Folder:\n${folderContext}` : '';

  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: `## Full Document Content:\n${fullDocContent}\n\n## Selected Text to Modify:\n${selectedText}\n\n## Modification Instructions:\n${userPrompt}${folderContextSection}\n\nReturn ONLY the modified version of the selected text above, with no explanations or additional content:`
    }]
  });

  const command = new InvokeModelCommand({
    modelId: 'global.anthropic.claude-sonnet-4-5-20250929-v1:0',
    body: body
  });

  const response = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(response.body));
  return responseBody.content[0].text;
}