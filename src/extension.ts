// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import CustomFile from './fileHandler';
import { EXTENSION_IS_RUNNING, FILE_CREATION_PLACEHOLDER } from './utils/labels';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Start a file watcher to "listen for file changes in the workspace"
	const watcher = vscode.workspace.createFileSystemWatcher("**/*.{js,ts}");
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log(EXTENSION_IS_RUNNING);
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('shikari.helloWorld', async () => {
		// At extension activation create file 
		let fileTitle = await vscode.window.showInputBox({placeHolder: FILE_CREATION_PLACEHOLDER});
		if(fileTitle) {
			const file = new CustomFile(fileTitle, watcher);
        	file.startWriting();
			// If file created successfully start a comment thread
		};
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Shikari!');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
