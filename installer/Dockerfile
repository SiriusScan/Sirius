FROM golang:1.24-alpine AS builder
WORKDIR /src

COPY installer/go.mod ./go.mod
COPY installer/cmd ./cmd
COPY installer/internal ./internal

RUN go build -o /out/sirius-installer ./cmd/sirius-installer

FROM alpine:3.20
WORKDIR /workspace
COPY --from=builder /out/sirius-installer /usr/local/bin/sirius-installer

ENTRYPOINT ["sirius-installer"]
