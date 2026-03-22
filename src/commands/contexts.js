import chalk from 'chalk';
import { dataPlane } from '../client.js';

export async function contextsListCommand() {
  try {
    const res = await dataPlane('GET', '/v1/contexts');
    const contexts = res.data?.contexts || [];

    if (contexts.length === 0) {
      console.log(chalk.yellow('No contexts. Create one with: trucontext contexts create <name>'));
      return;
    }

    for (const ctx of contexts) {
      console.log(`${chalk.bold(ctx.name)} ${chalk.dim(ctx.contextId)}`);
      if (ctx.metadata && Object.keys(ctx.metadata).length > 0) {
        console.log(`  ${chalk.dim(JSON.stringify(ctx.metadata))}`);
      }
    }
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}

export async function contextsCreateCommand(name, options) {
  try {
    const body = { name };
    if (options.metadata) {
      try {
        body.metadata = JSON.parse(options.metadata);
      } catch {
        console.error(chalk.red('Invalid metadata JSON'));
        process.exit(1);
      }
    }

    const res = await dataPlane('POST', '/v1/contexts', body);
    const ctx = res.data;
    console.log(chalk.green(`Created: ${chalk.bold(ctx.name)}`));
    console.log(chalk.dim(`Context ID: ${ctx.contextId}`));
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}

export async function contextsDeleteCommand(contextId) {
  try {
    await dataPlane('DELETE', `/v1/contexts/${contextId}`);
    console.log(chalk.green(`Deleted: ${contextId}`));
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}
