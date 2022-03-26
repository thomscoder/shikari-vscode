import * as fs from 'fs';
import { CommentThread, window, workspace } from "vscode";
import { FAILED_TO_CREATE_BOILERPLATE, FOLDER_CREATED } from '../utils/labels';

export const shikariJSON = async (thread: CommentThread): Promise<string> => {
    /** Replacer function to prevent circular objects error when parsing JSON */
     const replacerFunc = () => {
        const visited = new WeakSet();
        return (key: any, value: any) => {
            if (typeof value === "object" && value !== null) {
            if (visited.has(value)) {
                return;
            }
            visited.add(value);
            }
            return value;
        };
    };
    /** Object to turn into JSON */
    const stringifiedThread = {
        canReply: thread.canReply,
        collapsibleState: thread.collapsibleState,
        comments: thread.comments,
        contextValue: thread.contextValue,
        label: thread.label,
        range: thread.range,
        uri: thread.uri,
    };
    return JSON.stringify(thread, replacerFunc(), 4);
};

export const createShikariFolder = (): string => {
    /** Get workspace path */
    const wsPath: string = workspace.workspaceFolders![0].uri?.toString().split(':')[1];
    // File and folder creation paths
    const shikariFolder: string = `${wsPath}/.shikari`;
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