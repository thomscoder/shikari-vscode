import * as vscode from "vscode";
import { COMMENT_ID, COMMENT_PLACEHOLDER, DEFAULT_USERNAME } from "../utils/labels";
import ShikariComment from "./shikariComment";
import { heartReaction, likeReaction, wowReaction } from "./shikariReaction";



/** Creates a comment thread */
export const commentsHandler = (context: vscode.ExtensionContext, username: string) => {
    // Start creating comment thread		
    let commentController = vscode.comments.createCommentController(COMMENT_ID, "shikari");
    context.subscriptions.push(commentController);

    // Add decorators
    commentController.commentingRangeProvider = {
        /** Tells where to add decorators */
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
    commentController.reactionHandler = async (comment: vscode.Comment, reaction: vscode.CommentReaction): Promise<void> => {}; 

    
    // Save comment
    let createComment: vscode.Disposable = vscode.commands.registerCommand('shikari.saveComment', async (reply: vscode.CommentReply) => {
        reply.thread.label = `New comment from @${username}`;
        // Set the context for this thread
        if(reply.thread.contextValue !== 'unresolved') {
            reply.thread.contextValue = 'unresolved';
        };

		let commentThread = reply.thread;
        // Build custom comment with user session from github
        let newComment: ShikariComment = new ShikariComment(
            reply.text, 
            {name: `${username}`, iconPath: vscode.Uri.parse(`https://github.com/${username}.png`)}, 
            commentThread, 
            vscode.CommentMode.Preview,
            commentThread.comments.length ? 'deletable' : 'writing',
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

    // Cancel comment
    let cancelComment: vscode.Disposable = vscode.commands.registerCommand('shikari.cancelComment', async (reply: ShikariComment) => {
        // Cancel the text
        reply.bodyToSave = '';
        // Collapsed
        //reply.shikariCommentThread.collapsibleState = 0;
    });

    context.subscriptions.push(cancelComment);

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

    // Delete thread
    let deleteThread: vscode.Disposable = vscode.commands.registerCommand('shikari.deleteThread', async (thread: vscode.CommentThread) => {
        thread.dispose();
    });

    context.subscriptions.push(deleteThread);


    // Edit comment
    let editComment: vscode.Disposable = vscode.commands.registerCommand('shikari.editComment', async (comment: ShikariComment) => {
        let commentThread: vscode.CommentThread= comment.shikariCommentThread!;
        commentThread.comments = commentThread.comments.map(c => {
            if((c as ShikariComment).id === comment.id) {
                c.mode = vscode.CommentMode.Editing;
                c.contextValue = "editing";
            };
            return c;
        });
    });

    context.subscriptions.push(editComment);

    // Resolve thread
    let resolveThread: vscode.Disposable = vscode.commands.registerCommand('shikari.resolveThread', async (reply: ShikariComment) => {
        reply.shikariCommentThread.canReply = false;
        reply.shikariCommentThread.contextValue = 'resolved';
    });

    context.subscriptions.push(resolveThread);
};