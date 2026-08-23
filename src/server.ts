
import express, { type Request, type Response } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import prisma from "../db/db.config.js";
import adminRoutes from "./routes/adminRoutes/admin.js";
import crudRoutes from "./routes/adminRoutes/crud.js";
import cors from "cors";
import competitionRoutes from "./routes/adminRoutes/competition/competition.route.js";
import venueRoutes from "./routes/adminRoutes/competition/venue.routes.js";
import commonRoutes from "./routes/adminRoutes/competition/common.routes.js";
import matchRoutes from "./routes/adminRoutes/competition/match.routes.js";
import ballEventRoutes from "./routes/adminRoutes/ballEvent.routes.js";
import authRoutes from "./routes/adminRoutes/auth.routes.js";
import { authenticate } from "./middleware/auth.js";
import { initializeSocket } from "./utils/socket.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// Initialize Socket.IO with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "https://admin.cricvot.com/", "https://admin.cricvot.com", "https://batbliz-admin.vercel.app", "http://localhost:3002"],
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Initialize socket handlers
initializeSocket(io);

app.use(cookieParser());
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:3000", "https://admin.cricvot.com", "https://batbliz-admin.vercel.app", "http://localhost:3002", "http://localhost:3002/"],
  credentials: true
}));

// Make io accessible in routes
app.set("io", io);


// Auth routes (no middleware required)
app.use("/admin/auth", authRoutes);

// Protected admin API routes (JWT required)
app.use("/admin/schema", authenticate, adminRoutes);
app.use("/admin/crud", authenticate, crudRoutes);
app.use("/admin/competition", authenticate, competitionRoutes);
app.use("/admin/venue", authenticate, venueRoutes);
app.use("/admin/common", authenticate, commonRoutes);
app.use("/admin/match", authenticate, matchRoutes);
app.use("/admin/ball-event", authenticate, ballEventRoutes);

// Health check endpoint
app.get("/health", async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("API is running at BatBliz API");
});

httpServer.listen(PORT, '0.0.0.0', async () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || 'dev'} mode on port ${PORT}`
  );
  console.log(`📡 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🔌 Socket.IO server initialized`);
  console.log(`🗄️  Database: PostgreSQL (Docker)`);

  // Initialize database connection
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
});