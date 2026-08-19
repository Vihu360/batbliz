import { type Request, type Response, type NextFunction } from "express";
import { verifyToken, type TokenPayload } from "../utils/auth.js";

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware: Requires valid JWT in Authorization header
 * Sets req.user with decoded token payload
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      error: "No authorization header provided",
    });
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    res.status(401).json({
      success: false,
      error: "Invalid authorization format. Use: Bearer <token>",
    });
    return;
  }

  const token = parts[1] as string;

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    const message =
      error instanceof Error && error.name === "TokenExpiredError"
        ? "Token expired"
        : "Invalid token";

    res.status(401).json({
      success: false,
      error: message,
    });
  }
}

/**
 * Middleware: Requires authenticated user with one of the specified roles
 * Must be used after authenticate()
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Requires one of these roles: ${roles.join(", ")}`,
      });
      return;
    }

    next();
  };
}
