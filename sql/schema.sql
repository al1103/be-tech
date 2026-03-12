CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(36) PRIMARY KEY,
  slug VARCHAR(150) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  emoji VARCHAR(16),
  color ENUM('yellow', 'red', 'blue', 'green') DEFAULT 'blue'
);

CREATE TABLE IF NOT EXISTS authors (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  avatar_url TEXT,
  bio TEXT
);

CREATE TABLE IF NOT EXISTS posts (
  id VARCHAR(36) PRIMARY KEY,
  slug VARCHAR(180) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content LONGTEXT,
  category_id VARCHAR(36),
  author_id VARCHAR(36),
  tag_color ENUM('yellow', 'red', 'blue', 'green') DEFAULT 'blue',
  read_time_minutes INT DEFAULT 1,
  published_at DATETIME NOT NULL,
  featured TINYINT(1) DEFAULT 0,
  cover_image TEXT,
  views INT DEFAULT 0,
  meta_title VARCHAR(255),
  meta_description TEXT,
  og_image TEXT,
  CONSTRAINT fk_posts_category FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES authors(id)
);

CREATE TABLE IF NOT EXISTS tags (
  id VARCHAR(36) PRIMARY KEY,
  slug VARCHAR(150) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  color ENUM('yellow', 'red', 'blue', 'green') DEFAULT 'blue'
);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id VARCHAR(36) NOT NULL,
  tag_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (post_id, tag_id),
  CONSTRAINT fk_post_tags_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_tags_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_toc (
  id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  level INT NOT NULL,
  position INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_post_toc_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(36) PRIMARY KEY,
  slug VARCHAR(180) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  tags JSON,
  category VARCHAR(120) NOT NULL,
  live_url TEXT,
  github_url TEXT,
  created_at DATETIME NOT NULL,
  content LONGTEXT,
  features JSON,
  screenshots JSON,
  tech_stack JSON,
  role VARCHAR(255),
  duration VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  email VARCHAR(255) PRIMARY KEY,
  source VARCHAR(255),
  locale VARCHAR(40),
  subscribed_at DATETIME NOT NULL,
  unsubscribed_at DATETIME NULL,
  unsubscribe_reason TEXT NULL
);

CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(36) PRIMARY KEY,
  display_name VARCHAR(200) NOT NULL,
  headline VARCHAR(255) NOT NULL,
  bio TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  skills JSON NOT NULL,
  fun_facts JSON NOT NULL,
  social_links JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS portfolio_stats (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  completed_projects INT NOT NULL DEFAULT 0,
  happy_clients INT NOT NULL DEFAULT 0,
  years_of_experience INT NOT NULL DEFAULT 0,
  github_commits INT NOT NULL DEFAULT 0
);
