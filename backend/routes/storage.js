const express = require('express');
const multer = require('multer');
const { supabase } = require('../config/supabase');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Configure multer to handle files in memory (we'll upload to Supabase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
    }
  }
});

/**
 * Upload images to Supabase Storage
 * POST /api/storage/upload
 */
router.post('/upload', adminAuth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const uploadedUrls = [];

    for (const file of req.files) {
      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1E9);
      const ext = file.originalname.split('.').pop().toLowerCase();
      const fileName = `businesses/business-${timestamp}-${random}.${ext}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('business-images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        return res.status(500).json({
          success: false,
          message: `Failed to upload ${file.originalname}: ${error.message}`,
        });
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('business-images')
        .getPublicUrl(fileName);

      uploadedUrls.push(publicUrl);
    }

    res.json({
      success: true,
      urls: uploadedUrls,
      message: `Successfully uploaded ${uploadedUrls.length} image(s)`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message,
    });
  }
});

/**
 * Delete image from Supabase Storage
 * DELETE /api/storage/delete
 */
router.delete('/delete', adminAuth, async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Image URL is required',
      });
    }

    // Extract file path from URL
    const urlParts = url.split('/business-images/');
    if (urlParts.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image URL format',
      });
    }

    const fileName = urlParts[1];
    const filePath = `businesses/${fileName}`;

    // Delete from Supabase Storage
    const { error } = await supabase.storage
      .from('business-images')
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete image',
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting file',
      error: error.message,
    });
  }
});

module.exports = router;

