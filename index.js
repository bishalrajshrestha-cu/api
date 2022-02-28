const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const fileupload = require("express-fileupload");
const path = require("path");

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connecting Database
connectDB();

app.get('/', (req, res) => {
  res.send('Hello World.');
});

//File upload
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Defing route
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/product', require('./routes/api/product'));

const PORT = process.env.PORT | 5000;

app.listen(PORT, console.log(`Successfully connected to ${PORT}`));
