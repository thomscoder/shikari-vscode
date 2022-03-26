import path = require("path");
import * as vscode from "vscode";
import * as fs from 'fs';

import { APP_NAME, COMMENT_PLACEHOLDER, DEFAULT_USERNAME } from "../utils/labels";
import ShikariComment from "./shikariComment";
import { heartReaction, likeReaction, wowReaction } from "./shikariReaction";
import { createShikariFolder, shikariJSON } from "./threadHandler";



/** Creates a comment thread */
export const commentsHandler = (context: vscode.ExtensionContext, username: string) => {
    // Start creating comment thread		
    let commentController = vscode.comments.createCommentController(APP_NAME, APP_NAME);
    

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


    // Cancel comment
    let cancelComment: vscode.Disposable = vscode.commands.registerCommand('shikari.cancelComment', async (reply: ShikariComment) => {
        // Cancel the text
        reply.bodyToSave = '';
        // Collapsed
        //reply.shikariCommentThread.collapsibleState = 0;
    });
    

    // Delete comment
    let deleteComment: vscode.Disposable = vscode.commands.registerCommand('shikari.deleteComment', async (comment: ShikariComment) => {
        let commentThread: vscode.CommentThread = comment.shikariCommentThread!;
        // Remove comment from the comments thread
        commentThread.comments = commentThread.comments.filter(c => (c as ShikariComment).id !== comment.id);
        if(commentThread.comments.length === 0) {
            commentThread.dispose();
        };
    });
    

    // Delete thread
    let deleteThread: vscode.Disposable = vscode.commands.registerCommand('shikari.deleteThread', async (thread: vscode.CommentThread) => {
        thread.dispose();
    });
    


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
    let resolveThread: vscode.Disposable = vscode.commands.registerCommand('shikari.resolveThread', async (thread: vscode.CommentThread) => {
        // Lock thread if it has at least on comment
        if(thread.comments.length > 0) {
            thread.canReply = false;
            thread.contextValue = 'resolved';
        }
        console.log(thread.canReply);
    });


    // Unresolve thread
    let unresolveThread: vscode.Disposable = vscode.commands.registerCommand('shikari.unresolveThread', async (thread: vscode.CommentThread) => {
        thread.canReply = true;
        thread.contextValue = 'unresolved';
    });

    // Save thread
    let saveThread: vscode.Disposable = vscode.commands.registerCommand('shikari.saveThread', async (thread: vscode.CommentThread) => {
        // Create folder
        const shikariFolder = createShikariFolder();
        /** Get current file name */
        const fileNameToParse = vscode.window.activeTextEditor!.document.fileName.match(/[\w-]+\.\w+/)![0];
        const filename = `${fileNameToParse.replace(/\W/g, '-')}.js`;
        const shikariFile = path.join(shikariFolder, filename);

        // Create file if it doesn't exist
        try {
            const fileData = shikariJSON(thread);
            if(!fs.existsSync(shikariFile)) {
                //const data = shikariJSON(thread);
                fs.writeFile(shikariFile, fileData, 'utf-8', err => {
                    console.log(err);
                });
            }
        } catch(err) {
            console.log(err);
        }
    });


    context.subscriptions.push(
        commentController,
        createComment,
        cancelComment,
        deleteComment,
        deleteThread,
        resolveThread,
        unresolveThread,
        saveThread
    );
};