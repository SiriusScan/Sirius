import chalk from 'chalk';

export const logger = {
  info: (message: string) => console.log(chalk.blue(`ℹ️  ${message}`)),
  success: (message: string) => console.log(chalk.green(`✅ ${message}`)),
  warning: (message: string) => console.log(chalk.yellow(`⚠️  ${message}`)),
  error: (message: string) => console.log(chalk.red(`❌ ${message}`)),
  debug: (message: string) => console.log(chalk.gray(`🔍 ${message}`)),
};


