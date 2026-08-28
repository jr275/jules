import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PolicyEngine, PolicyRule } from '@/lib/domain/policy';
import { EconomicValueCalculator } from '@/lib/domain/execution';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = 'tenant-northstar-001';
    const organizationId = 'org-northstar-holdings';

    const { agentId = 'agent-cash-flow', inputPrompt, autonomyLevel = 'LEVEL_2_PREPARE' } = body;

    const agent = await prisma.agent.findFirst({
      where: { id: agentId, tenantId },
    });

    const execution = await prisma.execution.create({
      data: {
        tenantId,
        organizationId,
        agentId: agent ? agent.id : null,
        trigger: 'MANUAL_TEST_LAB',
        status: 'RUNNING',
        startedAt: new Date(),
      },
    });

    const stepsData = [];

    // Step 1: Context & Knowledge Assembly
    const step1 = await prisma.executionStep.create({
      data: {
        executionId: execution.id,
        type: 'OBSERVE',
        status: 'SUCCESS',
        startedAt: new Date(),
        completedAt: new Date(),
        metadata: JSON.stringify({
          stepNumber: 1,
          title: 'Context & Knowledge Assembly',
          details: `Retrieved historical liquidity positions from Google Sheets Knowledge Source and live balance vector from Treasury API.`,
          knowledgeSource: 'Google Sheets (Treasury Forecast Q1)',
          recordsMatched: 42,
        }),
      },
    });
    stepsData.push(step1);

    // Step 2: Policy Check using PolicyEngine
    const rules: PolicyRule[] = [
      {
        id: 'POL-002',
        name: 'Treasury Investment Cap Threshold',
        field: 'amount',
        operator: 'GREATER_THAN',
        value: 500000,
        action: 'REQUIRE_APPROVAL',
        requiredRole: 'CFO',
        message: 'Transactions over $500,000 USD require CFO approval.',
      },
    ];

    const polEval = PolicyEngine.evaluate(rules, { amount: 2500000, autonomyLevel });

    const step2 = await prisma.executionStep.create({
      data: {
        executionId: execution.id,
        type: 'POLICY_CHECK',
        status: polEval.action === 'ALLOW' ? 'SUCCESS' : 'WARNING',
        startedAt: new Date(),
        completedAt: new Date(),
        metadata: JSON.stringify({
          stepNumber: 2,
          title: 'Deterministic Policy Evaluation',
          details: `Evaluated policy POL-002 (Treasury Investment Cap). Proposed action ($2,500,000 sweep) requires CFO approval under ${autonomyLevel}.`,
          policyId: 'POL-002',
          status: polEval.action,
        }),
      },
    });
    stepsData.push(step2);

    // Step 3: Tool Execution & Economic Value
    const expectedValue = EconomicValueCalculator.calculateExpectedValue({
      amount: 112500,
      currency: 'USD',
      type: 'CASH_RELEASED',
      confidence: 0.942,
    });

    const step3 = await prisma.executionStep.create({
      data: {
        executionId: execution.id,
        type: 'TOOL_EXECUTION',
        status: 'SUCCESS',
        startedAt: new Date(),
        completedAt: new Date(),
        metadata: JSON.stringify({
          stepNumber: 3,
          title: 'Tool Execution & Opportunity Quantification',
          details: `Executed Tool 'Treasury API Query' & 'Yield Curve Simulator'. Calculated net annual yield lift of $${expectedValue.toLocaleString()} (+4.5% APY).`,
          toolName: 'Yield Curve Simulator',
          calculatedYieldDelta: `+$${expectedValue.toLocaleString()} USD`,
        }),
      },
    });
    stepsData.push(step3);

    // Step 4: Business Output Generation
    const businessOutput = await prisma.businessOutput.create({
      data: {
        tenantId,
        organizationId,
        agentId: agent ? agent.id : null,
        executionId: execution.id,
        type: 'OPPORTUNITY',
        source: agent ? agent.name : 'Interactive Test Lab',
        methodology: 'SWIFT_BALANCE_MONEY_MARKET_SWEEP_SIMULATION',
        summary: `Identify yield optimization for $2.5M idle cash balance`,
        financialImpact: expectedValue,
        confidence: 0.942,
      },
    });

    await prisma.dataProvenance.create({
      data: {
        businessOutputId: businessOutput.id,
        sourceType: 'BANK_API',
        sourceId: 'JPMorgan Checking #4829',
        method: 'OPEN_BANKING_SWIFT_SYNC',
        quality: 0.98,
        coverage: 1.0,
      },
    });

    const step4 = await prisma.executionStep.create({
      data: {
        executionId: execution.id,
        type: 'ECONOMIC_EVALUATION',
        status: 'SUCCESS',
        startedAt: new Date(),
        completedAt: new Date(),
        metadata: JSON.stringify({
          stepNumber: 4,
          title: 'Economic Value & Decision Package',
          details: `Formatted normalized Business Output ID ${businessOutput.id}. Confidence score 94.2%.`,
          businessOutputId: businessOutput.id,
          confidence: 0.942,
        }),
      },
    });
    stepsData.push(step4);

    const updatedExecution = await prisma.execution.update({
      where: { id: execution.id },
      data: {
        status: polEval.action === 'REQUIRE_APPROVAL' ? 'WAITING_APPROVAL' : 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      execution: updatedExecution,
      steps: stepsData,
      businessOutput,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Execution failed' },
      { status: 500 }
    );
  }
}
