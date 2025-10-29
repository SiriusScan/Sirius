import { glob } from 'glob';
import chalk from 'chalk';
import { validateYaml, validateContent, checkIfStale, validateFilePaths } from './validators/index.js';

async function main() {
  const agentFiles = await glob('.cursor/agents/*.agent.md', { cwd: '../../' });

  let errors = 0;
  let warnings = 0;

  console.log(chalk.blue('\n🤖 Agent Identity Validation\n'));

  for (const agentFile of agentFiles) {
    const fullPath = `../../${agentFile}`;
    console.log(chalk.blue(`\nValidating ${agentFile}...`));

    // YAML validation
    const yamlResult = await validateYaml(fullPath);
    if (!yamlResult.valid) {
      console.log(chalk.red(`  ❌ YAML errors:`));
      yamlResult.errors.forEach(err => console.log(chalk.red(`     - ${err}`)));
      errors++;
    }

    // Content validation
    const contentResult = await validateContent(fullPath);
    if (!contentResult.valid) {
      console.log(chalk.red(`  ❌ Content errors:`));
      contentResult.errors.forEach(err => console.log(chalk.red(`     - ${err}`)));
      errors++;
    }
    if (contentResult.warnings.length > 0) {
      console.log(chalk.yellow(`  ⚠️  Content warnings:`));
      contentResult.warnings.forEach(warn => console.log(chalk.yellow(`     - ${warn}`)));
      warnings++;
    }

    // Sync validation
    const syncResult = await checkIfStale(fullPath);
    if (syncResult.isStale) {
      console.log(chalk.yellow(`  ⚠️  Stale: ${syncResult.reason}`));
      if (syncResult.staleFiles && syncResult.staleFiles.length > 0) {
        console.log(chalk.yellow(`      Modified files:`));
        syncResult.staleFiles.forEach(file => console.log(chalk.yellow(`        - ${file}`)));
      }
      console.log(chalk.yellow(`      Run: make regenerate-agents`));
      warnings++;
    }

    // File path validation
    const pathResult = await validateFilePaths(fullPath);
    if (!pathResult.valid && pathResult.missingFiles.length > 0) {
      console.log(chalk.yellow(`  ⚠️  Missing files:`));
      pathResult.missingFiles.slice(0, 5).forEach(file =>
        console.log(chalk.yellow(`     - ${file}`))
      );
      if (pathResult.missingFiles.length > 5) {
        console.log(chalk.yellow(`     ... and ${pathResult.missingFiles.length - 5} more`));
      }
      warnings++;
    }

    if (yamlResult.valid && contentResult.valid) {
      console.log(chalk.green(`  ✅ Valid`));
    }
  }

  console.log(chalk.blue(`\n📊 Summary:`));
  console.log(`  Total files: ${agentFiles.length}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Warnings: ${warnings}`);

  if (errors === 0) {
    console.log(chalk.green('\n✅ All validations passed!\n'));
  } else {
    console.log(chalk.red('\n❌ Validation failed with errors\n'));
  }

  process.exit(errors > 0 ? 1 : 0);
}

main().catch(error => {
  console.error(chalk.red(`\n❌ Fatal error: ${error}\n`));
  process.exit(1);
});


