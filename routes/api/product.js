const express = require('express');
const router = express.Router();
const config = require('config')
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Product = require('../../models/Product');
const User = require('../../models/User');
const path = require("path");



const filePath = config.get('FILE_UPLOAD_PATH')
const maxSize = config.get('MAX_FILE_UPLOAD')


// @route POST /api/product
// @desc Add a product
// @access Private

router.post('/', [auth, [
  check('title', 'Title is required.').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    res.status(400).json({errors: errors.array()});
    console.log("titile is required")
  }
  try {
    const user = await User.findById(req.user.id).select('-password');

    const newProduct = Product({
      title: req.body.title,
      uid: user.id,
      name: user.name,
      avatar: user.avatar,
      phone: user.phone,
      user: req.user.id,
      description: req.body.description,
      quantity: req.body.quantity,
      time: req.body.time,
      location: req.body.location
    });

    const product = await newProduct.save();
    res.status(201).json({success: true, data: product }); //, statusCode: 201
    console.log("/api/product PASS")

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error.")
  }
})

// @route GET /api/product/photo
// @desc Get a photo
// @access private

router.get('/', auth, async(req, res) => {
  const products = await Product.find({});

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  })
})

// @route GET /api/product/:id
// @desc Get a specific product
// @access private

router.get('/:id', auth, async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.status(200).json({
    success: true,
    data: product,
  });
});

// @route POST /api/product/:id/photo
// @desc Add a photo
// @access private

router.put('/:id/photo', auth, async (req, res) => {
  const product = await Product.findById(req.params.id);
  console.log(product);

  if (!product){
    console.log("Product not found")
    return res.status(404).send(`No product found with ${req.params.id}`) ;
    }
  
  
  if (!req.files) {
    console.log("Please upload a file")
    return res.status(400).send(`Please upload a file`);
  }

  const file = req.files.file;

  // Make sure the image is a photo and accept any extension of an image
    // if (!file.mimetype.startsWith("image")) {
    //   return next(new ErrorResponse(`Please upload an image`, 400));
    // }
  
    // Check file size
    if (file.size > maxSize) {
      return res.status(400).send("Please upload an image of less size.")

      // return next(
      //   new ErrorResponse(
      //     `Please upload an image less than ${maxSize}`,
      //     400
      //   )
      // );
    }
  
    file.name = `photo_${product.id}${path.parse(file.name).ext}`;
  
    file.mv(`${filePath}/${file.name}`, async (err) => {
      if (err) {
        console.err(err);
        return res.status(500).send("Problem with file upload")
        // return next(new ErrorResponse(`Problem with file upload`, 500));
      }
  
      //insert the filename into database
      await Product.findByIdAndUpdate(req.params.id, {
        photo: file.name,
      });
    });
  
    res.status(200).json({
      success: true,
      data: file.name,
    });
    console.log("Pic upload success")

})

// @route DELETE /api/product/:id
// @desc Delete Product
// @access Private

router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (req.user.id !== product.user.toString()) {
      return res.status(401).json({ msg: 'User not authorized.', success:false});
    }

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    await product.remove();

    return res.send(`Product removed. \n ${product}`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;