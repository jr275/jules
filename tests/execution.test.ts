import { describe, it, expect } from 'vitest';
import {
  ExecutionStateMachine,
  OpportunityScorer,
  EconomicValueCalculator,
} from '../src/lib/domain/execution';
import { DefaultLLMProvider } from '../src/lib/domain/llm';
import { InternalEventBus } from '../src/lib/domain/events';

describe('Execution State Machine', () => {
  it('should allow valid transitions', () => {
    expect(ExecutionStateMachine.canTransition('PENDING', 'RUNNING')).toBe(true);
    expect(ExecutionStateMachine.canTransition('RUNNING', 'WAITING_APPROVAL')).toBe(true);
    expect(ExecutionStateMachine.canTransition('WAITING_APPROVAL', 'COMPLETED')).toBe(true);
  });

  it('should throw AppError on invalid transition', () => {
    expect(() => ExecutionStateMachine.transition('COMPLETED', 'RUNNING')).toThrowError(
      "Invalid execution status transition from 'COMPLETED' to 'RUNNING'"
    );
  });
});

describe('Opportunity Scorer', () => {
  it('should compute priority score correctly', () => {
    const score = OpportunityScorer.calculateScore({
      economicImpact: 100000,
      probability: 0.8,
      urgencyMultiplier: 1.5,
      feasibilityMultiplier: 1.0,
      reversibilityMultiplier: 1.0,
      riskPenalty: 0.1,
    });
    expect(score).toBe(108000);
  });
});

describe('Economic Value Calculator', () => {
  it('should compute expected value adjusted by confidence', () => {
    const val = EconomicValueCalculator.calculateExpectedValue({
      amount: 250000,
      currency: 'USD',
      type: 'COST_SAVING',
      confidence: 0.85,
    });
    expect(val).toBe(212500);
  });
});

describe('LLM Provider Abstraction', () => {
  it('should return NOT_CONFIGURED status when API key is missing', async () => {
    const provider = new DefaultLLMProvider('');
    expect(provider.isConfigured()).toBe(false);

    const res = await provider.generate({ prompt: 'Analyze liquidity' });
    expect(res.status).toBe('NOT_CONFIGURED');
    expect(res.content).toBeNull();
  });
});

describe('Internal Event Bus', () => {
  it('should publish and receive domain events', async () => {
    const bus = InternalEventBus.getInstance();
    let received = false;

    bus.subscribe('worker.created', (event) => {
      received = true;
      expect(event.tenantId).toBe('tenant-test');
    });

    await bus.publish({
      id: 'ev-1',
      tenantId: 'tenant-test',
      eventType: 'worker.created',
      resource: 'Worker',
      resourceId: 'w-1',
      actor: 'system',
      payload: {},
      timestamp: new Date(),
    });

    expect(received).toBe(true);
  });
});
