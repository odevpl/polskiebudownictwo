CREATE TABLE IF NOT EXISTS mediators (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  short_description TEXT NOT NULL,
  full_description MEDIUMTEXT NOT NULL,
  key_experience TEXT,
  qualifications TEXT,
  specializations TEXT,
  mediation_modes TEXT,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_mediators_listing (is_published, sort_order, id),
  INDEX idx_mediators_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mediator_inquiries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mediator_id INT UNSIGNED NULL,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(30),
  message TEXT NOT NULL,
  consent_data TINYINT(1) NOT NULL DEFAULT 0,
  ip_address VARCHAR(45),
  status ENUM('new', 'contacted', 'closed') NOT NULL DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (mediator_id) REFERENCES mediators(id) ON DELETE SET NULL,
  INDEX idx_mediator_inquiries_mediator (mediator_id),
  INDEX idx_mediator_inquiries_status (status, created_at),
  INDEX idx_mediator_inquiries_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
