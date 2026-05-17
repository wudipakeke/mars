import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface FeishuTokenResponse {
  code: number;
  msg: string;
  data: { access_token: string };
}

interface FeishuUserResponse {
  code: number;
  msg: string;
  data: { open_id: string; name: string; avatar_url: string };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private jwtService: JwtService) {}

  /** 飞书 OAuth 授权地址 */
  getFeishuAuthUrl(app?: string): string {
    const isTerra = app === 'terra';
    const appId = isTerra ? process.env.FEISHU_APP_ID_TERRA : process.env.FEISHU_APP_ID;
    const redirectUri = encodeURIComponent(
      isTerra ? (process.env.FEISHU_REDIRECT_URI_TERRA || '') : (process.env.FEISHU_REDIRECT_URI || ''),
    );
    const state = Math.random().toString(36).slice(2);
    return `https://open.feishu.cn/open-apis/authen/v1/index?redirect_uri=${redirectUri}&app_id=${appId}&state=${state}`;
  }

  /** 用 code 换 token，再拿 token 换用户信息 */
  async feishuLogin(code: string, app?: string): Promise<{
    token: string;
    user: { openId: string; name: string; avatar: string };
  }> {
    const isTerra = app === 'terra';
    const appId = isTerra ? process.env.FEISHU_APP_ID_TERRA : process.env.FEISHU_APP_ID;
    const appSecret = isTerra ? process.env.FEISHU_APP_SECRET_TERRA : process.env.FEISHU_APP_SECRET;

    // 1. 换取 access_token
    const tokenRes = await fetch(
      'https://open.feishu.cn/open-apis/authen/v1/access_token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          code,
          app_id: appId,
          app_secret: appSecret,
        }),
      },
    );
    const tokenData = (await tokenRes.json()) as FeishuTokenResponse;
    if (tokenData.code !== 0) {
      throw new Error(`飞书 token 换取失败: ${tokenData.msg}`);
    }

    const accessToken = tokenData.data.access_token;

    // 2. 获取用户信息
    const userRes = await fetch(
      'https://open.feishu.cn/open-apis/authen/v1/user_info',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    const userData = (await userRes.json()) as FeishuUserResponse;
    if (userData.code !== 0) {
      throw new Error(`飞书用户信息获取失败: ${userData.msg}`);
    }

    const user = {
      openId: userData.data.open_id,
      name: userData.data.name,
      avatar: userData.data.avatar_url || '',
    };

    // 3. 签发 JWT
    const token = this.jwtService.sign(user, { expiresIn: '7d' });
    return { token, user };
  }
}
