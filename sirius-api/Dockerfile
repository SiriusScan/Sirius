# sirius-api Dockerfile

FROM golang:latest
WORKDIR /api

COPY .air.toml .air.toml

# Dependencies
RUN apt-get update

WORKDIR /api
#DEV Dependencies
RUN go install github.com/air-verse/air@latest


# Invoke air to run the server after volume mount
CMD ["air", "-c", ".air.toml"]

EXPOSE 9001