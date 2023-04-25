export class Category {
    constructor(id, name, idea) {
        this.id = id;
        this.name = name;
        this.idea=idea;
    }

    static fromJson(json, docId) {
        return new Category(docId, json.name, json.idea);
    }

    toJson() {
        return {
            name: this.name,
            idea:this.idea
        };
    }
}
