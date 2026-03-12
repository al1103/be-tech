# be-tech

Backend mẫu cho app Blog + Portfolio, đã kết nối MySQL theo tài liệu `API_REQUIREMENTS.md`.

## Cài đặt

```bash
npm install
cp .env.example .env
```

## Chuẩn bị database

```bash
mysql -u root -p < sql/schema.sql
```

## Chạy server

```bash
npm start
```

Base URL: `http://localhost:3000/api/v1`
