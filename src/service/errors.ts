export class NoAclError extends Error {
    constructor() {
        super(`User has no ACL`);
        Object.setPrototypeOf(this, NoAclError.prototype);
        this.name = NoAclError.name;
    }
}

export class NoOccurrenceError extends Error {
    constructor() {
        super(`No occurrence parquet for user's ACLs`);
        Object.setPrototypeOf(this, NoOccurrenceError.prototype);
        this.name = NoOccurrenceError.name;
    }
}
