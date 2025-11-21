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

    // Enhanced search with better logic
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 0);
      
      // Build search conditions with word boundaries for better matching
      // Search across: name, category, city, state, description, church_branch, address
      const searchConditions = [];
      
      // Exact match patterns (highest priority)
      const exactPattern = `%${searchTerm}%`;
      
      // Word-by-word patterns for multi-word searches
      searchWords.forEach((word, idx) => {
        const wordPattern = `%${word}%`;
        searchConditions.push(`(
          name ILIKE $${paramCount + idx} OR
          category ILIKE $${paramCount + idx} OR
          city ILIKE $${paramCount + idx} OR
          state ILIKE $${paramCount + idx} OR
          description ILIKE $${paramCount + idx} OR
          church_branch ILIKE $${paramCount + idx} OR
          address ILIKE $${paramCount + idx}
        )`);
        params.push(wordPattern);
      });
      
      // Also add exact phrase match
      searchConditions.push(`(
        name ILIKE $${paramCount + searchWords.length} OR
        category ILIKE $${paramCount + searchWords.length} OR
        description ILIKE $${paramCount + searchWords.length}
      )`);
      params.push(exactPattern);
      
      whereClause += ` AND (${searchConditions.join(' OR ')})`;
      paramCount += searchWords.length + 1;
    }

    // Category filter - exact match preferred, but allow partial for flexibility
    if (category && category.trim()) {
      const categoryTerm = category.trim();
      // Try exact match first, then partial
      whereClause += ` AND (
        category = $${paramCount} OR 
        category ILIKE $${paramCount + 1}
      )`;
      params.push(categoryTerm, `%${categoryTerm}%`);
      paramCount += 2;
    }

    // City filter - exact match preferred, but allow partial for flexibility
    if (city && city.trim()) {
      const cityTerm = city.trim();
      whereClause += ` AND (
        city = $${paramCount} OR 
        city ILIKE $${paramCount + 1}
      )`;
      params.push(cityTerm, `%${cityTerm}%`);
      paramCount += 2;
    }

    // State filter - exact match preferred
    if (state && state.trim()) {
      const stateTerm = state.trim();
      whereClause += ` AND (
        state = $${paramCount} OR 
        state ILIKE $${paramCount + 1}
      )`;
      params.push(stateTerm, `%${stateTerm}%`);
      paramCount += 2;
    }

    // Build ORDER BY clause with advanced relevance ranking
    let orderByClause = '';
    let relevanceSelect = '';
    
    if (search && search.trim()) {
      const searchTerm = search.trim();
      const searchPattern = `%${searchTerm}%`;
      const searchLower = searchTerm.toLowerCase();
      
      // Calculate comprehensive relevance score
      relevanceSelect = `,
        (
          -- Exact matches get highest score
          CASE WHEN LOWER(name) = $${paramCount} THEN 1000 ELSE 0 END +
          CASE WHEN LOWER(category) = $${paramCount} THEN 800 ELSE 0 END +
          CASE WHEN LOWER(city) = $${paramCount} THEN 600 ELSE 0 END +
          CASE WHEN LOWER(state) = $${paramCount} THEN 600 ELSE 0 END +
          
          -- Starts with matches get high score
          CASE WHEN LOWER(name) LIKE $${paramCount + 1} THEN 500 ELSE 0 END +
          CASE WHEN LOWER(category) LIKE $${paramCount + 1} THEN 400 ELSE 0 END +
          
          -- Contains matches get medium score
          CASE WHEN name ILIKE $${paramCount + 2} THEN 300 ELSE 0 END +
          CASE WHEN category ILIKE $${paramCount + 2} THEN 250 ELSE 0 END +
          CASE WHEN city ILIKE $${paramCount + 2} THEN 200 ELSE 0 END +
          CASE WHEN state ILIKE $${paramCount + 2} THEN 200 ELSE 0 END +
          CASE WHEN description ILIKE $${paramCount + 2} THEN 150 ELSE 0 END +
          CASE WHEN church_branch ILIKE $${paramCount + 2} THEN 100 ELSE 0 END +
          CASE WHEN address ILIKE $${paramCount + 2} THEN 100 ELSE 0 END +
          
          -- Featured boost
          CASE WHEN featured = true THEN 200 ELSE 0 END +
          
          -- Popularity boost (views)
          CASE WHEN views > 50 THEN 50
               WHEN views > 20 THEN 30
               WHEN views > 10 THEN 15
               ELSE 0 END
        ) as relevance_score`;
      
      const startsWithPattern = `${searchLower}%`;
      
      orderByClause = `ORDER BY 
        relevance_score DESC,
        featured DESC,
        views DESC,
        created_at DESC`;
      
      params.push(searchLower, startsWithPattern, searchPattern);
      paramCount += 3;
    } else {
      // When not searching, calculate relevance based on filters and popularity
      relevanceSelect = `,
        (
          CASE WHEN featured = true THEN 200 ELSE 0 END +
          CASE WHEN views > 50 THEN 50
               WHEN views > 20 THEN 30
               WHEN views > 10 THEN 15
               ELSE 0 END
        ) as relevance_score`;
      
      orderByClause = 'ORDER BY featured DESC, views DESC, created_at DESC';
    }

    // Build final query with optimized selection
    const query = `
      SELECT 
        *${relevanceSelect}
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
