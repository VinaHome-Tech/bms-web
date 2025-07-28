export interface OfficeType {
  id: number | null;
  name: string | null;
  code: string | null;
  address: string | null;
  note: string | null;
  status: boolean;
  created_at: Date | null;
  phones: OfficePhoneType[];
}

export interface DTO_RQ_Office {
  name: string | null;
  code: string | null;
  address: string | null;
  note: string | null;
  status: boolean;
  phones: OfficePhoneType[];
}
export interface DTO_RP_Office_2 {
  id: number;
  name: string;
  code: string;
  address: string;
  note: string;
  status: boolean;
  phones: DTO_RP_OfficePhone[];
  company_id: number;
  company_name: string;
  company_code: string;
}
export interface OfficePhoneType {
  id: number | null;
  phone: string | null;
  type: string;
}
export interface OfficeStoreType{
  id: number | null;
  name: string | null;
}