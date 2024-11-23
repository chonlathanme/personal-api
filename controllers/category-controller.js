const prisma = require("../models");
const tryCatch = require("../utils/try-catch");
const createError = require("../utils/create-error");

module.exports.createCategory = (tryCatch(async (req, res) => {
    const { name } = req.body
    const category = await prisma.category.create({
        data: {
            name
        }
    })
    res.send(category)
}))

module.exports.getCategories = (tryCatch(async (req, res) => {
    const categories = await prisma.category.findMany()
    res.send(categories)
}))

module.exports.deleteCategory = (tryCatch(async (req, res) => {
    const { id } = req.params
    const category = await prisma.category.delete({
        where: {
            id: Number(id)
        }
    })
    res.send(category)
}))