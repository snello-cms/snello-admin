### STAGE 1: GIT CLONE DEL PROGETTO DA COMPILARE E IMPACCHETTARE ###
FROM alpine/git  as gitter
WORKDIR /app
RUN git clone https://github.com/snello-cms/snello-admin.git

### STAGE 1: NPM INSTALL E GENERA IL COMPILATO ANGULAR ###
FROM node:10-alpine as builder
COPY --from=gitter /app/snello-admin/src ./ng-app/src
COPY --from=gitter /app/snello-admin/e2e ./ng-app/e2e
COPY --from=gitter /app/snello-admin/*.json ./ng-app/
WORKDIR /ng-app

RUN npm i && $(npm bin)/ng build --prod

### STAGE 2: CREO IMMAGINE DOCKER CON ELABORATO FINALE ###
FROM nginx:1.14.1-alpine
## Copy our default nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From ‘builder’ stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist/admin /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
