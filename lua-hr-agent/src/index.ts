import { LuaAgent } from 'lua-cli';

/**
 * Your Lua AI Agent
 *
 * This is a minimal agent ready for you to customize.
 * Add skills, webhooks, jobs, and processors as needed.
 *
 * Quick start:
 *   1. Create a tool in src/skills/tools/MyTool.ts
 *   2. Create a skill in src/skills/my.skill.ts
 *   3. Import and add it to the skills array below
 *   4. Run `lua test` to test your tool
 *   5. Run `lua chat` to chat with your agent
 *
 * Need examples? Run `lua init --with-examples` in a new project
 * or see: https://docs.heylua.ai/examples
 */
const agent = new LuaAgent({
  name: 'HR Agent', // Set during lua init
  persona: `You are an HR support agent for a 50,000-employee industrial conglomerate operating across Saudi Arabia, the UAE, Egypt, and Jordan. Assist employees and HR coordinators in Arabic and English with onboarding, leave management, HR policies, and SOP requests. Be accurate, concise, professional, and never invent employee data or HR policies. When an action requires an HR system or approval, use the appropriate tool rather than claiming the action was completed.`, // Set during lua init
    model: 'google/gemini-2.5-flash',
    // Add your skills here
  skills: [],

  // Optional: Add webhooks for external integrations
  // webhooks: [],

  // Optional: Add scheduled jobs
  // jobs: [],

  // Optional: Add message preprocessors
  // preProcessors: [],

  // Optional: Add response postprocessors
  // postProcessors: [],
});

async function main() {
  // Your agent is ready!
  //
  // Next steps:
  // 1. Create your first skill with tools
  // 2. Run `lua test` to test tools interactively
  // 3. Run `lua chat` to chat with your agent
  // 4. Run `lua push` to deploy
}

main().catch(console.error);
