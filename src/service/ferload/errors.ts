export class FerloadError extends Error {
    public readonly status: number;
    public readonly details: unknown;

    constructor(status: number, details: unknown) {
        super(`Ferload returns status ${status}`);
        Object.setPrototypeOf(this, FerloadError.prototype);
        this.name = FerloadError.name;
        this.status = status;
        this.details = details;
    }
}
