FROM node:18-alpine AS builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./

RUN npm run build

FROM node:18-alpine

WORKDIR /app

RUN npm install -g http-server

COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["http-server", "build", "-p", "3000", "--cors"]
