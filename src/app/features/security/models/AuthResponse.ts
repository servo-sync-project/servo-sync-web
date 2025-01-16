import { UserResponse } from "./UserResponse";

export interface AuthResponse{
    access_token: string,
    unique_token: string,
    user: UserResponse,
}

export interface AuthResponseForRefresh{
    access_token: string,
    user: UserResponse,
}