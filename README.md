# Earth Simulator

Real-time geospatial simulation and visualization framework.

## Platform Objective

Supports:
- 3D planetary globe and 2D high-performance GIS map views
- Real-time data ingestion from external APIs
- Large-scale datasets and multi-layer rendering
- Time-based simulation control (1x,10x,100x)
- GPU accelerated graphics via Three.js/CesiumJS and MapLibre/OpenLayers

## Core Architecture

Client Rendering Engine (3D/2D) -> Edge API Gateway -> Realtime Data Engine -> Service APIs (Weather/Flight/Satellite) -> Geospatial Processing -> PostGIS -> Tile & Vector Server

Major components:
- Rendering Engine
- Data Ingestion System
- Geospatial Database
- Simulation Engine
- Tile Generation Server
- Real-time Stream Service

## Project scaffold

- `src/server` - Node.js + Express API + WebSocket
- `src/ingest` - ingest workers + normalization + stream
- `src/db` - PostGIS models, migrations
- `src/client` - 3D/2D renderer stubs

## Goals

Concurrent users: 10,000+; objects rendered: 100,000+; update rate: 1-5s; frame rate: 60 FPS.

## Getting started

Install dependencies:

```bash
npm install
```

## Running with Docker

```bash
docker-compose up --build
```

## Local development

Copy `.env.example` to `.env` and set your keys:

```bash
cp .env.example .env
```

Seed the database (requires Postgres up):

```bash
npm run seed
```

Run API:

```bash
npm install
npm run dev
```

Open client in browser:

`http://localhost:4000`

## Secrets and API keys (public repo safe)

Do not commit API keys in code or `.env` directly. Use VS Code Secret Storage by installing an extension such as:

- "Settings Sync" (built-in)
- "MS Learn: Secret Storage" or custom VS Code extension approach

For local development, use `.env` + `.env.example` and keep `.env` in `.gitignore`.

```
OPENWEATHER_API_KEY=YOUR_KEY
```

You can also set environment variables in VS Code in `/.vscode/settings.json` for safe local runtime.

## Tests

```bash
npm test
```

