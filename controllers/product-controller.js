const prisma = require("../models");
const createError = require("../utils/create-error");
const tryCatch = require("../utils/try-catch");
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.createProduct = tryCatch(async (req, res) => {
    const { title, description, price, quantity, categoryId, images } = req.body;

    // Validate images
    if (!Array.isArray(images)) {
        return res.status(400).json({ error: "Images must be an array" });
    }

    const product = await prisma.product.create({
        data: {
            title,
            description,
            price: parseFloat(price),
            quantity: parseInt(quantity),
            categoryId: parseInt(categoryId),
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

    res.send(product);
});

exports.getProducts = (tryCatch(async (req, res) => {
    const { count } = req.params
    const products = await prisma.product.findMany({
        take: parseInt(count),
        orderBy: {
            createdAt: "desc"
        },
        include: {
            images: true,
            category: true
        }
    })
    res.send(products)
}))

exports.deleteProduct = (tryCatch(async (req, res) => {
    const { id } = req.params
    const product = await prisma.product.findFirst({
        where: {
            id: Number(id)
        },
        include: {
            images: true
        }
    })
    if (!product) {
        createError("Product not found", 404)
    }
    const deletedImages = product.images.map((image) => {
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
    await prisma.product.delete({
        where: {
            id: Number(id)
        }
    })
    res.send("Product deleted successfully")
}))

exports.productBy = (tryCatch(async (req, res) => {
    const { sort, order, limit } = req.body
    const products = await prisma.product.findMany({
        take: parseInt(limit),
        orderBy: {
            [sort]: order
        },
        include: {
            category: true,
        }
    })
    res.send(products)
}))

const handleQuery = async (req, res, query) => {
    const products = await prisma.product.findMany({
        where: {
            title: {
                contains: query
            }
        },
        include: {
            category: true,
            images: true
        }
    })
    res.send(products)
}

const handlePrice = async (req, res, priceRange) => {
    const products = await prisma.product.findMany({
        where: {
            price: {
                gte: priceRange[0],
                lte: priceRange[1]
            }
        },
        include: {
            category: true,
            images: true
        }
    })
    res.send(products)
}

const handleCategory = async (req, res, categoryId) => {
    const products = await prisma.product.findMany({
        where: {
            categoryId: {
                in: categoryId.map((id) => Number(id))
            }
        },
        include: {
            category: true,
            images: true
        }
    })
    res.send(products)
}

exports.filterProducts = (tryCatch(async (req, res) => {
    const { query, category, price } = req.query
    if (query) {
        await handleQuery(req, res, query)
    }
    if (category) {
        await handleCategory(req, res, category)
    }
    if (price) {
        await handlePrice(req, res, price)
    }
}))

exports.updateProduct = (tryCatch(async (req, res) => {
    const { title, description, price, quantity, categoryId, images } = req.body
    const { id } = req.params
    await prisma.image.deleteMany({
        where: {
            productId: Number(id)
        }
    })
    const product = await prisma.product.update({
        where: {
            id: Number(id)
        },
        data: {
            title: title,
            description: description,
            price: parseFloat(price),
            quantity: parseInt(quantity),
            categoryId: parseInt(categoryId),
            images: {
                create: images.map((image) => ({
                    asset_id: image.asset_id,
                    public_id: image.public_id,
                    url: image.url,
                    secure_url: image.secure_url
                }))
            }
        }
    })
    res.send(product)
}))

exports.createImage = (tryCatch(async (req, res) => {
    const result = await cloudinary.uploader.upload(req.body.image, {
        public_id: `${Date.now()}`,
        resource_type: "auto",
        folder: 'personal'
    })
    console.log(JSON.stringify(result, null, 2));
    res.send(result)
}))

exports.deleteImage = (tryCatch(async (req, res) => {
    const { public_id } = req.body
    await cloudinary.uploader.destroy(public_id, (result) => {
        res.send("Image deleted successfully")
    })
}))