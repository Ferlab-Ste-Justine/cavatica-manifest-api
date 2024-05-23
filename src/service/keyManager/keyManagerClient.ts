import { fenceList, keyManagerUrl } from '../../config/env';
import { KeyManagerError, KeyManagerFenceNotConnectedError } from './errors';

const MAX_KEY_MANAGER_RETRIES = 2;

export const getUserACLs = async (accessToken: string): Promise<string[]> => {
    const acls = await Promise.all(fenceList.map((fence) => getACLsForFence(accessToken, fence)));
    return [...new Set(acls.flat())];
};

const getACLsForFence = async (accessToken: string, fence: string): Promise<string[]> => {
    const uri = `${keyManagerUrl}/fence/${fence}/acl`;

    for (let i = 0; i <= MAX_KEY_MANAGER_RETRIES; i++) {
        const response = await fetch(encodeURI(uri), {
            method: 'get',
            headers: {
                Authorization: accessToken,
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 401) {
            throw new KeyManagerFenceNotConnectedError();
        }

        if (response.status === 200) {
            const body = await response.json();
            return body.acl;
        }

        if (response.status !== 500) {
            throw new KeyManagerError(response.status, await response.text());
        }
    }
};
