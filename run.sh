#!/bin/bash

#CPU
#docker run --name aiaudioseparation -it -p 8000:8000 -v $(pwd)/checkpoints:/root/.cache/torch/hub/checkpoints --rm qooba/aimusicseparation

#GPU
docker run --name aiaudioseparation --gpus all -it -p 8000:8000 -v $(pwd)/checkpoints:/root/.cache/torch/hub/checkpoints --rm qooba/aimusicseparation
