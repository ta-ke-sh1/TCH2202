export class Category {
    constructor (id, name, count) {
        this.id = id;
        this.name = name;
        this.count = count;
    }

    static fromJson(json) {
        return new Category(json.id, json.name, json.count);
    }

    toJson() {
        return {
            id: this.id,
            name: this.name,
            count: this.count
        }
    }
}