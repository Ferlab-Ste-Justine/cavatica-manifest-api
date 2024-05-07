<p align="center">
  <img src="docs/kids_first_logo.svg" alt="Kids First repository logo" width="660px" />
</p>

# Cavatica VWB API

## Requirements

- Node >=18.18.0
- NPM >=10.5.0
- Docker

## Developement

### Get Started

Make sure to fill your `.env` file based on `.env.example`

```
npm install
```

then 

```
npm run dev
```

### Run tests

- Watch mode

```
npm run test
```

- With coverage

```
npm run test:coverage
```

### Build and run the Docker image

```
docker build -t kf-cavatica-vwb-api .
```

Then

```
docker run -p 1313:1313 \
-e PORT=1313 \
-e KEYCLOAK_URL={KEYCLOAK_URL} \
-e KEYCLOAK_REALM={KEYCLOAK_REALM} \
-e KEYCLOAK_CLIENT={KEYCLOAK_CLIENT} \
-e KEY_MANAGER_URL={KEY_MANAGER_URL} \
-e FENCE_LIST="gen3|dcf" \
-e FHIR_URL={FHIR_URL} \
-e FHIR_KEYCLOAK_URL={FHIR_KEYCLOAK_URL} \
-e FHIR_KEYCLOAK_REALM={FHIR_KEYCLOAK_REALM} \
-e FHIR_KEYCLOAK_CLIENT_ID={FHIR_KEYCLOAK_CLIENT_ID} \
-e FHIR_KEYCLOAK_CLIENT_SECRET={FHIR_KEYCLOAK_CLIENT_SECRET} \
-it -d kf-cavatica-vwb-api
```

Do not forget to fill env values

## API Documentation

### VWB endpoint

- GET `/status`

Returns

```
{
    "app": "kf-cavatica-vwb-api",
    "version": "0.0.1",
    "keycloak_url": {KEYCLOAK_URL},
    "fhir_url": {FHIR_URL}
}
```

- POST `/vwb`

Requires body with Cavatica project name

```
{
    "project": "username/project_name"
}
```

Returns cavatica bulk import response

```
{
    "href": "https://cavatica-api.sbgenomics.com/v2/bulk/drs/imports/243039088206221312",
    "id": "243039088206221312",
    "result": [],
    "state": "SUBMITTED",
}
```
