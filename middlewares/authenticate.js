const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch");
const jwt = require("jsonwebtoken");
const prisma = require("../models");

module.exports.userCheck = tryCatch(async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return next(createError(401, "Unauthorized"));
  }

  const token = authorization.split(" ")[1];
  console.log("Received Token:", token); // Log received token

  if (!token) {
    return next(createError(401, "Authentication token is required"));
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      console.error("JWT Error:", err); // Log the JWT error
      return next(createError(403, "Invalid token"));
    }

    const foundUser = await prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!foundUser) {
      return next(createError(401, "Unauthorized"));
    }

    const { password, createdAt, updatedAt, ...user } = foundUser;
    req.user = user;
    next();
  });
});


module.exports.adminCheck = async (req, res, next) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ message: 'Unauthorized: No user information' });
    }

    const { email } = req.user;
    const adminUser = await prisma.user.findFirst({
      where: { email: email }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access Denied: Admin Only' });
    }

    next();
  } catch (err) {
    console.error(err); // Use a logging library in production
    res.status(500).json({ message: 'Error Admin access denied' });
  }
}
