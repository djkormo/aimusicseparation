#!/bin/bash

docker run --name aiaudioseparation --gpus all -it -p 8000:8000 -p 8888:8888 --rm -v $(pwd)/src/app:/app  qooba/aimusicseparation:dev
#docker run --name aiscissors -it -p 8000:8000 --rm -v $(pwd)/src/app:/app -v $(pwd)/u2net_models:/root/.u2net  qooba/aiscissors ./start-reload.sh
