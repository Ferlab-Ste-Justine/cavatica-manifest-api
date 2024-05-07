import jwt from 'jsonwebtoken';

const privateKey = `
-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----
`;

// eslint-disable-next-line max-len
export const publicKey = `MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEArcpdOWgIzJwRaVQennTMfwlIX+C2Ji/QZKrRMWq/Gjx7G4ntUEMTmIytalzHqp4/eQ+2OMpuw8tgw8NAQL3W1SiMB7nb9axPQ5Kwmo9FvL7ohzNOKcbFsph4dncNRf9FexSwtz+8XaNkPKflM8vPyi9f0cFGC1kD6Mkcd17buJ4sOnEc6XvPdHCxPfuy8XUodcecVFoLSSdC1dfCShgcuJk1L9CPIa4ozn3ihMzkY/AhHbbalJ+FZusaYdpKUp2hij8q2K0AU1QjKLnQ8vW2iMAaRbU0xL37Mw10jkJijROilhzazfh6yOJjBQWkOiCYn7qOhneTKL0UvNBEIN/i9KCnXVwmjPoYo8LJW6OjDAsTGnyeEHHcwD4WkpoJJy7xWVmSAhSdaRnXIYwCk2n+0ngEOp9BfNaSUTXXWIoA/5NeTcWkayHSidBvu8drVdqVB+9QMpTkQJ05rY7SjoC3t+P6LTcTvEmicncZnVw9SOT0VsQakyfhkWXQ4a6sdyT/gVyTFQox76QQ7CCUCO3sKG4Wp/8IfnbvJVWxmr/nQGG/j+v/uGNWD+s61Pq16NgvKz9ktei6u5oHD/+mLODPan5Qq1xtcp1B62RlBTC6yq+TOb3pEZVK7iW78pliDzqtLMRchC0RqZdkYD2647+WeU0txCNtY/YAMWCPH4X5Yu0CAwEAAQ==`;

const fakeKeycloakUrl = 'http://localhost:8080';
const fakeKeycloakRealm = 'fakeRealm';
const fakeKeycloakPortalClient = 'fakePortalClient';
const fakeKeycloakApiClient = 'fakeApiClient';

export const getToken = (expire = 1000, sub = '12345-678-90abcdef'): string =>
    jwt.sign(
        {
            iss: `${fakeKeycloakUrl}/realms/${fakeKeycloakRealm}`,
            sub: sub,
            aud: 'kf-cavatica-vwb-api',
            jti: '2c166d55-5ae6-4fb4-9daa-a1d5e1f535d7',
            user_id: sub,
            typ: 'Bearer',
            azp: fakeKeycloakPortalClient,
            session_state: 'ae2d1238-0180-4ea1-978a-8e9a95ba44f4',
            acr: '1',
            realm_access: {
                roles: [],
            },
            scope: 'email profile',
            email_verified: false,
            name: 'test test',
            groups: [],
            preferred_username: 'test@test.test',
            given_name: 'test',
            family_name: 'test',
            email: 'test@test.test',
        },
        privateKey,
        {
            expiresIn: expire,
            algorithm: 'RS256',
            keyid: 'a9UdlDPw/hUvvmsQNSDpBIdMc2me6HK0b6PZeZbOmuA',
        },
    );

export const fakeKeycloakConfig = {
    realm: fakeKeycloakRealm,
    'confidential-port': 0,
    'bearer-only': true,
    'auth-server-url': fakeKeycloakUrl,
    'ssl-required': 'external',
    resource: fakeKeycloakApiClient,
    'realm-public-key': publicKey, // For test purpose, we use public key to validate token.
};
