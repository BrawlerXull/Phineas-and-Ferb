const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).json({ error: "Token not found" });
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded payload (e.g., { id, email }) to the request
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = auth;
