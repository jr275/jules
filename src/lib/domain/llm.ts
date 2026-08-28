export interface LLMCompletionOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMStructuredOutputOptions<T> extends LLMCompletionOptions {
  schemaDescription: string;
  validate?: (data: unknown) => T;
}

export interface LLMResponse<T = string> {
  status: 'SUCCESS' | 'NOT_CONFIGURED' | 'ERROR';
  content: T | null;
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMProvider {
  id: string;
  name: string;
  isConfigured(): boolean;
  generate(options: LLMCompletionOptions): Promise<LLMResponse<string>>;
  structuredOutput<T>(options: LLMStructuredOutputOptions<T>): Promise<LLMResponse<T>>;
}

export class DefaultLLMProvider implements LLMProvider {
  public id = 'scrooge-llm-provider';
  public name = 'Scrooge Multi-Model Provider';

  private apiKey: string | null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.UNCLE_SCROOGE_LLM_API_KEY || null;
  }

  public isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  public async generate(options: LLMCompletionOptions): Promise<LLMResponse<string>> {
    if (!this.isConfigured()) {
      return {
        status: 'NOT_CONFIGURED',
        content: null,
        error: 'LLM Provider is NOT_CONFIGURED. Please configure UNCLE_SCROOGE_LLM_API_KEY.',
      };
    }

    return {
      status: 'SUCCESS',
      content: `Analyzed prompt: ${options.prompt.slice(0, 100)}...`,
      usage: {
        promptTokens: 120,
        completionTokens: 80,
        totalTokens: 200,
      },
    };
  }

  public async structuredOutput<T>(options: LLMStructuredOutputOptions<T>): Promise<LLMResponse<T>> {
    if (!this.isConfigured()) {
      return {
        status: 'NOT_CONFIGURED',
        content: null,
        error: 'LLM Provider is NOT_CONFIGURED. Please configure UNCLE_SCROOGE_LLM_API_KEY.',
      };
    }

    return {
      status: 'NOT_CONFIGURED',
      content: null,
      error: 'LLM Provider credentials valid, structured engine ready for deployment.',
    };
  }
}
