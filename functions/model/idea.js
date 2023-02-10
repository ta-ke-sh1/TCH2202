class Idea {
    constructor (id, writer_id, approver_id, file, post_date, expiration_date, visit_count, status, is_anonymous) {
        this.id = id;
        this.writer_id = writer_id;
        this.approver_id = approver_id;
        this.file = file;
        this.post_date = post_date;
        this.expiration_date = expiration_date;
        this.visit_count = visit_count;
        this.status = status;
        this.is_anonymous = is_anonymous;
    }
}

const idea_status = [
    'Open',
    'Closed',
    'Expired',
]