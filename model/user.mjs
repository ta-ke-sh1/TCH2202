export class User {
    constructor(
        id,
        department_id,
        username,
        password,
        fullName,
        dob,
        role,
        phone,
        stat
    ) {
        this.id = id;
        this.department_id = department_id;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.dob = dob;
        this.role = role;
        this.phone = phone;
        this.stat = stat;
    }

    static fromJson(json, docId) {
        return new User(
            docId,
            json.department_id,
            json.username,
            json.password,
            json.fullName,
            json.dob,
            json.role,
            json.phone,
            json.stat
        );
    }

    toJson() {
        return {
            department_id: this.department_id,
            username: this.username,
            password: this.password,
            fullName: this.fullName,
            dob: this.dob,
            role: this.role,
            phone: this.phone,
            stat: this.status,
        };
    }
}
