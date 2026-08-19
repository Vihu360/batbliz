# Socket.IO Real-Time Cricket Scoring API

## Overview

This document describes the Socket.IO implementation for real-time cricket match scoring in the BatBliz API. The system enables live updates for ball-by-ball commentary, scoring, wickets, boundaries, and match statistics.

## Architecture

### Components

1. **Server Setup** (`src/server.ts`)
   - HTTP server with Express
   - Socket.IO server integrated with CORS support
   - Shared between REST API and WebSocket connections

2. **Socket Utility** (`src/utils/socket.ts`)
   - Socket.IO initialization and connection management
   - Room-based broadcasting (match and innings rooms)
   - Helper functions for emitting events

3. **Ball Event Controller** (`src/controllers/admin/ballEvent.controller.ts`)
   - CRUD operations for ball events
   - Prisma transactions for data consistency
   - Real-time event emission via Socket.IO

4. **Ball Event Routes** (`src/routes/adminRoutes/ballEvent.routes.ts`)
   - RESTful API endpoints for ball event management

## Features

### Real-Time Events

The system emits the following real-time events:

#### 1. Ball Events (`ball-event`)
Triggered when any ball event is created, updated, or deleted.

```javascript
{
  type: "ball-created" | "ball-updated" | "ball-deleted",
  ballEvent: {
    id: number,
    matchId: number,
    inningsId: number,
    overNumber: number,
    ballInOver: number,
    batsmanId: number,
    bowlerId: number,
    runsBatsman: number,
    runsExtras: number,
    extraType: string | null,
    wicket: boolean,
    wicketType: string | null,
    // ... other fields
  },
  timestamp: string (ISO 8601)
}
```

#### 2. Wicket Events (`wicket`)
Special event triggered when a wicket falls.

```javascript
{
  type: "wicket",
  ballEvent: { /* ball event data */ },
  innings: { /* updated innings data */ },
  timestamp: string
}
```

#### 3. Boundary Events (`boundary`)
Special event triggered for fours and sixes.

```javascript
{
  type: "boundary",
  runs: 4 | 6,
  ballEvent: { /* ball event data */ },
  innings: { /* updated innings data */ },
  timestamp: string
}
```

#### 4. Innings Updates (`innings-update`)
Triggered when innings statistics change.

```javascript
{
  type: "innings-updated",
  innings: {
    id: number,
    inningNumber: number,
    runs: number,
    wickets: number,
    overs: Decimal,
    extras: number,
    // ... other fields
  },
  timestamp: string
}
```

#### 5. Match Updates (`match-update`)
Triggered for match-level changes.

```javascript
{
  type: "match-updated",
  match: { /* match data */ },
  timestamp: string
}
```

### Room-Based Broadcasting

The system uses Socket.IO rooms for efficient event distribution:

- **Match Rooms** (`match-{matchId}`): Receive all events for a specific match
- **Innings Rooms** (`innings-{inningsId}`): Receive events for a specific innings

## Client Integration

### Connecting to the Server

```javascript
const socket = io('http://localhost:3000', {
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

### Joining Rooms

```javascript
// Join a match room
socket.emit('join-match', '1');

socket.on('joined-match', (data) => {
  console.log('Joined match:', data.matchId);
});

// Join an innings room
socket.emit('join-innings', '1');

socket.on('joined-innings', (data) => {
  console.log('Joined innings:', data.inningsId);
});
```

### Listening for Events

```javascript
// Ball events
socket.on('ball-event', (data) => {
  console.log('Ball event:', data);
  // Update UI with ball-by-ball data
});

// Wickets
socket.on('wicket', (data) => {
  console.log('WICKET!', data);
  // Show wicket animation/notification
});

// Boundaries
socket.on('boundary', (data) => {
  console.log(`${data.runs === 4 ? 'FOUR' : 'SIX'}!`, data);
  // Show boundary animation/notification
});

// Innings updates
socket.on('innings-update', (data) => {
  console.log('Innings update:', data);
  // Update scorecard
});

// Match updates
socket.on('match-update', (data) => {
  console.log('Match update:', data);
  // Update match status
});
```

### Leaving Rooms

```javascript
// Leave a match room
socket.emit('leave-match', '1');

