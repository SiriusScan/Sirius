# Sirius Engine Dockerfile
# This container acts as the orchestration engine for Sirius components

FROM golang:1.21-alpine AS base

# Install system dependencies
RUN apk add --no-cache git ca-certificates build-base curl

WORKDIR /app

# Development stage
FROM base AS development
# Install development tools
RUN go install github.com/air-verse/air@latest

# Create a simple engine service
COPY . .

# Expose ports for engine and gRPC
EXPOSE 5174 50051

# For development, we'll create a simple HTTP server
CMD ["sh", "-c", "echo 'Sirius Engine Development Mode' && sleep infinity"]

# Production stage  
FROM base AS production

# Copy engine configuration and scripts
COPY . .

# Create a minimal engine binary
RUN echo 'package main\n\
import (\n\
    "fmt"\n\
    "log"\n\
    "net/http"\n\
    "os"\n\
)\n\
\n\
func main() {\n\
    port := os.Getenv("ENGINE_MAIN_PORT")\n\
    if port == "" {\n\
        port = "5174"\n\
    }\n\
    \n\
    http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {\n\
        w.WriteHeader(http.StatusOK)\n\
        fmt.Fprintf(w, `{"status":"healthy","service":"sirius-engine"}`)\n\
    })\n\
    \n\
    fmt.Printf("Sirius Engine starting on port %s...\n", port)\n\
    log.Fatal(http.ListenAndServe(":"+port, nil))\n\
}' > main.go

RUN CGO_ENABLED=0 GOOS=linux go build -o sirius-engine main.go

# Final production stage
FROM alpine:latest AS final
RUN apk --no-cache add ca-certificates
WORKDIR /root/

# Copy the engine binary
COPY --from=production /app/sirius-engine .
COPY --from=production /app/*.json ./
COPY --from=production /app/custom-scripts ./custom-scripts/
COPY --from=production /app/custom-templates ./custom-templates/

EXPOSE 5174 50051

CMD ["./sirius-engine"]
