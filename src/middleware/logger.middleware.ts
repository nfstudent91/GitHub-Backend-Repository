import { Request, Response, NextFunction } from "express";

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

// Helper function to get color for status code
const getStatusColor = (status: number): string => {
  if (status >= 200 && status < 300) return colors.green;
  if (status >= 300 && status < 400) return colors.cyan;
  if (status >= 400 && status < 500) return colors.yellow;
  if (status >= 500) return colors.red;
  return colors.white;
};

// Helper function to format timestamp
const getTimestamp = (): string => {
  return new Date().toISOString();
};

// Helper function to format method with color
const formatMethod = (method: string): string => {
  const methodColors: { [key: string]: string } = {
    GET: colors.cyan,
    POST: colors.green,
    PUT: colors.yellow,
    PATCH: colors.yellow,
    DELETE: colors.red,
  };
  const color = methodColors[method] || colors.white;
  return `${color}${method.padEnd(7)}${colors.reset}`;
};

// Helper function to mask sensitive data
const maskSensitiveData = (obj: any): any => {
  if (!obj || typeof obj !== "object") return obj;
  
  const sensitiveKeys = ["password", "token", "authorization", "auth"];
  const masked = { ...obj };
  
  for (const key in masked) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
      masked[key] = "***MASKED***";
    } else if (typeof masked[key] === "object" && masked[key] !== null) {
      masked[key] = maskSensitiveData(masked[key]);
    }
  }
  
  return masked;
};

// Request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const timestamp = getTimestamp();
  
  // Store start time for response logging
  (req as any).startTime = startTime;
  
  // Log request
  console.log(`\n${colors.dim}${"=".repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}📥 REQUEST${colors.reset} ${colors.dim}[${timestamp}]${colors.reset}`);
  console.log(`${colors.dim}${"-".repeat(80)}${colors.reset}`);
  console.log(`${formatMethod(req.method)} ${colors.bright}${req.originalUrl || req.url}${colors.reset}`);
  console.log(`${colors.dim}IP:${colors.reset} ${req.ip || req.socket.remoteAddress || "unknown"}`);
  
  // Log headers (excluding sensitive data)
  if (Object.keys(req.headers).length > 0) {
    const maskedHeaders = maskSensitiveData(req.headers);
    console.log(`${colors.dim}Headers:${colors.reset}`, JSON.stringify(maskedHeaders, null, 2));
  }
  
  // Log query parameters
   if (Object.keys(req.query).length > 0) {
    console.log(`${colors.dim}Query:${colors.reset}`, JSON.stringify(req.query, null, 2));
  }
  
  // Log body (excluding sensitive data)
  if (req.body && Object.keys(req.body).length > 0) {
    const maskedBody = maskSensitiveData(req.body);
    console.log(`${colors.dim}Body:${colors.reset}`, JSON.stringify(maskedBody, null, 2));
  }
  
  // Log params
  if (Object.keys(req.params).length > 0) {
    console.log(`${colors.dim}Params:${colors.reset}`, JSON.stringify(req.params, null, 2));
  }
  
  // Override res.json to capture response
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);
  
  // Store response body
  let responseBody: any = null;
  
  // Override json method
  res.json = function (body: any) {
    responseBody = body;
    return originalJson(body);
  };
  
  // Override send method
  res.send = function (body: any) {
    if (typeof body === "string") {
      try {
        responseBody = JSON.parse(body);
      } catch (e) {
        // If parsing fails, treat as plain string
        responseBody = body;
      }
    } else {
      responseBody = body;
    }
    return originalSend(body);
  };
  
  // Log response when finished
  res.on("finish", () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const statusColor = getStatusColor(res.statusCode);
    
    // Log response
    console.log(`\n${colors.dim}${"-".repeat(80)}${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta}📤 RESPONSE${colors.reset} ${colors.dim}[${getTimestamp()}]${colors.reset}`);
    console.log(`${colors.dim}${"-".repeat(80)}${colors.reset}`);
    console.log(`${formatMethod(req.method)} ${colors.bright}${req.originalUrl || req.url}${colors.reset}`);
    console.log(`${colors.dim}Status:${colors.reset} ${statusColor}${res.statusCode}${colors.reset} ${colors.dim}(${duration}ms)${colors.reset}`);
    
    // Log response body (truncated if too long)
    if (responseBody) {
      try {
        const bodyStr = JSON.stringify(responseBody, null, 2);
        if (bodyStr.length > 500) {
          console.log(`${colors.dim}Response:${colors.reset} ${bodyStr.substring(0, 500)}... ${colors.yellow}(truncated)${colors.reset}`);
        } else {
          console.log(`${colors.dim}Response:${colors.reset}`, bodyStr);
        }
      } catch (e) {
        console.log(`${colors.dim}Response:${colors.reset}`, responseBody);
      }
    }
    
    console.log(`${colors.dim}${"=".repeat(80)}${colors.reset}\n`);
  });
  
  next();
};

