export class Department {
    constructor (id, name, emp_count) {
        this.id = id;
        this.name = name;
        this.emp_count = emp_count;
    }

    static fromJson(json) {
        return new Department(json.id, json.name, json.emp_count)
    }

    toJson() {
        return {
            id: this.id,
            name: this.name,
            emp_count: this.emp_count,
        }
    }
}