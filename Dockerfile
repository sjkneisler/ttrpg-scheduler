FROM node:18-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package.json ./
COPY yarn.lock ./

USER node

RUN yarn

COPY --chown=node:node . .

RUN ["yarn", "db:generate"]

EXPOSE 443

#CMD yarn db:migrate:prod; npx ts-node ./server_old/server.ts
CMD npx ts-node ./server_old/server.ts