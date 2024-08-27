FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm install pm2 -g
CMD ["pm2-runtime", "ecosystem.config.js"]