// Leave an innings room
socket.emit('leave-innings', '1');
```

## API Endpoints

### Ball Event Endpoints

All endpoints are prefixed with `/admin/ball-event`

#### 1. Get All Ball Events
```http
GET /admin/ball-event
```

Query parameters:
- `page` (number): Page number for pagination
- `limit` (number): Items per page
- `search` (string): Search in commentary text
- `matchId` (number): Filter by match ID
- `inningsId` (number): Filter by innings ID
- `batsmanId` (number): Filter by batsman ID
- `bowlerId` (number): Filter by bowler ID
- `wicket` (boolean): Filter by wicket events

#### 2. Get Ball Event by ID
```http
GET /admin/ball-event/:id
```

#### 3. Get Ball Events by Match
```http
GET /admin/ball-event/match/:matchId
```

#### 4. Get Ball Events by Innings
```http
GET /admin/ball-event/innings/:inningsId
```

#### 5. Create Ball Event (Real-time)
```http
POST /admin/ball-event
```

Request body:
```json
{
  "matchId": 1,
  "inningsId": 1,
  "overNumber": 0,
  "ballInOver": 1,
  "batsmanId": 1,
  "bowlerId": 2,
  "nonStrikerId": 3,
  "runsBatsman": 4,
  "runsExtras": 0,
  "extraType": null,
  "wicket": false,
  "wicketType": null,
  "dismissedPlayerId": null,
  "fielderId": null,
  "commentaryText": "Short ball, pulled for FOUR!",
  "ballTimestamp": "2024-11-28T10:30:00Z",
  "metadata": {}
}
```

**Features:**
- Uses Prisma transaction for data consistency
- Automatically updates innings statistics
- Emits real-time events to subscribed clients
- Triggers special events for wickets and boundaries

#### 6. Update Ball Event (Real-time)
```http
PUT /admin/ball-event/:id
```

Request body: (all fields optional)
```json
{
  "runsBatsman": 6,
  "commentaryText": "Massive six over long-on!",
  "metadata": {}
}
```

**Features:**
- Recalculates innings statistics
- Emits update events

#### 7. Delete Ball Event (Real-time)
```http
DELETE /admin/ball-event/:id
```

**Features:**
- Uses transaction to update innings statistics
- Emits deletion event

## Transaction Management

All ball event operations that modify data use Prisma transactions to ensure:

1. **Data Consistency**: Ball events and innings stats are always in sync
2. **Atomicity**: Operations either complete fully or roll back
3. **Isolation**: Concurrent requests don't interfere with each other

### Example Transaction Flow

When creating a ball event:

```typescript
await prisma.$transaction(async (tx) => {
  // 1. Create ball event
  const ballEvent = await tx.ballEvent.create({ ... });
  
  // 2. Update innings statistics
  const updatedInnings = await tx.inning.update({
    where: { id: inningsId },
    data: {
      runs: { increment: totalRuns },
      wickets: { increment: wicket ? 1 : 0 },
      overs: { increment: oversIncrement },
      extras: { increment: runsExtras }
    }
  });
  
  return { ballEvent, updatedInnings };
});

// 3. Emit real-time events (after transaction commits)
emitBallEvent(matchId, inningsId, data);
```

## Testing

### Using the Example Client

1. Open `examples/socket-client-example.html` in a web browser
2. Enter your server URL (default: http://localhost:3000)
3. Click "Connect"
4. Enter a match ID and click "Join Match"
5. Enter an innings ID and click "Join Innings"
6. Use the REST API to create ball events and watch them appear in real-time

### Manual Testing with curl

Create a ball event:
```bash
curl -X POST http://localhost:3000/admin/ball-event \
  -H "Content-Type: application/json" \
  -d '{
    "matchId": 1,
    "inningsId": 1,
    "overNumber": 0,
    "ballInOver": 1,
    "batsmanId": 1,
    "bowlerId": 2,
    "nonStrikerId": 3,
    "runsBatsman": 4,
    "runsExtras": 0,
    "wicket": false
  }'
```

## Performance Considerations

1. **Room-based Broadcasting**: Only clients subscribed to specific matches/innings receive updates
2. **Efficient Queries**: Prisma queries include only necessary relations
3. **Connection Management**: Socket.IO handles reconnection and fallback transports
4. **Transaction Isolation**: Database transactions prevent race conditions

## CORS Configuration

The server is configured to accept connections from:
- http://localhost:3000
- http://localhost:3002
- https://batbliz-admin.vercel.app

To add more origins, update the CORS configuration in `src/server.ts`:

```typescript
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "your-new-origin"],
    credentials: true,
    methods: ["GET", "POST"]
  }
});
```

## Error Handling

The API includes comprehensive error handling:

1. **Validation Errors** (400): Missing or invalid required fields
2. **Not Found Errors** (404): Resource doesn't exist
3. **Server Errors** (500): Database or system errors

All errors return a consistent format:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

## Future Enhancements

Potential improvements:

1. **Authentication**: Add JWT-based authentication for Socket.IO connections
2. **Redis Adapter**: Scale across multiple servers using Redis
3. **Rate Limiting**: Prevent abuse of real-time connections
4. **Compression**: Enable Socket.IO message compression
5. **Metrics**: Add monitoring for connection count, event frequency
6. **Replay**: Store and replay match events for highlights

## Dependencies

- `socket.io`: ^4.8.1 - WebSocket server
- `@prisma/client`: ^6.17.1 - Database ORM
- `express`: ^5.1.0 - HTTP server framework

## Support

For issues or questions, please refer to:
- Socket.IO Documentation: https://socket.io/docs/
- Prisma Documentation: https://www.prisma.io/docs/
- Express Documentation: https://expressjs.com/

