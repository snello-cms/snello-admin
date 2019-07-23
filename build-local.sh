#!/usr/bin/env bash

ng build --prod
docker build --no-cache -t snellocms/snello-admin -f Dockerfile-local .
docker tag snellocms/snello-admin snellocms/snello-admin:local
