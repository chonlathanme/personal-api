const express = require('express');
const pageRoute = express.Router();
const pageController = require('../controllers/page-controller')
const authenticate = require('../middlewares/authenticate')

pageRoute.get('/page/promotions', pageController.getPromotions)
pageRoute.post('/page/create-promotion', authenticate.userCheck, authenticate.adminCheck, pageController.createPromotion)
pageRoute.delete('/page/delete-promotion/:id', authenticate.userCheck, authenticate.adminCheck, pageController.deletePromotion)

pageRoute.get('/page/news', pageController.getNews)
pageRoute.post('/page/create-news', authenticate.userCheck, authenticate.adminCheck, pageController.createNews)
pageRoute.delete('/page/delete-news/:id', authenticate.userCheck, authenticate.adminCheck, pageController.deleteNews)

module.exports = pageRoute