# Reports API Documentation

## Overview

API để xử lý báo cáo từ người dùng về nội dung không phù hợp trên hệ thống.

## Authentication

Tất cả các endpoint đều yêu cầu authentication. Token được gửi qua HTTP-only cookie.

## Endpoints

### Submit Report

Submit một báo cáo mới.

**POST** `/api/reports`

**Request Body:**

```json
{
  "targetType": "recipe" | "comment" | "post",
  "targetId": "string",
  "reason": "string",
  "description": "string" // optional
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "report_id",
    "message": "Báo cáo đã được gửi thành công"
  }
}
```

**Error Responses:**

- `400` - Validation error (missing required fields)
- `400` - Invalid target type
- `401` - Unauthorized
- `409` - Already reported (user already reported this target)
- `500` - Internal server error

### Get User Reports

Lấy danh sách báo cáo của user hiện tại.

**GET** `/api/reports/user`

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 50)
- `status` - Filter by status (pending, reviewed, resolved, rejected)

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "report_id",
        "reporterId": "user_id",
        "targetType": "recipe",
        "targetId": "target_id",
        "reason": "Nội dung không phù hợp",
        "description": "Mô tả chi tiết",
        "status": "pending",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "pages": 2
    }
  }
}
```

## Report Status

- `pending` - Đang chờ xử lý
- `reviewed` - Đã được xem xét
- `resolved` - Đã xử lý xong
- `rejected` - Từ chối (báo cáo không hợp lệ)

## Target Types

- `recipe` - Báo cáo công thức nấu ăn
- `comment` - Báo cáo bình luận
- `post` - Báo cáo bài viết cộng đồng

## Common Reasons

### For Recipes:

- "Công thức sai lệch"
- "Hình ảnh không phù hợp"
- "Spam / Quảng cáo"
- "Vi phạm bản quyền"
- "Nội dung không liên quan"

### For Comments:

- "Ngôn từ tiêu cực"
- "Spam / Quảng cáo"
- "Nội dung không phù hợp"
- "Sai thông tin"
- "Bình luận độc hại"

### For Posts:

- "Nội dung không phù hợp"
- "Spam / Quảng cáo"
- "Ngôn từ tiêu cực"
- "Sai thông tin"
- "Vi phạm bản quyền"

## Admin Management

Admin có thể xem và quản lý tất cả báo cáo thông qua admin panel. API admin sẽ được implement riêng.

## Rate Limiting

- User chỉ có thể báo cáo mỗi target một lần
- Recommend implement rate limiting để tránh spam (ví dụ: 10 báo cáo/giờ/user)

## Usage Examples

### Frontend Integration

```javascript
// Submit report
const reportData = {
  targetType: "recipe",
  targetId: "507f1f77bcf86cd799439011",
  reason: "Công thức sai lệch",
  description: "Công thức này có nguyên liệu độc hại",
};

const response = await reportsAPI.submitReport(reportData);
if (response.success) {
  showToast("Đã gửi báo cáo. Cảm ơn bạn!");
}

// Get user reports
const reports = await reportsAPI.getUserReports({
  page: 1,
  limit: 10,
  status: "pending",
});
```
