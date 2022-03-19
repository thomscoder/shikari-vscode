import * as fs from 'fs';
import path = require('path');
import * as vscode from 'vscode';
import { CREATED_FILE, FAILED_TO_CREATE_BOILERPLATE, NO_JS_FILE } from './utils/labels';

interface FileCreation {
    readonly startWriting: any;
}

export default class CustomFile implements FileCreation {
    #fileName: string;
    #folderPath: string;
    #watcher: vscode.FileSystemWatcher;
    #data: string;
	/** Custom file creates a new Javascript or Typescript file and sets it as the active text editor
	 * Accepts two parameters:
	 * @param {string} name the name of the file
	 * @param {vscode.FileSystemWatcher} watcher a file system watcher that listens for creation and modification of files
	 */
    constructor(name: string, watcher: vscode.FileSystemWatcher) {
        this.#fileName = name;
        this.#watcher = watcher;
        this.#folderPath = vscode.workspace.workspaceFolders![0].uri?.toString().split(':')[1];
        this.#data = '';
    }

	/** Once the file is created, it opens it */
    private fileEvents() {
        this.#watcher.onDidCreate(uri => {
            vscode.workspace.openTextDocument((uri)).then((doc: vscode.TextDocument) => {
				
				
                vscode.window.showTextDocument(doc).then((file: vscode.TextEditor) => {
                    return;
                });
            });
        });
    }

	/** Checks if the file name is a valid javascript or typescript file */
    protected nameChecker(): Boolean {
        if(this.#fileName !== '') {
            if(this.#fileName.match(/\.(js|ts)$/)) {
                return true;
            }
        }
        return false;
    }

	/** Starts the file creation and validation process */
    private craftFile() {
        const isNameRight: Boolean = this.nameChecker();
        if(!isNameRight) {
            vscode.window.showErrorMessage(NO_JS_FILE);
            return;
        };
        fs.writeFile(path.join(this.#folderPath, this.#fileName), this.#data, err => {
            if(err) {
                console.error(err);
                vscode.window.showErrorMessage(FAILED_TO_CREATE_BOILERPLATE);
                return;
            }
            vscode.window.showInformationMessage(CREATED_FILE);
            this.fileEvents();
        });
    }
    
	/** You can now start writing and reading the file */
    public startWriting(): void {
        return this.craftFile();
    }

}