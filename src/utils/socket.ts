import { Server, Socket } from "socket.io";

let io: Server;

export const initializeSocket = (socketServer: Server) => {
  io = socketServer;

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join match-specific rooms
    socket.on("join-match", (matchId: string) => {
      socket.join(`match-${matchId}`);
      console.log(`👤 Socket ${socket.id} joined match-${matchId}`);
      socket.emit("joined-match", { matchId });
    });

    // Leave match-specific rooms
    socket.on("leave-match", (matchId: string) => {
      socket.leave(`match-${matchId}`);
      console.log(`👤 Socket ${socket.id} left match-${matchId}`);
      socket.emit("left-match", { matchId });
    });

    // Join innings-specific rooms
    socket.on("join-innings", (inningsId: string) => {
      socket.join(`innings-${inningsId}`);
      console.log(`👤 Socket ${socket.id} joined innings-${inningsId}`);
      socket.emit("joined-innings", { inningsId });
    });

    // Leave innings-specific rooms
    socket.on("leave-innings", (inningsId: string) => {
      socket.leave(`innings-${inningsId}`);
      console.log(`👤 Socket ${socket.id} left innings-${inningsId}`);
      socket.emit("left-innings", { inningsId });
    });

    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

// Helper functions to emit events
export const emitBallEvent = (matchId: number, inningsId: number, data: any) => {
  if (io) {
    // Emit to match-specific room
    io.to(`match-${matchId}`).emit("ball-event", data);
    // Emit to innings-specific room
    io.to(`innings-${inningsId}`).emit("ball-event", data);
    console.log(`📡 Ball event emitted to match-${matchId} and innings-${inningsId}`);
  }
};

export const emitInningsUpdate = (matchId: number, inningsId: number, data: any) => {
  if (io) {
    io.to(`match-${matchId}`).emit("innings-update", data);
    io.to(`innings-${inningsId}`).emit("innings-update", data);
    console.log(`📡 Innings update emitted to match-${matchId} and innings-${inningsId}`);
  }
};

export const emitMatchUpdate = (matchId: number, data: any) => {
  if (io) {
    io.to(`match-${matchId}`).emit("match-update", data);
    console.log(`📡 Match update emitted to match-${matchId}`);
  }
};

export const emitWicketEvent = (matchId: number, inningsId: number, data: any) => {
  if (io) {
    io.to(`match-${matchId}`).emit("wicket", data);
    io.to(`innings-${inningsId}`).emit("wicket", data);
    console.log(`📡 Wicket event emitted to match-${matchId} and innings-${inningsId}`);
  }
};

export const emitBoundaryEvent = (matchId: number, inningsId: number, data: any) => {
  if (io) {
    io.to(`match-${matchId}`).emit("boundary", data);
    io.to(`innings-${inningsId}`).emit("boundary", data);
    console.log(`📡 Boundary event emitted to match-${matchId} and innings-${inningsId}`);
  }
};

