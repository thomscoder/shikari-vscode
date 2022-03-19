import * as vscode from "vscode";
import { COMMENT_ID, COMMENT_PLACEHOLDER } from "../utils/labels";

let shikariCommentId = 0;
class ShikariComment implements vscode.Comment {
    id: number;
    label: string | undefined;
    bodyToSave: string;
    constructor(
        public body: string,
        public author: vscode.CommentAuthorInformation,
        public shikariCommentThread: vscode.CommentThread,
        public mode: vscode.CommentMode,
        public contextValue?: string | undefined,
    ) {
        this.id = ++shikariCommentId;
        this.bodyToSave = this.body;
    }
}

/** Creates a comment thread */
export const commentsHandler = (uri: vscode.Uri, doc: vscode.TextDocument, context: vscode.ExtensionContext, username: string) => {
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

    // Comment options
    commentController.options = {
        placeHolder: COMMENT_PLACEHOLDER,
    };

    // Register the command to create the comment
    let createComment = vscode.commands.registerCommand('shikari.saveComment', async (reply: vscode.CommentReply) => {
		vscode.window.showInformationMessage(reply.text);
		let commentThread = reply.thread;
        let newComment: ShikariComment = new ShikariComment(
            reply.text, 
            {name: `@${username}`, iconPath: vscode.Uri.parse(`https://github.com/${username}.png`)}, 
            commentThread, 
            vscode.CommentMode.Preview,
            undefined
        );
        commentThread.comments = [...commentThread.comments, newComment];
	});
    context.subscriptions.push(createComment);
};