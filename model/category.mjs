export class Category {
    constructor(id, name, count) {
        this.id = id;
        this.name = name;
        this.count = count;
    }

    static fromJson(json, docId) {
        return new Category(docId, json.name, json.count);
    }

    toJson() {
        return {
            name: this.name,
            count: this.count,
        };
    }
}
