const express = require('express');
const authRoute = express.Router();
const authController = require('../controllers/auth-controller')
const authenticate = require('../middlewares/authenticate')

authRoute.post('/user/register', authController.register)
authRoute.post('/user/login', authController.login)
authRoute.post('/user/current-user', authenticate.userCheck, authController.currentUser)
authRoute.post('/user/current-admin', authenticate.userCheck, authenticate.adminCheck, authController.currentUser)



module.exports = authRoute