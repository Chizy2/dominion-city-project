const express = require('express');
const multer = require('multer');
const { moderatorAuth } = require('../middleware/auth');
const pool = require('../config/database');
const { supabase } = require('../config/supabase');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Helper function to handle database errors
function handleDbError(error, res, defaultMessage) {
  console.error(defaultMessage, error);
  
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      message: 'Database unavailable. Please check your Supabase project status or database connection.',
      error: 'Database connection failed'
    });
  }
  
  res.status(500).json({
    success: false,
    message: defaultMessage,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}

// Configure multer for file uploads
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

// Helper function to upload files to Supabase Storage
async function uploadToSupabase(files, maxRetries = 3) {
  if (!files || files.length === 0) return [];

  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'business-images');
    
    if (!bucketExists) {
      console.warn('⚠️  Supabase Storage bucket "business-images" does not exist.');
      return [];
    }
  } catch (checkError) {
    console.warn('⚠️  Error checking Supabase Storage bucket:', checkError.message);
    return [];
  }

  const uploadedUrls = [];
  
  for (const file of files) {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1E9);
        const originalName = file.originalname || file.name || 'image';
        const ext = originalName.split('.').pop().toLowerCase() || 'jpg';
        const fileName = `businesses/business-${timestamp}-${random}.${ext}`;
        const fileBuffer = file.buffer || (file instanceof Buffer ? file : null);
        
        if (!fileBuffer) {
          throw new Error(`File buffer not available for ${originalName}`);
        }

        const uploadPromise = supabase.storage
          .from('business-images')
          .upload(fileName, fileBuffer, {
            contentType: file.mimetype || 'image/jpeg',
            upsert: false,
          });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
        );

        const { data, error } = await Promise.race([uploadPromise, timeoutPromise]);

        if (error) {
          if (retries < maxRetries - 1) {
            retries++;
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
            continue;
          }
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('business-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
        break;
      } catch (error) {
        if (retries < maxRetries - 1) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          continue;
        }
        console.error('Error uploading file:', error);
        break;
      }
    }
  }

  return uploadedUrls;
}

// Apply moderator auth middleware to all routes
router.use(moderatorAuth);

// Get all businesses (moderator view - can see pending)
router.get('/businesses', async (req, res) => {
  try {
    const { search, category, city, status, approved, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM businesses WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (category) {
      query += ` AND category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (city) {
      query += ` AND city = $${paramCount}`;
      params.push(city);
      paramCount++;
    }

    if (status !== undefined && status !== '') {
      query += ` AND is_active = $${paramCount}`;
      params.push(status === 'true' || status === true);
      paramCount++;
    }

    // Moderators can filter by approval status
    if (approved !== undefined && approved !== '') {
      query += ` AND approved = $${paramCount}`;
      params.push(approved === 'true' || approved === true);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    const countResult = await pool.query('SELECT COUNT(*) FROM businesses');
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      total: totalCount,
      count: result.rows.length,
    });
  } catch (error) {
    handleDbError(error, res, 'Error fetching businesses');
  }
});

// Create new business (moderators create as pending, requires admin approval)
router.post('/businesses',
  upload.array('images', 5),
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('city').notEmpty().withMessage('City is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const {
        name,
        category,
        description,
        phone,
        email,
        address,
        city,
        state,
        country = 'Nigeria',
        church_branch,
        whatsapp,
        website,
        instagram,
      } = req.body;

      // Handle uploaded images
      let images = [];
      if (req.files && req.files.length > 0) {
        try {
          images = await uploadToSupabase(req.files);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          images = [];
        }
      }

      let imagesArray = [];
      if (Array.isArray(images) && images.length > 0) {
        imagesArray = images.filter(url => url && typeof url === 'string' && url.trim() !== '');
      }

      // Moderators create businesses as pending (approved = false)
      const result = await pool.query(
        `INSERT INTO businesses (
          name, category, description, phone, email, address, city, state, country,
          church_branch, whatsapp, website, instagram, images, approved
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *`,
        [
          name || null,
          category || null,
          description || null,
          phone || null,
          email || null,
          address || null,
          city || null,
          state || null,
          country || 'Nigeria',
          church_branch || null,
          whatsapp || null,
          website || null,
          instagram || null,
          imagesArray,
          false // Moderators create as pending
        ]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Business created successfully. Pending admin approval.',
      });
    } catch (error) {
      console.error('Error creating business:', error);
      handleDbError(error, res, 'Error creating business');
    }
  }
);

// Update business (moderators can edit)
router.put('/businesses/:id', upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if business exists
    const existing = await pool.query('SELECT * FROM businesses WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    // Moderators cannot change approval status
    const {
      name,
      category,
      description,
      phone,
      email,
      address,
      city,
      state,
      country,
      church_branch,
      whatsapp,
      website,
      instagram,
      is_active,
      featured,
    } = req.body;

    // Handle images
    let images = existing.rows[0].images || [];
    if (req.files && req.files.length > 0) {
      const newImages = await uploadToSupabase(req.files);
      images = [...images, ...newImages];
    }

    // Build update query (moderators cannot change approved status)
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(email);
    }
    if (address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(address);
    }
    if (city !== undefined) {
      updates.push(`city = $${paramCount++}`);
      values.push(city);
    }
    if (state !== undefined) {
      updates.push(`state = $${paramCount++}`);
      values.push(state);
    }
    if (country !== undefined) {
      updates.push(`country = $${paramCount++}`);
      values.push(country);
    }
    if (church_branch !== undefined) {
      updates.push(`church_branch = $${paramCount++}`);
      values.push(church_branch);
    }
    if (whatsapp !== undefined) {
      updates.push(`whatsapp = $${paramCount++}`);
      values.push(whatsapp);
    }
    if (website !== undefined) {
      updates.push(`website = $${paramCount++}`);
      values.push(website);
    }
    if (instagram !== undefined) {
      updates.push(`instagram = $${paramCount++}`);
      values.push(instagram);
    }
    if (images !== undefined) {
      updates.push(`images = $${paramCount++}`);
      values.push(images);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active === 'true' || is_active === true);
    }
    if (featured !== undefined) {
      updates.push(`featured = $${paramCount++}`);
      values.push(featured === 'true' || featured === true);
    }

    // Always update updated_at
    updates.push('updated_at = CURRENT_TIMESTAMP');

    if (updates.length === 1) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    values.push(id);
    const whereParam = `$${paramCount}`;

    const query = `UPDATE businesses SET ${updates.join(', ')} WHERE id = ${whereParam} RETURNING *`;
    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Business updated successfully',
    });
  } catch (error) {
    handleDbError(error, res, 'Error updating business');
  }
});

module.exports = router;

