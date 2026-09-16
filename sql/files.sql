CREATE TABLE IF NOT EXISTS file_storage_lock (
  id TINYINT UNSIGNED PRIMARY KEY
) ENGINE=InnoDB;
INSERT IGNORE INTO file_storage_lock (id) VALUES (1);

CREATE TABLE IF NOT EXISTS files (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  storage_key CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL UNIQUE,
  original_name VARCHAR(180) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT UNSIGNED NOT NULL,
  status ENUM('uploading', 'ready') NOT NULL,
  scan_status ENUM('pending', 'clean', 'skipped') NOT NULL DEFAULT 'pending',
  uploaded_by INT UNSIGNED NULL,
  attached_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_files_cleanup (status, attached_at, created_at),
  INDEX idx_files_owner (uploaded_by, attached_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS lesson_attachments (
  id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin PRIMARY KEY,
  lesson_id INT UNSIGNED NOT NULL,
  block_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  file_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  FOREIGN KEY (lesson_id) REFERENCES course_lessons(id) ON DELETE CASCADE,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE RESTRICT,
  UNIQUE INDEX uniq_lesson_block_file (lesson_id, block_id, file_id),
  INDEX idx_attachment_file (file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS file_upload_attempts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_file_attempt_admin (admin_id, created_at)
) ENGINE=InnoDB;
