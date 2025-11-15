require('dotenv').config();
const pool = require('./config/database');

async function checkTables() {
  try {
    console.log('🔍 Checking tables in Supabase database...\n');
    
    // Query to get all tables in the public schema
    const tablesQuery = `
      SELECT 
        table_name,
        table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const tablesResult = await pool.query(tablesQuery);
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found in the database.');
      return;
    }
    
    console.log(`✅ Found ${tablesResult.rows.length} table(s):\n`);
    
    // For each table, get column information
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      
      // Get column information
      const columnsQuery = `
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `;
      
      const columnsResult = await pool.query(columnsQuery, [tableName]);
      
      // Get row count
      const countQuery = `SELECT COUNT(*) as count FROM ${tableName};`;
      let rowCount = 0;
      try {
        const countResult = await pool.query(countQuery);
        rowCount = parseInt(countResult.rows[0].count);
      } catch (err) {
        // Some tables might not be readable
        rowCount = -1;
      }
      
      console.log(`📋 Table: ${tableName} (${rowCount >= 0 ? rowCount + ' rows' : 'N/A'})`);
      console.log('   Columns:');
      
      columnsResult.rows.forEach(col => {
        const maxLength = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultValue = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`     - ${col.column_name}: ${col.data_type}${maxLength} ${nullable}${defaultValue}`);
      });
      
      console.log('');
    }
    
    // Get indexes
    console.log('📊 Indexes:');
    const indexesQuery = `
      SELECT 
        indexname,
        tablename,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `;
    
    const indexesResult = await pool.query(indexesQuery);
    
    if (indexesResult.rows.length === 0) {
      console.log('   No indexes found.\n');
    } else {
      indexesResult.rows.forEach(idx => {
        console.log(`   - ${idx.indexname} on ${idx.tablename}`);
      });
      console.log('');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkTables();

