CREATE TABLE IF NOT EXISTS affiliate_links (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  owner_name VARCHAR(160) NOT NULL,
  owner_email VARCHAR(254) NOT NULL,
  code CHAR(36) NOT NULL,
  alias VARCHAR(80) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by_admin_id INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX uniq_affiliate_links_code (code),
  UNIQUE INDEX uniq_affiliate_links_alias (alias),
  INDEX idx_affiliate_links_owner_email (owner_email),
  INDEX idx_affiliate_links_active (is_active),
  FOREIGN KEY (created_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS affiliate_registrations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  affiliate_link_id BIGINT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  registered_email VARCHAR(254) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX uniq_affiliate_registrations_user (user_id),
  INDEX idx_affiliate_registrations_link_created (affiliate_link_id, created_at),
  INDEX idx_affiliate_registrations_email (registered_email),
  FOREIGN KEY (affiliate_link_id) REFERENCES affiliate_links(id) ON DELETE RESTRICT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
