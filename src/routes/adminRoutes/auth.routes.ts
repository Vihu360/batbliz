import { Router, type Request, type Response } from "express";
import prisma from "../../../db/db.config.js";
import {
  comparePassword,
  generateTokens,
  verifyToken,
} from "../../utils/auth.js";
import { authenticate } from "../../middleware/auth.js";

const router = Router();

/**
 * POST /auth/login - Authenticate and return JWT tokens
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        error: "Account is deactivated",
      });
      return;
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        ...tokens,
      },
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({
      success: false,
      error: "Failed to login",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /auth/refresh - Exchange refresh token for new token pair
 */
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: "Refresh token is required",
      });
      return;
    }

    // Verify the refresh token
    const payload = verifyToken(refreshToken);

    // Check user still exists and is active
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        error: "User not found or deactivated",
      });
      return;
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      success: true,
      data: tokens,
      message: "Tokens refreshed successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TokenExpiredError"
        ? "Refresh token expired"
        : "Invalid refresh token";

    res.status(401).json({
      success: false,
      error: message,
    });
  }
});

/**
 * GET /auth/me - Get current authenticated user profile
 */
router.get("/me", authenticate, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user profile",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
