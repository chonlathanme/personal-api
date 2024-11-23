const express = require('express');
const userRoute = express.Router();
const userController = require('../controllers/user-controller')
const authenticate = require('../middlewares/authenticate')

userRoute.get('/users', userController.getUsers)
userRoute.post('/user/change-status', authenticate.userCheck, userController.changeStatus)
userRoute.post('/user/change-role/:id', authenticate.userCheck, userController.changeRole)

userRoute.post('/user/cart', authenticate.userCheck, userController.addToCart)
userRoute.get('/user/cart', authenticate.userCheck, userController.getCart)
userRoute.delete('/user/cart', authenticate.userCheck, userController.deleteCart)

userRoute.post('/user/address', authenticate.userCheck, userController.addAddress)

userRoute.post('/user/order', authenticate.userCheck, userController.saveOrders)
userRoute.get('/user/orders', authenticate.userCheck, userController.getOrders)

module.exports = userRoute