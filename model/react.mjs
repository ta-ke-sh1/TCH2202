export class Reaction {
    constructor(reaction, user, document, datetime) {
        this.reaction = reaction;
        this.user = user;
        this.document = document;
        this.datetime = datetime;
    }

    static fromJson(json) {
        return new React(json.reaction, json.id, json.document);
    }

    toJson() {
        return {
            reaction: this.reaction,
            user: this.user,
            document: this.document,
            datetime: this.datetime,
        };
    }
}
