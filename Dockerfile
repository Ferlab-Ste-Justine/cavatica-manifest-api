# First image to compile typescript to javascript
FROM node:22.1.0-alpine3.19 AS build-image
WORKDIR /app
COPY . .

RUN npm ci
RUN npm run clean
RUN npm run build

# Second image, that creates an image for production
FROM node:22.1.0-alpine3.19 AS prod-image
WORKDIR /app
COPY --from=build-image ./app/dist ./dist
COPY package* ./
RUN apk update && apk upgrade --no-cache libcrypto3 libssl3 && npm ci --production
ENV NODE_ENV=production
CMD [ "node", "./dist/src/index.js" ]
