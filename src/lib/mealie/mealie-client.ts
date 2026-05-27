import type { RecipeResponse } from "./recipe-types.ts";

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
  recipeCrud: "/api/recipes",
} as const;

export const DEFAULT_HEADERS = {
  "Content-Type": "application/x-www-form-urlencoded",
  Accept: "application/json",
} as const;

export class MealieClient {
  private authInfo: AuthInfo;
  private apiInfo: ApiInfo;
  private accessToken: string | null = null;

  constructor(apiInfo: ApiInfo, authInfo: AuthInfo) {
    this.authInfo = authInfo;
    this.apiInfo = apiInfo;
  }

  public BuildUrl(endpoint: string): string {
    return `${this.apiInfo.baseUrl}:${this.apiInfo.port}${endpoint}`;
  }

  public async Login() {
    if (this.accessToken !== null) {
      return;
    }

    const url = this.BuildUrl(MealieEndpoints.login);
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
  }

  public async GetRecipes(): Promise<RecipeResponse> {
    await this.Login();
    const url = this.BuildUrl(MealieEndpoints.recipeCrud);
    const preResponse = await fetch(url, {
      method: "GET",
      headers: await this.AuthorizedDefaultHeader(),
    });
    return await preResponse.json();
  }

  public async AuthHeader(): Promise<Record<string, string>> {
    await this.Login();

    return { Authorization: `Bearer ${this.accessToken}` };
  }

  public async AuthorizedDefaultHeader(): Promise<Record<string, string>> {
    return {
      ...DEFAULT_HEADERS,
      ...(await this.AuthHeader()),
    };
  }
}
