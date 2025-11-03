// Dữ liệu mock danh sách trạng thái liên hệ
export const mockTicketContactStatusList = [
  { id: 1, label: 'Chưa gọi' },
  { id: 2, label: 'Phòng vé đã gọi' },
  { id: 3, label: 'Phòng vé gọi không nghe' },
  { id: 4, label: 'Tài xế đã gọi' },
  { id: 5, label: 'Tài xế gọi không nghe' },
  { id: 6, label: 'Số điện thoại không đúng' },
  { id: 7, label: 'Đã gọi cho tài xế' },
  { id: 8, label: 'Thuê bao không gọi được' },
  { id: 9, label: 'Tài xế báo hủy' },
  { id: 10, label: 'Đã nhận tin' },
  { id: 11, label: 'Đã nhận tin trung chuyển' },
  { id: 12, label: 'Sai địa chỉ đón' },
  { id: 13, label: 'Chuyển chuyến khác' },
];

// Danh sách mock các hành động vé
export const mockTicketActList = [
  { code: 'UPDATE', label: 'Cập nhật' },
  { code: 'COPY', label: 'Sao chép' },
  { code: 'MOVE', label: 'Di chuyển' },
  { code: 'UPDATE_CONTACT', label: 'Liên hệ' },
  { code: 'CANCEL', label: 'Huỷ vé' },
];
