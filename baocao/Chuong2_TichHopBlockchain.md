# CHƯƠNG 2: TÍCH HỢP BLOCKCHAIN VÀO HỆ THỐNG

## 2.1. Tổng quan về blockchain trong dự án

### 2.1.1. Blockchain là gì?

Blockchain là một công nghệ sổ cái phân tán (distributed ledger) cho phép lưu trữ dữ liệu một cách:

- **Bất biến (Immutable)**: Dữ liệu đã được ghi không thể thay đổi hoặc xóa
- **Phi tập trung (Decentralized)**: Dữ liệu được lưu trên nhiều node, không phụ thuộc vào một server trung tâm
- **Minh bạch (Transparent)**: Tất cả các giao dịch đều công khai và có thể verify
- **Bảo mật (Secure)**: Sử dụng mã hóa và consensus mechanism để đảm bảo tính toàn vẹn

### 2.1.2. Mục đích sử dụng blockchain trong dự án

**Bảo vệ bản quyền công thức:**

- Lưu hash của công thức lên blockchain
- Gắn liền với wallet address của tác giả
- Timestamp không thể giả mạo (block number và block timestamp)
- Phát hiện trùng lặp tự động (hash giống → nội dung giống)

**Minh bạch và có thể verify:**

- Bất kỳ ai cũng có thể verify công thức đã được đăng ký
- Không cần quyền truy cập vào database của hệ thống
- Có thể sử dụng làm chứng cứ trong tranh chấp bản quyền

### 2.1.3. Kiến trúc tích hợp blockchain

Hệ thống sử dụng kiến trúc 3 tầng:

```
Frontend (React) → Backend (Node.js/Express) → Blockchain (Ganache + Smart Contract)
```

**Frontend Layer:**

- MetaMask Integration: Lấy wallet address từ user
- UI Components: Hiển thị trạng thái verify, transaction hash

**Backend Layer:**

- Recipe Repository: Business logic, tính hash, gọi blockchain service
- Blockchain Service: Tương tác với blockchain qua Web3.js

**Blockchain Layer:**

- Ganache: Local blockchain network (development)
- Smart Contract: Logic lưu trữ và verify hash

### 2.1.4. Flow đăng ký công thức lên blockchain

1. User điền thông tin công thức và kết nối MetaMask (lấy wallet address)
2. Frontend gửi recipe data + walletAddress lên backend
3. Backend lưu vào MongoDB và tính hash SHA256
4. Backend gọi blockchainService để đăng ký hash lên blockchain
5. Smart Contract kiểm tra và lưu hash vào blockchain
6. Backend nhận kết quả và lưu transactionHash, blockNumber
7. Frontend hiển thị badge "Verified on Blockchain"

## 2.2. Smart Contract

### 2.2.1. Giới thiệu Smart Contract

Smart Contract là một chương trình chạy tự động trên blockchain, được viết bằng ngôn ngữ Solidity. Trong dự án này, Smart Contract `RecipeRegistry` đóng vai trò là **sổ cái bất biến** để lưu trữ:

- Hash của công thức (SHA256)
- Wallet address của tác giả
- Timestamp (thời điểm đăng ký)
- Block number (số block chứa transaction)

### 2.2.2. Cấu trúc dữ liệu

**Struct RecipeInfo:**

```solidity
struct RecipeInfo {
    address author;        // Địa chỉ ví của tác giả
    uint256 timestamp;     // Thời điểm đăng ký
    bool exists;           // Kiểm tra hash đã tồn tại chưa
}
```

**Mapping:**

```solidity
mapping(string => RecipeInfo) public recipes;
```

### 2.2.3. Các hàm chính

**registerRecipe:** Đăng ký hash công thức mới lên blockchain

- Kiểm tra hash chưa tồn tại
- Lưu thông tin vào mapping
- Emit event RecipeRegistered

**verifyRecipe:** Xác minh hash công thức có tồn tại trên blockchain không

- View function (không tốn gas)
- Trả về exists, author, timestamp

**updateRecipe:** Cập nhật công thức (tạo version mới với hash mới)

- Chỉ tác giả mới có thể update
- Tạo entry mới với hash mới (hash cũ vẫn tồn tại)

### 2.2.4. Deploy Contract

**Quy trình:**

