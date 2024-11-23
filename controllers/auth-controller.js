const prisma = require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch");
const { Role } = require("@prisma/client");


function checkEmailOrMobile(identity) {
  let identityKey = "";

  if (/^1[3456789]\d{9}$/.test(identity)) {
    identityKey = "mobile";
  }
  if (/^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,})$/.test(identity)) {
    identityKey = "email";
  }
  if (!identityKey) {
    throw createError(400, "Please enter a valid email or mobile phone number");
  }
  
  return identityKey;
}


module.exports.register = tryCatch(async (req, res) => {
  const { identity, firstName, lastName, password, confirmPassword } = req.body;

  if (!(identity.trim() && firstName.trim() && lastName.trim() && password.trim() && confirmPassword.trim())) {
    throw createError(400, "Please enter all fields");
  }

  if (password !== confirmPassword) {
    throw createError(400, "Passwords do not match");
  }
  const identityKey = checkEmailOrMobile(identity);
  const existingUser = await prisma.user.findUnique({
    where: {
      [identityKey]: identity,
    },
  });

  if (existingUser) {
    throw createError(409, `This ${identityKey} is already registered`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    [identityKey]: identity,
    firstName,
    lastName,
    password: hashedPassword,
  };
  const result = await prisma.user.create({ data: newUser });
  
  res.json({ message: "Registration successful", result });
});

module.exports.login = tryCatch(async (req, res) => {
  const { identity, password } = req.body;

  if (!identity.trim() || !password.trim()) {
    throw createError(400, "Please fill all data");
  }

  const identityKey = checkEmailOrMobile(identity);
  const foundUser = await prisma.user.findUnique({
    where: {
      [identityKey]: identity,
    },
  });

  if (!foundUser) {
    throw createError(404, "User not found");
  }

  const passwordMatches = await bcrypt.compare(password, foundUser.password);
  if (!passwordMatches) {
    throw createError(401, "Incorrect password");
  }
  const token = jwt.sign({ id: foundUser.id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  const { password: pw, createdAt, updatedAt, ...userData } = foundUser;
  
  res.json({ user: userData, token });
});


exports.currentUser = async (req, res) => {
  try {
      //code
      const user = await prisma.user.findFirst({
          where: { email: req.user.email },
          select: {
              id: true,
              email: true,
              firstName: true,
              mobile: true,
              role: true
          }
      })
      res.json({ user })
  } catch (err) {
      //err
      console.log(err)
      res.status(500).json({ message: 'Server Error' })
  }
}

