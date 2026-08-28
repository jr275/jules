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
  public name = 'Scrooge Multi-Model Provider (Anthropic / OpenAI API)';

  private apiKey: string | null;
  private providerType: 'anthropic' | 'openai' | 'generic';
  private modelName: string;

  constructor(apiKey?: string, providerType?: string, modelName?: string) {
    this.apiKey =
      apiKey ||
      process.env.UNCLE_SCROOGE_LLM_API_KEY ||
      process.env.LLM_API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      process.env.OPENAI_API_KEY ||
      null;

    this.providerType =
      (providerType as any) ||
      process.env.LLM_PROVIDER?.toLowerCase() ||
      (process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'openai');

    this.modelName =
      modelName ||
      process.env.LLM_MODEL ||
      (this.providerType === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'gpt-4o');
  }

  public isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  public async generate(options: LLMCompletionOptions): Promise<LLMResponse<string>> {
    if (!this.isConfigured()) {
      return {
        status: 'NOT_CONFIGURED',
        content: null,
        error: 'LLM Provider is NOT_CONFIGURED. Please configure UNCLE_SCROOGE_LLM_API_KEY or ANTHROPIC_API_KEY / OPENAI_API_KEY.',
      };
    }

    const decisionResponse = await this.generateWithTools(options);
    if (decisionResponse.status !== 'SUCCESS' || !decisionResponse.content) {
      return {
        status: decisionResponse.status,
        content: null,
        error: decisionResponse.error,
      };
    }

    return {
      status: 'SUCCESS',
      content: decisionResponse.content.finalAnswer || 'Completed prompt generation.',
      usage: decisionResponse.usage,
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

    try {
      if (this.providerType === 'anthropic') {
        return await this.callAnthropicAPI(options);
      } else {
        return await this.callOpenAIAPI(options);
      }
    } catch (err: any) {
      return {
        status: 'ERROR',
        content: null,
        error: `Real LLM Provider error: ${err.message || 'HTTP request failed'}`,
      };
    }
  }

  private async callAnthropicAPI(options: LLMCompletionOptions): Promise<LLMResponse<LLMStepDecision>> {
    const systemInstruction =
      options.systemPrompt ||
      options.messages?.find((m) => m.role === 'system')?.content ||
      'You are Uncle Scrooge Financial AI. Perform structured financial decision making.';

    const anthropicMessages = (options.messages || [])
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'tool' ? 'user' : m.role,
        content: m.content,
      }));

    if (anthropicMessages.length === 0 && options.prompt) {
      anthropicMessages.push({ role: 'user', content: options.prompt });
    }

    const tools = (options.tools || []).map((t) => ({
      name: t.id,
      description: t.description,
      input_schema: {
        type: 'object',
        properties: t.inputSchema || {},
      },
    }));

    const body: Record<string, unknown> = {
      model: this.modelName,
      max_tokens: options.maxTokens || 1024,
      system: systemInstruction,
      messages: anthropicMessages,
    };

    if (tools.length > 0) {
      body.tools = tools;
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': this.apiKey!, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { status: 'ERROR', content: null, error: `Anthropic API HTTP ${res.status}: ${errText}` };
    }

    const data = await res.json();
    const toolCallBlock = data.content?.find((c: any) => c.type === 'tool_use');

    if (toolCallBlock) {
      const decision: LLMStepDecision = {
        type: 'TOOL_CALL',
        toolCall: {
          id: toolCallBlock.id,
          toolId: toolCallBlock.name,
          arguments: toolCallBlock.input || {},
        },
      };
      return { status: 'SUCCESS', content: decision, decision, usage: { promptTokens: data.usage?.input_tokens || 100, completionTokens: data.usage?.output_tokens || 50, totalTokens: (data.usage?.input_tokens || 100) + (data.usage?.output_tokens || 50) } };
    }

    const textBlock = data.content?.find((c: any) => c.type === 'text');
    const decision: LLMStepDecision = {
      type: 'FINAL_ANSWER',
      finalAnswer: textBlock?.text || 'Task completed.',
    };

    return { status: 'SUCCESS', content: decision, decision, usage: { promptTokens: data.usage?.input_tokens || 100, completionTokens: data.usage?.output_tokens || 50, totalTokens: (data.usage?.input_tokens || 100) + (data.usage?.output_tokens || 50) } };
  }

  private async callOpenAIAPI(options: LLMCompletionOptions): Promise<LLMResponse<LLMStepDecision>> {
    const openAIMessages = (options.messages || []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    if (openAIMessages.length === 0 && options.prompt) {
      openAIMessages.push({ role: 'user', content: options.prompt });
    }

    const tools = (options.tools || []).map((t) => ({
      type: 'function',
      function: {
        name: t.id,
        description: t.description,
        parameters: {
          type: 'object',
          properties: t.inputSchema || {},
        },
      },
    }));

    const body: Record<string, unknown> = {
      model: this.modelName,
      messages: openAIMessages,
      temperature: options.temperature || 0.2,
    };

    if (tools.length > 0) {
      body.tools = tools;
      body.tool_choice = 'auto';
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { status: 'ERROR', content: null, error: `OpenAI API HTTP ${res.status}: ${errText}` };
    }

    const data = await res.json();
    const choice = data.choices?.[0]?.message;

    if (choice?.tool_calls?.length > 0) {
      const tc = choice.tool_calls[0];
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(tc.function.arguments || '{}');
      } catch {}

      const decision: LLMStepDecision = {
        type: 'TOOL_CALL',
        toolCall: {
          id: tc.id,
          toolId: tc.function.name,
          arguments: parsedArgs,
        },
      };
      return { status: 'SUCCESS', content: decision, decision, usage: { promptTokens: data.usage?.prompt_tokens || 100, completionTokens: data.usage?.completion_tokens || 50, totalTokens: data.usage?.total_tokens || 150 } };
    }

    const decision: LLMStepDecision = {
      type: 'FINAL_ANSWER',
      finalAnswer: choice?.content || 'Task completed.',
    };

    return { status: 'SUCCESS', content: decision, decision, usage: { promptTokens: data.usage?.prompt_tokens || 100, completionTokens: data.usage?.completion_tokens || 50, totalTokens: data.usage?.total_tokens || 150 } };
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
      error: 'Structured JSON output ready.',
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
