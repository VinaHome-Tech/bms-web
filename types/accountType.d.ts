export interface AccountType {
  id: string;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  username: string;
  full_name: string;
  company_id: number;
  role: string;
}
export interface UserInfoType {
  id: string;
  username: string;
  full_name: string;
  company_id: number;
  role: string;
  refresh_token: string;
  expires_in: number;
}

export interface ChangePasswordType {
  user_id: string;
  old_password: string | null;
  new_password: string | null;
  confirm_password: string | null;
}
export interface ChangePasswordStaffType {
  user_id: string | null;
  new_password: string | null;
  confirm_password: string | null;
}

export interface AccountSettingType {
  id: string;
  phone: string;
  email: string;
  name: string;
  address: string;
  date_of_birth: Date | null;
  gender: string | null;
}