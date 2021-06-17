FROM node:slim

RUN apt-get update && \
  apt-get install -y \
  chromium \
  libatk-bridge2.0-0 \
  libxkbcommon0 \
  libwayland-client0 \
  libgtk-3-0 && \
  rm -rf /var/lib/apt/lists/*

COPY package.json .

RUN npm install
RUN rm -rf node_modules/sharp
RUN rm -rf node_modules/whatsapp-web.js/sharp

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
