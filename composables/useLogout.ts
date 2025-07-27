export const useLogout = () => {
  const useUserStore = userStore();
  const cookieAccessToken = useCookie("access_token");

  const handleLogout = () => {
    ElNotification({
      message: h("p", { style: "color: teal" }, "Đăng xuất thành công!"),
      type: "success",
    });
    cookieAccessToken.value = null;
    useUserStore.resetUserInfo();
    navigateTo("/");
  };

  return {
    handleLogout,
  };
};
