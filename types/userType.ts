export interface UserBMSType {
  id: string | null;
  username: string | null;
  full_name: string | null;
  company_id: string | null;
  company_name: string | null;
  role: string | null;
  access_token: string | null;
  refresh_token: string | null;
  expires_in: number | null;
}

export interface UserActionType {
  id: string;
  full_name: string;
  username: string;
  company_id: string;
  office_id?: number | null ;
}
