export interface LLMGenerateParams {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  status: 'NOT_CONFIGURED' | 'SUCCESS' | 'ERROR';
  content?: string;
  error?: string;
}

export class LLMProviderService {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.LLM_API_KEY;
  }

  public generate(params: LLMGenerateParams): LLMResponse {
    if (!this.apiKey) {
      return {
        status: 'NOT_CONFIGURED',
        error: `LLM provider API key is not configured for prompt: ${params.prompt.slice(0, 10)}...`,
      };
    }

    return {
      status: 'NOT_CONFIGURED',
      error: 'LLM direct integration disabled in foundation phase.',
    };
  }
}
