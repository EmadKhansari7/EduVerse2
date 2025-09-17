FROM node:18-alpine

WORKDIR /app

# ابتدا package.jsonها را کپی می‌کنیم
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# نصب dependencies
RUN npm install
RUN npm install --prefix client
RUN npm install --prefix server

# کپی تمام فایل‌ها
COPY . .

# build کردن کلاینت و سرور
RUN npm run build --prefix client
RUN npm run build --prefix server

# پورت را expose کنید
EXPOSE 3000

# دستور اجرا
CMD ["node", "server/dist/index.js"]

