// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { commentsHandler } from './handlers/commentsHandlers';
import CustomFile from './handlers/fileHandler';
import { EXTENSION_IS_RUNNING, FILE_CREATION_PLACEHOLDER } from './utils/labels';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Start a file watcher to "listen for file changes in the workspace"
	const watcher = vscode.workspace.createFileSystemWatcher("**/*.{js,ts,txt,html,css,scss,cpp,c,php,json,lock,gitignore}");
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log(EXTENSION_IS_RUNNING);
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposableStart = vscode.commands.registerCommand('shikari.startShikari', async () => {
		// Get the github account
        const session = await vscode.authentication.getSession('github', ['read:user', 'user:email'], { createIfNone: false });
		const username = session?.account.label ?? 'anonymous';
		// Get file name
		let fileTitle = await vscode.window.showInputBox({placeHolder: FILE_CREATION_PLACEHOLDER});
		if(fileTitle) {
			// Create the file
			const file = new CustomFile(fileTitle, watcher, context, username);
        	file.startWriting();
		};
	});

	let disposableStartOnCurrentFile = vscode.commands.registerCommand('shikari.startShikariOnCurrentFile', async () => {
		// Get the github account
        const session = await vscode.authentication.getSession('github', ['read:user', 'user:email'], { createIfNone: false });
		const username = session?.account.label ?? 'anonymous';
		/** Handle comments */
		commentsHandler(context, username);
		const downloaded = await vscode.commands.executeCommand('shikari.downloadThread');
	});

	context.subscriptions.push(
		disposableStart,
		disposableStartOnCurrentFile
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
