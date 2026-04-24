const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for member profile photos
const memberStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'titan-fit/members',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Configure storage for trainer profile photos
const trainerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'titan-fit/trainers',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Create multer upload instances
const uploadMemberPhoto = multer({ storage: memberStorage });
const uploadTrainerPhoto = multer({ storage: trainerStorage });

module.exports = {
  cloudinary,
  uploadMemberPhoto,
  uploadTrainerPhoto
};