FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN npm install -g nodemon

COPY . .

EXPOSE 8080

# CMD ["nodemon", "--legacy-watch", "server.js"]
CMD [ "npm" ,"run","server" ]
