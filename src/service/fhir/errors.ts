export class FhirError extends Error {
    public readonly status: number;
    public readonly details: unknown;

    constructor(status: number, details: unknown) {
        super(`FHIR returns status ${status}`);
        Object.setPrototypeOf(this, FhirError.prototype);
        this.name = FhirError.name;
        this.status = status;
        this.details = details;
    }
}

export class KeycloakFhirError extends Error {
    public readonly status: number;
    public readonly details: unknown;

    constructor(status: number, details: unknown) {
        super(`Keycloak (FHIR) returns status ${status}`);
        Object.setPrototypeOf(this, KeycloakFhirError.prototype);
        this.name = KeycloakFhirError.name;
        this.status = status;
        this.details = details;
    }
}
