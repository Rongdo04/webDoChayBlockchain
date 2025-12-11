# Admin Posts API Documentation

## Tổng quan

API quản lý bài viết cho admin panel, cho phép admin xem, cập nhật, kiểm duyệt và xóa các bài viết trong cộng đồng.

## Authentication

Tất cả endpoints yêu cầu:

- JWT token hợp lệ trong header `Authorization: Bearer <token>`
- User phải có role `admin`

## Endpoints

### 1. GET /api/admin/posts

Lấy danh sách bài viết với phân trang và lọc.

**Query Parameters:**

- `status` (optional): `pending`, `published`, `hidden`
- `tag` (optional): `Kinh nghiệm`, `Hỏi đáp`, `Món mới`, `Chia sẻ`, `Tư vấn`
- `cursor` (optional): ID của bài viết cuối cùng để phân trang
- `limit` (optional): Số lượng bài viết trả về (1-100, mặc định 20)
- `sort` (optional): `newest`, `oldest`, `most_liked`, `most_commented` (mặc định newest)

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "post_id",
        "content": "Nội dung bài viết",
        "tag": "Kinh nghiệm",
        "status": "published",
        "likesCount": 10,
        "commentsCount": 5,
        "user": {
          "_id": "user_id",
          "name": "Tên tác giả",
          "email": "email@example.com",
          "avatar": "avatar_url",
          "role": "user"
        },
        "moderatedBy": null,
        "moderatedAt": null,
        "moderationNote": "",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "hasNext": true,
      "nextCursor": "next_post_id"
    }
  }
}
```

### 2. GET /api/admin/posts/stats

Lấy thống kê bài viết.

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 100,
    "pending": 20,
    "published": 60,
    "hidden": 20,
    "recent": 15,
    "byTag": [
      { "_id": "Kinh nghiệm", "count": 40 },
      { "_id": "Hỏi đáp", "count": 30 },
      { "_id": "Món mới", "count": 20 },
      { "_id": "Chia sẻ", "count": 10 }
    ],
    "byStatus": [
      { "_id": "published", "count": 60 },
      { "_id": "pending", "count": 20 },
      { "_id": "hidden", "count": 20 }
    ]
  }
}
```

### 3. GET /api/admin/posts/:id

Lấy chi tiết một bài viết.

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "post_id",
    "content": "Nội dung bài viết đầy đủ",
    "tag": "Kinh nghiệm",
    "status": "published",
    "likesCount": 10,
    "commentsCount": 5,
    "user": {
      "_id": "user_id",
      "name": "Tên tác giả",
      "email": "email@example.com",
      "avatar": "avatar_url",
      "role": "user"
    },
    "moderatedBy": {
      "_id": "admin_id",
      "name": "Admin Name",
      "email": "admin@example.com"
    },
    "moderatedAt": "2024-01-01T00:00:00.000Z",
    "moderationNote": "Ghi chú của admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 4. PUT /api/admin/posts/:id/status

Cập nhật trạng thái bài viết.

**Request Body:**

```json
{
  "status": "hidden",
  "moderationNote": "Ghi chú của admin"
}
```

**Status Values:**

- `pending`: Chờ duyệt
- `published`: Đã xuất bản
- `hidden`: Đã ẩn

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "post_id",
    "status": "hidden",
    "moderationNote": "Ghi chú của admin",
    "moderatedBy": "admin_id",
    "moderatedAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Trạng thái bài viết đã được cập nhật: hidden"
}
```

### 5. POST /api/admin/posts/:id/moderate

Kiểm duyệt bài viết (duyệt/từ chối/ẩn).

**Request Body:**

```json
{
  "action": "approve",
  "note": "Ghi chú kiểm duyệt"
}
```

**Action Values:**

- `approve`: Duyệt bài viết (status → published)
- `reject`: Từ chối bài viết (status → hidden)
- `hide`: Ẩn bài viết (status → hidden)

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "post_id",
    "status": "published",
    "moderatedBy": "admin_id",
    "moderatedAt": "2024-01-01T00:00:00.000Z",
    "moderationNote": "Ghi chú kiểm duyệt"
  },
  "message": "Bài viết đã được duyệt"
}
```

