### STAGE 1: Build ###

# We label our stage as ‘builder’
FROM node:10-alpine as builder

RUN mkdir /ng-app
ADD src  ./ng-app/src
ADD e2e  ./ng-app/e2e
ADD *.json ./ng-app/
## Storing node modules on a separate layer will prevent unnecessary npm installs at each build
WORKDIR /ng-app

RUN npm i && $(npm bin)/ng build --prod
### STAGE 2: Setup ###

FROM nginx:1.14.1-alpine

## Copy our default nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## From ‘builder’ stage copy over the artifacts in dist folder to default nginx public folder
COPY --from=builder /ng-app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]