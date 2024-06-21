<p align="center">
  <img src="docs/CQDGLogoFull.svg" alt="CQDG repository logo" width="660px" />
</p>

# Cavatica Manifest API

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
docker build -t cavatica-manifest-api .
```

Then

```
docker run -p 1313:1313 \
-e ENV=qa \
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
-e MANIFEST_BUCKET={MANIFEST_BUCKET} \
-it -d cavatica-manifest-api
```

Do not forget to fill env values

## API Documentation

### VWB endpoint

- GET `/status`

Returns

```
{
    "app": "cavatica-manifest-api",
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

- GET `/vwb/manifest`

Success: returns 200 with body 

```
{
    "importUrl":"https://cavatica.sbgenomics.com/import-redirect/drs/csv?URL=https%3A%2F%2Fkf-strides-vwb-cavatica-import-manifest-prd.s3.us-east-1.amazonaws.com%2FVWB_e6fa48a0-01c6-42c1-8aa1-4f6133275a36_1716494922878.csv%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Content-Sha256%3DUNSIGNED-PAYLOAD%26X-Amz-Credential%3DASIATMD7WGMCXO6DHWP7%252F20240523%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20240523T200844Z%26X-Amz-Expires%3D43200%26X-Amz-Security-Token%3DFwoGZXIvYXdzEBYaDIK32RZBv0QjF00p2SLdARve2trjNQ%252F1CpyDD8XdqLMR4s2HSMF2vU3JnmNEj3KuXVyFlEXuVTkcQykecktze%252BilJV5jzUZDIR50r2Gng82NWkahv2sW6sxnxXAjg%252FlYu852kRGU1cBc8Q5n%252F5MYZpLDaRKlsjhR5TycQjqdeD7huBkiLtvHpZqgTFVDWgSxY8%252BdS7vhkRndse7QsUXqe%252B2E33nGNqZnqplKCv8lDXpK8WmhKL84UjfOUogZIuLS%252FckW6lu2yC2DpikPzESQtT3S6cPa4eBpS3trxVuVZjoKC5%252Bx8iEc8gZ92UrdKLTEvrIGMjMxS%252FMNphGHA56gXEkvTSx1pVvxo9msOVGgxYWtDojtSCTAFzp62z9qBLukdTD1Zm9BbfU%253D%26X-Amz-Signature%3D8d90054ddfd017175624c11030003695ebf4b2c687812fb4c1868158acc139c3%26X-Amz-SignedHeaders%3Dhost%26x-id%3DGetObject"
}
```

## This is a WIP... 

[//]: # (Error - User is not connected to its fences: returns 400 with body )

[//]: # ()
[//]: # (```)

[//]: # ({)

[//]: # (    "error": "no_fence_connection" )

[//]: # (})

[//]: # (```)

[//]: # ()
[//]: # (Error - User has no ACL: returns 400 with body )

[//]: # ()
[//]: # (```)

[//]: # ({)

[//]: # (    "error": "no_acl" )

[//]: # (})

[//]: # (```)

[//]: # ()
[//]: # (Error - No parquet file match user's ACLs in FHIR: returns 400 with body )

[//]: # ()
[//]: # (```)

[//]: # ({)

[//]: # (    "error": "no_file_for_acls" )

[//]: # (})

[//]: # (```)