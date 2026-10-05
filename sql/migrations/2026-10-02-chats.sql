CREATE TABLE IF NOT EXISTS chats (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  uuid CHAR(36) NOT NULL,
  title VARCHAR(160) NOT NULL,
  access_type ENUM('course', 'members') NOT NULL DEFAULT 'course',
  course_id INT UNSIGNED NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by_admin_id INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX uniq_chats_uuid (uuid),
  INDEX idx_chats_course_active (course_id, access_type, is_active),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chat_members (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chat_id BIGINT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  is_blocked TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX uniq_chat_members_chat_user (chat_id, user_id),
  INDEX idx_chat_members_user (user_id, is_blocked),
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chat_id BIGINT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  deleted_by_admin_id INT UNSIGNED NULL,
  FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (deleted_by_admin_id) REFERENCES admins(id) ON DELETE SET NULL,
  INDEX idx_chat_messages_history (chat_id, id),
  INDEX idx_chat_messages_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO chats (uuid, title, access_type, course_id, is_active)
SELECT 'e7d962e1-8ca5-4698-a5e7-97df4ba07e50', 'Dyskusja: Bezpieczny (Pod)wykonawca', 'course', c.id, 1
FROM courses c
WHERE c.slug = 'bezpieczny-podwykonawca'
  AND NOT EXISTS (SELECT 1 FROM chats existing WHERE existing.course_id = c.id AND existing.access_type = 'course');
