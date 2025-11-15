const express = require('express');
const pool = require('../config/database');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Helper function to handle database errors
function handleDbError(error, res, defaultMessage) {
  console.error(defaultMessage, error);
  
  // Handle database connection errors
  const isConnectionError = 
    error.code === 'ENOTFOUND' || 
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT' ||
    error.message?.includes('timeout') ||
    error.message?.includes('Connection terminated') ||
    error.message?.includes('terminating connection');
  
  if (isConnectionError) {
    return res.status(503).json({
      success: false,
      message: 'Database unavailable. The connection timed out or was terminated. This usually means your Supabase project is paused. Please check your Supabase project status.',
      error: 'Database connection failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  
  res.status(500).json({
    success: false,
    message: defaultMessage,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}

// Get all active businesses
router.get('/', async (req, res) => {
  try {
    const { search, category, city, state, limit = 50, offset = 0 } = req.query;

    console.log('GET /api/businesses - Query params:', { search, category, city, state, limit, offset });

    // Build WHERE clause with filters - only show approved businesses to public
    let whereClause = 'WHERE is_active = true AND approved = true';
    const params = [];
    let paramCount = 1;

    // Enhanced search across multiple fields for better discovery
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const searchPattern = `%${searchTerm}%`;
      
      // Search across: name, category, city, state, description, church_branch, address
      // This helps users find businesses by skill, location, or any related keyword
      whereClause += ` AND (
        name ILIKE $${paramCount} OR
        category ILIKE $${paramCount} OR
        city ILIKE $${paramCount} OR
        state ILIKE $${paramCount} OR
        description ILIKE $${paramCount} OR
        church_branch ILIKE $${paramCount} OR
        address ILIKE $${paramCount}
      )`;
      params.push(searchPattern);
      paramCount++;
    }

    // Category filter - case-insensitive for flexibility
    if (category && category.trim()) {
      whereClause += ` AND category ILIKE $${paramCount}`;
      params.push(`%${category.trim()}%`);
      paramCount++;
    }

    // City filter - case-insensitive for flexibility
    if (city && city.trim()) {
      whereClause += ` AND city ILIKE $${paramCount}`;
      params.push(`%${city.trim()}%`);
      paramCount++;
    }

    // State filter - case-insensitive for flexibility
    if (state && state.trim()) {
      whereClause += ` AND state ILIKE $${paramCount}`;
      params.push(`%${state.trim()}%`);
      paramCount++;
    }

    // Build ORDER BY clause with relevance ranking
    let orderByClause = '';
    if (search && search.trim()) {
      // When searching, prioritize results by relevance:
      // 1. Featured businesses always appear first
      // 2. Name matches (highest priority - exact business/person name)
      // 3. Category matches (skill/service matches)
      // 4. Location matches (city/state matches)
      // 5. Description/keyword matches
      // 6. Then by popularity (views) and recency
      const searchTerm = search.trim();
      const searchPattern = `%${searchTerm}%`;
      
      orderByClause = `ORDER BY 
        featured DESC,
        CASE 
          WHEN name ILIKE $${paramCount} THEN 1
          WHEN category ILIKE $${paramCount} THEN 2
          WHEN city ILIKE $${paramCount} OR state ILIKE $${paramCount} THEN 3
          WHEN description ILIKE $${paramCount} OR church_branch ILIKE $${paramCount} OR address ILIKE $${paramCount} THEN 4
          ELSE 5
        END,
        views DESC,
        created_at DESC`;
      // Use the same search pattern for all CASE conditions (PostgreSQL will reuse the parameter)
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      paramCount += 4;
    } else {
      // When not searching, show featured first, then by popularity (views), then newest
      orderByClause = 'ORDER BY featured DESC, views DESC, created_at DESC';
    }

    // Build final query with optimized selection
    const query = `
      SELECT 
        *,
        CASE 
          WHEN featured = true THEN 100
          WHEN views > 10 THEN 50
          ELSE 0
        END as relevance_score
      FROM businesses 
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    params.push(parseInt(limit), parseInt(offset));

    console.log('Executing optimized search query...');
    console.log('Query params count:', params.length);
    const result = await pool.query(query, params);
    console.log(`Query returned ${result.rows.length} businesses`);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error in GET /api/businesses:', error);
    handleDbError(error, res, 'Error fetching businesses');
  }
});

// Get single business
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Only show approved businesses to public
    const result = await pool.query(
      'SELECT * FROM businesses WHERE id = $1 AND is_active = true AND approved = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    // Increment views
    await pool.query(
      'UPDATE businesses SET views = views + 1 WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    handleDbError(error, res, 'Error fetching business');
  }
});

// Get featured businesses
router.get('/featured/list', async (req, res) => {
  try {
    console.log('GET /api/businesses/featured/list');
    // Only show approved featured businesses
    const result = await pool.query(
      'SELECT * FROM businesses WHERE is_active = true AND approved = true AND featured = true ORDER BY views DESC LIMIT 6'
    );
    console.log(`Featured businesses query returned ${result.rows.length} results`);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error in GET /api/businesses/featured/list:', error);
    handleDbError(error, res, 'Error fetching featured businesses');
  }
});

// Get categories
router.get('/meta/categories', async (req, res) => {
  try {
    console.log('GET /api/businesses/meta/categories');
    // Only count approved businesses
    const result = await pool.query(
      'SELECT DISTINCT category, COUNT(*) as count FROM businesses WHERE is_active = true AND approved = true GROUP BY category ORDER BY count DESC'
    );
    console.log(`Categories query returned ${result.rows.length} results`);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error in GET /api/businesses/meta/categories:', error);
    handleDbError(error, res, 'Error fetching categories');
  }
});

// Get cities
router.get('/meta/cities', async (req, res) => {
  try {
    console.log('GET /api/businesses/meta/cities');
    // Only count approved businesses
    const result = await pool.query(
      'SELECT DISTINCT city, COUNT(*) as count FROM businesses WHERE is_active = true AND approved = true GROUP BY city ORDER BY count DESC'
    );
    console.log(`Cities query returned ${result.rows.length} results`);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error in GET /api/businesses/meta/cities:', error);
    handleDbError(error, res, 'Error fetching cities');
  }
});

module.exports = router;
