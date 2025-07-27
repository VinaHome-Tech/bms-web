export interface EmployeeType  {
    id: number | null;
    username: string | null;
    password: string | null;
    number_phone: string | null;
    full_name: string | null;
    email: string | null;
    address: string | null;
    date_of_birth: Date | null;
    gender: string;
    status: boolean;
    role: string;
    company_id: number;
    accept_app: Accept_App;
}
export interface Accept_App {
    bms: boolean;
    cms: boolean;
    ams: boolean;
    driver: boolean;
}

export interface DriverType {
    id: number;
    full_name: string;
    number_phone: string;
}
 
export interface AssistantType {
    id: number;
    full_name: string;
    number_phone: string;
}