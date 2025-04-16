import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as toml from "toml";

export function activate(context: vscode.ExtensionContext) {
  console.log("goto-file extension activated");

  // Register the command that will be called by the Vim extension
  let disposable = vscode.commands.registerCommand(
    "goto-file.gotoFile",
    async () => {
      console.log("gotoFile command triggered");
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        console.log("No active text editor found");
        return;
      }

      // Get the word under cursor
      const position = editor.selection.active;
      const wordRange = editor.document.getWordRangeAtPosition(position);
      if (!wordRange) {
        console.log("No word found at cursor position");
        return;
      }

      const lineText = editor.document.lineAt(position.line).text;
      console.log(`Current line text: ${lineText}`);

      const fileReference = extractFileReference(lineText);
      console.log(`Extracted file reference: ${fileReference}`);

      if (!fileReference) {
        console.log("No file reference could be extracted from the line");
        return;
      }

      // Find and open the file
      const filePath = await findFilePath(fileReference);
      console.log(`Found file path: ${filePath}`);

      if (filePath) {
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document, { preview: false });
        console.log(`Successfully opened file: ${filePath}`);
      } else {
        console.log(`File not found: ${fileReference}`);
        vscode.window.showErrorMessage(`File not found: ${fileReference}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

function extractFileReference(lineText: string): string | null {
  // This regex looks for filenames with extensions
  // You might want to customize this based on your specific format
  const match = lineText.match(/\b[\w-]+\.\w+\b/);
  console.log(`Regex match result: ${match ? match[0] : "null"}`);
  return match ? match[0] : null;
}

async function findFilePath(fileReference: string): Promise<string | null> {
  console.log(`Searching for file: ${fileReference}`);

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    console.log("No workspace folders found");
    return null;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  console.log(`Workspace root path: ${rootPath}`);

  const configPath = path.join(
    rootPath,
    vscode.workspace
      .getConfiguration("goto-file")
      .get("configPath", ".goto-file.toml")
  );
  console.log(`Config file path: ${configPath}`);

  try {
    if (!fs.existsSync(configPath)) {
      console.log(
        "Configuration file not found, falling back to workspace root search"
      );
      vscode.window.showWarningMessage(
        "Configuration file not found. Searching in workspace root."
      );
      return searchInDirectory(rootPath, fileReference);
    }

    const configContent = fs.readFileSync(configPath, "utf8");
    const config = toml.parse(configContent);
    console.log(`Parsed config: ${JSON.stringify(config)}`);

    if (!config.prefixes || !Array.isArray(config.prefixes)) {
      console.log(
        "No valid prefixes found in config, falling back to workspace root search"
      );
      return searchInDirectory(rootPath, fileReference);
    }

    // Search in all prefixes
    for (const prefix of config.prefixes) {
      console.log(`Searching in prefix: ${prefix}`);
      const result = await searchInDirectory(prefix, fileReference);
      if (result) return result;
    }

    console.log("File not found in any configured prefixes");
    return null;
  } catch (error) {
    console.error(`Error reading config: ${error}`);
    vscode.window.showErrorMessage(`Error reading config: ${error}`);
    return null;
  }
}

async function searchInDirectory(
  directory: string,
  filename: string
): Promise<string | null> {
  console.log(`Searching for ${filename} in directory: ${directory}`);

  try {
    const files = fs.readdirSync(directory);
    console.log(`Found ${files.length} files in directory`);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        console.log(`Recursing into directory: ${filePath}`);
        const result = await searchInDirectory(filePath, filename);
        if (result) return result;
      } else if (file === filename) {
        console.log(`Found matching file: ${filePath}`);
        return filePath;
      }
    }
  } catch (error) {
    console.error(`Error searching directory ${directory}:`, error);
  }
  return null;
}
