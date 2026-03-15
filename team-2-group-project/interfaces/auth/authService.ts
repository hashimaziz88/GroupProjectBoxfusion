export interface IAuthenticateRequest {
  userNameOrEmailAddress?: string | null;
  password?: string | null;
  rememberClient?: boolean | null;
}

export interface IAuthenticateResponse {
  accessToken: string;
  encryptedAccessToken: string;
  expireInSeconds: number;
  userId: number;
}

export interface IRegisterRequest {
  name?: string | null;
  surname?: string | null;
  userName?: string | null;
  emailAddress?: string | null;
  password?: string | null;
}

export interface IRegisterResponse {
  canLogin: boolean;
}
