#!/bin/bash
cp -r ../src/app app
docker build -t qooba/aimusicseparation:dev -f Dockerfile.dev .
docker build -t qooba/aimusicseparation .
rm -r app
