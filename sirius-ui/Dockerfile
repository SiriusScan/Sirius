# sirius-ui Dockerfile

FROM oven/bun:latest
WORKDIR /app

# Container Setup
# Install OpenSSL 1.1.x for Prisma
RUN apt-get update && \
    apt-get install -y ca-certificates curl gnupg && \
    echo "deb http://security.debian.org/debian-security bullseye-security main" > /etc/apt/sources.list.d/bullseye-security.list && \
    apt-get update && \
    apt-get install -y libssl1.1

# RUN echo "alias npm='bun'" >> /root/.bashrc

# Copy package files and install dependencies
COPY package*.json bun.lockb ./
COPY prisma ./prisma
RUN bun install

# Generate Prisma client (will be done at runtime)
# Note: Prisma commands moved to startup script

# Bundle app source
COPY . /app

WORKDIR /app
RUN bun install
RUN bun install sonner

# Copy startup script and make it executable
COPY startup.sh /app/startup.sh
RUN chmod +x /app/startup.sh

# Set the environment variable to skip environment variable validation
ENV SKIP_ENV_VALIDATION=1

# Run the startup script
CMD ["/app/startup.sh"]

EXPOSE 3000
EXPOSE 3001