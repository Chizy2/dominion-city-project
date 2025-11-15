const express = require('express');
const multer = require('multer');
const { adminAuth } = require('../middleware/auth');
const pool = require('../config/database');
const { supabase } = require('../config/supabase');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Helper function to handle database errors
function handleDbError(error, res, defaultMessage) {
  console.error(defaultMessage, error);
  
  // Handle database connection errors
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

// Configure multer to handle files in memory (for Supabase Storage)
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

// Helper function to upload files to Supabase Storage with retry logic
async function uploadToSupabase(files, maxRetries = 3) {
  if (!files || files.length === 0) return [];

  // Check if Supabase Storage bucket exists
  try {
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
      console.warn('⚠️  Could not check Supabase Storage buckets:', bucketError.message);
      console.warn('⚠️  Image uploads will be skipped. Business will be created without images.');
      return [];
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'business-images');
    if (!bucketExists) {
      console.warn('⚠️  Supabase Storage bucket "business-images" does not exist.');
      console.warn('⚠️  Please create the bucket in Supabase Dashboard: Storage → Create bucket → Name: business-images');
      console.warn('⚠️  Image uploads will be skipped. Business will be created without images.');
      return [];
    }
  } catch (checkError) {
    console.warn('⚠️  Error checking Supabase Storage bucket:', checkError.message);
    console.warn('⚠️  Image uploads will be skipped. Business will be created without images.');
    return [];
  }

  const uploadedUrls = [];
  
  for (const file of files) {
    let retries = 0;
    let lastError = null;
    
    while (retries < maxRetries) {
      try {
        // Generate unique filename
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1E9);
        // Handle both multer file objects (with originalname) and File objects
        const originalName = file.originalname || file.name || 'image';
        const ext = originalName.split('.').pop().toLowerCase() || 'jpg';
        const fileName = `businesses/business-${timestamp}-${random}.${ext}`;

        // Get file buffer - multer memory storage provides buffer property
        const fileBuffer = file.buffer || (file instanceof Buffer ? file : null);
        
        if (!fileBuffer) {
          console.error('File buffer not available for:', originalName);
          throw new Error(`File buffer not available for ${originalName}`);
        }

        // Upload to Supabase Storage with timeout
        const uploadPromise = supabase.storage
          .from('business-images')
          .upload(fileName, fileBuffer, {
            contentType: file.mimetype || 'image/jpeg',
            upsert: false,
          });

        // Add timeout wrapper (30 seconds)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
        );

        const { data, error } = await Promise.race([uploadPromise, timeoutPromise]);

        if (error) {
          // Check if it's a recoverable error
          const isRecoverable = 
            error.message?.includes('fetch failed') ||
            error.message?.includes('network') ||
            error.message?.includes('socket') ||
            error.message?.includes('ECONNREFUSED') ||
            error.message?.includes('ENOTFOUND');
          
          if (isRecoverable && retries < maxRetries - 1) {
            retries++;
            const waitTime = Math.min(1000 * Math.pow(2, retries), 5000); // Exponential backoff, max 5s
            console.warn(`Upload failed for ${originalName}, retrying in ${waitTime}ms (attempt ${retries + 1}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            lastError = error;
            continue;
          }
          
          console.error('Supabase upload error:', error);
          throw new Error(`Failed to upload ${originalName}: ${error.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('business-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
        break; // Success, exit retry loop
      } catch (error) {
        lastError = error;
        const isRecoverable = 
          error.message?.includes('fetch failed') ||
          error.message?.includes('timeout') ||
          error.message?.includes('network') ||
          error.message?.includes('socket');
        
        if (isRecoverable && retries < maxRetries - 1) {
          retries++;
          const waitTime = Math.min(1000 * Math.pow(2, retries), 5000);
          console.warn(`Upload error for ${file.originalname || file.name}, retrying in ${waitTime}ms (attempt ${retries + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        // Non-recoverable error or max retries reached
        console.error('Error uploading file after retries:', error);
        throw error;
      }
    }
    
    if (lastError && uploadedUrls.length === 0) {
      throw lastError;
    }
  }

  return uploadedUrls;
}

// Apply admin auth middleware to all routes
router.use(adminAuth);

// Get all businesses (admin view)
router.get('/businesses', async (req, res) => {
  try {
    const { search, category, city, status, limit = 50, offset = 0 } = req.query;

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
      // Convert string 'true'/'false' or boolean to proper boolean
      params.push(status === 'true' || status === true);
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(query, params);

    // Get total count
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

// Get dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  try {
    const totalBusinesses = await pool.query('SELECT COUNT(*) FROM businesses');
    const activeBusinesses = await pool.query('SELECT COUNT(*) FROM businesses WHERE is_active = true');
    const totalViews = await pool.query('SELECT SUM(views) FROM businesses');
    const recentBusinesses = await pool.query(
      'SELECT * FROM businesses ORDER BY created_at DESC LIMIT 5'
    );

    res.json({
      success: true,
      stats: {
        total: parseInt(totalBusinesses.rows[0].count),
        active: parseInt(activeBusinesses.rows[0].count),
        totalViews: parseInt(totalViews.rows[0].sum || 0),
        recent: recentBusinesses.rows,
      },
    });
  } catch (error) {
    handleDbError(error, res, 'Error fetching dashboard stats');
  }
});

// Create new business
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

      // Handle uploaded images - upload to Supabase Storage
      let images = [];
      if (req.files && req.files.length > 0) {
        try {
          images = await uploadToSupabase(req.files);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          // Continue without images if upload fails
          console.warn('Continuing without images due to upload error');
          images = []; // Ensure it's an empty array
        }
      }

      // Ensure images is properly formatted for PostgreSQL TEXT[] array
      // PostgreSQL requires arrays to be actual arrays, not null for empty
      let imagesArray = [];
      if (Array.isArray(images) && images.length > 0) {
        imagesArray = images.filter(url => url && typeof url === 'string' && url.trim() !== '');
      }

      console.log('Creating business with:', {
        name,
        category,
        city,
        imagesCount: imagesArray.length,
        hasImages: imagesArray.length > 0
      });

      // Admin creates businesses as approved, moderators create as pending
      const isAdmin = req.user.role === 'admin';
      
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
          imagesArray, // PostgreSQL pg library handles array conversion automatically
          isAdmin // Only admins can create approved businesses
        ]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Business created successfully',
      });
  } catch (error) {
    console.error('Error creating business - Full error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    
    // Provide more specific error messages
    if (error.code === '23502') {
      return res.status(400).json({
        success: false,
        message: 'Required field is missing',
        error: error.message,
      });
    }
    
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry - this business already exists',
        error: error.message,
      });
    }
    
    handleDbError(error, res, 'Error creating business');
  }
  }
);

// Update business
router.put('/businesses/:id', upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    
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

    // Check if business exists
    const existing = await pool.query('SELECT * FROM businesses WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    // Handle images - upload new ones to Supabase Storage
    let images = existing.rows[0].images || [];
    if (req.files && req.files.length > 0) {
      const newImages = await uploadToSupabase(req.files);
      images = [...images, ...newImages];
    }

    // Build dynamic update query - only update fields that are provided
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
      // Convert string to boolean if needed
      values.push(is_active === 'true' || is_active === true);
    }
    if (featured !== undefined) {
      updates.push(`featured = $${paramCount++}`);
      // Convert string to boolean if needed
      values.push(featured === 'true' || featured === true);
    }

    // Always update updated_at
    updates.push('updated_at = CURRENT_TIMESTAMP');

    if (updates.length === 1) { // Only updated_at
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    // Add id to values for WHERE clause
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

// Delete business (Admin only)
router.delete('/businesses/:id', async (req, res) => {
  try {
    // Only admins can delete businesses
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can delete businesses.',
      });
    }

    const { id } = req.params;

    const result = await pool.query('DELETE FROM businesses WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    res.json({
      success: true,
      message: 'Business deleted successfully',
    });
  } catch (error) {
    handleDbError(error, res, 'Error deleting business');
  }
});

// Approve business (Admin only)
router.post('/businesses/:id/approve', async (req, res) => {
  try {
    // Only admins can approve businesses
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can approve businesses.',
      });
    }

    const { id } = req.params;

    const result = await pool.query(
      'UPDATE businesses SET approved = true WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Business approved successfully',
    });
  } catch (error) {
    handleDbError(error, res, 'Error approving business');
  }
});

// Reject business (Admin only)
router.post('/businesses/:id/reject', async (req, res) => {
  try {
    // Only admins can reject businesses
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can reject businesses.',
      });
    }

    const { id } = req.params;

    const result = await pool.query(
      'UPDATE businesses SET approved = false WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Business rejected successfully',
    });
  } catch (error) {
    handleDbError(error, res, 'Error rejecting business');
  }
});

// Get pending businesses (Admin only)
router.get('/businesses/pending', async (req, res) => {
  try {
    // Only admins can view pending businesses
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can view pending businesses.',
      });
    }

    const result = await pool.query(
      'SELECT * FROM businesses WHERE approved = false ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    handleDbError(error, res, 'Error fetching pending businesses');
  }
});

// User Management - Get all users (Admin only)
router.get('/users', async (req, res) => {
  try {
    // Only admins can view users
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can view users.',
      });
    }

    const result = await pool.query(
      'SELECT id, email, name, role, is_admin, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    handleDbError(error, res, 'Error fetching users');
  }
});

// User Management - Update user role (Admin only)
router.put('/users/:id/role', async (req, res) => {
  try {
    // Only admins can change roles
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can change user roles.',
      });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'moderator', 'user'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be admin, moderator, or user.',
      });
    }

    // Prevent demoting yourself
    const currentUser = await pool.query('SELECT id FROM users WHERE email = $1', [req.user.email]);
    if (currentUser.rows[0]?.id === parseInt(id) && role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot demote yourself.',
      });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1, is_admin = ($1 = $2) WHERE id = $3 RETURNING id, email, name, role, is_admin',
      [role, 'admin', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    handleDbError(error, res, 'Error updating user role');
  }
});

module.exports = router;
