export class User {
    constructor (
        department_id,
        username,
        password,
        fullName,
        dob,
        role,
        phone,
        stat,
        avatar,
        email
    ) {
        this.department_id = department_id;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.dob = dob;
        this.role = role;
        this.phone = phone;
        this.stat = stat;
        this.avatar = avatar;
        this.email = email;
    }

    static fromJson(json, docId) {
        return new User(
            json.department_id,
            docId,
            json.password,
            json.fullName,
            json.dob,
            json.role,
            json.phone,
            json.stat,
            json.avatar,
            json.email
        );
    }

    toJson() {
        return {
            department_id: this.department_id,
            password: this.password,
            fullName: this.fullName,
            dob: this.dob,
            role: this.role,
            phone: this.phone,
            stat: this.stat,
            avatar: this.avatar,
            email: this.email,
        };
    }
}
