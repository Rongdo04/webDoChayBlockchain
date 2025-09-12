# Tính năng Báo cáo (Reporting System)

## Tổng quan

Hệ thống báo cáo cho phép người dùng báo cáo nội dung không phù hợp trên platform, bao gồm công thức, bình luận và bài viết cộng đồng.

## Các thành phần đã triển khai

### Frontend Components

#### 1. Hooks

- **`useReporting.js`** - Hook chính để xử lý logic báo cáo
- **`useReportModal.js`** - Hook quản lý state modal báo cáo và navigation

#### 2. Components

- **`GenericReportModal.jsx`** - Modal báo cáo tái sử dụng cho mọi loại content
- **`LoginRequiredModal.jsx`** - Modal yêu cầu đăng nhập khi chưa auth

#### 3. Services

- **`reportsAPI.js`** - Service API để gọi backend reports

#### 4. Tích hợp

- **Community page** - Đã tích hợp báo cáo cho posts
- **Recipe detail page** - Đã thêm nút báo cáo cho recipes

### Backend Implementation

#### 1. API Endpoints

- **POST** `/api/reports` - Submit báo cáo mới
- **GET** `/api/reports/user` - Lấy báo cáo của user

#### 2. Components

- **`reportsController.js`** - Controller xử lý logic báo cáo
- **`reportsRoutes.js`** - Route definitions
- **`Report.js`** - Model MongoDB cho báo cáo (sử dụng model có sẵn)

#### 3. Features

- Kiểm tra authentication
- Validate input data
- Prevent duplicate reports
- Pagination cho user reports
- Filter theo status

## Cách sử dụng

### 1. Trong Community Page

```javascript
// User click "Báo cáo" trên bài viết
// → Kiểm tra authentication
// → Mở GenericReportModal với targetType="post"
// → Submit báo cáo qua API
// → Hiển thị toast confirmation
```

### 2. Trong Recipe Detail Page

```javascript
// User click icon warning bên cạnh nút "Lưu"
// → Kiểm tra authentication
// → Mở GenericReportModal với targetType="recipe"
// → Submit báo cáo qua API
// → Hiển thị toast confirmation
```

### 3. Tích hợp vào component mới

```javascript
import useReportModal from "../../hooks/useReportModal";
import GenericReportModal from "../../components/common/GenericReportModal";
import LoginRequiredModal from "../components/community/LoginRequiredModal";

const MyComponent = () => {
  const { isAuthenticated } = useAuth();
  const {
    reportTarget,
    showLoginRequired,
    toast,
    handleReport,
    handleReportSuccess,
    handleLoginRedirect,
    closeReportModal,
    closeLoginModal,
    clearToast,
  } = useReportModal();

  const handleReportClick = (item) => {
    handleReport(item, isAuthenticated);
  };

  return (
    <div>
      <button onClick={() => handleReportClick(myItem)}>Báo cáo</button>

      <GenericReportModal
        open={!!reportTarget}
        target={reportTarget}
        targetType="recipe" // hoặc "comment", "post"
        onClose={closeReportModal}
        onSuccess={handleReportSuccess}
        onLoginRequired={() => {}}
      />

      <LoginRequiredModal
        open={showLoginRequired}
        onClose={closeLoginModal}
        onLoginRedirect={handleLoginRedirect}
      />

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};
```

## Cấu trúc Data

### Report Object

```javascript
{
  _id: "report_id",
  reporterId: "user_id",
  targetType: "recipe" | "comment" | "post",
  targetId: "target_object_id",
  reason: "Lý do báo cáo",
  description: "Mô tả chi tiết (optional)",
  status: "pending" | "reviewed" | "resolved" | "rejected",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}
```

### API Request/Response

```javascript
// POST /api/reports
{
  targetType: "recipe",
  targetId: "507f1f77bcf86cd799439011",
  reason: "Công thức sai lệch",
  description: "Mô tả chi tiết..."
}

// Response
{
  success: true,
  data: {
    id: "report_id",
    message: "Báo cáo đã được gửi thành công"
  }
}
```

## Tính năng

### ✅ Đã hoàn thành

- [x] Submit báo cáo với authentication check
- [x] Prevent duplicate reports
- [x] Báo cáo posts trong Community
- [x] Báo cáo recipes trong Recipe Detail
- [x] Modal yêu cầu đăng nhập
- [x] Toast notification
- [x] Generic modal cho mọi loại content
- [x] Backend API với validation
- [x] Test cases
- [x] Documentation

### ⚠️ Cần admin backend để hoàn thiện

- [ ] Admin view tất cả báo cáo
- [ ] Admin update status báo cáo
- [ ] Admin statistics
- [ ] Email notifications cho admin

### 💡 Tính năng mở rộng (tương lai)

- [ ] Báo cáo comments
- [ ] Rate limiting
- [ ] Report categories/tags
- [ ] Auto-moderation rules
- [ ] User reputation system

## Testing

### Manual Testing Checklist

- [ ] User chưa đăng nhập → hiện modal login
- [ ] User đã đăng nhập → hiện modal báo cáo
- [ ] Submit báo cáo thành công → hiện toast
- [ ] Submit duplicate báo cáo → hiện error
- [ ] Escape key đóng modal
- [ ] Click outside đóng modal

### Unit Tests

```bash
# Backend tests
cd backend
npm test tests/reports.test.js

# Frontend tests (nếu có)
cd client
npm test -- --testPathPattern=reports
```

## Deployment Notes

### Environment Variables

Không cần thêm env vars mới, sử dụng config MongoDB và JWT có sẵn.

### Database Migration

Không cần migration, sử dụng Report model có sẵn trong system.

### Admin Setup

Sau khi deploy, cần implement admin interface để quản lý báo cáo:

1. Thêm reports management vào admin panel
2. Setup notification system
3. Define moderation workflows

## File Structure

```
client/src/
├── hooks/
│   ├── useReporting.js
│   └── useReportModal.js
├── components/common/
│   └── GenericReportModal.jsx
├── services/
│   └── reportsAPI.js
└── user/
    ├── pages/
    │   ├── Community.jsx (updated)
    │   └── RecipeDetail.jsx (updated)
    └── components/community/
        └── LoginRequiredModal.jsx

backend/
├── controllers/
│   └── reportsController.js
├── routes/
│   └── reportsRoutes.js
├── tests/
│   └── reports.test.js
└── docs/
    └── REPORTS_API.md
```

## Kết luận

Hệ thống báo cáo đã được triển khai hoàn chỉnh với:

- ✅ Frontend UI/UX hoàn thiện
- ✅ Backend API đầy đủ
- ✅ Authentication & validation
- ✅ Error handling & user feedback
- ✅ Testing & documentation

Người dùng có thể báo cáo nội dung không phù hợp, admin sẽ thấy trong queue (khi backend admin được cắm vào).
