const prisma = require("../models");
const tryCatch = require("../utils/try-catch");

exports.getUsers = (tryCatch(async (req, res) => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            mobile: true,
            role: true,
            enabled: true
        }
    })
    res.json(users)
}))

exports.changeStatus = (tryCatch(async (req, res) => {
    const { id, enabled } = req.body
    const user = await prisma.user.update({
        where: {
            id: Number(id)
        },
        data: {
            enabled: enabled
        }
    })
    res.send("User status updated successfully")
}))

exports.changeRole = (tryCatch(async (req, res) => {
    const { id } = req.params
    const { role } = req.body
    const user = await prisma.user.update({
        where: {
            id: Number(id)
        },
        data: {
            role: role
        }
    })
    res.send("User role updated successfully")
}))

exports.addToCart = (tryCatch(async (req, res) => {
    const { id, cart } = req.body; // User ID
    const user = await prisma.user.findFirst({
        where: {
            id: Number(id)
        }
    });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const existingCart = await prisma.cart.findFirst({
        where: {
            orderBy: {
                id: user.id
            }
        }
    });

    if (existingCart) {
        await prisma.productOnCart.deleteMany({
            where: {
                cartId: existingCart.id
            }
        });

        await prisma.cart.delete({
            where: {
                id: existingCart.id
            }
        });
    }

    // Validate product existence
    const products = await Promise.all(cart.map(async (el) => {
        const product = await prisma.product.findUnique({
            where: { id: el.id }
        });
        if (product) {
            return {
                productId: product.id,
                count: el.count,
                price: product.price, // Assuming the price is in the Product table
            };
        }
        return null; // Return null if the product doesn't exist
    }));

    // Filter out any null products
    const validProducts = products.filter(p => p !== null);

    if (validProducts.length === 0) {
        return res.status(400).json({ error: "No valid products found" });
    }

    const cartTotal = validProducts.reduce((sum, el) => 
        sum + el.price * el.count, 0
    );

    const newCart = await prisma.cart.create({
        data: {
            products: {
                create: validProducts
            },
            cartTotal: cartTotal,
            orderBy: {
                connect: { id: user.id }
            },
        }
    });

    // Include the valid products in the response
    res.json({
        message: "Cart created successfully",
        cart: newCart,
        products: validProducts
    });
}));

exports.getCart = (tryCatch(async (req, res) => {
    const userId = Number(req.user.id);

    const cart = await prisma.cart.findFirst({
        where: {
            userId: userId
        },
        include: {
            products: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
    }

    res.json({ products: cart.products, cartTotal: cart.cartTotal });
}));


exports.deleteCart = (tryCatch(async (req, res) => {
    const userId = Number(req.user.id);

    const cart = await prisma.cart.findFirst({
        where: {
            userId: userId
        }
    });

    if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
    }

    await prisma.productOnCart.deleteMany({
        where: {
            cartId: cart.id
        }
    });

    const result = await prisma.cart.delete({
        where: {
            id: cart.id
        }
    });

    res.json({
        message: "Cart deleted successfully",
        deleted: result.id
    });
}));


exports.addAddress = (tryCatch(async (req, res) => {
    const { address } = req.body;

    // Check if address is provided
    if (!address) {
        return res.status(400).json({ error: "Address is required" });
    }

    // Create a new address associated with the user
    const addressUser = await prisma.address.create({
        data: {
            address: address,
            user: {
                connect: { id: Number(req.user.id) } // Connect the address to the user
            }
        }
    });

    res.json({
        message: "Address added successfully",
        address: addressUser
    });
}));

exports.saveOrders = (tryCatch(async (req, res) => {
    const userCart = await prisma.cart.findFirst({
        where: {
            userId: Number(req.user.id)
        },
        include: {
            products: true
        }
    });

    if (!userCart || userCart.products.length === 0) {
        return res.status(404).json({ error: "Cart is empty" });
    }

    // Check product availability
    for (const product of userCart.products) {
        const foundProduct = await prisma.product.findUnique({
            where: {
                id: product.productId
            },
            select: { quantity: true, title: true }
        });
        if (!foundProduct || product.count > foundProduct.quantity) {
            return res.status(404).json({ error: "Product out of stock" });
        }
    }

    // Create the order
    const order = await prisma.order.create({
        data: {
            products: {
                create: userCart.products.map((el) => ({
                    productId: el.productId,
                    count: el.count,
                    price: el.price
                }))
            },
            orderBy: {
                connect: {
                    id: Number(req.user.id)
                }
            },
            cartTotal: userCart.cartTotal
        }
    });

    // Update product quantities
    const update = userCart.products.map((el) => ({
        where: {
            id: el.productId
        },
        data: {
            quantity: {
                decrement: el.count
            },
            sold: {
                increment: el.count
            }
        }
    }));

    await Promise.all(
        update.map((el) => prisma.product.update(el))
    );

    // Delete products associated with the cart
    await prisma.productOnCart.deleteMany({
        where: {
            cartId: userCart.id // Ensure we delete products linked to this cart
        }
    });

    // Finally, delete the cart
    await prisma.cart.delete({
        where: {
            id: userCart.id // Delete by cart ID
        }
    });

    res.json(order);
}));




exports.getOrders = (tryCatch(async (req, res) => {
    const orders = await prisma.order.findMany({
        where: {
            userId: Number(req.user.id)
        },
        include: {
            products: {
                include: {
                    product: true
                }
            }
        }
    })
    if (orders.length === 0) {
        createError("No order found", 404)
    }
    res.json(orders)
}))