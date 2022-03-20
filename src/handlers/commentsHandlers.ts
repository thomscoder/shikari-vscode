import * as vscode from "vscode";
import { COMMENT_ID, COMMENT_PLACEHOLDER } from "../utils/labels";
import ShikariComment from "./shikariComment";
import { heartReaction, likeReaction, wowReaction } from "./shikariReaction";



/** Creates a comment thread */
export const commentsHandler = (context: vscode.ExtensionContext, username: string) => {
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

    /** This handles the click on a specific reaction
     * Also adds the "add reaction" icon
     */
    commentController.reactionHandler = async (comment: vscode.Comment, reaction: vscode.CommentReaction) => {
        console.log(reaction);
    }; 


    // Register the command to create the comment
    let createComment: vscode.Disposable = vscode.commands.registerCommand('shikari.saveComment', async (reply: vscode.CommentReply) => {
        reply.thread.label = `New comment from @${username}`;
		let commentThread = reply.thread;
        // Build custom comment with user session from github
        let newComment: ShikariComment = new ShikariComment(
            reply.text, 
            {name: `${username}` ?? "anon", iconPath: vscode.Uri.parse(`https://github.com/${username}.png`)}, 
            commentThread, 
            vscode.CommentMode.Preview,
            undefined,
        );
        
        commentThread.comments = [...commentThread.comments, newComment];
        commentThread.comments.forEach(comment => {
            // Reaction handler;
            let date = new Date();
            let hour = date.getHours();
            let minutes = date.getMinutes();
            comment.label = `${hour}:${minutes}`;
            try {
                comment.reactions = [
                    likeReaction.build(),
                    heartReaction.build(),
                    wowReaction.build(),
                ];
            } catch {}
        });
	});

    context.subscriptions.push(createComment);
};