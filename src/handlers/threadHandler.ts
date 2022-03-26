import * as fs from 'fs';
import path = require('path');
import { CommentThread, window, workspace } from "vscode";
import { CREATED_FILE, FAILED_TO_CREATE_BOILERPLATE, FOLDER_CREATED } from '../utils/labels';

export const shikariJSON = (thread: CommentThread): string => {
    const stringifiedThread = {
        canReply: thread.canReply,
        collapsibleState: thread.collapsibleState,
        comments: thread.comments,
        contextValue: thread.contextValue,
        label: thread.label,
        range: thread.range,
        uri: thread.uri,
    };
    return JSON.stringify(stringifiedThread);
};

export const createShikariFolder = (): string => {
    /** Get workspace path */
    const wsPath: string = workspace.workspaceFolders![0].uri?.toString().split(':')[1];
    // File and folder creation paths
    const shikariFolder: string = `${wsPath}/shikari`;
    // Create folder if it doesn't exist
	if(!fs.existsSync(shikariFolder)) {
        fs.mkdir(shikariFolder, err => {
            if(err) {
                console.error(err);
                window.showErrorMessage(FAILED_TO_CREATE_BOILERPLATE);
                return FAILED_TO_CREATE_BOILERPLATE;
            }
            window.showInformationMessage(FOLDER_CREATED);
        });
    }
    
    return shikariFolder;
};