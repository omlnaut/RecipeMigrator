export interface AuthInfo {
  username: string;
  password: string;
}

export interface ApiInfo {
  baseUrl: string;
  port: number;
}

const MealieEndpoints = {
  login: "/api/auth/token",
} as const;

export class MealieClient {
  private authInfo: AuthInfo;
  private apiInfo: ApiInfo;
  private accessToken: string | null = null;

  constructor(apiInfo: ApiInfo, authInfo: AuthInfo) {
    this.authInfo = authInfo;
    this.apiInfo = apiInfo;
  }

  public async Login() {
    const url = `${this.apiInfo.baseUrl}:${this.apiInfo.port}${MealieEndpoints.login}`;
    const payload = new URLSearchParams({
      username: this.authInfo.username,
      password: this.authInfo.password,
      remember_me: "false",
    });

    const preResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        accept: "application/json",
      },
      body: payload,
    });

    const jsonResponse = await preResponse.json();

    this.accessToken = jsonResponse["access_token"];

    console.log(`Successfully fetched token ${this.accessToken}`);
  }
}
