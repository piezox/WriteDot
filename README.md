# WriteDot

A VS Code extension that modifies selected text in any file using Claude via AWS Bedrock.

## Features

- ✨ **Multi-line prompt input** - Use a dedicated panel for complex, multi-line prompts
- 📝 **Works with any text file** - Not limited to markdown files
- 🎯 **Full document context** - Automatically includes the entire document for better results
- 📁 **Optional folder context** - Include other files in the same directory (supports `.md`, `.txt`, `.html`, `.json`, `.pdf`, and many more)
- ⚙️ **Configurable settings** - Customize AWS region, model ID, max tokens, and default behavior
- ⌨️ **Keyboard shortcut** - Quick access via `Cmd+Shift+M` (Mac) or `Ctrl+Shift+M` (Windows/Linux)
- 📊 **Status bar integration** - Quick access button appears when text is selected

## Prerequisites

- AWS account with Bedrock access
- AWS credentials configured (`~/.aws/credentials`)
- Access to Claude Sonnet 4.5 model in AWS Bedrock

## Installation

Install directly from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=StefMarzani.writedot) or search for "WriteDot" in the Extensions view (`Cmd+Shift+X` / `Ctrl+Shift+X`).

## Usage

### Method 1: Right-click menu
1. Open any text file in VS Code
2. Select the text you want to modify
3. Right-click on the selection → **"WriteDot: Modify with AI"**

### Method 2: Keyboard shortcut
1. Select the text you want to modify
2. Press `Cmd+Shift+M` (Mac) or `Ctrl+Shift+M` (Windows/Linux)

### Method 3: Status bar
1. Select the text you want to modify
2. Click the **"✨ AI Edit"** button in the status bar

### Workflow

1. A prompt panel will open beside your editor where you can enter your modification instructions
2. Multi-line prompts are supported - use `Cmd+Enter` or `Ctrl+Enter` to submit
3. Choose whether to include context from other files in the folder (optional checkbox)
4. The selected text will be replaced with the AI-modified version
5. The panel stays open for multiple sequential modifications - just keep selecting text and submitting new prompts!

**Example prompts:**
- "make it more concise"
- "fix grammar and spelling"
- "translate to Spanish"
- "rewrite in a professional tone"
- "add code comments"

## Configuration

Go to VS Code Settings → Extensions → WriteDot to configure:

| Setting | Default | Description |
|---------|---------|-------------|
| `awsRegion` | `us-west-2` | AWS region for Bedrock API calls |
| `modelId` | `global.anthropic.claude-sonnet-4-5-20250929-v1:0` | Bedrock model ID to use |
| `maxTokens` | `4096` | Maximum tokens in the response |
| `defaultContextBehavior` | `ask` | Default behavior for folder context (`ask`, `always`, or `never`) |

## Supported File Types for Context

When including folder context, the extension reads these file types:

**Documents**: `.md`, `.txt`, `.html`, `.htm`, `.xml`, `.pdf`

**Data**: `.json`, `.csv`, `.yaml`, `.yml`, `.toml`, `.ini`, `.cfg`, `.conf`

**Code**: `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.java`, `.c`, `.cpp`, `.h`, `.css`, `.scss`

## Troubleshooting

**Extension fails to activate**: Make sure AWS credentials are properly configured and you have access to Claude on Bedrock.

**Model not found error**: Verify you have access to Claude Sonnet 4.5 in the us-west-2 region.

**Text not replacing correctly**: Make sure you have text selected before running the command.

## Future Developments

The following features are planned for future releases:

### Prompt History
- Save recent prompts for easy reuse
- Quick access to frequently used modification commands
- Prompt templates for common tasks

### Multiple Commands
Add quick commands for common modifications:
- "Fix Grammar"
- "Make Concise"
- "Translate to..."
- "Improve Writing"
- "Add Documentation"

### Diff Preview
- Show a side-by-side diff before applying changes
- Accept/reject changes before replacement
- Undo/redo support

### Enhanced Error Handling
- Better error messages for AWS credential issues
- Rate limit detection and handling
- Retry logic for transient failures

### Testing
- Unit tests for core functionality
- Integration tests for AWS Bedrock calls
- End-to-end extension tests

### Additional Features
- Support for streaming responses
- Cost estimation before making API calls
- Usage analytics and tracking
- Multiple AI model support (beyond Claude)

Contributions and feature requests are welcome! Please open an issue on GitHub to discuss.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on [GitHub](https://github.com/piezox/WriteDot).

### Development Setup

If you want to contribute to WriteDot:

1. Clone the repository:

   ```bash
   git clone https://github.com/piezox/WriteDot.git
   cd WriteDot
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Compile the extension:

   ```bash
   npm run compile
   ```

4. Press `F5` in VS Code to launch the Extension Development Host with debugging enabled.

### Project Structure

```text
WriteDot/
├── src/
│   ├── extension.ts         # Main extension logic
│   ├── bedrockClient.ts     # AWS Bedrock/Claude integration
│   ├── contextGatherer.ts   # File context gathering
│   └── promptPanel.ts       # Multi-line prompt input panel
├── out/                     # Compiled JavaScript
├── package.json            # Extension manifest
└── tsconfig.json          # TypeScript configuration
```

## License

MIT
