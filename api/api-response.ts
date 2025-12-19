export interface ApiResponse<T> {
    success: boolean;
    message: string;
    statusCode: number;
    result?: T;
}