#!/usr/bin/env bash

docker build -t snellocms/snello-admin -f docs/Dockerfile-local .
docker tag snellocms/snello-admin snellocms/snello-admin:local
