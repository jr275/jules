import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Uncle Scrooge development database for Northstar Holdings [DEMO DATA]...');

  await prisma.auditEvent.deleteMany();
  await prisma.dataProvenance.deleteMany();
  await prisma.economicValue.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.action.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.forecast.deleteMany();
  await prisma.businessOutput.deleteMany();
  await prisma.executionStep.deleteMany();
  await prisma.execution.deleteMany();
  await prisma.workerSkill.deleteMany();
  await prisma.skillTool.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.tool.deleteMany();
  await prisma.connector.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.user.deleteMany();
  await prisma.entity.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.tenant.deleteMany();

  const tenant = await prisma.tenant.create({
    data: {
      id: 'tenant-northstar-001',
      name: 'Northstar Holdings [DEMO DATA]',
      status: 'ACTIVE',
    },
  });

  const org = await prisma.organization.create({
    data: {
      id: 'org-northstar-global',
      tenantId: tenant.id,
      name: 'Northstar Holdings Global',
      status: 'ACTIVE',
    },
  });

  const entityUS = await prisma.entity.create({
    data: {
      id: 'ent-northstar-us',
      tenantId: tenant.id,
      organizationId: org.id,
      name: 'Northstar Corporation US',
      country: 'USA',
      currency: 'USD',
      status: 'ACTIVE',
    },
  });

  const entityBR = await prisma.entity.create({
    data: {
      id: 'ent-northstar-br',
      tenantId: tenant.id,
      organizationId: org.id,
      name: 'Northstar do Brasil Ltda',
      country: 'BRA',
      currency: 'BRL',
      status: 'ACTIVE',
    },
  });

  const entityEU = await prisma.entity.create({
    data: {
      id: 'ent-northstar-eu',
      tenantId: tenant.id,
      organizationId: org.id,
      name: 'Northstar Europe B.V.',
      country: 'NLD',
      currency: 'EUR',
      status: 'ACTIVE',
    },
  });

  const userCFO = await prisma.user.create({
    data: {
      id: 'usr-cfo',
      tenantId: tenant.id,
      organizationId: org.id,
      email: 'cfo@northstar-holdings.demo',
      name: 'Eleanor Vance',
      role: 'CFO',
      status: 'ACTIVE',
    },
  });

  await prisma.user.create({
    data: {
      id: 'usr-treasury',
      tenantId: tenant.id,
      organizationId: org.id,
      email: 'treasury@northstar-holdings.demo',
      name: 'Marcus Sterling',
      role: 'TREASURY',
      status: 'ACTIVE',
    },
  });

  await prisma.connector.createMany({
    data: [
      {
        id: 'conn-sap-erp',
        tenantId: tenant.id,
        type: 'ERP',
        name: 'SAP S/4HANA ERP',
        status: 'CONNECTED',
        configuration: JSON.stringify({ endpoint: 'https://sap.northstar.demo/api', source: 'DEMO' }),
        credentialReference: 'cred-sap-01',
      },
      {
        id: 'conn-jpm-bank',
        tenantId: tenant.id,
        type: 'BANK',
        name: 'JPMorgan Chase Treasury API',
        status: 'CONNECTED',
        configuration: JSON.stringify({ environment: 'sandbox' }),
        credentialReference: 'cred-jpm-01',
      },
      {
        id: 'conn-stripe-payments',
        tenantId: tenant.id,
        type: 'PAYMENT_PROCESSOR',
        name: 'Stripe Payments',
        status: 'CONNECTED',
        configuration: JSON.stringify({ mode: 'test' }),
        credentialReference: 'cred-stripe-01',
      },
    ],
  });

  const toolBankQuery = await prisma.tool.create({
    data: {
      id: 'tool-bank-query',
      name: 'Bank Account Balance Query',
      description: 'Queries real-time balance across global cash accounts',
      category: 'BANKING',
      status: 'ACTIVE',
    },
  });

  const toolERPInvoice = await prisma.tool.create({
    data: {
      id: 'tool-erp-invoice',
      name: 'ERP Payables & Receivables Scanner',
      description: 'Reads outstanding payables and receivables aging schedules',
      category: 'ERP',
      status: 'ACTIVE',
    },
  });

  const skillCashForecast = await prisma.skill.create({
    data: {
      id: 'skill-cash-forecasting',
      name: 'Liquidity & Cash Forecasting',
      description: 'Predicts 13-week cash position and identifies working capital shortfalls',
      category: 'TREASURY',
      riskLevel: 'LOW',
      autonomyLevel: 'LEVEL_1_RECOMMEND',
    },
  });

  const skillPaymentIntel = await prisma.skill.create({
    data: {
      id: 'skill-payment-intel',
      name: 'Payment & Yield Optimization',
      description: 'Identifies early payment discount capture and idle cash sweeping opportunities',
      category: 'WORKING_CAPITAL',
      riskLevel: 'MEDIUM',
      autonomyLevel: 'LEVEL_2_PREPARE',
    },
  });

  await prisma.skillTool.createMany({
    data: [
      { skillId: skillCashForecast.id, toolId: toolBankQuery.id },
      { skillId: skillPaymentIntel.id, toolId: toolERPInvoice.id },
    ],
  });

  await prisma.policy.createMany({
    data: [
      {
        id: 'policy-payment-limits',
        tenantId: tenant.id,
        name: 'Payment Authorization Thresholds',
        description: 'Mandates CFO approval for payments > $100,000 USD',
        status: 'ACTIVE',
        rules: JSON.stringify([
          {
            id: 'p-rule-1',
            name: 'CFO Approval Rule',
            field: 'amount',
            operator: 'GREATER_THAN',
            value: 100000,
            action: 'REQUIRE_APPROVAL',
            requiredRole: 'CFO',
            message: 'Payments over $100,000 USD require CFO approval',
          },
        ]),
      },
      {
        id: 'policy-counterparty-risk',
        tenantId: tenant.id,
        name: 'Counterparty Risk Limits',
        description: 'Prohibits autonomous execution with critical risk counterparties',
        status: 'ACTIVE',
        rules: JSON.stringify([
          {
            id: 'p-rule-2',
            name: 'Critical Risk Prohibit',
            field: 'riskLevel',
            operator: 'EQUALS',
            value: 'CRITICAL',
            action: 'PROHIBIT',
            message: 'Transactions with critical risk counterparties are prohibited',
          },
        ]),
      },
    ],
  });

  const cashWorker = await prisma.worker.create({
    data: {
      id: 'wrk-cash-optimizer',
      tenantId: tenant.id,
      organizationId: org.id,
      name: 'Cash Optimization Worker',
      description: 'Continuously monitors liquidity, forecasts cash balances, and captures yield',
      purpose: 'Maximize interest yield and eliminate overdraft / emergency borrowing costs',
      status: 'ACTIVE',
      autonomyLevel: 'LEVEL_2_PREPARE',
      configuration: JSON.stringify({ frequency: 'HOURLY', minReserveUSD: 500000 }),
    },
  });

  await prisma.workerSkill.createMany({
    data: [
      { workerId: cashWorker.id, skillId: skillCashForecast.id },
      { workerId: cashWorker.id, skillId: skillPaymentIntel.id },
    ],
  });

  const execution1 = await prisma.execution.create({
    data: {
      id: 'exec-001',
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      workerId: cashWorker.id,
      trigger: 'SCHEDULED',
      status: 'COMPLETED',
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(),
    },
  });

  await prisma.executionStep.createMany({
    data: [
      {
        executionId: execution1.id,
        type: 'TRIGGER',
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 3590000),
        metadata: JSON.stringify({ triggerType: 'SCHEDULED_HOURLY' }),
      },
      {
        executionId: execution1.id,
        type: 'DATA',
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 3590000),
        completedAt: new Date(Date.now() - 3500000),
        metadata: JSON.stringify({ sourcesQueried: ['SAP S/4HANA', 'JPMorgan Chase API'] }),
      },
      {
        executionId: execution1.id,
        type: 'ANALYSIS',
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 3500000),
        completedAt: new Date(Date.now() - 3400000),
        metadata: JSON.stringify({ findings: 'Idle cash detected in USD operating account' }),
      },
    ],
  });

  const businessOutput1 = await prisma.businessOutput.create({
    data: {
      id: 'out-001',
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      executionId: execution1.id,
      type: 'ECONOMIC_IMPACT',
      confidence: 0.92,
      source: 'Cash Optimization Worker',
      methodology: 'Overnight Money Market Yield Sweep Simulation',
      data: JSON.stringify({ recommendation: 'Sweep $4,200,000 USD to Overnight Treasury Money Market (5.15% APY)' }),
    },
  });

  await prisma.economicValue.create({
    data: {
      id: 'econ-001',
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      businessOutputId: businessOutput1.id,
      amount: 216300,
      currency: 'USD',
      period: 'ANNUAL',
      type: 'COST_SAVING',
      confidence: 0.92,
      source: 'Yield Optimization Engine',
      methodology: 'Difference between 0.15% checking yield and 5.30% Treasury Yield',
    },
  });

  await prisma.opportunity.create({
    data: {
      id: 'opp-001',
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      businessOutputId: businessOutput1.id,
      title: 'Idle Liquidity Yield Sweep - Northstar US',
      description: 'Optimize $4.2M idle cash currently yielding 0.15% in checking by sweeping to overnight 5.30% money market funds.',
      category: 'TREASURY',
      estimatedValue: 216300,
      currency: 'USD',
      probability: 0.95,
      expectedValue: 205485,
      urgency: 'HIGH',
      effort: 'LOW',
      risk: 'LOW',
      reversibility: 'HIGH',
      confidence: 0.92,
      status: 'IDENTIFIED',
      recommendedAction: 'Execute daily automated sweep of excess cash above $500,000 buffer.',
      owner: 'Eleanor Vance',
    },
  });

  await prisma.opportunity.create({
    data: {
      id: 'opp-002',
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityEU.id,
      title: 'Early Vendor Payment Discount Capture - Northstar EU',
      description: 'Capture 2.0% 10 net 30 early payment terms across top 5 technology vendors in European entity.',
      category: 'WORKING_CAPITAL',
      estimatedValue: 145000,
      currency: 'EUR',
      probability: 0.88,
      expectedValue: 127600,
      urgency: 'MEDIUM',
      effort: 'MEDIUM',
      risk: 'LOW',
      reversibility: 'HIGH',
      confidence: 0.88,
      status: 'REVIEWED',
      recommendedAction: 'Accelerate payment of batch invoice #EU-8842 with 2% discount.',
      owner: 'Marcus Sterling',
    },
  });

  const decision1 = await prisma.decision.create({
    data: {
      id: 'dec-001',
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      businessOutputId: businessOutput1.id,
      problem: 'Idle liquid balance of $4.2M in operating account returning negligible yield.',
      evidence: JSON.stringify(['JPMorgan checking balance statement: $4,720,000', 'Forecasted 30-day payout requirement: $520,000']),
      assumptions: JSON.stringify(['Overnight liquidity remains accessible with same-day settlement']),
      alternatives: JSON.stringify(['Keep in checking (0.15%)', 'Sweep to 30-day CD (5.40%)', 'Sweep to Money Market (5.30%)']),
      scenarios: JSON.stringify(['Base Case: +$216,300 APY', 'Stressed Liquidity Case: +$180,000 APY']),
      economicImpact: 216300,
      risk: 'LOW',
      policyStatus: 'PASSED',
      recommendation: 'Approve daily sweep mechanism for Northstar US cash account.',
      approvalStatus: 'PENDING',
      executionStatus: 'NOT_STARTED',
    },
  });

  await prisma.action.create({
    data: {
      id: 'act-001',
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      decisionId: decision1.id,
      type: 'REBALANCING',
      target: 'JPMorgan Chase Money Market Fund #4829',
      amount: 4200000,
      currency: 'USD',
      status: 'PROPOSED',
      approvalStatus: 'PENDING',
      executionStatus: 'NOT_STARTED',
      policyStatus: 'COMPLIANT',
      verificationStatus: 'UNVERIFIED',
    },
  });

  await prisma.risk.create({
    data: {
      id: 'risk-001',
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityBR.id,
      category: 'FX',
      exposure: 1500000,
      currency: 'USD',
      probability: 0.35,
      impact: 'HIGH',
      confidence: 0.82,
      mitigation: 'Implement 60-day USD/BRL currency forward hedge contract.',
      status: 'ACTIVE',
    },
  });

  await prisma.forecast.create({
    data: {
      id: 'forc-001',
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      horizon: '90_DAYS',
      expected: 12800000,
      lowerBound: 11400000,
      upperBound: 14200000,
      currency: 'USD',
      confidence: 0.89,
      methodology: 'ARIMA + Monte Carlo Cash Flow Ensemble Model',
      source: 'Cash Optimization Worker [DEMO DATA]',
      dataType: 'FORECAST',
    },
  });

  await prisma.auditEvent.create({
    data: {
      tenantId: tenant.id,
      actor: userCFO.email,
      event: 'worker.created',
      resource: 'Worker',
      resourceId: cashWorker.id,
      metadata: JSON.stringify({ workerName: cashWorker.name, source: 'DEMO SEED' }),
    },
  });

  console.log('✅ Seed completed successfully for Northstar Holdings [DEMO DATA]!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
