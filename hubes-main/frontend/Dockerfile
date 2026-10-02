FROM node:24-alpine as build

WORKDIR /app/frontend

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:24-alpine

WORKDIR /app/frontend

RUN npm install -g serve && apk add --no-cache curl

COPY --from=build /app/frontend/dist ./dist
COPY server.js ./server.js
COPY package.json ./package.json

RUN npm install express http-proxy-middleware

EXPOSE 3001

CMD ["node", "server.js"]
