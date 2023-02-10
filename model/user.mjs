class User {
    constructor (id, department_id, username, password, fullName, dob, role, phone, status) {
        this.id = id;
        this.department_id = department_id;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.dob = dob;
        this.role = role;
        this.phone = phone;
        this.status = status;
    }

    toJson() {
        return {
            id: this.id,
            department_id: this.department_id,
            username: this.username,
            password: this.password,
            fullName: this.fullName,
            dob: this.dob,
            role: this.role,
            phone: this.phone,
            status: this.status,
        }
    }
}
