FROM pytorch/pytorch:1.9.0-cuda10.2-cudnn7-runtime
RUN apt update && apt install curl git cmake ack g++ vim tmux -yq
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/qooba/vim-python-ide/master/setup.sh)"
RUN pip install demucs qdi fastapi uvicorn jinja2 aiofiles python-multipart
ENV PYTHONPATH="/app:${PYTHONPATH}"
WORKDIR /app
RUN pip3 install jupyterlab
#COPY ./app /app
#CMD ./start-reload.sh
