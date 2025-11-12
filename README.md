# AI Markdown Assistant

A VS Code extension that modifies selected markdown text using Claude via AWS Bedrock.

## Features

- Modify selected text in markdown files using natural language prompts
- Full document context is automatically included for better results
- Optional folder context (includes other files in the same directory)
- Supports multiple file types: `.md`, `.txt`, `.html`, `.json`, `.pdf`, and more

## Prerequisites

- VS Code 1.85.0 or higher
- Node.js and npm
- AWS account with Bedrock access
- AWS credentials configured (`~/.aws/credentials`)
- Access to Claude Sonnet 4.5 model in AWS Bedrock (us-west-2 region)

## Installation

### Option 1: Install from source

1. Clone this repository:
   ```bash
   git clone https://github.com/piezox/SmartEditor.git
   cd SmartEditor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile the extension:
   ```bash
   npm run compile
   ```

4. Open the project in VS Code:
   ```bash
   code .
   ```

5. Press `F5` to launch the Extension Development Host

### Option 2: Package and install

1. Install vsce (VS Code Extension packager):
   ```bash
   npm install -g @vscode/vsce
   ```

2. Package the extension:
   ```bash
   vsce package
   ```

3. Install the `.vsix` file:
   - In VS Code, go to Extensions view
   - Click the `...` menu → "Install from VSIX..."
   - Select the generated `.vsix` file

## Usage

1. Open a markdown (`.md`) file in VS Code
2. Select the text you want to modify
3. Right-click on the selection
4. Click **"Modify with AI"**
5. Enter your modification prompt (e.g., "make it more concise", "fix grammar", "translate to Spanish")
6. Choose whether to include context from other files in the folder
7. The selected text will be replaced with the AI-modified version

## Configuration

The extension uses AWS Bedrock with the following defaults:
- **Region**: `us-west-2`
- **Model**: `global.anthropic.claude-sonnet-4-5-20250929-v1:0` (Claude Sonnet 4.5)

To modify these settings, edit [`src/bedrockClient.ts`](src/bedrockClient.ts).

## Supported File Types for Context

When including folder context, the extension reads these file types:

**Documents**: `.md`, `.txt`, `.html`, `.htm`, `.xml`, `.pdf`

**Data**: `.json`, `.csv`, `.yaml`, `.yml`, `.toml`, `.ini`, `.cfg`, `.conf`

**Code**: `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.java`, `.c`, `.cpp`, `.h`, `.css`, `.scss`

## Development

### Project Structure

```
SmartEditor/
├── src/
│   ├── extension.ts         # Main extension logic
│   ├── bedrockClient.ts     # AWS Bedrock/Claude integration
│   └── contextGatherer.ts   # File context gathering
├── out/                     # Compiled JavaScript
├── package.json            # Extension manifest
└── tsconfig.json          # TypeScript configuration
```

### Building

```bash
npm run compile
```

### Debugging

Press `F5` in VS Code to launch the Extension Development Host with debugging enabled.

## License

MIT

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## Troubleshooting

**Extension fails to activate**: Make sure AWS credentials are properly configured and you have access to Claude on Bedrock.

**Model not found error**: Verify you have access to Claude Sonnet 4.5 in the us-west-2 region.

**Text not replacing correctly**: Make sure you have text selected before running the command.