export interface DTO_RP_LoginBMS {
    id: string;
    username: string;
    full_name: string;
    company_name: string;
    company_id: string;
    company_code: string;
    role: string;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at?: number;
}