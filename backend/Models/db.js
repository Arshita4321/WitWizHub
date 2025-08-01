const mongoose = require('mongoose');

const mongo_url = process.env.MONGO_URL;

mongoose.connect("mongodb+srv://arshitathakur1316:Arsh!1026@cluster0.girxs8t.mongodb.net/witwizhub?retryWrites=true&w=majority&appName=Cluster0")
.then(() => {
    console.log('MongoDB Connected');
}).catch((err) => {
    console.log('MongoDB Connected Error', err);
})