import { ferloadUrl } from '../../config/env';
import { FerloadError } from './errors';

export const fetchUserPermittedFiles = async (accessToken: string, inputList: string[]): Promise<string[]> => {
    const response = await fetch(encodeURI(`${ferloadUrl}/permissions/by-list`), {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken,
        },
        body: JSON.stringify({
            file_ids: inputList,
        }),
    });

    if (response.status === 200) {
        return await response.json();
    }

    throw new FerloadError(response.status, await response.text());
};
