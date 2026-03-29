const { auth } = require("../config/firebase");

/**
 * Authentication middleware - verifies Firebase ID token
 * Attaches decoded user info to req.user
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        error: "No token provided",
        code: "AUTH_TOKEN_MISSING" 
      });
    }

    const token = authHeader.split("Bearer ")[1];

    try {
      // Verify the Firebase ID token
      const decodedToken = await auth.verifyIdToken(token);
      
      // Attach user info to request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || "Sales Executive", // from custom claims
        showroomId: decodedToken.showroomId || null,
      };

      next();
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return res.status(401).json({ 
        error: "Invalid or expired token",
        code: "AUTH_TOKEN_INVALID" 
      });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ 
      error: "Authentication failed",
      code: "AUTH_ERROR" 
    });
  }
}

module.exports = authenticate;
