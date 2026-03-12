const express = require('express');
const { query } = require('../db/pool');
const { asyncHandler, parsePagination, toMeta } = require('../utils/http');

const router = express.Router();

router.get('/health', asyncHandler(async (_req, res) => {
  await query('SELECT 1 AS ok');
  res.json({ success: true });
}));

router.get('/posts', asyncHandler(async (req, res) => {
  const { featured, sort } = req.query;
  const { page, pageSize, offset } = parsePagination(req.query);

  const filters = [];
  const params = [];

  if (featured === 'true') {
    filters.push('p.featured = 1');
  }

  const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';
  const orderBy = sort === 'publishedAt:desc' ? 'ORDER BY p.published_at DESC' : 'ORDER BY p.published_at DESC';

  const totalRows = await query(`SELECT COUNT(*) AS total FROM posts p ${whereClause}`, params);
  const total = totalRows[0]?.total || 0;

  const data = await query(
    `
      SELECT
        p.id,
        p.slug,
        p.title,
        p.excerpt,
        JSON_OBJECT('id', c.id, 'slug', c.slug, 'name', c.name) AS category,
        p.tag_color AS tagColor,
        p.read_time_minutes AS readTimeMinutes,
        p.published_at AS publishedAt,
        p.featured,
        p.cover_image AS coverImage
      FROM posts p
      LEFT JOIN categories c ON c.id = p.category_id
      ${whereClause}
      ${orderBy}
      LIMIT ? OFFSET ?
    `,
    [...params, pageSize, offset]
  );

  res.json({ data, meta: toMeta({ page, pageSize, total }) });
}));

router.get('/posts/search', asyncHandler(async (req, res) => {
  const keyword = `%${(req.query.q || '').trim()}%`;
  const limit = Math.max(Number(req.query.limit || 10), 1);

  const data = await query(
    `
      SELECT
        p.id,
        p.slug,
        p.title,
        p.excerpt,
        c.name AS categoryName,
        p.tag_color AS tagColor,
        p.published_at AS publishedAt
      FROM posts p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.title LIKE ? OR p.excerpt LIKE ?
      ORDER BY p.published_at DESC
      LIMIT ?
    `,
    [keyword, keyword, limit]
  );

  res.json({ data });
}));

router.get('/posts/popular', asyncHandler(async (req, res) => {
  const limit = Math.max(Number(req.query.limit || 5), 1);

  const data = await query(
    `
      SELECT id, slug, title, views
      FROM posts
      ORDER BY views DESC
      LIMIT ?
    `,
    [limit]
  );

  res.json({ data });
}));

