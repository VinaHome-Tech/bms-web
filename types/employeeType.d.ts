export interface EmployeeType  {
    id: string | null;
    username: string | null;
    phone: string | null;
    name: string | null;
    email: string | null;
    address: string | null;
    date_of_birth: Date | null;
    gender: string;
    status: boolean;
    role: string;
    accept_app: Accept_App;
}

export interface DTO_RQ_Employee {
    username: string | null;
    password: string | null;
    phone: string | null;
    name: string | null;
    email: string | null;
    address: string | null;
    date_of_birth: Date | null;
    gender: string | null;
    status: boolean;
    role: string | null;
    accept_app: Accept_App;
}
export interface Accept_App {
    bms: boolean;
    cms: boolean;
    driver: boolean;
}

export interface DriverType {
    id: string;
    name: string;
    phone: string;
}
 
export interface AssistantType {
    id: string;
    name: string;
    phone: string;
}