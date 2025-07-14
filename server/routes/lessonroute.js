const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const protect = require('../middleware/authmiddleware');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resource_type = 'auto';
    if (file.mimetype.startsWith('video/')) resource_type = 'video';
    if (file.mimetype === 'application/pdf') resource_type = 'raw';
    if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') resource_type = 'raw';
    return {
      folder: 'phish-defense/lessons/resources',
      resource_type,
      public_id: file.originalname.split('.')[0],
    };
  },
});



// Course thumbnail storage
const thumbnailStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'phish-defense/courses/thumbnails',
      resource_type: 'image',
      public_id: `thumbnail_${Date.now()}_${file.originalname.split('.')[0]}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 800, height: 450, crop: 'fill', quality: 'auto' }
      ]
    };
  },
});

const upload = multer({ storage });
const thumbnailUpload = multer({ storage: thumbnailStorage });

// Test endpoint to verify Cloudinary connection
router.get('/test-cloudinary', async (req, res) => {
  try {
    console.log('🧪 Testing Cloudinary connection...');
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary ping result:', result);
    res.json({ 
      success: true, 
      message: 'Cloudinary connection successful',
      result 
    });
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Cloudinary connection failed',
      error: error.message 
    });
  }
});

// ✅ Upload lesson file to cloudinary
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      console.error('❌ Upload failed - no file received');
      return res.status(400).json({ message: 'Upload failed - no file received' });
    }

    console.log('✅ Uploaded file:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: req.file.path
    });

    res.json({
      url: req.file.path,
      type: req.file.mimetype,
      filename: req.file.originalname
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      message: 'Upload failed', 
      error: error.message 
    });
  }
});



// ✅ Upload course thumbnail to cloudinary
router.post('/thumbnail-upload', thumbnailUpload.single('file'), (req, res) => {
  try {
    console.log('📤 Starting thumbnail upload...');
    console.log('📁 Request file:', req.file);
    console.log('📁 Request body:', req.body);
    
    if (!req.file || !req.file.path) {
      console.error('❌ Thumbnail upload failed - no file received');
      return res.status(400).json({ message: 'Thumbnail upload failed - no file received' });
    }

    console.log('✅ Uploaded thumbnail:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: req.file.path,
      public_id: req.file.filename
    });

    res.json({
      url: req.file.path,
      type: req.file.mimetype,
      filename: req.file.originalname,
      public_id: req.file.filename
    });
  } catch (error) {
    console.error('❌ Thumbnail upload error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Thumbnail upload failed', 
      error: error.message,
      details: error.stack
    });
  }
});

// ✅ Save lesson in database
router.post('/addlesson', lessonController.addLesson);

// ✅ Update a lesson
router.patch('/:lessonId', lessonController.updateLesson);
// ✅ Delete a lesson
router.delete('/:lessonId', lessonController.deleteLesson);
// ✅ Delete a resource from a lesson
router.delete('/resource/:lessonId/:resourceIndex', lessonController.deleteResourceFromLesson);

// ✅ Get lessons by courseId (optional auth - returns free lessons for non-authenticated users)
router.get('/:courseId', lessonController.getLessonsByCourse);

// --- Resource Endpoints ---
// Upload a resource file to Cloudinary
router.post('/resource/upload', upload.single('file'), lessonController.uploadResource);
// Add a resource to a lesson
router.post('/resource/:lessonId', lessonController.addResourceToLesson);
// Get resources for a lesson (protected)
router.get('/resource/:lessonId', protect, lessonController.getResourcesForLesson);

module.exports = router;