1. Compile contract trong Remix IDE (EVM version: istanbul hoặc berlin)
2. Deploy lên Ganache (RPC: http://127.0.0.1:7545)
3. Lấy contract address và thêm vào `.env`

**Bảo mật:**

- Input validation: Kiểm tra hash không rỗng, author address hợp lệ
- Access control: Chỉ tác giả mới có thể update recipe
- Không có upgrade mechanism: Contract không thể upgrade sau khi deploy

## 2.3. Ganache - Local Blockchain Network

### 2.3.1. Giới thiệu Ganache

Ganache là công cụ phát triển blockchain local, cho phép tạo một mạng Ethereum riêng trên máy tính. Dự án sử dụng Ganache GUI với các đặc điểm:

- **Local Blockchain Network**: Mạng blockchain chạy trên localhost
- **Pre-funded Accounts**: Tự động tạo accounts với ETH để test
- **Fast Block Time**: Block time = 0 (instant confirmation)
- **No Gas Cost**: Miễn phí gas, không tốn phí thật

### 2.3.2. Vai trò trong dự án

Ganache đóng vai trò là **blockchain network** cho môi trường development:

- Thay thế Mainnet: Không cần kết nối Ethereum mainnet (tốn phí)
- Nhanh chóng: Block time = 0, transaction confirm ngay lập tức
- Kiểm soát hoàn toàn: Có thể reset, tạo accounts mới bất cứ lúc nào

### 2.3.3. Cài đặt và cấu hình

**Cài đặt:**

1. Download Ganache GUI từ https://trufflesuite.com/ganache/
2. Tạo Workspace mới với port 7545 (mặc định)
3. Network ID: 5777 (mặc định)

**Cấu hình Backend:**

```env
GANACHE_URL=http://127.0.0.1:7545
GANACHE_NETWORK_ID=5777
GANACHE_PRIVATE_KEY=0x... (lấy từ Ganache UI)
```

**Accounts:**

- Ganache tự động tạo 10 accounts với 100 ETH mỗi account
- Private key hiển thị trong tab "Accounts" (click icon key)

### 2.3.4. So sánh với Mainnet/Testnet

| Tiêu chí    | Ganache        | Testnet     | Mainnet     |
| ----------- | -------------- | ----------- | ----------- |
| **Chi phí** | Miễn phí       | Miễn phí    | Tốn phí     |
| **Tốc độ**  | ⚡⚡⚡ Instant | ⚡⚡ 12-15s | ⚡⚡ 12-15s |
| **Reset**   | ✅ Có thể      | ❌ Không    | ❌ Không    |

**Khi nào dùng Ganache:**

- ✅ Development và testing
- ✅ Cần test nhanh
- ✅ Không muốn tốn phí

## 2.4. Web3.js - Tương tác với Blockchain

### 2.4.1. Giới thiệu Web3.js

Web3.js là thư viện JavaScript cho phép tương tác với blockchain Ethereum từ ứng dụng JavaScript/Node.js. Dự án sử dụng Web3.js v4.x.

**Vai trò trong dự án:**

- Kết nối backend với Ganache local network
- Quản lý backend account (sử dụng private key)
- Tương tác với Smart Contract (gọi functions, gửi transactions)
- Xử lý transactions (gửi, đợi confirmation, lấy receipt)

### 2.4.2. Service blockchainService.js

**Vị trí:** `backend/services/blockchainService.js`

**Các chức năng chính:**

**initializeBlockchain():**

- Khởi tạo Web3 instance kết nối với Ganache
- Tạo account từ private key
- Tạo contract instance

**registerRecipeHash():**

- Validate inputs (hash, authorWalletAddress)
- Gọi Smart Contract function registerRecipe()
- Estimate gas và gửi transaction
- Đợi confirmation và trả về kết quả

**verifyRecipeHash():**

- Gọi view function verifyRecipe() (không tốn gas)
- Trả về exists, author, timestamp

**updateRecipeHash():**

- Gọi Smart Contract function updateRecipe()
- Tạo version mới với hash mới

### 2.4.3. Xử lý lỗi

**Error message extraction:**

- Web3 v4: Error message nằm trong `error.cause.message`
- Cần extract đúng cách để hiển thị cho user

**Common errors:**

- "Cannot connect to Ganache" → Ganache chưa chạy
- "Recipe hash already registered" → Hash đã tồn tại
- "Gas estimation failed" → Transaction sẽ revert

### 2.4.4. Xử lý BigInt

Web3.js v4 trả về `blockNumber` dưới dạng `BigInt`, nhưng MongoDB yêu cầu `Number`. Cần convert:

```javascript
blockNumber: Number(receipt.blockNumber);
```

## 2.5. MetaMask - Wallet Provider

### 2.5.1. Giới thiệu MetaMask

MetaMask là browser extension cho phép quản lý Ethereum wallet và kết nối với DApps. Trong dự án này, MetaMask đóng vai trò là **wallet provider** để:

- Lấy wallet address của user (không ký transaction)
- Xác định tác giả công thức trên blockchain
- Hiển thị trạng thái kết nối cho user

**Lưu ý quan trọng:** MetaMask **KHÔNG** ký transaction hay trả phí gas trong dự án này. Tất cả transactions đều được gửi từ backend với private key của backend account.

### 2.5.2. Tại sao cần MetaMask?

**Vấn đề với authorId (MongoDB):**

- Có thể giả mạo (tạo user mới với thông tin giả)
- Không liên kết với blockchain
- Không thể verify công khai

**Giải pháp với authorWalletAddress:**

- Không thể giả mạo (cần private key)
- Liên kết trực tiếp với blockchain
- Có thể verify công khai

**Kết hợp:**

- `authorId` (MongoDB): Quản lý user trong hệ thống
- `authorWalletAddress` (Blockchain): Xác định tác giả trên blockchain

### 2.5.3. Tích hợp MetaMask với Frontend

**Custom Hook: useMetaMask**

**Vị trí:** `client/src/hooks/useMetaMask.js`

**Chức năng:**

- Quản lý kết nối MetaMask
- Lấy wallet address
- Lắng nghe thay đổi account/network

**Kết nối MetaMask:**

```javascript
const accounts = await window.ethereum.request({
  method: "eth_requestAccounts",
});
```

**Sử dụng trong Recipe Form:**

- Hiển thị UI kết nối MetaMask
- Gửi walletAddress lên backend khi submit công thức

### 2.5.4. Flow kết nối MetaMask

1. User click "Kết nối MetaMask"
2. MetaMask popup yêu cầu permission
3. User approve → Lấy wallet address
4. Frontend cập nhật state và hiển thị address
5. User submit công thức → Gửi walletAddress lên backend
6. Backend đăng ký blockchain với authorWalletAddress

### 2.5.5. Cấu hình Network

**Thêm Ganache Network vào MetaMask:**

- Network Name: Ganache Local
- RPC URL: http://127.0.0.1:7545
- Chain ID: 5777
- Currency Symbol: ETH

**Import Account từ Ganache:**

- Click "Import Account" trong MetaMask
- Paste private key từ Ganache
- Account sẽ xuất hiện với balance 100 ETH

### 2.5.6. MetaMask không ký transaction

**Trong dự án này:**

- MetaMask chỉ cung cấp wallet address
- Backend account ký transaction (với backend private key)
- Backend trả phí gas

**Lý do:**

- User không cần trả phí gas
- Backend quản lý transaction
- Đơn giản hóa UX

## 2.6. Kết luận chương

Chương này đã trình bày cách tích hợp blockchain vào hệ thống, bao gồm:

1. **Smart Contract**: Logic lưu trữ và verify hash công thức trên blockchain
2. **Ganache**: Local blockchain network cho môi trường development
3. **Web3.js**: Thư viện JavaScript để tương tác với blockchain từ backend
4. **MetaMask**: Wallet provider để lấy wallet address từ user

Các thành phần này kết hợp với nhau tạo thành một hệ thống bảo vệ bản quyền công thức mạnh mẽ, minh bạch và có thể verify công khai. Mặc dù có một số hạn chế về chi phí và độ phức tạp, nhưng các lợi ích về tính bất biến, minh bạch và khả năng verify công khai khiến blockchain trở thành lựa chọn phù hợp cho mục tiêu bảo vệ bản quyền của dự án.

Trong chương tiếp theo, chúng ta sẽ đánh giá kết quả dự án, các khó khăn gặp phải, bài học kinh nghiệm và hướng phát triển trong tương lai.
