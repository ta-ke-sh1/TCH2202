export class Comment {
    constructor (id, idea_id, user_id, content, date, stat, react) {
        this.id = id;
        this.idea_id = idea_id;
        this.user_id = user_id;
        this.content = content;
        this.date = date;
        this.stat = stat;
        this.react = react;
    }

    static fromJson(json) {
        return new Comment(json.id, json.idea_id, json.user_id, json.content, json.date, json.stat, json.react)
    }

    toJson() {
        return {
            id: this.id,
            idea_id: this.idea_id,
            user_id: this.user_id,
            content: this.content,
            date: this.date,
            stat: this.stat,
            react: this.react,

        }
    }
}