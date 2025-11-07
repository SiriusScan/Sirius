import { generateAgentIdentity } from "./generators/index.js";
import { glob } from "glob";
import chalk from "chalk";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log(`
${chalk.blue("🤖 Agent Identity Generator")}

Usage: npm run generate [options]

Options:
  --all              Generate all agent identities
  --product=<name>   Generate specific product (e.g., app-agent)
  --help             Show this help

Examples:
  npm run generate -- --all
  npm run generate -- --product=agent-engineer
    `);
    return;
  }

  console.log(chalk.blue("\n🤖 Agent Identity Generation\n"));

  try {
    if (args.includes("--all")) {
      // Find config files relative to the project root (2 levels up from src/)
      const configs = await glob("../../.cursor/agents/config/*.config.yaml");

      if (configs.length === 0) {
        console.log(
          chalk.yellow("⚠️  No config files found in .cursor/agents/config/")
        );
        return;
      }

      console.log(chalk.blue(`Found ${configs.length} config file(s)\n`));

      for (const config of configs) {
        await generateAgentIdentity(config);
      }

      console.log(
        chalk.green("\n✅ All agent identities generated successfully!\n")
      );
    } else {
      const product = args
        .find((arg) => arg.startsWith("--product="))
        ?.split("=")[1];
      if (!product) {
        console.error(chalk.red("❌ Error: Specify --product=<name> or --all"));
        console.log(chalk.blue("Run with --help for usage information"));
        process.exit(1);
      }

      const configPath = `../../.cursor/agents/config/${product}.config.yaml`;
      await generateAgentIdentity(configPath);

      console.log(chalk.green("\n✅ Agent identity generated successfully!\n"));
    }
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error}\n`));
    process.exit(1);
  }
}

main();
