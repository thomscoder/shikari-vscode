import { Comment, CommentAuthorInformation, CommentMode, CommentReaction, CommentThread} from "vscode";
let shikariCommentId = 0;

export default class ShikariComment implements Comment {
    id: number;
    label: string | undefined;
    bodyToSave: string;
    constructor(
        public body: string,
        public author: CommentAuthorInformation,
        public shikariCommentThread: CommentThread,
        public mode: CommentMode,
        public contextValue?: string | undefined,
        public reactions?: CommentReaction[],
    ) {
        this.id = ++shikariCommentId;
        this.bodyToSave = this.body;
    }
}
