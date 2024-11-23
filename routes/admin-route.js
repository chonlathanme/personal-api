const express = require('express');
const adminRoute = express.Router();
const adminController = require('../controllers/admin-controller')
const authenticate = require('../middlewares/authenticate')

adminRoute.patch('/admin/order-status', authenticate.userCheck, authenticate.adminCheck, adminController.updateOrderStatus)
adminRoute.get('/admin/get-orders', authenticate.userCheck, authenticate.adminCheck, adminController.getOrders)

module.exports = adminRoute