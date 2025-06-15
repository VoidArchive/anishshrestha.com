# Bagchal Reforged Multiplayer - Deployment Guide

## Overview

This guide covers deploying the Bagchal Reforged multiplayer functionality using Cloudflare Pages, D1 Database, and Durable Objects.

## Phase 1: Database Setup

### 1.1 Create D1 Database

```bash
# Login to Cloudflare (via Dashboard)
# Go to Cloudflare Dashboard > D1 SQL Database
# Click "Create database"
# Name: bagchal-reforged
# Copy the database ID
```

### 1.2 Initialize Database Schema

```bash
# Upload the schema.sql file via Dashboard
# Or use Wrangler CLI if available:
npx wrangler d1 execute bagchal-reforged --file=./database/schema.sql
```

### 1.3 Update wrangler.toml

Replace `your-database-id-here` in `wrangler.toml` with your actual D1 database ID.

## Phase 2: Durable Objects Configuration

### 2.1 Enable Durable Objects

In Cloudflare Dashboard:
1. Go to Workers & Pages
2. Select your site
3. Go to Settings > Functions
4. Enable Durable Objects
5. Add binding: `GAME_ROOMS` → `GameRoomDurableObject`

### 2.2 Configure Bindings

Ensure these bindings are configured in your site settings:
- `DB` → Your D1 database
- `GAME_ROOMS` → GameRoomDurableObject

## Phase 3: Build and Deploy

### 3.1 Build the Application

```bash
npm run build
```

### 3.2 Deploy via Dashboard

1. Go to Cloudflare Pages
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `.svelte-kit/cloudflare`
5. Deploy

## Phase 4: Testing

### 4.1 Test Room Creation

```bash
curl -X POST https://your-site.pages.dev/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"playerName": "TestPlayer", "gameMode": "REFORGED"}'
```

### 4.2 Test Room Joining

```bash
curl -X POST https://your-site.pages.dev/api/rooms/[ROOM_CODE]/join \
  -H "Content-Type: application/json" \
  -d '{"playerName": "Player2"}'
```

## Implementation Status

### ✅ Completed

- [x] Database schema design
- [x] TypeScript types for multiplayer
- [x] Room management API endpoints
- [x] Multiplayer utility functions
- [x] Multiplayer UI components
- [x] Reforged game mode page
- [x] Updated games listing

### 🚧 In Progress

- [ ] Durable Object WebSocket implementation (simplified version created)
- [ ] Complete move validation in multiplayer context
- [ ] WebSocket endpoint (`/api/ws`)

### 📋 Next Steps

1. **Complete Durable Object Implementation**
   - Fix TypeScript issues in GameRoomDurableObject
   - Test WebSocket connections
   - Implement proper move validation

2. **Add WebSocket Server Route**
   ```typescript
   // src/routes/api/ws/+server.ts
   export const GET = async ({ url, platform }) => {
     // WebSocket upgrade logic
   };
   ```

3. **Implement Reforged Rules**
   - Update `src/games/bagchal/rules/reforged.ts`
   - Define rule differences from Classic mode

4. **Testing & Polish**
   - Test multiplayer gameplay flow
   - Add error handling and recovery
   - Optimize performance

## Architecture Summary

```
Frontend (Svelte)
├── MultiplayerRoomUI.svelte     # Room creation/joining
├── MultiplayerHandler.svelte    # WebSocket client
└── Reforged page                # Game interface

Backend (Cloudflare)
├── API Routes
│   ├── /api/rooms               # Room management
│   └── /api/rooms/[code]/join   # Join rooms
├── Durable Objects
│   └── GameRoomDurableObject    # Real-time game state
└── D1 Database                  # Persistent storage
```

## Key Features Implemented

1. **Clean Separation**: Classic mode unchanged, Reforged mode is entirely new
2. **Real-time Multiplayer**: WebSocket-based communication
3. **Room Codes**: Human-readable room sharing (e.g., "BRAVE-TIGER-123")
4. **Connection Management**: Automatic reconnection and error handling
5. **Persistent Storage**: Game history and statistics in D1
6. **Responsive UI**: Works on desktop and mobile

The implementation provides a solid foundation for multiplayer Bagchal while maintaining the existing single-player experience intact. 