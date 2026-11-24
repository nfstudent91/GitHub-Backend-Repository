import { Request, Response, NextFunction } from "express";

/**
 * Middleware to check if user has required role
 * @param allowedRoles - Array of role names that are allowed to access the route
 */
export const roleAuthMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated (should be set by authMiddleware)
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      // Get user's role from token
      const userRole = req.user.roleName;

      if (!userRole) {
        res.status(403).json({
          success: false,
          message: "Access denied. No role assigned.",
        });
        return;
      }

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(userRole)) {
        res.status(403).json({
          success: false,
          message: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error checking role authorization",
        error: error.message,
      });
    }
  };
};

// Shorthand middleware for admin-only routes
export const adminOnly = roleAuthMiddleware(["Admin"]);

// Shorthand middleware for manager and admin routes
export const managerOrAdmin = roleAuthMiddleware(["Admin", "Manager"]);

// Shorthand middleware for all authenticated users
export const authenticated = roleAuthMiddleware(["Admin", "Manager", "Advisor", "Telecaller", "Processing"]);

