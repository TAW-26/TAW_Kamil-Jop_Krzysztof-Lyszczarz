export interface LoginResponse {
    token : string;
    user: {
        id: string;
        username: string;
        email: string;
        role : string;
    }
}

export interface IToken {
    token : string;
}

export interface RegisterDto {
    username: string;
    email: string;
    password: string;
}

export interface LoginDto {
    email: string;
    password: string;
}