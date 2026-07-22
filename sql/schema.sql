CREATE TABLE IF NOT EXISTS submissions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80),
  last_name VARCHAR(120),
  company_name VARCHAR(200),
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(20),
  roles JSON NOT NULL,
  `groups` JSON,
  company_size ENUM('1-2','3-10','11-50','51-250','250+'),
  consent_data TINYINT(1) NOT NULL DEFAULT 0,
  consent_marketing TINYINT(1) NOT NULL DEFAULT 0,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  notes TEXT,
  status ENUM('new','contacted','member') DEFAULT 'new',
  status_tags JSON,
  UNIQUE INDEX uniq_submissions_email (email),
  INDEX idx_created_at (created_at),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS events (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  upcoming TINYINT(1) NOT NULL DEFAULT 0,
  event_date DATE NULL,
  event_time TIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_events_date_time (event_date, event_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role ENUM('admin','superadmin') NOT NULL DEFAULT 'admin',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at TIMESTAMP NULL,
  created_by INT UNSIGNED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email_verified_at TIMESTAMP NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  type ENUM('email_verification','password_reset') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_tokens_lookup (user_id, type, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INT UNSIGNED PRIMARY KEY,
  first_name VARCHAR(80),
  last_name VARCHAR(120),
  phone VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_billing_details (
  user_id INT UNSIGNED PRIMARY KEY,
  billing_type ENUM('company', 'individual') NOT NULL DEFAULT 'company',
  company_name VARCHAR(200),
  nip CHAR(10),
  billing_email VARCHAR(254),
  street VARCHAR(160),
  building_number VARCHAR(20),
  apartment_number VARCHAR(20),
  postal_code VARCHAR(10),
  city VARCHAR(100),
  country VARCHAR(100) NOT NULL DEFAULT 'Polska',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_billing_nip (nip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS courses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(120),
  level VARCHAR(40),
  lesson_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_free TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX uniq_courses_slug (slug),
  INDEX idx_courses_listing (is_active, sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS course_lessons (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id INT UNSIGNED NOT NULL,
  slug VARCHAR(160) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type ENUM('text', 'video', 'material') NOT NULL DEFAULT 'text',
  content MEDIUMTEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE INDEX uniq_course_lessons_slug (course_id, slug),
  INDEX idx_course_lessons_listing (course_id, is_published, sort_order, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_course_access (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  course_id INT UNSIGNED NOT NULL,
  access_type ENUM('free', 'purchase', 'grant', 'code') NOT NULL,
  status ENUM('active', 'revoked', 'expired') NOT NULL DEFAULT 'active',
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  revoked_at TIMESTAMP NULL,
  revoked_reason VARCHAR(255),
  granted_by_admin_id INT UNSIGNED NULL,
  source_reference VARCHAR(160),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL,
  UNIQUE INDEX uniq_user_course_access (user_id, course_id),
  INDEX idx_course_access_user_status (user_id, status, expires_at),
  INDEX idx_course_access_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_lesson_progress (
  user_id INT UNSIGNED NOT NULL,
  lesson_id INT UNSIGNED NOT NULL,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  last_viewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, lesson_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
  INDEX idx_lesson_progress_lesson (lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) NOT NULL PRIMARY KEY,
  expires BIGINT UNSIGNED NOT NULL,
  data TEXT,
  INDEX idx_expires (expires)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
