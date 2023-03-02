export class Comment {
    constructor (idea_id, user_id, content, date, isAnonymous) {
        this.idea_id = idea_id;
        this.user_id = user_id;
        this.content = content;
        this.date = date;
        this.isAnonymous = isAnonymous;
    }

    static fromJson(json) {
        return new Comment(
            json.idea_id,
            json.user_id,
            json.content,
            json.date,
            json.isAnonymous,
        );
    }

    toJson() {
        return {
            idea_id: this.idea_id,
            user_id: this.user_id,
            content: this.content,
            date: this.date,
            isAnonymous: this.isAnonymous,
        };
    }
}
