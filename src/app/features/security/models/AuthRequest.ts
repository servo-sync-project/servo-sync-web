export interface LoginUserRequest{
    email:string,
    password: string,
}

export interface RefreshTokenRequest{
    unique_token: string
}
    

export interface RegisterUserRequest{
    email: string
    username: string
    password: string
}

export interface SendEmailRequest{
    email: string
}

export interface EmailVerificationRequest{
    verification_uuid: string
}

export interface PasswordResetRequest{
    verification_uuid: string | null
    password: string
}