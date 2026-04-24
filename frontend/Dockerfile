FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# Copy static assets for standalone mode
RUN cp -r .next/static .next/standalone/.next/

EXPOSE 3000
CMD ["node", ".next/standalone/server.js"]
