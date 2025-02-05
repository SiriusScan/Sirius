# sirius-ui Dockerfile

FROM oven/bun:latest
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json bun.lockb ./
COPY .env ./
COPY prisma ./prisma
RUN bun install

RUN bunx prisma generate

# Bundle app source
COPY . /app

# Set the environment variable to skip environment variable validation
ENV SKIP_ENV_VALIDATION=1

# Run the development server
CMD ["bun", "run", "dev"]

EXPOSE 3000
EXPOSE 3001