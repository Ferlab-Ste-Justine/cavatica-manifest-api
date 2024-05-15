import dotenv from 'dotenv';

dotenv.config();

export const env = process.env.ENV;
export const port = process.env.PORT || 1313;

export const keycloakURL = process.env.KEYCLOAK_URL;
export const keycloakRealm = process.env.KEYCLOAK_REALM;
export const keycloakClient = process.env.KEYCLOAK_CLIENT;

export const mockKeyManager = process.env.MOCK_KEY_MANAGER || false;
export const keyManagerUrl = process.env.KEY_MANAGER_URL;
export const fenceList: string[] = (process.env.FENCE_LIST || '').split('|');

export const fhirUrl = process.env.FHIR_URL;
export const fhirKeycloakUrl = process.env.FHIR_KEYCLOAK_URL;
export const fhirKeycloakRealm = process.env.FHIR_KEYCLOAK_REALM;
export const fhirKeycloakClientId = process.env.FHIR_KEYCLOAK_CLIENT_ID;
export const fhirKeycloakClientSecret = process.env.FHIR_KEYCLOAK_CLIENT_SECRET;

export const manifestBucket = process.env.MANIFEST_BUCKET;
