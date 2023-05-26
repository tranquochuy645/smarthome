const jwt = require('jsonwebtoken');
require('dotenv').config();

const secretKey = process.env.JWT_KEY;

// Middleware for authenticating and authorizing requests
module.exports = (req, res, next) => {
    // console.log(req.headers.authorization);
  
  const type=req.headers.authorization.split(' ')[0];
  if(type!="Bearer"){
    return res.status(401).json({ error: 'Invalid type' });
  }
  const token = req.headers.authorization.split(' ')[1];
  // console.log(token);
  if (!token) {
    // No token provided
    // console.log("token missing");
    return res.status(401).json({ error: 'Access denied, token missing' });
  };

  jwt.verify(token, secretKey, (err, decoded) => {
    // console.log("verifying");

    if (err) {
        console.log(err);
      // Invalid token
      return res.status(401).json({ error: 'Access denied, invalid token' });
    }

    // Update the req object with the decoded userId
    req.headers.databaseId = decoded.databaseId;

    // Call next() to proceed to the next middleware or route handler
    next();
  });
};

