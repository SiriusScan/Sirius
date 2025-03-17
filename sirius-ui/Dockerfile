# sirius-ui Dockerfile

FROM oven/bun:latest
WORKDIR /app

# Container Setup
# RUN echo "alias npm='bun'" >> /root/.bashrc

# RUN apt-get update && apt-get install -y \
#     npm

# Copy package files and install dependencies
COPY package*.json bun.lockb ./
COPY .env ./
COPY prisma ./prisma
RUN bun install

# RUN bunx prisma generate
# RUN bunx prisma db push
# RUN bunx prisma db seed

# Bundle app source
COPY . /app

WORKDIR /app
RUN bun install
RUN bun install sonner

# Set the environment variable to skip environment variable validation
ENV SKIP_ENV_VALIDATION=1

# Run the development server
CMD ["bun", "run", "dev"]

EXPOSE 3000
EXPOSE 3001