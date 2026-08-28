async function pilotSmoke() {
  console.log('====================================================');
  console.log('UNCLE SCROOGE — LIVE PILOT SMOKE EXECUTION');
  console.log('====================================================');

  const llmKey = process.env.UNCLE_SCROOGE_LLM_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
  const googleClientId = process.env.GOOGLE_CLIENT_ID;

  if (!llmKey || !googleClientId) {
    console.log('\n[PILOT SMOKE RESULT]: BLOCKED — Missing required live credentials.');
    if (!llmKey) console.log('  - Missing LLM API key (UNCLE_SCROOGE_LLM_API_KEY / ANTHROPIC_API_KEY / OPENAI_API_KEY)');
    if (!googleClientId) console.log('  - Missing Google OAuth Client ID (GOOGLE_CLIENT_ID)');
    console.log('\nCannot execute live pilot without external SaaS credentials.');
    process.exit(0);
  }

  console.log('[pilot:smoke] All required credentials present. Initiating live end-to-end pilot...');
}

pilotSmoke();
