// import { keyManagerUrl } from '../../../config/env';
// import { CavaticaError } from './errors';
// import { BulkImportItem, BulkImportResponse, CavaticaDRSImportBody } from './types';
//
// export const startBulkImport = async (accessToken: string, items: BulkImportItem[]): Promise<BulkImportResponse> => {
//     const uri = `${keyManagerUrl}/cavatica2/v2/bulk/drs/imports/create`;
//     const body: CavaticaDRSImportBody = {
//         items,
//         conflict_resolution: 'OVERWRITE',
//         tags: [`VWB_${new Date().toISOString().slice(0, 10)}`],
//     };
//
//     const response = await fetch(encodeURI(uri), {
//         method: 'post',
//         headers: {
//             Authorization: accessToken,
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(body),
//     });
//
//     if (response.status === 200) {
//         const body: BulkImportResponse = await response.json();
//         return body;
//     }
//
//     throw new CavaticaError(response.status, await response.text());
// };
