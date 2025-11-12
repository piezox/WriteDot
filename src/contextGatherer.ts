import * as fs from 'fs';
import * as path from 'path';

export async function gatherFolderContext(currentFilePath: string): Promise<string> {
  const folderPath = path.dirname(currentFilePath);
  const files = fs.readdirSync(folderPath);

  let context = '';

  // Add current file
  const currentContent = fs.readFileSync(currentFilePath, 'utf-8');
  context += `### Current Document: ${path.basename(currentFilePath)}\n${currentContent}\n\n`;

  // Text-based file extensions to include
  const textFileExtensions = [
    '.md', '.txt', '.html', '.htm', '.xml', '.json', '.csv',
    '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.h',
    '.css', '.scss', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf'
  ];

  // Add other text-based files
  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    const fileExt = path.extname(file).toLowerCase();

    if (textFileExtensions.includes(fileExt) && fullPath !== currentFilePath) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        context += `### ${file}\n${content}\n\n`;
      } catch (error) {
        console.log(`Skipping ${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  // Add PDF files
  for (const file of files) {
    if (file.endsWith('.pdf')) {
      try {
        // Lazy load pdf-parse only when needed
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { PDFParse } = require('pdf-parse');
        const pdfBuffer = fs.readFileSync(path.join(folderPath, file));
        const pdfData = await PDFParse(pdfBuffer);
        context += `### ${file}\n${pdfData.text}\n\n`;
      } catch (error) {
        console.log(`Skipping ${file}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  return context;
}
