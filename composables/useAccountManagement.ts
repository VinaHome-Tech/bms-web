
// import { changePasswordApi } from "~/api/employeeAPI";
// import type { ChangePasswordType } from "~/types/accountType";

// export const useAccountManagement = () => {
//   const dialogFormChangePassword = ref(false);
//   const loadingChangePassword = ref(false);

//   const handleOpenChangePasswordDialog = () => {
//     dialogFormChangePassword.value = true;
//   };
//   const handleClosedChangePasswordDialog = () => {
//     dialogFormChangePassword.value = false;
//   };
//   const handleSaveChangePasswordDialog = async (data: ChangePasswordType) => {
//     loadingChangePassword.value = true;
//     try {
//       // Call the API to change the password
//       // await changePasswordApi(data);
//       console.log("Password changed successfully", data);
//       const response = await changePasswordApi(data);
//       if (response.success) {
//         ElNotification({
//           message: h(
//             "p",
//             { style: "color: teal" },
//             "Thay đổi mật khẩu thành công!"
//           ),
//           type: "success",
//         });
//       } else {
//         ElNotification({
//           message: h(
//             "p",
//             { style: "color: teal" },
//             response.message || "Thay đổi mật khẩu không thành công!"
//           ),
//           type: "error",
//         });
//       }
//     } catch (error) {
//       console.error("Error changing password:", error);
//     } finally {
//       loadingChangePassword.value = false;
//       dialogFormChangePassword.value = false;
//     }
//   };
//   return {
//     dialogFormChangePassword,
//     loadingChangePassword,
//     handleOpenChangePasswordDialog,
//     handleClosedChangePasswordDialog,
//     handleSaveChangePasswordDialog,
//   };
// };
