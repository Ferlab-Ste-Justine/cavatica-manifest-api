import { fhirKeycloakClientId, fhirKeycloakClientSecret, fhirKeycloakRealm, fhirKeycloakUrl } from '../../config/env';
import { KeycloakFhirError } from './errors';

export const fetchFhirToken = async () => {
    const uri = `${fhirKeycloakUrl}/realms/${fhirKeycloakRealm}/protocol/openid-connect/token`;

    const response = await fetch(encodeURI(uri), {
        method: 'post',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_secret: fhirKeycloakClientSecret,
            grant_type: 'client_credentials',
            client_id: fhirKeycloakClientId,
        }).toString(),
    });

    if (response.status === 200) {
        const body = await response.json();
        return body.access_token;
    }

    throw new KeycloakFhirError(response.status, await response.text());
};
