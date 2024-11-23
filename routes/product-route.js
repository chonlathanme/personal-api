const express = require('express');
const productRoute = express.Router();
const productController = require('../controllers/product-controller')
const authenticate = require('../middlewares/authenticate')

productRoute.post('/product/create', authenticate.userCheck, authenticate.adminCheck, productController.createProduct)
productRoute.get('/product/get-products/:count', productController.getProducts)
productRoute.delete('/product/delete/:id', authenticate.userCheck, authenticate.adminCheck, productController.deleteProduct)
productRoute.post('/product/product-by', productController.productBy)
productRoute.post('/product/filter-products', productController.filterProducts)
productRoute.patch('/product/product-update/:id', authenticate.userCheck, authenticate.adminCheck, productController.updateProduct)

productRoute.post('/product/image-upload', authenticate.userCheck, authenticate.adminCheck, productController.createImage)
productRoute.post('/product/image-delete', authenticate.userCheck, authenticate.adminCheck, productController.deleteImage)

module.exports = productRoute