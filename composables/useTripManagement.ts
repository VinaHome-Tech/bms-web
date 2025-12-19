import type { DTO_RQ_UpdateTrip, TripType } from "~/types/tripType";
import { startOfDay, format } from "date-fns";
// import {
//   getListTripByRouteAndDate,
//   updateTripInformation,
// } from "~/api/tripAPI";
import type { UserActionType } from "~/types/userType";
export const selectedTrip = ref<TripType | null>(null);
export const tripList = ref<TripType[]>([]);
export const useTripManagement = () => {
  
  const useUserStore = userStore();
  const loadingListTrip = ref(false);
  // const selectedTrip = ref<TripType | null>(null);
  const dialogFormEditTripInformation = ref(false);
  const loadingFormEditTripInformation = ref(false);
  const handleOpenFormEditTripInformation = () => {
    dialogFormEditTripInformation.value = true;
    console.log("Mở form chỉnh sửa thông tin chuyến:", selectedTrip.value);
  };
  const handleClosedDialogdialogFormEditTripInformation = () => {
    dialogFormEditTripInformation.value = false;
  };

  const handleUpdateTripInformation = async (trip: DTO_RQ_UpdateTrip) => {
    console.log("Cập nhật thông tin chuyến:", trip);
    loadingFormEditTripInformation.value = true;
    try {
      // const response = await updateTripInformation(
      //   trip.trip_id,
      //   {
      //     id: useUserStore.id,
      //     username: useUserStore.username,
      //     full_name: useUserStore.full_name,
      //     company_id: useUserStore.company_id,
      //   } as UserActionType,
      //   trip
      // );
      // if (response.success) {
      //   ElNotification({
      //     message: h(
      //       "p",
      //       { style: "color: green" },
      //       "Cập nhật thông tin chuyến thành công!"
      //     ),
      //     type: "success",
      //   });
      //   if (response.result) {
      //     const updatedTripData = response.result || trip;
      //     tripList.value = tripList.value.map((t) =>
      //       t.trip_id === trip.trip_id ? { ...t, ...updatedTripData } : t
      //     );
      //     if (
      //       selectedTrip.value &&
      //       selectedTrip.value.trip_id === trip.trip_id
      //     ) {
      //       selectedTrip.value = { ...selectedTrip.value, ...updatedTripData };
      //     }
      //   }
      // } else {
      //   ElNotification({
      //     message: h(
      //       "p",
      //       { style: "color: red" },
      //       response.message || "Cập nhật thông tin chuyến thất bại!"
      //     ),
      //     type: "error",
      //   });
      // }
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin chuyến:", error);
      ElNotification({
        message: h(
          "p",
          { style: "color: red" },
          "Đã xảy ra lỗi khi cập nhật thông tin chuyến!"
        ),
        type: "error",
      });
    } finally {
      loadingFormEditTripInformation.value = false;
      dialogFormEditTripInformation.value = false;
    }
  };

  const fetchListTripByRouteAndDate = async (
    valueDate: string | Date | undefined,
    valueRoute: number | string,
    companyId: string
  ) => {
    if (!valueDate || valueDate === "" || valueDate === undefined) {
      ElNotification({
        message: h("p", { style: "color: teal" }, "Vui lòng chọn ngày!"),
        type: "warning",
      });
      return;
    }
    if (!valueRoute || valueRoute === "" || valueRoute === undefined) {
      ElNotification({
        message: h("p", { style: "color: teal" }, "Vui lòng chọn tuyến!"),
        type: "warning",
      });
      return;
    }
    const normalizedDate = format(startOfDay(valueDate as Date), "yyyy-MM-dd");
    loadingListTrip.value = true;
    try {
      // const response = await getListTripByRouteAndDate(
      //   normalizedDate,
      //   valueRoute,
      //   companyId
      // );
      // if (response.success) {
      //   console.log("Danh sách chuyến:", tripList.value);
      //   if (response.result) {
      //     tripList.value = response.result;
      //   } else {
      //     tripList.value = [];
      //     ElNotification({
      //       message: h(
      //         "p",
      //         { style: "color: teal" },
      //         "Không có chuyến nào trong ngày này!"
      //       ),
      //       type: "info",
      //     });
      //   }
      // } else {
      //   ElNotification({
      //     message: h(
      //       "p",
      //       { style: "color: red" },
      //       response.message || "Không thể tải danh sách chuyến!"
      //     ),
      //     type: "error",
      //   });
      //   tripList.value = [];
      // }
    } catch (error) {
      console.error("Error fetching trips:", error);
      ElNotification({
        message: h(
          "p",
          { style: "color: red" },
          "Đã xảy ra lỗi khi tải danh sách chuyến!"
        ),
        type: "error",
      });
      tripList.value = [];
    } finally {
      loadingListTrip.value = false;
    }
  };

  // const handleTripSelected = async (trip: TripType) => {
  //   // Logic từ handleTripSelected()
  // };

  // const updateTicketsBookedInTrip = () => {
  //   // Logic từ updateTicketsBookedInTrip()
  // };

  return {
    // tripList,
    // selectedTrip,
    loadingListTrip,
    fetchListTripByRouteAndDate,
    // handleTripSelected,
    // updateTicketsBookedInTrip,
    dialogFormEditTripInformation,
    loadingFormEditTripInformation,
    handleOpenFormEditTripInformation,
    handleClosedDialogdialogFormEditTripInformation,
    handleUpdateTripInformation,
  };
};
