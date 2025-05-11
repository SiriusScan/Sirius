# sirius-api Dockerfile

FROM golang:latest
WORKDIR /api

# Build arguments for go-api commit SHA
ARG GO_API_COMMIT_SHA=main

COPY .air.toml .air.toml

# Dependencies
RUN apt-get update

# Set up go-api (if needed for builds)
WORKDIR /
RUN git clone https://github.com/SiriusScan/go-api.git && \
    cd /go-api && \
    git checkout ${GO_API_COMMIT_SHA}

WORKDIR /api
#DEV Dependencies
RUN go install github.com/air-verse/air@latest

# Invoke air to run the server after volume mount
CMD ["air", "-c", ".air.toml"]

EXPOSE 9001