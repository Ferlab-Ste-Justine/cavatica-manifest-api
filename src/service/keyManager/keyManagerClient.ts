import { fenceList, keyManagerUrl } from '../../config/env';
import { KeyManagerError, KeyManagerFenceNotConnectedError } from './errors';

const MAX_KEY_MANAGER_RETRIES = 2;
const NOT_CONNECTED = 'NOT_CONNECTED';

export const getUserACLs = async (accessToken: string): Promise<string[]> => {
    const acls = await Promise.all(fenceList.map((fence) => getACLsForFence(accessToken, fence)));
    const result = [...new Set(acls.flat())];

    if (result.length === 1 && result[0] === NOT_CONNECTED) {
        throw new KeyManagerFenceNotConnectedError();
    }
    return result.filter((acl) => acl !== NOT_CONNECTED);
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
            return [NOT_CONNECTED];
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