router.get('/posts/:slug', asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT
        p.id,
        p.slug,
        p.title,
        p.excerpt,
        p.content,
        JSON_OBJECT('id', c.id, 'slug', c.slug, 'name', c.name) AS category,
        p.read_time_minutes AS readTimeMinutes,
        p.published_at AS publishedAt,
        JSON_OBJECT('id', a.id, 'name', a.name, 'avatarUrl', a.avatar_url, 'bio', a.bio) AS author,
        JSON_OBJECT('metaTitle', p.meta_title, 'metaDescription', p.meta_description, 'ogImage', p.og_image) AS seo
      FROM posts p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN authors a ON a.id = p.author_id
      WHERE p.slug = ?
      LIMIT 1
    `,
    [req.params.slug]
  );

  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Post not found', details: [] }
    });
  }

  const post = rows[0];
  const tags = await query(
    `
      SELECT t.id, t.slug, t.name
      FROM post_tags pt
      INNER JOIN tags t ON t.id = pt.tag_id
      WHERE pt.post_id = ?
    `,
    [post.id]
  );

  const tableOfContents = await query(
    `
      SELECT id, title, level
      FROM post_toc
      WHERE post_id = ?
      ORDER BY position ASC
    `,
    [post.id]
  );

  res.json({ ...post, tags, tableOfContents });
}));

router.get('/categories', asyncHandler(async (_req, res) => {
  const data = await query(
    `
      SELECT
        c.id,
        c.slug,
        c.name,
        c.description,
        c.emoji,
        c.color,
        COUNT(p.id) AS postCount
      FROM categories c
      LEFT JOIN posts p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name ASC
    `
  );

  res.json({ data });
}));

router.get('/categories/:categorySlug/posts', asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePagination(req.query);

  const categories = await query('SELECT id, slug, name, description, emoji, color FROM categories WHERE slug = ? LIMIT 1', [req.params.categorySlug]);
  if (categories.length === 0) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Category not found', details: [] }
    });
  }

  const category = categories[0];

  const totalRows = await query('SELECT COUNT(*) AS total FROM posts WHERE category_id = ?', [category.id]);
  const total = totalRows[0]?.total || 0;

  const data = await query(
    `
      SELECT
        p.id,
        p.slug,
        p.title,
        p.excerpt,
        JSON_OBJECT('id', c.id, 'slug', c.slug, 'name', c.name) AS category,
        p.tag_color AS tagColor,
        p.read_time_minutes AS readTimeMinutes,
        p.published_at AS publishedAt,
        p.featured,
        p.cover_image AS coverImage
      FROM posts p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.category_id = ?
      ORDER BY p.published_at DESC
      LIMIT ? OFFSET ?
    `,
    [category.id, pageSize, offset]
  );

  res.json({ category, data, meta: toMeta({ page, pageSize, total }) });
}));

router.get('/tags/popular', asyncHandler(async (req, res) => {
  const limit = Math.max(Number(req.query.limit || 12), 1);

  const data = await query(
    `
      SELECT
        t.id,
        t.slug,
        t.name,
        t.color,
        COUNT(pt.post_id) AS postCount
      FROM tags t
      LEFT JOIN post_tags pt ON pt.tag_id = t.id
      GROUP BY t.id
      ORDER BY postCount DESC
      LIMIT ?
    `,
    [limit]
  );

  res.json({ data });
}));

router.get('/projects', asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = parsePagination(req.query);
  const filters = [];
  const params = [];

  if (req.query.category) {
    filters.push('p.category = ?');
    params.push(req.query.category);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const totalRows = await query(`SELECT COUNT(*) AS total FROM projects p ${whereClause}`, params);
  const total = totalRows[0]?.total || 0;

  const data = await query(
    `
      SELECT
        p.id,
        p.slug,
        p.title,
        p.description,
        p.thumbnail_url AS thumbnailUrl,
        p.tags,
        p.category,
        p.live_url AS liveUrl,
        p.github_url AS githubUrl,
        p.created_at AS createdAt
      FROM projects p
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `,
    [...params, pageSize, offset]
  );

  res.json({ data, meta: toMeta({ page, pageSize, total }) });
}));

router.get('/projects/categories', asyncHandler(async (_req, res) => {
  const data = await query(
    `
      SELECT
        MIN(id) AS id,
        category AS label,
        COUNT(*) AS count
      FROM projects
      GROUP BY category
      ORDER BY count DESC
    `
  );

  res.json({ data });
}));

router.get('/projects/:slug', asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT
        id,
        slug,
        title,
        description,
        thumbnail_url AS thumbnailUrl,
        tags,
        category,
        live_url AS liveUrl,
        github_url AS githubUrl,
        created_at AS createdAt,
        content,
        features,
        screenshots,
        tech_stack AS techStack,
        role,
        duration
      FROM projects
      WHERE slug = ?
      LIMIT 1
    `,
    [req.params.slug]
  );

  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Project not found', details: [] }
    });
  }

  res.json(rows[0]);
}));

router.post('/newsletter/subscribe', asyncHandler(async (req, res) => {
  const { email, source = null, locale = null } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Email không hợp lệ',
        details: [{ field: 'email', message: 'Email is required' }]
      }
    });
  }

  await query(
    `
      INSERT INTO newsletter_subscribers (email, source, locale, subscribed_at)
      VALUES (?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE source = VALUES(source), locale = VALUES(locale), unsubscribed_at = NULL
    `,
    [email, source, locale]
  );

  res.status(201).json({
    success: true,
    message: 'Đăng ký thành công',
    doubleOptIn: false
  });
}));

router.post('/newsletter/unsubscribe', asyncHandler(async (req, res) => {
  const { email, reason = null } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Email không hợp lệ',
        details: [{ field: 'email', message: 'Email is required' }]
      }
    });
  }

  await query(
    `
      UPDATE newsletter_subscribers
      SET unsubscribed_at = NOW(), unsubscribe_reason = ?
      WHERE email = ?
    `,
    [reason, email]
  );

  res.json({ success: true, message: 'Huỷ đăng ký thành công' });
}));

router.get('/profile', asyncHandler(async (_req, res) => {
  const rows = await query(
    `
      SELECT
        id,
        display_name AS displayName,
        headline,
        bio,
        avatar_url AS avatarUrl,
        email,
        skills,
        fun_facts AS funFacts,
        social_links AS socialLinks
      FROM profiles
      LIMIT 1
    `
  );

  if (!rows.length) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Profile not found', details: [] }
    });
  }

  res.json(rows[0]);
}));

router.get('/stats/portfolio', asyncHandler(async (_req, res) => {
  const rows = await query(
    `
      SELECT
        completed_projects AS completedProjects,
        happy_clients AS happyClients,
        years_of_experience AS yearsOfExperience,
        github_commits AS githubCommits
      FROM portfolio_stats
      ORDER BY id DESC
      LIMIT 1
    `
  );

  res.json(rows[0] || {
    completedProjects: 0,
    happyClients: 0,
    yearsOfExperience: 0,
    githubCommits: 0
  });
}));

module.exports = router;
