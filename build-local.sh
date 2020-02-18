#!/usr/bin/env bash


ng build --prod --base-href /snello-admin --deploy-url /snello-admin/

docker build --no-cache -t snellocms/snello-admin -f Dockerfile-local .
ID="$(docker images | grep 'snellocms/snello-admin' | head -n 1 | awk '{print $3}')"

docker tag snellocms/snello-admin snellocms/snello-admin:1.0.0.RC6
docker tag snellocms/snello-admin snellocms/snello-admin:latest
docker push snellocms/snello-admin:latest
docker push snellocms/snello-admin:1.0.0.RC6
