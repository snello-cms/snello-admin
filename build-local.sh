#!/usr/bin/env bash


ng build --configuration production --base-href / --deploy-url /

docker build --no-cache -t snellocms/snello-admin -f Dockerfile-local .
ID="$(docker images | grep 'snellocms/snello-admin' | head -n 1 | awk '{print $3}')"

docker tag snellocms/snello-admin snellocms/snello-admin:3.0.0
docker tag snellocms/snello-admin snellocms/snello-admin:latest
docker push snellocms/snello-admin:latest
docker push snellocms/snello-admin:3.0.0
