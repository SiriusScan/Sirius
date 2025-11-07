import { glob } from 'glob';
import chalk from 'chalk';
import { checkIfStale } from './validators/sync-validator.js';

async function main() {
  const agentFiles = await glob('.cursor/agents/*.agent.md', { cwd: '../../' });

  console.log(chalk.blue('\n🔍 Agent Identity Sync Check\n'));

  let staleCount = 0;

  for (const agentFile of agentFiles) {
    const fullPath = `../../${agentFile}`;
    const result = await checkIfStale(fullPath);

    if (result.isStale) {
      console.log(chalk.yellow(`⚠️  ${agentFile} is stale`));
      console.log(chalk.yellow(`   Reason: ${result.reason}`));
      if (result.staleFiles && result.staleFiles.length > 0) {
        console.log(chalk.yellow(`   Modified files:`));
        result.staleFiles.forEach(file => console.log(chalk.yellow(`     - ${file}`)));
      }
      console.log();
      staleCount++;
    } else {
      console.log(chalk.green(`✅ ${agentFile} is in sync`));
    }
  }

  console.log(chalk.blue(`\n📊 Summary:`));
  console.log(`  Total files: ${agentFiles.length}`);
  console.log(`  In sync: ${agentFiles.length - staleCount}`);
  console.log(`  Stale: ${staleCount}`);

  if (staleCount > 0) {
    console.log(chalk.yellow(`\n⚠️  ${staleCount} agent identit${staleCount === 1 ? 'y' : 'ies'} need regeneration`));
    console.log(chalk.blue('   Run: make regenerate-agents\n'));
    process.exit(1);
  } else {
    console.log(chalk.green('\n✅ All agent identities are in sync!\n'));
    process.exit(0);
  }
}

main().catch(error => {
  console.error(chalk.red(`\n❌ Fatal error: ${error}\n`));
  process.exit(1);
});


