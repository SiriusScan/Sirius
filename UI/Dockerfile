# syntax=docker/dockerfile:1
   
FROM node:18-alpine
WORKDIR /app
#COPY . .

# The package files should use Docker cache system
# To ensure that dependencies are not overwritten by the local files (OS Compatibility)
COPY package*.json .
COPY yarn.lock .

#RUN yarn install
RUN yarn add vite

RUN yarn install
CMD ["yarn", "run", "dev"]

EXPOSE 5173