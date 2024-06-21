// export class KeyManagerError extends Error {
//     public readonly status: number;
//     public readonly details: unknown;
//
//     constructor(status: number, details: unknown) {
//         super(`Key Manager returns status ${status}`);
//         Object.setPrototypeOf(this, KeyManagerError.prototype);
//         this.name = KeyManagerError.name;
//         this.status = status;
//         this.details = details;
//     }
// }
//
// export class KeyManagerFenceNotConnectedError extends Error {
//     constructor() {
//         super('no_fence_connection');
//         Object.setPrototypeOf(this, KeyManagerFenceNotConnectedError.prototype);
//         this.name = KeyManagerFenceNotConnectedError.name;
//     }
// }
