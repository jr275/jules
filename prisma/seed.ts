import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Uncle Scrooge enterprise demo dataset...');

  // Clean existing demo data
  await prisma.auditEvent.deleteMany();
  await prisma.provenance.deleteMany();
  await prisma.action.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.economicValue.deleteMany();
  await prisma.businessOutput.deleteMany();
  await prisma.executionStep.deleteMany();
  await prisma.execution.deleteMany();
  await prisma.policy.deleteMany();
  await prisma.credential.deleteMany();
  await prisma.connector.deleteMany();
  await prisma.workerSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.worker.deleteMany();
  await prisma.user.deleteMany();
  await prisma.forecast.deleteMany();
  await prisma.risk.deleteMany();
  await prisma.entity.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.tenant.deleteMany();

  // 1. Tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Northstar Holdings [DEMO DATA]',
      status: 'ACTIVE',
    },
  });

  // 2. Organization
  const org = await prisma.organization.create({
    data: {
      tenantId: tenant.id,
      name: 'Northstar Global Corp',
      status: 'ACTIVE',
    },
  });

  // 3. Entities
  const entityUS = await prisma.entity.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      name: 'Northstar USA LLC',
      country: 'USA',
      currency: 'USD',
      status: 'ACTIVE',
    },
  });

  const entityBR = await prisma.entity.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      name: 'Northstar Brasil Ltda',
      country: 'BRA',
      currency: 'BRL',
      status: 'ACTIVE',
    },
  });

  const entityEU = await prisma.entity.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      name: 'Northstar Europe B.V.',
      country: 'NLD',
      currency: 'EUR',
      status: 'ACTIVE',
    },
  });

  // 4. Users
  const cfoUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      email: 'cfo@northstar-demo.com',
      name: 'Ebenezer Vance',
      role: 'CFO',
      status: 'ACTIVE',
    },
  });

  const treasuryUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      email: 'treasury@northstar-demo.com',
      name: 'Clara Sterling',
      role: 'TREASURY',
      status: 'ACTIVE',
    },
  });

  // 5. Connectors
  const bankConnector = await prisma.connector.create({
    data: {
      tenantId: tenant.id,
      type: 'BANK',
      name: 'JPMorgan Chase API Adapter [DEMO]',
      status: 'CONNECTED',
      configuration: JSON.stringify({ environment: 'SANDBOX', accountsSynced: 4 }),
      credentialReference: 'cred_vault_jpm_9921',
    },
  });

  const erpConnector = await prisma.connector.create({
    data: {
      tenantId: tenant.id,
      type: 'ERP',
      name: 'SAP S/4HANA Connector [DEMO]',
      status: 'CONNECTED',
      configuration: JSON.stringify({ modules: ['FI', 'MM', 'SD'] }),
      credentialReference: 'cred_vault_sap_4481',
    },
  });

  // 6. Credentials (Safe references only)
  await prisma.credential.create({
    data: {
      tenantId: tenant.id,
      name: 'JPMorgan OAuth Token Reference',
      type: 'OAUTH2',
      reference: 'cred_vault_jpm_9921',
      status: 'ACTIVE',
    },
  });

  // 7. Policies
  const paymentPolicy = await prisma.policy.create({
    data: {
      tenantId: tenant.id,
      name: 'Large Outflow Approval Policy',
      description: 'Mandates CFO approval for disbursements exceeding $100,000 USD equivalent',
      status: 'ACTIVE',
      rules: JSON.stringify([
        {
          id: 'rule_1',
          field: 'amount',
          operator: 'GREATER_THAN',
          value: 100000,
          action: 'REQUIRE_APPROVAL',
          requiredRole: 'CFO',
        },
      ]),
    },
  });

  // 8. Skills
  const cashForecastSkill = await prisma.skill.create({
    data: {
      name: 'Dynamic Liquidity Forecasting',
      description: 'Predicts 13-week cash flow trajectories across bank accounts',
      category: 'TREASURY',
      version: '1.2.0',
      status: 'ACTIVE',
      riskLevel: 'LOW',
      autonomyLevel: 'LEVEL_1_RECOMMEND',
    },
  });

  const vendorDiscountSkill = await prisma.skill.create({
    data: {
      name: 'Dynamic Vendor Early Payment Discounting',
      description: 'Identifies APR yield opportunities by accelerating AP payments',
      category: 'WORKING_CAPITAL',
      version: '2.0.1',
      status: 'ACTIVE',
      riskLevel: 'MEDIUM',
      autonomyLevel: 'LEVEL_2_PREPARE',
    },
  });

  // 9. Workers
  const cashWorker = await prisma.worker.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      name: 'Cash Optimization Worker',
      description: 'Monitors corporate cash, optimizes sweep strategies and working capital',
      purpose: 'Maximize interest yields and release working capital tied in AP/AR',
      status: 'ACTIVE',
      autonomyLevel: 'LEVEL_2_PREPARE',
      configuration: JSON.stringify({ targetBufferUSD: 5000000 }),
    },
  });

  await prisma.workerSkill.createMany({
    data: [
      { workerId: cashWorker.id, skillId: cashForecastSkill.id },
      { workerId: cashWorker.id, skillId: vendorDiscountSkill.id },
    ],
  });

  // 10. Executions
  const execution = await prisma.execution.create({
    data: {
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
        executionId: execution.id,
        type: 'TRIGGER',
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 3600000),
        completedAt: new Date(Date.now() - 3590000),
      },
      {
        executionId: execution.id,
        type: 'DATA',
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 3590000),
        completedAt: new Date(Date.now() - 3500000),
        inputReference: 'connector:bankConnector',
      },
      {
        executionId: execution.id,
        type: 'ANALYSIS',
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 3500000),
        completedAt: new Date(Date.now() - 3400000),
      },
    ],
  });

  // 11. Business Outputs & Economic Value
  const businessOutput = await prisma.businessOutput.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      executionId: execution.id,
      type: 'ECONOMIC_IMPACT',
      status: 'PROPOSED',
      confidence: 0.92,
      source: 'Cash Optimization Worker [DEMO DATA]',
      methodology: 'AP Early Settlement APR Discount vs Short-term Yield Curve',
      payload: JSON.stringify({ supplier: 'Acme Steel Corp', invoiceCount: 12 }),
    },
  });

  await prisma.economicValue.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      businessOutputId: businessOutput.id,
      amount: 145000,
      currency: 'USD',
      period: 'ANNUAL',
      type: 'COST_SAVING',
      confidence: 0.92,
      source: 'AP Discount Model',
      methodology: 'Capture 2/10 Net 30 terms on $7.25M annual payables',
    },
  });

  // 12. Opportunities
  await prisma.opportunity.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      businessOutputId: businessOutput.id,
      title: 'Accelerate Payables Discount with Acme Steel',
      description: 'Capture 2% early payment discount by settling invoices 18 days prior to due date',
      category: 'WORKING_CAPITAL',
      estimatedValue: 145000,
      currency: 'USD',
      probability: 0.9,
      expectedValue: 130500,
      urgency: 0.85,
      effort: 0.2,
      risk: 0.1,
      reversibility: 0.9,
      confidence: 0.92,
      priorityScore: 825.0,
      status: 'IDENTIFIED',
      recommendedAction: 'Approve $450,000 disbursement batch before Friday 5 PM EST',
      owner: 'Clara Sterling',
    },
  });

  // 13. Decisions & Actions
  const decision = await prisma.decision.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      businessOutputId: businessOutput.id,
      problem: 'Idle cash earning 3.2% vs early payment discount annualized yield of 36%',
      evidence: JSON.stringify(['Bank Balance: $12.4M', 'Invoice #ACME-8891: $450k']),
      assumptions: JSON.stringify(['Liquidity buffer remains above $5M baseline']),
      alternatives: JSON.stringify(['Keep cash in Money Market Fund', 'Execute partial early payment']),
      scenarios: JSON.stringify(['Base Case: +$9,000 net profit', 'Delay: $0 yield']),
      economicImpact: 145000,
      currency: 'USD',
      risk: 'LOW',
      policyStatus: 'PASSED',
      recommendation: 'Authorize early payment batch of $450,000',
      approvalStatus: 'PENDING',
      executionStatus: 'NOT_STARTED',
    },
  });

  await prisma.action.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      decisionId: decision.id,
      type: 'PAYMENT_EXECUTION',
      target: 'JPM Account *4401 -> Acme Steel Vendor Bank *9912',
      amount: 450000,
      currency: 'USD',
      status: 'PLANNED',
      approvalStatus: 'PENDING',
      executionStatus: 'NOT_STARTED',
      policyStatus: 'COMPLIANT',
      verificationStatus: 'UNVERIFIED',
    },
  });

  // 14. Risk & Forecasts
  await prisma.risk.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityBR.id,
      category: 'FX',
      exposure: 2100000,
      currency: 'BRL',
      probability: 0.65,
      impact: 0.45,
      confidence: 0.88,
      mitigation: 'Execute BRL/USD forward hedge contract for Q3 intercompany transfers',
      status: 'MONITORING',
    },
  });

  await prisma.forecast.create({
    data: {
      tenantId: tenant.id,
      organizationId: org.id,
      entityId: entityUS.id,
      horizon: '30D',
      type: 'FORECAST',
      expected: 14200000,
      lowerBound: 12800000,
      upperBound: 15600000,
      currency: 'USD',
      confidence: 0.89,
      methodology: 'Ensemble ARIMAX + ERP Invoice Due Date Schedule',
      source: 'Treasury Analytics Engine [DEMO DATA]',
    },
  });

  // 15. Audit Event
  await prisma.auditEvent.create({
    data: {
      tenantId: tenant.id,
      actorId: cfoUser.id,
      actorEmail: cfoUser.email,
      event: 'worker.configured',
      resource: 'Worker',
      resourceId: cashWorker.id,
      metadata: JSON.stringify({ changes: { autonomyLevel: 'LEVEL_2_PREPARE' } }),
    },
  });

  console.log('Seed completed successfully for tenant:', tenant.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
