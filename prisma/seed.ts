import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Uncle Scrooge Agent Platform database for Northstar Holdings [DEMO DATA]...');

  await prisma.outputDestination.deleteMany();
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
  await prisma.task.deleteMany();
  await prisma.agentTrigger.deleteMany();
  await prisma.agentKnowledgeSource.deleteMany();
  await prisma.knowledgeSource.deleteMany();
  await prisma.agentConnector.deleteMany();
  await prisma.agentTool.deleteMany();
  await prisma.agentSkill.deleteMany();
  await prisma.agentVersion.deleteMany();
  await prisma.agent.deleteMany();
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

  const connGoogle = await prisma.connector.create({
    data: {
      id: 'conn-google-workspace',
      tenantId: tenant.id,
      type: 'GOOGLE_SHEETS',
      category: 'GOOGLE',
      name: 'Google Workspace (Drive & Sheets)',
      status: 'CONNECTED',
      configuration: JSON.stringify({ scopes: ['drive.readonly', 'spreadsheets.readonly'], account: 'finance@northstar.demo' }),
      credentialReference: 'cred-google-01',
    },
  });

  const connSAP = await prisma.connector.create({
    data: {
      id: 'conn-sap-erp',
      tenantId: tenant.id,
      type: 'SAP_ERP',
      category: 'FINANCE',
      name: 'SAP S/4HANA ERP',
      status: 'CONNECTED',
      configuration: JSON.stringify({ endpoint: 'https://sap.northstar.demo/api' }),
      credentialReference: 'cred-sap-01',
    },
  });

  const connJPM = await prisma.connector.create({
    data: {
      id: 'conn-jpm-bank',
      tenantId: tenant.id,
      type: 'BANK_API',
      category: 'FINANCE',
      name: 'JPMorgan Chase Treasury API',
      status: 'CONNECTED',
      configuration: JSON.stringify({ environment: 'production-sandbox' }),
      credentialReference: 'cred-jpm-01',
    },
  });

  const ksRevenueSheet = await prisma.knowledgeSource.create({
    data: {
      id: 'ks-fy26-revenue-sheet',
      tenantId: tenant.id,
      organizationId: org.id,
      connectorId: connGoogle.id,
      name: 'FY26 Global Revenue Forecast Sheet',
      type: 'GOOGLE_SHEET',
      uri: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      status: 'ACTIVE',
      metadata: JSON.stringify({ lastUpdatedBy: 'Eleanor Vance', sheetName: 'Q3_P&L_Forecast' }),
    },
  });

  const toolBankQuery = await prisma.tool.create({
    data: {
      id: 'tool-bank-query',
      name: 'Bank Account Balance Query',
      description: 'Queries real-time balance across global cash accounts',
      category: 'BANKING',
      inputSchema: JSON.stringify({ entityId: 'string' }),
      outputSchema: JSON.stringify({ totalCashUSD: 'number', balances: 'array' }),
      riskLevel: 'LOW',
      status: 'ACTIVE',
    },
  });

  const toolGoogleSheetRead = await prisma.tool.create({
    data: {
      id: 'tool-google-sheet-read',
      name: 'Google Sheets Data Reader',
      description: 'Reads rows, ranges, and formulas from connected Google Sheets',
      category: 'GOOGLE',
      inputSchema: JSON.stringify({ sheetId: 'string', range: 'string' }),
      outputSchema: JSON.stringify({ rows: 'array' }),
      riskLevel: 'LOW',
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

  const skillFPAAnalysis = await prisma.skill.create({
    data: {
      id: 'skill-fpa-analysis',
      name: 'Budget vs. Actual Variance Analysis',
      description: 'Analyzes financial spreadsheet models against ERP actuals to explain margin drift',
      category: 'ANALYTICS',
      riskLevel: 'LOW',
      autonomyLevel: 'LEVEL_1_RECOMMEND',
    },
  });

  await prisma.skillTool.createMany({
    data: [
      { skillId: skillCashForecast.id, toolId: toolBankQuery.id },
      { skillId: skillFPAAnalysis.id, toolId: toolGoogleSheetRead.id },
    ],
  });

  await prisma.policy.create({
    data: {
      id: 'policy-cfo-threshold',
      tenantId: tenant.id,
      name: 'CFO Payment Threshold Policy',
      description: 'Mandates CFO approval for actions with financial impact > $100,000 USD',
      status: 'ACTIVE',
      rules: JSON.stringify([
        {
          id: 'rule-cfo-100k',
          name: 'CFO Approval Rule',
          field: 'amount',
          operator: 'GREATER_THAN',
          value: 100000,
          action: 'REQUIRE_APPROVAL',
          requiredRole: 'CFO',
          message: 'Financial execution over $100,000 USD requires CFO approval',
        },
      ]),
    },
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
    ],
  });

  const agentCashFlow = await prisma.agent.create({
    data: {
      id: 'agent-cash-flow',
      tenantId: tenant.id,
      organizationId: org.id,
      ownerId: userCFO.id,
      name: 'Cash Flow & Liquidity Agent',
      description: 'Continuously monitors bank balances, forecasts 13-week cash, and identifies yield sweep opportunities.',
      objective: 'Eliminate idle uninvested liquid balances and prevent cash shortfalls across global operating accounts.',
      rolePersona: 'Senior Treasury Manager AI Persona',
      instructions: 'Analyze bank balances every morning at 8:00 AM. Sweep excess cash above $500k buffer into 5.30% overnight money market funds.',
      status: 'ACTIVE',
      autonomyLevel: 'LEVEL_2_PREPARE',
      version: 1,
    },
  });

  const agentFPA = await prisma.agent.create({
    data: {
      id: 'agent-fpa-copilot',
      tenantId: tenant.id,
      organizationId: org.id,
      ownerId: userCFO.id,
      name: 'FP&A & Margin Intelligence Agent',
      description: 'Reads financial models from Google Sheets, compares with SAP ERP actuals, and delivers executive commentary.',
      objective: 'Provide daily variance analysis and quantify gross margin risks before month-end close.',
      rolePersona: 'Corporate FP&A Director AI Persona',
      instructions: 'Monitor Google Sheet FY26 Revenue Forecast. Alert CFO if revenue variance exceeds 5%.',
      status: 'ACTIVE',
      autonomyLevel: 'LEVEL_1_RECOMMEND',
      version: 1,
    },
  });

  await prisma.agentSkill.createMany({
    data: [
      { agentId: agentCashFlow.id, skillId: skillCashForecast.id },
      { agentId: agentFPA.id, skillId: skillFPAAnalysis.id },
    ],
  });

  await prisma.agentTool.createMany({
    data: [
      { agentId: agentCashFlow.id, toolId: toolBankQuery.id },
      { agentId: agentFPA.id, toolId: toolGoogleSheetRead.id },
    ],
  });

  await prisma.agentConnector.createMany({
    data: [
      { agentId: agentCashFlow.id, connectorId: connJPM.id },
      { agentId: agentCashFlow.id, connectorId: connSAP.id },
      { agentId: agentFPA.id, connectorId: connGoogle.id },
    ],
  });

  await prisma.agentKnowledgeSource.create({
    data: {
      agentId: agentFPA.id,
      knowledgeSourceId: ksRevenueSheet.id,
    },
  });

  await prisma.agentVersion.createMany({
    data: [
      {
        agentId: agentCashFlow.id,
        version: 1,
        configuration: JSON.stringify({ minReserveUSD: 500000, sweepFund: 'JPMorgan Money Market #4829' }),
        changelog: 'Initial production release v1',
      },
      {
        agentId: agentFPA.id,
        version: 1,
        configuration: JSON.stringify({ varianceThreshold: 0.05 }),
        changelog: 'Initial production release v1',
      },
    ],
  });

  await prisma.agentTrigger.createMany({
    data: [
      {
        agentId: agentCashFlow.id,
        type: 'SCHEDULE',
        configuration: JSON.stringify({ cron: '0 8 * * *', timezone: 'America/New_York' }),
        status: 'ACTIVE',
      },
      {
        agentId: agentFPA.id,
        type: 'DATA_CHANGE',
        configuration: JSON.stringify({ resource: 'GOOGLE_SHEET', sheetId: ksRevenueSheet.id }),
        status: 'ACTIVE',
      },
    ],
  });

  const exec1 = await prisma.execution.create({
    data: {
      id: 'exec-agent-001',
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      workerId: cashWorker.id,
      agentId: agentCashFlow.id,
      trigger: 'SCHEDULED',
      status: 'COMPLETED',
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(),
    },
  });

  await prisma.executionStep.createMany({
    data: [
      {
        executionId: exec1.id,
        type: 'TRIGGER',
        status: 'COMPLETED',
        metadata: JSON.stringify({ trigger: 'SCHEDULED_DAILY_8AM' }),
      },
      {
        executionId: exec1.id,
        type: 'DATA',
        status: 'COMPLETED',
        metadata: JSON.stringify({ connectorUsed: 'JPMorgan Chase Treasury API', itemsRetrieved: 2 }),
      },
      {
        executionId: exec1.id,
        type: 'ANALYSIS',
        status: 'COMPLETED',
        metadata: JSON.stringify({ idleBalanceUSD: 4200000, yieldDifference: 0.0515 }),
      },
    ],
  });

  const output1 = await prisma.businessOutput.create({
    data: {
      id: 'out-agent-001',
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      executionId: exec1.id,
      agentId: agentCashFlow.id,
      type: 'RECOMMENDATION',
      confidence: 0.95,
      source: 'Cash Flow & Liquidity Agent v1',
      methodology: 'Overnight Treasury Sweep Yield Calculation',
      summary: 'Idle liquidity of $4,200,000 USD detected in checking account. Recommend sweeping excess to 5.30% overnight fund.',
      financialImpact: 216300,
      data: JSON.stringify({ targetAccount: 'JPMorgan Money Market Fund #4829', sweepAmount: 4200000 }),
    },
  });

  await prisma.dataProvenance.create({
    data: {
      businessOutputId: output1.id,
      sourceType: 'BANK_API',
      sourceId: 'JPMorgan Chase Checking #4829',
      retrievedAt: new Date(Date.now() - 3600000),
      method: 'OAUTH2_SECURE_SWIFT_QUERY',
      quality: 1.0,
      coverage: 1.0,
      metadata: JSON.stringify({ connector: 'JPMorgan Treasury API', balanceUSD: 4720000 }),
    },
  });

  await prisma.economicValue.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      businessOutputId: output1.id,
      amount: 216300,
      currency: 'USD',
      period: 'ANNUAL',
      type: 'COST_SAVING',
      confidence: 0.95,
      source: 'Cash Flow & Liquidity Agent',
      methodology: 'Difference between 0.15% checking APY and 5.30% Treasury Yield',
    },
  });

  await prisma.opportunity.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      businessOutputId: output1.id,
      title: 'Idle Liquidity Yield Sweep - Northstar US',
      description: 'Sweep $4.2M excess cash from 0.15% checking into 5.30% money market fund.',
      category: 'TREASURY',
      estimatedValue: 216300,
      currency: 'USD',
      probability: 0.95,
      expectedValue: 205485,
      urgency: 'HIGH',
      effort: 'LOW',
      risk: 'LOW',
      reversibility: 'HIGH',
      confidence: 0.95,
      status: 'IDENTIFIED',
      recommendedAction: 'Execute daily automated sweep of cash above $500k reserve.',
      owner: 'Eleanor Vance',
    },
  });

  await prisma.decision.create({
    data: {
      id: 'dec-001',
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      businessOutputId: output1.id,
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
      entityId: entityUS.id,
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
      source: 'Cash Flow & Liquidity Agent [DEMO DATA]',
      dataType: 'FORECAST',
    },
  });

  await prisma.outputDestination.create({
    data: {
      businessOutputId: output1.id,
      type: 'DASHBOARD',
      target: '/dashboard',
      status: 'DELIVERED',
      deliveredAt: new Date(),
    },
  });

  console.log('✅ Seed completed successfully for Uncle Scrooge Agent Platform [DEMO DATA]!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
