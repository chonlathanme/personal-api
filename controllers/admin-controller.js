const prisma = require("../models");
const tryCatch = require("../utils/try-catch");

exports.updateOrderStatus = (tryCatch(async (req, res) => {
    console.log(req.body);
    const { id, orderStatus } = req.body;

    if (!id || !orderStatus) {
        return res.status(400).json({ error: "Missing id or orderStatus" });
    }

    const orderExists = await prisma.order.findUnique({
        where: { id: id },
    });
    
    if (!orderExists) {
        return res.status(404).json({ error: "Order not found" });
    }

    const orderUpdate = await prisma.order.update({
        where: { id: id },
        data: { orderStatus: orderStatus },
    });
    
    res.json(orderUpdate);
}));

exports.getOrders = (tryCatch(async (req, res) => {
    const orders = await prisma.order.findMany({
        include: {
            products: {
                include: {
                    product: true
                }
            },
            orderBy: {
                select: {
                    id: true,
                    firstName: true,
                    email: true,
                    mobile: true,
                    address: true
                }
            }
        }
    })
    res.json(orders)
}))