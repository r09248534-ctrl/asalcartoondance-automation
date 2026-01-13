# renderer/Dockerfile
FROM node:18-bullseye

# تثبيت ffmpeg و ImageMagick
RUN apt-get update && apt-get install -y ffmpeg imagemagick && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
