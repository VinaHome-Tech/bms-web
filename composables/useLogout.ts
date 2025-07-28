export const useLogout = () => {
  const useUserStore = userStore();
  const officeStore = useOfficeStore();
  const cookieAccessToken = useCookie("access_token");

  const handleLogout = () => {
    ElNotification({
      message: h("p", { style: "color: teal" }, "Đăng xuất thành công!"),
      type: "success",
    });
    cookieAccessToken.value = null;
    useUserStore.resetUserInfo();
    officeStore.resetOfficeStore();
    navigateTo("/");
  };

  return {
    handleLogout,
  };
};
