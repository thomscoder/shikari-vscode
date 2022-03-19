import * as vscode from "vscode";
import { COMMENT_ID } from "../utils/labels";

/** Creates a comment thread */
export const commentsHandler = (uri: vscode.Uri, doc: vscode.TextDocument, context: vscode.ExtensionContext) => {
    // Start creating comment thread		
    let commentController = vscode.comments.createCommentController(COMMENT_ID, "hello world");
    context.subscriptions.push(commentController);

    // Add decorators
    commentController.commentingRangeProvider = {
        provideCommentingRanges(doc, token) {
            let lineCount = doc.lineCount;
            let range = new vscode.Range(0, 0, lineCount - 1, 0);
            return [range];
        }
    };

    // Register the command to create the comment
    context.subscriptions.push(vscode.commands.registerCommand('shikari.createComment', (reply: vscode.CommentReply) => {
		console.log(reply.text);
	}));

};