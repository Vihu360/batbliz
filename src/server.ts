
import express, { type Request, type Response } from "express";
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
const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

dotenv.config();

app.use(cookieParser());
app.use(express.json());


app.use(cors({
  origin: ["http://localhost:3000", "https://batbliz-admin.vercel.app", "http://localhost:3002"],
  credentials: true
}));


// Admin API routes
app.use("/admin/schema", adminRoutes);
app.use("/admin/crud", crudRoutes);
app.use("/admin/competition", competitionRoutes);
app.use("/admin/venue", venueRoutes);
app.use("/admin/common", commonRoutes);
app.use("/admin/match", matchRoutes);

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
  res.send("Hello World");
});

app.listen(PORT, '0.0.0.0', async () => {  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || 'dev'} mode on port ${PORT}`
  );
  console.log(`📡 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database: PostgreSQL (Docker)`);

  // Initialize database connection
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
});