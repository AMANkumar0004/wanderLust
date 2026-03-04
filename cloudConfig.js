const cloudinary = require('cloudinary').v2;
const CloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});

<<<<<<< HEAD
const storage = CloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'wanderlust_DEV',
    allowedFormats: ['png','jpg','jpeg'],
  });


  module.exports={
=======
const storage = new CloudinaryStorage({
>>>>>>> upstream/main
    cloudinary,
    params: {
        folder: 'wanderlust_DEV',
        allowed_formats: ['png', 'jpg', 'jpeg'], // <-- FIXED
    },
});

module.exports = {
    cloudinary,
    storage,
};