### 6. DELETE /api/admin/posts/:id

Xóa bài viết.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "post_id",
    "deleted": true
  },
  "message": "Bài viết đã được xóa"
}
```

## Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Access token is required"
  }
}
```

### 403 Forbidden

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required"
  }
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "Post not found"
  }
}
```

### 422 Validation Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "status": "Status must be one of: pending, published, hidden"
    }
  }
}
```

## Audit Logging

Tất cả các thao tác admin đều được ghi log trong `AuditLog` collection với:

- `action`: Loại hành động (create, update, delete)
- `entityType`: "post"
- `entityId`: ID của bài viết
- `userId`: ID của admin thực hiện
- `metadata`: Chi tiết thao tác

## Database Schema

### Post Model

```javascript
{
  content: String, // Nội dung bài viết (max 2000 chars)
  tag: String, // Tag: "Kinh nghiệm", "Hỏi đáp", "Món mới", "Chia sẻ", "Tư vấn"
  status: String, // "pending", "published", "hidden"
  userId: ObjectId, // ID tác giả
  likes: [ObjectId], // Danh sách user đã like
  likesCount: Number, // Số lượng like
  commentsCount: Number, // Số lượng comment
  moderatedBy: ObjectId, // ID admin đã kiểm duyệt
  moderatedAt: Date, // Thời gian kiểm duyệt
  moderationNote: String, // Ghi chú của admin
  ipAddress: String, // IP address
  userAgent: String, // User agent
  createdAt: Date,
  updatedAt: Date
}
```

## Testing

Chạy test suite:

```bash
cd backend
npm test tests/admin.posts.complete.test.js
```

Test coverage bao gồm:

- ✅ List posts với pagination và filtering
- ✅ Get post statistics
- ✅ Get single post details
- ✅ Update post status
- ✅ Moderate posts với các actions
- ✅ Delete posts
- ✅ Authentication và authorization
- ✅ Error handling và validation
- ✅ Audit logging

## Usage Examples

### 1. Lấy danh sách bài viết chờ duyệt

```bash
curl -H "Authorization: Bearer <admin_token>" \
  "http://localhost:5000/api/admin/posts?status=pending&limit=10"
```

### 2. Cập nhật trạng thái bài viết

```bash
curl -X PUT \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "hidden", "moderationNote": "Nội dung không phù hợp"}' \
  "http://localhost:5000/api/admin/posts/post_id/status"
```

### 3. Kiểm duyệt bài viết

```bash
curl -X POST \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"action": "approve", "note": "Bài viết chất lượng tốt"}' \
  "http://localhost:5000/api/admin/posts/post_id/moderate"
```

### 4. Lấy thống kê bài viết

```bash
curl -H "Authorization: Bearer <admin_token>" \
  "http://localhost:5000/api/admin/posts/stats"
```

## Features

### Quản lý bài viết toàn diện:

- Xem danh sách với filter theo status, tag
- Chi tiết bài viết với thông tin tác giả
- Thống kê theo status, tag, thời gian

### Kiểm duyệt nội dung:

- Duyệt/từ chối bài viết
- Ẩn/hiện bài viết
- Ghi chú kiểm duyệt

### Bảo mật & Audit:

- Chỉ admin mới có quyền truy cập
- Log mọi thao tác admin
- Validation đầy đủ input

### Performance:

- Cursor-based pagination
- Optimized queries với indexes
- Population hiệu quả

## Notes

- Tất cả timestamps đều ở UTC
- Pagination sử dụng cursor-based để hiệu quả với dataset lớn
- Posts được populate với thông tin tác giả và admin kiểm duyệt
- Audit logs được tạo tự động cho mọi thao tác admin
- Validation đầy đủ cho tất cả input parameters
- Hỗ trợ sorting theo thời gian, lượt like, lượt comment
