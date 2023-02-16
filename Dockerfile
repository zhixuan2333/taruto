# use node:v18
FROM node:18-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn install --frozen-lockfile && yarn cache clean
RUN yarn global add

COPY tsconfig.json tsconfig.server.json ./
COPY . .

# Specify the environment variable for the port
ARG PORT

# start app
CMD ["yarn", "server"]
