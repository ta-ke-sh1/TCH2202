export class Reaction {
    constructor(reaction, user, document) {
        this.reaction = reaction;
        this.user = user;
        this.document = document;
    }

    static fromJson(json) {
        return new React(json.reaction, json.id, json.document);
    }

    toJson() {
        return {
            reaction: this.reaction,
            user: this.user,
            document: this.document,
        };
    }
}
