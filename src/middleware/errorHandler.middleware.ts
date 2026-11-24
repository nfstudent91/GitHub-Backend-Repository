import { Request, Response, NextFunction } from "express";

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Helper function to format timestamp
const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Helper function to format method with color
const formatMethod = (method: string): string => {
  const methodColors: { [key: string]: string } = {
    GET: colors.cyan,
    POST: colors.cyan,
    PUT: colors.cyan,
    PATCH: colors.cyan,
    DELETE: colors.cyan,
  };
  const color = methodColors[method] || colors.cyan;
  return `${color}${method.padEnd(7)}${colors.reset}`;
};

// Global error handler middleware
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const timestamp = getTimestamp();
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";
  const stack = process.env.NODE_ENV === "development" ? err.stack : undefined;

  // Log error to terminal
  console.log(`\n${colors.dim}${"=".repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}${colors.red}❌ ERROR${colors.reset} ${colors.dim}[${timestamp}]${colors.reset}`);
  console.log(`${colors.dim}${"-".repeat(80)}${colors.reset}`);
  console.log(`${formatMethod(req.method)} ${colors.bright}${req.originalUrl || req.url}${colors.reset}`);
  console.log(`${colors.dim}Status:${colors.reset} ${colors.red}${statusCode}${colors.reset}`);
  console.log(`${colors.dim}Error Message:${colors.reset} ${colors.yellow}${message}${colors.reset}`);
  
  if (stack) {
    console.log(`${colors.dim}Stack Trace:${colors.reset}`);
    console.log(`${colors.red}${stack}${colors.reset}`);
  }
  
  // Log request details
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`${colors.dim}Request Body:${colors.reset}`, JSON.stringify(req.body, null, 2));
  }
  
  if (Object.keys(req.query).length > 0) {
    console.log(`${colors.dim}Query Params:${colors.reset}`, JSON.stringify(req.query, null, 2));
  }
  
  if (Object.keys(req.params).length > 0) {
    console.log(`${colors.dim}Route Params:${colors.reset}`, JSON.stringify(req.params, null, 2));
  }
  
  console.log(`${colors.dim}${"=".repeat(80)}${colors.reset}\n`);

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: stack }),
    ...(process.env.NODE_ENV === "development" && { error: err }),
  });
};

// Async error wrapper to catch errors in async route handlers
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

