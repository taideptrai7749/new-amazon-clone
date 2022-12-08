const express = require('express');
const adminRouter = express.Router();
const admin = require('../middlewares/admin.js');
const { Product } = require('../models/product.js');
const Order = require('../models/order.js');
//Add Product
adminRouter.post('/admin/addProduct', admin, async (req, res) => {
    try {
        const { name, description, quantity, images, category, price } = req.body;
        let product = new Product({
            name,
            description,
            quantity,
            images,
            category,
            price,
        });
        product = await product.save();
        res.json(product);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

//Get All Product
adminRouter.get("/admin/getProduct", admin, async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

//Delete the product
adminRouter.post("/admin/deleteProduct", admin, async (req, res) => {
    try {
        const { id } = req.body;
        let product = await Product.findByIdAndDelete(id);
        res.json(product);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

//Get all orders data
adminRouter.get("/admin/get-orders", admin, async (req, res) => {
    try {
        const orders = await Order.find({});
        res.json(orders);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

//Update order status
adminRouter.post("/admin/update-order-status", admin, async (req, res) => {
    try {
        const { id } = req.body;
        let order = await Order.findById(id);
        if (order.status >= 3) {
            return res.status(400).json({ msg: 'Order status has already been completed' });
        }
        order.status += 1;
        order = await order.save();
        res.json(order);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

adminRouter.get("/admin/analytics", admin, async (req, res) => {
    try {
        const orders = await Order.find({});
        let totalEarning = 0;
        for (let i = 0; i < orders.length; i++) {
            for (let j = 0; j < orders[i].products.length; j++) {
                totalEarning += orders[i].products[j].product.price * orders[i].products[j].quantity;
            }
        }
        let mobileEarning = await getCategoryProduct("Mobile");
        let bookEarning = await getCategoryProduct("Book");
        let electronicsEarning = await getCategoryProduct("Electronics");
        let fashionEarning = await getCategoryProduct("Fashion");
        let appliancesEarning = await getCategoryProduct("Appliances");
        let essentialsEarning = await getCategoryProduct("Essentials");
        let earnings = {
            totalEarning,
            mobileEarning,
            bookEarning,
            electronicsEarning,
            fashionEarning,
            appliancesEarning,
            essentialsEarning,
        };
        res.json(earnings);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

async function getCategoryProduct(category) {
    let categoryOrders = await Order.find({
        'products.product.category': category,
    });

    let earning = 0;
    for (let i = 0; i < categoryOrders.length; i++) {
        for (let j = 0; j < categoryOrders[i].products.length; j++) {
            earning += categoryOrders[i].products[j].product.price * categoryOrders[i].products[j].quantity;
        }
    }
    return earning;
}

module.exports = adminRouter;