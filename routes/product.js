const e = require('express');
const express = require('express');
const productRouter = express.Router();
const auth = require('../middlewares/auth.js');
const { Product } = require('../models/product');

//Get Product by Category
productRouter.get("/api/product/", auth, async (req, res) => {
    try {
        const products = await Product.find({ category: req.query.category });
        res.json(products);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});

//Get Product by Search
productRouter.get("/api/product/search/:name", auth, async (req, res) => {
    try {
        const products = await Product.find({ name: { $regex: req.params.name, $options: "i" } });
        res.json(products);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

//Rate the product
productRouter.post("/api/product/rate-product", auth, async (req, res) => {
    try {
        const { id, rating } = req.body;
        let product = await Product.findById(id);
        for (let i = 0; i < product.ratings.length; i++) {
            if (product.ratings[i].userId == req.user) {
                product.ratings.splice(i, 1);
                break;
            }
        }
        const ratingSchema = {
            userId: req.user,
            rating: rating,
        };
        product.ratings.push(ratingSchema);
        product = await product.save();
        res.json(product);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

productRouter.get("/api/deal", auth, async (req, res) => {
    try {
        let products = await Product.find({});
        let dealProduct;
        products.sort((a, b) => {
            let aSum = 0;
            let bSum = 0;
            for (let i = 0; i < a.ratings.length; i++) {
                aSum = aSum + a.ratings[i].rating;
            }
            for (let j = 0; j < b.ratings.length; j++) {
                bSum = bSum + b.ratings[i].rating;
            }
            return bSum - aSum;
        })
        dealProduct = products[0];
        res.json(dealProduct);
    }
    catch (e) {
        res.status(50).json({ error: e.message });
    }
})


module.exports = productRouter;