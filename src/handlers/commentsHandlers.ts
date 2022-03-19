import * as vscode from "vscode";
import { COMMENT_ID, COMMENT_PLACEHOLDER, LIKE_REACTION, LOVE_REACTION, WOW_REACTION } from "../utils/labels";

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
        public reactions?: vscode.CommentReaction[],
    ) {
        this.id = ++shikariCommentId;
        this.bodyToSave = this.body;
    }
}

// Create reactions for comments
class ShikariCommentReaction {
    // Make a new reaction with specified png path
    public static build(reactionUrl: string): vscode.CommentReaction {
        return {
            authorHasReacted:false, 
            count: 0, 
            iconPath: vscode.Uri.parse(reactionUrl), 
            label: "reaction",
        };
    }
}

/** Creates a comment thread */
export const commentsHandler = (uri: vscode.Uri, doc: vscode.TextDocument, context: vscode.ExtensionContext, username: string) => {
    // Start creating comment thread		
    let commentController = vscode.comments.createCommentController(COMMENT_ID, "shikari");
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
    let createComment: vscode.Disposable = vscode.commands.registerCommand('shikari.saveComment', async (reply: vscode.CommentReply) => {
        reply.thread.label = `New comment from @${username}`;
		let commentThread = reply.thread;
        // Build custom comment with user session from github
        let newComment: ShikariComment = new ShikariComment(
            reply.text, 
            {name: `@${username}`, iconPath: vscode.Uri.parse(`https://github.com/${username}.png`)}, 
            commentThread, 
            vscode.CommentMode.Preview,
            undefined,
        );
        
        commentThread.comments = [...commentThread.comments, newComment];
        commentThread.comments.forEach(comment => {
            let date = new Date();
            let hour = date.getHours();
            let minutes = date.getMinutes();
            comment.label = `${hour}:${minutes}`;
            try {
                comment.reactions = [
                    ShikariCommentReaction.build(LIKE_REACTION),
                    ShikariCommentReaction.build(LOVE_REACTION),
                    ShikariCommentReaction.build(WOW_REACTION),
                ];
            } catch {}
        });
	});
    context.subscriptions.push(createComment);
};