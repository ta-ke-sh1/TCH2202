export class React {
    constructor (id, reaction) {
        this.id = id;
        this.reaction = reaction;
    }

    static fromJson(json, id) {
        return new React(id, json.reaction);
    }

    toJson() {
        return {
            reaction: this.reaction,
        };
    }
}