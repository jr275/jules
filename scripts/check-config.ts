async function checkConfig() {
  console.log('[config:check] Auditing environment configuration...');
  const errors: string[] = [];
  const warnings: string[] = [];

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) errors.push('DATABASE_URL is missing');

  const encKey = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!encKey) warnings.push('CREDENTIAL_ENCRYPTION_KEY is missing (using fallback default key)');

  const llmKey = process.env.UNCLE_SCROOGE_LLM_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
  if (!llmKey) warnings.push('LLM API Key missing (UNCLE_SCROOGE_LLM_API_KEY / ANTHROPIC_API_KEY / OPENAI_API_KEY)');

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) warnings.push('OPENAI_API_KEY missing (required for vector embeddings)');

  const googleId = process.env.GOOGLE_CLIENT_ID;
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!googleId || !googleSecret) warnings.push('Google OAuth credentials missing (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)');

  if (errors.length > 0) {
    console.error('[config:check] FAIL — Critical configuration errors:');
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.log('[config:check] BLOCKED — Environment missing required credentials for live pilot:');
    warnings.forEach((w) => console.log(`  - ${w}`));
    process.exit(0);
  }

  console.log('[config:check] PASS — All environment variables fully configured!');
  process.exit(0);
}

checkConfig();
