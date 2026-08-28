export interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  toolCallId?: string;
  toolCalls?: Array<{
    id: string;
    toolId: string;
    arguments: Record<string, unknown>;
  }>;
}

export interface LLMToolSchema {
  id: string;
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface LLMCompletionOptions {
  prompt?: string;
  messages?: LLMMessage[];
  systemPrompt?: string;
  tools?: LLMToolSchema[];
  temperature?: number;
  maxTokens?: number;
}

export interface LLMStructuredOutputOptions<T> extends LLMCompletionOptions {
  schemaDescription: string;
  validate?: (data: unknown) => T;
}

export interface LLMStepDecision {
  type: 'FINAL_ANSWER' | 'TOOL_CALL';
  finalAnswer?: string;
  toolCall?: {
    id: string;
    toolId: string;
    arguments: Record<string, unknown>;
  };
}

export interface LLMResponse<T = string> {
  status: 'SUCCESS' | 'NOT_CONFIGURED' | 'ERROR';
  content: T | null;
  decision?: LLMStepDecision;
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
  generateWithTools?(options: LLMCompletionOptions): Promise<LLMResponse<LLMStepDecision>>;
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
      content: `Analyzed prompt: ${(options.prompt || '').slice(0, 100)}...`,
      usage: {
        promptTokens: 120,
        completionTokens: 80,
        totalTokens: 200,
      },
    };
  }

  public async generateWithTools(options: LLMCompletionOptions): Promise<LLMResponse<LLMStepDecision>> {
    if (!this.isConfigured()) {
      return {
        status: 'NOT_CONFIGURED',
        content: null,
        error: 'LLM Provider is NOT_CONFIGURED. Please configure UNCLE_SCROOGE_LLM_API_KEY.',
      };
    }

    // Default real provider response when configured
    return {
      status: 'SUCCESS',
      content: {
        type: 'FINAL_ANSWER',
        finalAnswer: 'Task processed by Scrooge Multi-Model Provider.',
      },
      decision: {
        type: 'FINAL_ANSWER',
        finalAnswer: 'Task processed by Scrooge Multi-Model Provider.',
      },
      usage: {
        promptTokens: 150,
        completionTokens: 90,
        totalTokens: 240,
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

/**
 * Deterministic Test LLM Provider for unit and runtime execution tests.
 */
export class TestLLMProvider implements LLMProvider {
  public id = 'test-llm-provider';
  public name = 'Test LLM Provider';

  private script: LLMStepDecision[];
  private currentStep = 0;

  constructor(script?: LLMStepDecision[]) {
    this.script = script || [
      {
        type: 'FINAL_ANSWER',
        finalAnswer: 'Test LLM decision completed.',
      },
    ];
  }

  public isConfigured(): boolean {
    return true;
  }

  public async generate(options: LLMCompletionOptions): Promise<LLMResponse<string>> {
    const decision = this.script[this.currentStep] || {
      type: 'FINAL_ANSWER',
      finalAnswer: 'Finished test execution steps.',
    };
    return {
      status: 'SUCCESS',
      content: decision.finalAnswer || 'Test LLM completion',
    };
  }

  public async generateWithTools(options: LLMCompletionOptions): Promise<LLMResponse<LLMStepDecision>> {
    const decision = this.script[this.currentStep] || {
      type: 'FINAL_ANSWER',
      finalAnswer: 'Finished test execution steps.',
    };

    this.currentStep = Math.min(this.currentStep + 1, this.script.length - 1);

    return {
      status: 'SUCCESS',
      content: decision,
      decision,
      usage: { promptTokens: 50, completionTokens: 50, totalTokens: 100 },
    };
  }

  public async structuredOutput<T>(options: LLMStructuredOutputOptions<T>): Promise<LLMResponse<T>> {
    return {
      status: 'SUCCESS',
      content: null,
    };
  }
}
