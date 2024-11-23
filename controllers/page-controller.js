const prisma = require("../models");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.getPromotions = (tryCatch(async (req, res) => {
    const promotion = await prisma.promotion.findMany()
    res.send(promotion)
}))

exports.createPromotion = tryCatch(async (req, res) => {
    const { details, images } = req.body;

    // Validate images
    if (!Array.isArray(images)) {
        return res.status(400).json({ error: "Images must be an array" });
    }

    const promotion = await prisma.promotion.create({
        data: {
            details,
            images: {
                create: images.map((image) => ({
                    asset_id: image.asset_id,
                    public_id: image.public_id,
                    url: image.url,
                    secure_url: image.secure_url
                }))
            }
        }
    });

    res.send(promotion);
});

exports.deletePromotion = (tryCatch(async (req, res) => {
    const { id } = req.params
    const promotion = await prisma.promotion.findFirst({
        where: {
            id: Number(id)
        },
        include: {
            images: true
        }
    })
    if (!promotion) {
        createError("Promotion not found", 404)
    }
    const deletedImages = promotion.images.map((image) => {
        new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(image.public_id, (error, result) => {
                if (error) {
                    reject(error)
                }
                resolve(result)
            })
        })
    })
    await Promise.all(deletedImages)
    await prisma.promotion.delete({
        where: {
            id: Number(id)
        }
    })
    res.send("Promotion deleted successfully")
}))

exports.getNews = (tryCatch(async (req, res) => {
    const news = await prisma.news.findMany()
    res.send(news)
}))

exports.createNews = tryCatch(async (req, res) => {
    const { details, images } = req.body;

    // Validate images
    if (!Array.isArray(images)) {
        return res.status(400).json({ error: "Images must be an array" });
    }

    const news = await prisma.news.create({
        data: {
            details,
            images: {
                create: images.map((image) => ({
                    asset_id: image.asset_id,
                    public_id: image.public_id,
                    url: image.url,
                    secure_url: image.secure_url
                }))
            }
        }
    });

    res.send(news);
});

exports.deleteNews = (tryCatch(async (req, res) => {
    const { id } = req.params
    const news = await prisma.news.findFirst({
        where: {
            id: Number(id)
        },
        include: {
            images: true
        }
    })
    if (!news) {
        createError("News not found", 404)
    }
    const deletedImages = news.images.map((image) => {
        new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(image.public_id, (error, result) => {
                if (error) {
                    reject(error)
                }
                resolve(result)
            })
        })
    })
    await Promise.all(deletedImages)
    await prisma.news.delete({
        where: {
            id: Number(id)
        }
    })
    res.send("News deleted successfully")
}))