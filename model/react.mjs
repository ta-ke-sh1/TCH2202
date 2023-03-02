export class Reaction {
    constructor (reaction) {
        this.reaction = reaction;
    }

    static fromJson(json) {
        return new React(json.reaction);
    }

    toJson() {
        return {
            reaction: this.reaction,
        };
    }
}