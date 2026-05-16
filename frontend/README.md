# Scraper Frontend

A React-based frontend for the Structured Data Extraction Engine.

## Development

```bash
npm install
npm start
```

The app will open at http://localhost:3000

## Build

```bash
npm run build
```

## Docker

Build the Docker image:

```bash
docker build -f docker/frontend/Dockerfile -t scraper-frontend .
```

Run the container:

```bash
docker run -p 3000:3000 scraper-frontend
```
