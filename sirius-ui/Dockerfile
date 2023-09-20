FROM node:16-alpine3.17
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY .env ./
RUN npm install

# Bundle app source
COPY . /app

# Copy Prisma schema file
COPY prisma/schema.prisma ./prisma/schema.prisma
# Generate Prisma Client
RUN npx prisma generate

# Set the environment variable to skip environment variable validation
ENV SKIP_ENV_VALIDATION=1

# Run the development server
CMD ["npm", "run", "dev"]

EXPOSE 3000
EXPOSE 3001