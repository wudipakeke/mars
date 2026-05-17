import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface DeepseekChoice {
  message?: { content?: string };
}
interface DeepseekUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
interface DeepseekResponse {
  id: string;
  choices: DeepseekChoice[];
  usage?: DeepseekUsage;
}

@Injectable()
export class DeepseekService {
  private readonly baseUrl = 'https://api.deepseek.com/v1';

  constructor(private config: ConfigService) {}

  private get apiKey(): string {
    return this.config.get<string>('DEEPSEEK_API_KEY') || '';
  }

  async chatCompletion(
    messages: { role: string; content: string }[],
    options?: {
      maxTokens?: number;
      temperature?: number;
    },
  ): Promise<DeepseekResponse> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: options?.maxTokens ?? 2048,
        temperature: options?.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`DeepSeek API error: ${err}`);
    }

    return (await res.json()) as DeepseekResponse;
  }
}
