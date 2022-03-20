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
            commentThread.comments.length ? 'deletable' : undefined,
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

    // Delete comment
    let deleteComment: vscode.Disposable = vscode.commands.registerCommand('shikari.deleteComment', async (comment: ShikariComment) => {
        let commentThread: vscode.CommentThread = comment.shikariCommentThread!;
        // Remove comment from the comments thread
        commentThread.comments = commentThread.comments.filter(c => (c as ShikariComment).id !== comment.id);
        if(commentThread.comments.length === 0) {
            commentThread.dispose();
        };
    });

    context.subscriptions.push(deleteComment);

    // Edit comment
    let editComment: vscode.Disposable = vscode.commands.registerCommand('shikari.editComment', async (comment: ShikariComment) => {
        let commentThread: vscode.CommentThread= comment.shikariCommentThread!;
        commentThread.comments = commentThread.comments.map(c => {
            if((c as ShikariComment).id === comment.id) {
                c.mode = vscode.CommentMode.Editing;
            };
            return c;
        });
    });

    context.subscriptions.push(editComment);
};