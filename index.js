//IMPORT FROM PACKAGES
const express = require('express');
const mongoose = require('mongoose');
const db = "mongodb+srv://phuongtai03:Thanhtu03@cluster0.l84qf4d.mongodb.net/?retryWrites=true&w=majority";

//IMPORT FROM FILES
const authRouter = require("./routes/auth.js");
const adminRouter = require("./routes/admin.js");
const productRouter = require("./routes/product.js");
const userRouter = require("./routes/user");

//INIT
const PORT = process.env.PORT || 3000;
const app = express();

//middleware
app.use(express.json());
app.use(authRouter);
app.use(adminRouter);
app.use(productRouter);
app.use(userRouter);

//Connections
mongoose.connect(db).then(() => {
    console.log("Connection successful");
}).catch((e) => { console.log(e); });

app.listen(PORT, function () {
    console.log(`Connect at port ${PORT}`);
});

