import * as vscode from "vscode";

/** Creates a comment thread */
export const commentsHandler = (uri: vscode.Uri, doc: vscode.TextDocument) => {
    // Start creating comment thread		
    let commentController = vscode.comments.createCommentController("ciao", "hello world");
    let lineCount = doc.lineCount;
    let range = new vscode.Range(0, 0, lineCount - 1, 0);

    commentController.createCommentThread(uri, range, []);
};