// export class CavaticaError extends Error {
//     public readonly status: number;
//     public readonly details: unknown;
//
//     constructor(status: number, details: unknown) {
//         super(`Cavatica Proxy (Key Manager) returns status ${status}`);
//         Object.setPrototypeOf(this, CavaticaError.prototype);
//         this.name = CavaticaError.name;
//         this.status = status;
//         this.details = details;
//     }
// }
