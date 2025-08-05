import { getListRouteNameActionByCompany } from "~/api/routeAPI";
import type { DTO_RP_ListRouteName } from "~/types/routeType";

export const useRouteSelection = () => {
  const routeNames = ref<DTO_RP_ListRouteName[]>([]);
  const loadingListRouteName = ref(false);
  const valueSelectedRoute = ref<number | string>("");

  const fetchListRouteName = async (company_id: string) => {
    loadingListRouteName.value = true;
    try {
      const response = await getListRouteNameActionByCompany(company_id);
      if (response.success) {
        if (response.result) {
          console.log("Danh sách tuyến:", response.result);
          routeNames.value = response.result;
          //   if (routeNames.value.length > 0) {
          //     valueSelectedRoute.value = routeNames.value[0].id;
          //   }
        }
      } else {
        ElNotification({
          message: h(
            "p",
            { style: "color: red" },
            response.message || "Không thể tải danh sách tuyến!"
          ),
          type: "error",
        });
      }
    } catch (error) {
      ElNotification({
        message: h(
          "p",
          { style: "color: red" },
          "Đã xảy ra lỗi khi tải danh sách tuyến!"
        ),
        type: "error",
      });
      console.error("Error fetching route names:", error);
    } finally {
      loadingListRouteName.value = false;
    }
  };

  const handleRouteChange = (id: number) => {
    const selectedRoute = routeNames.value.find((r) => r.id === id);
    valueSelectedRoute.value = selectedRoute ? selectedRoute.id : "";
    console.log("Tuyến được chọn:", selectedRoute);
    console.log("ID tuyến:", valueSelectedRoute.value);
  };

  return {
    routeNames,
    loadingListRouteName,
    valueSelectedRoute,
    fetchListRouteName,
    handleRouteChange,
  };
};
