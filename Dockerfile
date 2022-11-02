# use node:v18
FROM node:18-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn install --silent --cache /tmp/empty-cache && rm -rf /tmp/empty-cache
RUN yarn global add

COPY server lib ./

# start app
CMD ["yarn", "server:start"]
