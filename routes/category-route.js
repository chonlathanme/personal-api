const express = require('express');
const categoryRoute = express.Router();
const categoryController = require('../controllers/category-controller')
const authenticate = require('../middlewares/authenticate')

categoryRoute.post('/category/create', authenticate.userCheck, authenticate.adminCheck, categoryController.createCategory)
categoryRoute.get('/category/get-categories', categoryController.getCategories)
categoryRoute.delete('/category/delete/:id', authenticate.userCheck, authenticate.adminCheck, categoryController.deleteCategory)

module.exports = categoryRoute