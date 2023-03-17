# Go API Dockerfile

FROM golang:1.20-bullseye
WORKDIR /api
#COPY . .

COPY .air.toml .air.toml

# Dependencies
RUN apt-get update

WORKDIR /api
#DEV Dependencies
RUN go install github.com/cosmtrek/air@latest

# Invoke air to run the server after volume mount
ENTRYPOINT [ "air" ]  

EXPOSE 8080