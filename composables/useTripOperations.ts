/* eslint-disable @typescript-eslint/no-explicit-any */
import { changeTimeTrip, confirmationDepart, deleteTrip, updateNote } from "~/api/tripAPI";
import type { DTO_RQ_ChangeTimeTrip } from "~/types/tripType";
import { ElMessageBox } from 'element-plus'
import { selectedTrip, tripList } from './useTripManagement';
import { getTicketsByTripToPrint } from "~/api/ticketAPI";
import type { DTO_RP_TicketsToPrint } from "~/types/ticketType";

export const useTripOperations = () => {
  const dialogChangeTimeTrip = ref(false);
  const loadingFormChangeTimeTrip = ref(false);
  const handleOpenChangeTimeDialog = () => {
    dialogChangeTimeTrip.value = true;
  };
  const handleUpdateTimeTrip = async (data: DTO_RQ_ChangeTimeTrip) => {
    console.log("Data to update:", data);
    loadingFormChangeTimeTrip.value = true;
    try {
      const response = await changeTimeTrip(data);
      if (response.success) {
        notifySuccess("Cập nhật thời gian chuyến đi thành công");
        if (response.result) {
          if (selectedTrip.value) {
            selectedTrip.value = {
              ...selectedTrip.value,
              departure_time: response.result.departure_time,
            };
            tripList.value = tripList.value.map((t) =>
              t.trip_id === selectedTrip.value?.trip_id
                ? { ...t, departure_time: response.result?.departure_time ?? t.departure_time }
                : t
            );
          }
        }
        dialogChangeTimeTrip.value = false;
      } else {
        notifyError("Cập nhật thời gian chuyến đi thất bại");
      }
    } catch (error) {
      console.log(error);
      notifyError("Cập nhật thời gian chuyến đi thất bại");
    } finally {
      loadingFormChangeTimeTrip.value = false;
    }
  }


  const openMessageBoxDeleteTrip = async () => {
    if (!selectedTrip.value) {
      notifyError('Vui lòng chọn chuyến để xoá');
      return;
    }

    try {
      await ElMessageBox.confirm(
        'Bạn có chắc chắn muốn xoá chuyến này không?',
        'Xác nhận xoá chuyến',
        {
          confirmButtonText: 'Xoá',
          cancelButtonText: 'Thoát',
          type: 'warning',
        }
      );
      const response = await deleteTrip(selectedTrip.value.trip_id);

      if (response.success) {
        tripList.value = tripList.value.filter(
          (trip) => trip.trip_id !== selectedTrip.value?.trip_id
        );
        selectedTrip.value = null;
        notifySuccess('Xoá chuyến thành công');
      } else {
        notifyError('Xoá chuyến thất bại');
      }
    } catch (error) {
      if (error === 'cancel') {
        notifyInfo('Đã huỷ thao tác xoá');
      } else {
        console.error('Delete trip error:', error);
        notifyError('Xoá chuyến thất bại');
      }
    }
  }
  const openMessageBoxConfirmationDepart = async () => {
    if (!selectedTrip.value) {
      notifyError('Vui lòng chọn chuyến để xác nhận xuất bến');
      return;
    }

    try {
      await ElMessageBox.confirm(
        'Bạn có chắc chắn muốn xác nhận xuất bến chuyến này không?',
        'Xác nhận xuất bến chuyến',
        {
          confirmButtonText: 'Xác nhận',
          cancelButtonText: 'Thoát',
          type: 'info',
        }
      );
      const response = await confirmationDepart(selectedTrip.value.trip_id);

      if (response.success) {
        tripList.value = tripList.value.map((trip) =>
          trip.trip_id === selectedTrip.value?.trip_id
            ? { ...trip, confirmation_depart: true }
            : trip
        );
        notifySuccess('Xác nhận xuất bến thành công');
      } else {
        notifyError('Xác nhận xuất bến thất bại');
      }
    } catch (error) {
      if (error === 'cancel') {
        notifyInfo('Đã huỷ thao tác xuất bến');
      } else {
        console.error('Delete trip error:', error);
        notifyError('Xác nhận xuất bến thất bại');
      }
    }
  }

  const buildSeatMapHtml = (tickets: DTO_RP_TicketsToPrint[]) => {
    // Group theo floor
    const groupedByFloor = tickets.reduce((acc: any, t: DTO_RP_TicketsToPrint) => {
      if (!acc[ t.seat_floor ]) acc[ t.seat_floor ] = [];
      acc[ t.seat_floor ].push(t);
      return acc;
    }, {});

    let html = "";
    const floors = Object.keys(groupedByFloor).sort((a, b) => Number(a) - Number(b));

    floors.forEach((floor, index) => {
      const seats = groupedByFloor[ floor ];
      const maxRow = Math.max(...seats.map((s: { seat_row: any; }) => s.seat_row));
      const maxCol = Math.max(...seats.map((s: { seat_column: any; }) => s.seat_column));

      // Nếu không phải tầng đầu tiên → ngắt trang
      const pageBreakStyle = index > 0 ? "page-break-before: always;" : "";

      html += `<div style="${pageBreakStyle}">`;
      html += `<h4 style="margin:8px 0;">Tầng ${floor}</h4>`;
      html += `<table style="border-collapse:collapse; margin-bottom:16px; width:100%;">`;

      const cellWidth = (100 / maxCol).toFixed(2) + "%";

      for (let r = 1; r <= maxRow; r++) {
        html += "<tr>";
        for (let c = 1; c <= maxCol; c++) {
          const seat = seats.find((s: { seat_row: number; seat_column: number; }) => s.seat_row === r && s.seat_column === c);
          if (seat) {
            html += `
            <td style="
              border:1px solid #333;
              width:${cellWidth};
              height:100px;
              vertical-align:top;
              font-size:11px;
              padding:2px;
              background:${seat.booked_status ? "#fecaca" : "#dcfce7"};
            ">
              <div style="font-size:15px;"><b>${seat.seat_name || seat.seat_code}</b></div>
              ${seat.booked_status
                ? `
                <div>KH: ${seat.ticket_customer_name || "-"}</div>
                <div>ĐT: ${seat.ticket_phone || "-"}</div>
                <div>Lên: ${seat.ticket_point_up || "-"}</div>
                <div>Xuống: ${seat.ticket_point_down || "-"}</div>
                <div>Giá: ${seat.ticket_display_price?.toLocaleString() || 0}đ</div>
                <div>TT: ${seat.payment_method || "-"}</div>
                <div>Ghi chú: ${seat.ticket_note || ""}</div>
              `
                : `<div style="color:#555;font-style:italic;"></div>`
              }
            </td>`;
          } else {
            html += `<td style="border:1px solid #ccc; width:${cellWidth}; height:100px;"></td>`;
          }
        }
        html += "</tr>";
      }

      html += "</table>";
      html += `</div>`;
    });

    return html;
  };





  const printTicketListOfTheTrip = async () => {
    if (!selectedTrip.value) {
      notifyWarning('Vui lòng chọn chuyến');
      return;
    }
    try {
      const response = await getTicketsByTripToPrint(selectedTrip.value.trip_id);
      if (response.success) {
        const tickets = response.result || [];

        const html = `
        <html>
          <head>
            <title>Sơ đồ vé chuyến ${selectedTrip.value.route_name}</title>
          </head>
          <body>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
              <div>
                <h2 style="font-size: 14px;">${selectedTrip.value.route_name}</h2>
                <h2 style="font-size: 14px;">
                  ${selectedTrip.value.departure_date
            ? new Date(String(selectedTrip.value.departure_date)).toLocaleDateString('vi-VN')
            : ''} 
                  | ${selectedTrip.value.departure_time}
                </h2>
                <h2 style="font-size: 14px;">${selectedTrip.value.license_plate || ''}</h2>
              </div>
              <div>
                <h2 style="font-size: 14px;">Tài xế: ${selectedTrip.value.driver?.map(d => d.name).join(', ') || ''}</h2>
                <h2 style="font-size: 14px;">Phụ xe: ${selectedTrip.value.assistant?.map(a => a.name).join(', ') || ''}</h2>
              </div>
            </div>
            ${buildSeatMapHtml(tickets)}

            <script>
              window.onafterprint = function() {
                window.close();
              };
            </script>
          </body>
        </html>
      `;

        const printWindow = window.open('', '', 'width=900,height=700');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
      } else {
        notifyError(response.message || 'Lấy dữ liệu in phơi thất bại');
      }
    } catch (error) {
      console.error(error);
      notifyError('Lấy dữ liệu in phơi thất bại');
    }
  };

  const handleUpdateNote = async (newNote: string) => {
    console.log(newNote)
    if (!selectedTrip.value) {
      notifyError("Vui lòng chọn chuyến để cập nhật ghi chú");
      return;
    }
    try {
      const response = await updateNote(selectedTrip.value.trip_id, newNote);
      if (response.success) {
        notifySuccess("Cập nhật ghi chú thành công");
        if(response.result) {
          selectedTrip.value = {
            ...selectedTrip.value,
            note: response.result,
          };
          tripList.value = tripList.value.map((t) =>
            t.trip_id === selectedTrip.value?.trip_id
              ? { ...t, note: response.result ?? t.note }
              : t
          );
        }
      } else {
        notifyError(response.message || "Cập nhật ghi chú thất bại");
      }
    } catch (error) {
      console.log(error)
      notifyError("Cập nhật ghi chú thất bại");
    }
  }


  return {
    dialogChangeTimeTrip,
    loadingFormChangeTimeTrip,
    handleOpenChangeTimeDialog,
    handleUpdateTimeTrip,
    openMessageBoxDeleteTrip,
    openMessageBoxConfirmationDepart,
    printTicketListOfTheTrip,
    handleUpdateNote,
  };
};
