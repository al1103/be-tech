# API Requirements cho app Blog + Portfolio

Tài liệu này mô tả các API backend cần có để thay thế dữ liệu mock hiện tại trong app, đồng thời quy định các trường dữ liệu frontend cần sử dụng.

## 1) Quy ước chung

- Base URL gợi ý: `/api/v1`
- Format dữ liệu: `application/json`
- Time format: ISO 8601 (`2026-03-12T10:30:00Z`)
- Phân trang:
  - Query: `page`, `pageSize`
  - Response: `meta.page`, `meta.pageSize`, `meta.total`, `meta.totalPages`

---

## 2) API cho Bài viết (Blog)

### 2.1 Lấy danh sách bài viết trang chủ

**GET** `/posts?featured=true&limit=3`

Mục đích:
- Hiển thị block “Bài viết nổi bật”.

Response item (`PostSummary`):
- `id`: string
- `slug`: string
- `title`: string
- `excerpt`: string
- `category`: { `id`, `slug`, `name` }
- `tagColor`: `yellow | red | blue | green` (hoặc map ở frontend)
- `readTimeMinutes`: number
- `publishedAt`: string (ISO)
- `featured`: boolean
- `coverImage`: string | null

---

### 2.2 Lấy danh sách bài viết mới nhất

**GET** `/posts?sort=publishedAt:desc&page=1&pageSize=10`

Mục đích:
- Hiển thị section “Mới nhất” và nút “Xem thêm”.

Response:
- `data`: `PostSummary[]`
- `meta`: `{ page, pageSize, total, totalPages }`

---

### 2.3 Lấy chi tiết bài viết theo slug

**GET** `/posts/{slug}`

Mục đích:
- Trang chi tiết bài viết `/post/:slug`.

Response (`PostDetail`):
- `id`: string
- `slug`: string
- `title`: string
- `excerpt`: string
- `content`: string (Markdown hoặc HTML)
- `category`: { `id`, `slug`, `name` }
- `tags`: `{ id, slug, name }[]`
- `readTimeMinutes`: number
- `publishedAt`: string (ISO)
- `author`:
  - `id`: string
  - `name`: string
  - `avatarUrl`: string | null
  - `bio`: string | null
- `tableOfContents`: `{ id, title, level }[]` (có thể để backend build sẵn)
- `seo`:
  - `metaTitle`: string
  - `metaDescription`: string
  - `ogImage`: string | null

---

### 2.4 Lấy bài viết theo category

**GET** `/categories/{categorySlug}/posts?page=1&pageSize=10`

Mục đích:
- Trang `/category/:categorySlug`.

Response:
- `category`:
  - `id`: string
  - `slug`: string
  - `name`: string
  - `description`: string
  - `emoji`: string
  - `color`: `yellow | red | blue | green`
- `data`: `PostSummary[]`
- `meta`: `{ page, pageSize, total, totalPages }`

---

### 2.5 Tìm kiếm bài viết

**GET** `/posts/search?q={keyword}&limit=10`

Mục đích:
- Search dialog + ô tìm kiếm sidebar.

Response item (`SearchResult`):
- `id`: string
- `slug`: string
- `title`: string
- `excerpt`: string
- `categoryName`: string
- `tagColor`: `yellow | red | blue | green`
- `publishedAt`: string (ISO)

---

### 2.6 Top bài viết đọc nhiều

**GET** `/posts/popular?limit=5`

Mục đích:
- Box “Đọc nhiều” ở sidebar.

Response item:
- `id`: string
- `slug`: string
- `title`: string
- `views`: number

---

## 3) API cho Tag và Category

### 3.1 Lấy danh sách tag phổ biến

**GET** `/tags/popular?limit=12`

Response item:
- `id`: string
- `slug`: string
- `name`: string
- `color`: `yellow | red | blue | green`
- `postCount`: number

### 3.2 Lấy danh sách categories

**GET** `/categories`

Response item:
- `id`: string
- `slug`: string
- `name`: string
- `description`: string
- `emoji`: string
- `color`: `yellow | red | blue | green`
- `postCount`: number

---

## 4) API cho Portfolio

### 4.1 Lấy danh sách project

**GET** `/projects?category=Web%20App&page=1&pageSize=12`

Mục đích:
- Trang `/portfolio`, grid project + lọc theo category.

Response item (`ProjectSummary`):
- `id`: string
- `slug`: string
- `title`: string
- `description`: string
- `thumbnailUrl`: string
- `tags`: string[]
- `category`: string (`Web App | Mobile App | AI/ML | ...`)
- `liveUrl`: string | null
- `githubUrl`: string | null
- `createdAt`: string (ISO)

Response:
- `data`: `ProjectSummary[]`
- `meta`: `{ page, pageSize, total, totalPages }`

### 4.2 Lấy chi tiết project

**GET** `/projects/{slug}`

Mục đích:
- Dùng cho modal chi tiết project.

Response (`ProjectDetail`):
- Toàn bộ trường của `ProjectSummary`
- `content`: string (Markdown/HTML mô tả dài)
- `features`: string[]
- `screenshots`: string[]
- `techStack`: `{ name: string, version?: string }[]`
- `role`: string | null
- `duration`: string | null

### 4.3 Lấy category portfolio

**GET** `/projects/categories`

Response item:
- `id`: string
- `label`: string
- `count`: number

---

## 5) API cho Newsletter

### 5.1 Đăng ký newsletter

**POST** `/newsletter/subscribe`

Request body:
- `email`: string (required)
- `source`: string (vd: `website-newsletter-page`)
- `locale`: string (vd: `vi-VN`)

Response:
- `success`: boolean
- `message`: string
- `doubleOptIn`: boolean

### 5.2 Huỷ đăng ký newsletter (nếu cần)

**POST** `/newsletter/unsubscribe`

Request body:
- `email`: string
- `reason`: string | null

Response:
- `success`: boolean
- `message`: string

---

## 6) API cho About/Profile

### 6.1 Lấy thông tin tác giả

**GET** `/profile`

Response:
- `id`: string
- `displayName`: string
- `headline`: string
- `bio`: string
- `avatarUrl`: string
- `email`: string
- `skills`: `{ group: string, items: string[] }[]`
- `funFacts`: `{ emoji: string, text: string }[]`
- `socialLinks`: `{ platform: string, url: string }[]`

---

## 7) API thống kê (tuỳ chọn)

### 7.1 Stats cho portfolio

**GET** `/stats/portfolio`

Response:
- `completedProjects`: number
- `happyClients`: number
- `yearsOfExperience`: number
- `githubCommits`: number

---

## 8) Error format chuẩn (khuyến nghị)

Khi API lỗi, trả về:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email không hợp lệ",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

---

## 9) Checklist data tối thiểu để frontend chạy được

- Blog:
  - List posts (featured + latest + popular)
  - Post detail theo slug
  - Category + category posts
  - Search posts
- Portfolio:
  - List projects + filter theo category
  - Project detail
- Profile:
  - Thông tin About
- Newsletter:
  - Subscribe endpoint

Nếu backend làm đủ các API trên thì app có thể bỏ toàn bộ mock data và kết nối dữ liệu thật.
