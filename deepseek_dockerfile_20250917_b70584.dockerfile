FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build --prefix client
RUN npm run build --prefix server

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server/dist/index.js"]