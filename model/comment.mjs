export class Comment {
    constructor(id, idea_id, user_id, content, date, isAnonymous, react) {
        this.id = id;
        this.idea_id = idea_id;
        this.user_id = user_id;
        this.content = content;
        this.date = date;
        this.isAnonymous = isAnonymous;
        this.react = react;
    }

    static fromJson(json, docId) {
        return new Comment(
            docId,
            json.idea_id,
            json.user_id,
            json.content,
            json.date,
            json.isAnonymous,
            json.react
        );
    }

    toJson() {
        return {
            idea_id: this.idea_id,
            user_id: this.user_id,
            content: this.content,
            date: this.date,
            isAnonymous: this.isAnonymous,
            react: this.react,
        };
    }
}
