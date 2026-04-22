# PROJECT OVERVIEW: HYPERBOLIC TIME CHAMBER TRAINING

**Concept:** Một ứng dụng năng suất (Pomodoro) biến việc làm việc/học tập thành một "Training Arc" (chương luyện tập) trong thế giới Dragon Ball. Người dùng đóng vai một chiến binh vào Phòng tập thời gian (Hyperbolic Time Chamber) để thăng cấp sức mạnh.

---

## 1. HỆ THỐNG GIAO DIỆN (VISUAL IDENTITY)
- **Aesthetic:** Pixel-art retro 100%, sử dụng font chữ chủ đạo `Press Start 2P`.
- **Technical Style:** 
  - Sử dụng thuộc tính CSS `image-rendering: pixelated` cho toàn bộ ảnh để giữ nguyên độ nét răng cưa đặc trưng của retro game. 
  - Viền các khối (panels) có dạng răng cưa, trang trí thêm ốc vít ở 4 góc mang phong cách "Capsule Corp technology".
- **Responsive:** Thiết kế sử dụng đơn vị `vh/vw` (Viewport Units) để giao diện vừa khít mọi màn hình trình duyệt (100vh) mà không cần bật full-screen hay cuộn chuột (No Scroll design).

---

## 2. LUỒNG TRẢI NGHIỆM (USER FLOW)

### A. Màn hình Lobby (Khởi đầu)
- **Background:** Ảnh toàn cảnh Kami's Lookout (Đài quan sát của Thượng đế) được hiển thị trọn vẹn, không bị kéo dãn (stretched).
- **Feature:** Chỉ có duy nhất một nút "START TRAINING" nằm ở vị trí Bottom-Center.
- **Logic:** Nút có hiệu ứng nhấp nháy (blinking) liên tục. Khi người dùng nhấn vào, hệ thống chuyển sang màn hình chọn nhân vật.

### B. Màn hình Select Fighter (Chuẩn bị)
- **Bố cục 2 cột chính:**
  - **Cột trái:** Grid danh sách các icon chân dung nhân vật (Goku, Vegeta, Piccolo, Cell,...).
  - **Cột phải:** Preview nhân vật đang chọn hiển thị dạng Full Body Model (ảnh toàn thân). Bên dưới nhân vật là tên và bộ chọn Training Mode.
- **Logic Training Mode:** Người dùng chọn các preset có sẵn như `25/5`, `50/10`, `90/20` hoặc chế độ `Custom` (Tùy chỉnh) thay vì nhập số trực tiếp từ đầu.
- **Logic Layout:** Cột preview bên phải tự động căn giữa dọc (vertically center) để cân đối với danh sách nhân vật. Nếu chọn `Custom`, toàn bộ khối preview trượt nhẹ lên trên nhường chỗ cho ô nhập thời gian.

### C. Màn hình Training Session (Trong phòng tập)
- **Cột Trái:** Hiển thị Full Body Model của nhân vật đang luyện tập với kích thước lớn. Phía trên là khung "Current Mission" dùng để quản lý hệ thống Task.
- **Cột Phải:** HUD điều khiển trung tâm bao gồm:
  - **Timer:** Đồng hồ đếm ngược với con số khổng lồ.
  - **Progress Bars:** Thanh Time (tiến độ của session hiện tại) và thanh KI (tiến độ lên cấp sức mạnh).
  - **Dashboard Stats:** Khu vực hiển thị các thông số cày cuốc (tổng thời gian, thời gian tới cấp tiếp theo...).

---

## 3. LOGIC LUYỆN TẬP & NHIỆM VỤ (TASKS)
- **Hệ thống Task:** Người dùng nhập công việc cần làm vào ô "Current Mission". Nhiệm vụ được lưu lại và check-off trên màn hình giúp duy trì sự tập trung.
- **Timer Logic:**
  - **Chế độ tự động:** Khi hết thời gian Focus (Tập trung), hệ thống tự động chuyển sang chế độ Break (Nghỉ ngơi) và bắt đầu đếm ngược ngay lập tức.
  - **Nút điều khiển:** Hỗ trợ các chức năng START, PAUSE (kèm logic resume), và RESET.
  - **Click-Area Security:** Đã tối ưu fix lỗi click nhầm. Chỉ các khu vực nút bấm mới có tác dụng (pointer-events-auto), vùng trống xung quanh bị vô hiệu hóa để không bị dính click vào link YouTube ẩn.

