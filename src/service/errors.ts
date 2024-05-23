export class NoAclError extends Error {
    constructor() {
        super(`no_acl`);
        Object.setPrototypeOf(this, NoAclError.prototype);
        this.name = NoAclError.name;
    }
}

export class NoOccurrenceError extends Error {
    constructor() {
        super(`no_file_for_acls`);
        Object.setPrototypeOf(this, NoOccurrenceError.prototype);
        this.name = NoOccurrenceError.name;
    }
}
