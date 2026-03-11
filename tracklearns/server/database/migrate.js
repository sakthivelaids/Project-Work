const pool = require('../config/db');

const createTables = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
      avatar VARCHAR(255),
      bio TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      thumbnail VARCHAR(255),
      instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      price DECIMAL(10,2) DEFAULT 0,
      level VARCHAR(50) DEFAULT 'Beginner',
      duration VARCHAR(50),
      is_published BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS lessons (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      title VARCHAR(200) NOT NULL,
      video_url VARCHAR(500),
      content TEXT,
      duration VARCHAR(50),
      order_index INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    `CREATE TABLE IF NOT EXISTS enrollments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
      enrolled_at TIMESTAMP DEFAULT NOW(),
      completed_at TIMESTAMP,
      UNIQUE(user_id, course_id)
    )`,

    `CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, course_id)
    )`,

    `CREATE TABLE IF NOT EXISTS lesson_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
      completed BOOLEAN DEFAULT false,
      completed_at TIMESTAMP,
      UNIQUE(user_id, lesson_id)
    )`
  ];

  try {
    for (const query of queries) {
      await pool.query(query);
    }
    console.log('✅ All tables created successfully');
  } catch (err) {
    console.error('❌ Error creating tables:', err.message);
    throw err;
  }
};

module.exports = createTables;