---

## 4. LOGIC KI & HỆ THỐNG CÀY CUỐC (GAMIFICATION)
Đây là "linh hồn" của ứng dụng, sử dụng `localStorage` để lưu trữ dữ liệu vĩnh viễn cho người dùng.

- **Tỷ lệ quy đổi:** `1 phút tập trung thực tế = 1 điểm KI`.
- **Hệ thống Tiến hóa (Transformation):**
  - **Cấp 1 (Base -> SSJ1):** Cần tích lũy đủ `240 phút` (4 tiếng) Focus.
  - **Cấp tiếp theo:** Thời gian yêu cầu gấp đôi cấp độ trước đó (Ví dụ: Cấp 2 cần 8h, Cấp 3 cần 16h...).
- **Hệ thống Ngọc Rồng (Dragon Balls):**
  - Tích lũy đủ `600 phút` (10 tiếng) Focus = Nhận được 1 viên Ngọc Rồng.
  - **Mục tiêu:** Thu thập đủ 7 viên Ngọc Rồng để có thể "Call Shenron" (triệu hồi rồng thần).
- **Thống kê Dashboard (Stats UI):** Nằm ngay dưới thanh KI, hiển thị:
  - `TOTAL TRAINING`: Tổng thời gian đã luyện tập từ ngày đầu tiên sử dụng app (định dạng H:M:S).
  - `To Transform`: Đếm ngược số phút Focus còn lại để đạt được form tiến hóa mới.
  - `To Next Ball`: Đếm ngược số phút Focus còn lại để nhận được viên Ngọc Rồng tiếp theo.

---

## 5. HỆ THỐNG ÂM NHẠC (COMMAND CENTER)
- **Tích hợp YouTube API:** Ứng dụng chạy một trình phát IFrame ẩn bên trong.
- **Cơ chế HUD:** 
  - Mặc định ban đầu thu gọn thành một Logo YouTube nhỏ ở góc để tiết kiệm diện tích giao diện.
  - Khi **Click vào logo** -> Giao diện mở rộng thành thanh "NOW PLAYING", hiển thị tiêu đề video đang phát chạy chữ (Marquee) vô tận, không có khoảng trống gián đoạn.
  - Khi **Click icon Expand** -> Mở Command Center (Modal Popover) nằm chính giữa màn hình.
- **Tính năng Command Center:**
  - Dán trực tiếp link YouTube để Add to Queue (thêm vào danh sách chờ).
  - **Autoplay:** Tự động chuyển phát bài tiếp theo trong Queue khi bài hiện tại kết thúc.
  - **Playlist Management:** Hỗ trợ "Save Playlist" (đặt tên và lưu cục bộ vào localStorage) và "View Queue".
  - **Up Next:** Hiển thị preview tiêu đề của video/bài hát tiếp theo sẽ phát.
  - Thao tác đóng Modal nhanh bằng phím `Esc` hoặc click ra ngoài vùng Modal.

---

## 6. LOGIC KỸ THUẬT ĐẶC BIỆT
- **Drive Image Parser:** Hệ thống tự động nhận diện các URL Google Drive mà người dùng cung cấp (có thể dán vào phần Settings hoặc Database) và parse thành định dạng link direct image (`lh3.googleusercontent.com/u/0/d/ID...`) để có thể hiển thị làm background/model trực tiếp trên web mà không bị lỗi CORS hay yêu cầu quyền truy cập.
- **Transformation Visuals:** Thiết lập sẵn logic hiển thị trực quan cả 2 Avatar: Form hiện tại (bên trái thanh KI) và Form mục tiêu kế tiếp (bên phải thanh KI). Điều này tạo động lực thị giác mạnh mẽ, kích thích người dùng "gồng" để đạt được cấp độ tiếp theo.
