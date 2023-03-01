# Go API Dockerfile

FROM golang:1.20-bullseye
WORKDIR /api
COPY . .
RUN go build -o ./tmp/sirius-api ./sirius-api.go
CMD ["./tmp/sirius-api"]
EXPOSE 8080