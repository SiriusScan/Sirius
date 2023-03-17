# syntax=docker/dockerfile:1
   
FROM node:18-alpine
WORKDIR /app

# The package files should use Docker cache system
# To ensure that dependencies are not overwritten by the local files (OS Compatibility)
COPY package*.json .
COPY yarn.lock .

RUN yarn add vite
RUN yarn install

# Bundle app source
COPY . /app
CMD ["yarn", "run", "dev"]

EXPOSE 5173