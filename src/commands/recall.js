import chalk from 'chalk';
import { dataPlane } from '../client.js';

export async function recallCommand(query, options) {
  try {
    const body = {
      query,
      maxResults: options.limit ? parseInt(options.limit, 10) : 10,
      expansionDepth: options.depth ? parseInt(options.depth, 10) : 2,
    };

    if (options.context) body.context_id = options.context;

    const res = await dataPlane('POST', '/v1/recall', body);

    // Print synthesis
    if (res.synthesis?.summary) {
      console.log(chalk.bold('\nSynthesis:'));
      console.log(res.synthesis.summary);
    }

    // Print seeds
    if (res.seeds?.length > 0) {
      console.log(chalk.bold(`\nSeeds (${res.seeds.length}):`));
      for (const s of res.seeds) {
        const label = s.snippet || s.label || s.id;
        const score = (s.score * 100).toFixed(0);
        console.log(`  ${chalk.dim(`${score}%`)} ${label.slice(0, 100)}`);
      }
    }

    // Print graph context summary
    if (res.context) {
      console.log(chalk.dim(`\nGraph: ${res.context.nodes?.length || 0} nodes, ${res.context.edges?.length || 0} edges`));
    }

    console.log(chalk.dim(`${res.latency_ms}ms`));
  } catch (err) {
    console.error(chalk.red(`Recall failed: ${err.message}`));
    process.exit(1);
  }
}
