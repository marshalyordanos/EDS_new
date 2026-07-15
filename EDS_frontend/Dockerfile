FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
# --legacy-peer-deps: react-simple-maps@3.0.0's peerDependencies cap at React 18,
# but the app uses React 19; the package works fine at runtime regardless.
RUN npm ci --legacy-peer-deps

COPY . .

# Baked into the Vite bundle at build time. Leave empty to call the API
# same-origin via nginx (recommended with this Dockerfile/nginx.conf).
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
