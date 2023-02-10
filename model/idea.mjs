export class Idea {
    constructor (id, writer_id, approver_id, file, post_date, expiration_date, visit_count, stat, is_anonymous) {
        this.id = id;
        this.writer_id = writer_id;
        this.approver_id = approver_id;
        this.file = file;
        this.post_date = post_date;
        this.expiration_date = expiration_date;
        this.visit_count = visit_count;
        this.stat = stat;
        this.is_anonymous = is_anonymous;
    }

    static fromJson(json) {
        return new Idea(
            json.id,
            json.writer_id,
            json.approver_id,
            json.file,
            json.post_date,
            json.expiration_date,
            json.visit_count,
            json.stat,
            json.is_anonymous
        );
    }

    toJson() {
        return {
            id: this.id,
            writer_id: this.writer_id,
            approver_id: this.approver_id,
            file: this.file,
            post_date: this.post_date,
            expiration_date: this.expiration_date,
            visit_count: this.visit_count,
            stat: this.stat,
            is_anonymous: this.is_anonymous,
        }
    }

}

const idea_status = [
    'Open',
    'Closed',
    'Expired',
]