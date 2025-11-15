-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create businesses table (now includes individual skilled workers)
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Nigeria',
  whatsapp VARCHAR(20),
  website VARCHAR(255),
  instagram VARCHAR(255),
  images TEXT[], -- Array of image URLs (Supabase Storage URLs)
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  church_branch VARCHAR(255) -- Church branch/assembly affiliation
);

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_state ON businesses(state);
CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses(name);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_businesses_search ON businesses USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Admin user will be created by init-db.js script with proper bcrypt hashing

-- Sample listings for testing (businesses and skilled workers)
INSERT INTO businesses (name, category, description, phone, email, address, city, state, church_branch, images) VALUES
('Brother John Adeyemi', 'Electrician', 'Faithful and skilled electrical services for homes and businesses. Over 10 years experience. Available for residential and commercial work.', '08012345678', 'johnadeyemi@email.com', '123 Main Street', 'Ikeja', 'Lagos', 'Dominion City Church - Ikeja Assembly', ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800']),
('Sister Grace Okafor', 'Fashion Designer', 'Custom fashion design and tailoring services. Modern and traditional styles. Honest pricing and quality work.', '08023456789', 'graceokafor@email.com', '456 Fashion Avenue', 'Garki', 'FCT', 'Dominion City Church - Abuja Central', ARRAY['https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800']),
('Brother David Nwosu', 'Auto Mechanic', 'Expert auto repair and maintenance. Specializing in all makes and models. Fair and transparent service.', '08034567890', 'davidnwosu@email.com', '789 Auto Road', 'Port Harcourt', 'Rivers', 'Dominion City Church - Port Harcourt', ARRAY['https://images.unsplash.com/photo-1608779884828-89f1bee5d6a8?w=800']),
('Sister Blessing Eze', 'Hair Stylist', 'Professional hair styling and beauty services. Experienced and dedicated to excellence.', '08045678901', 'blessingeze@email.com', '321 Beauty Street', 'Victoria Island', 'Lagos', 'Dominion City Church - VI Assembly', ARRAY['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800'])
ON CONFLICT DO NOTHING;
