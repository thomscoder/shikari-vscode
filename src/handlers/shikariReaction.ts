import { CommentReaction, Uri } from "vscode";
import { LIKE, LIKE_REACTION, HEART, LOVE_REACTION, WOW, WOW_REACTION } from "../utils/labels";

// Create reactions for comments
class ShikariCommentReaction {
    label: string;
    count: number;
    iconPath: string;
    authorHasReacted: boolean;
    /** Makes the reaction UI
     * @param {string} reactionUrl url for the reaction image
     */
    constructor(reactionUrl: string) {
        this.label = reactionUrl.match(/thumbs/) ? LIKE : reactionUrl.match(/heart/) ? HEART : WOW;
        this.count = 0;
        this.iconPath = reactionUrl;
        this.authorHasReacted = false;
    }

    // Make a new reaction with specified png path
    public build(): CommentReaction {
        return {
            authorHasReacted:false, 
            count: this.count, 
            iconPath: Uri.parse(this.iconPath), 
            label: this.label,
        };
    }
}


export const likeReaction = new ShikariCommentReaction(LIKE_REACTION);
export const heartReaction = new ShikariCommentReaction(LOVE_REACTION);
export const wowReaction =new ShikariCommentReaction(WOW_REACTION);