import chalk from 'chalk';
import { dataPlane } from '../client.js';

export async function queryCommand(question, options) {
  try {
    const body = {
      mode: options.mode === 'context' ? 'CONTEXT' : 'ANSWER',
      max_results: options.limit ? parseInt(options.limit, 10) : 20,
    };

    if (body.mode === 'ANSWER') {
      body.query = question;
    } else {
      body.topic = question;
    }

    if (options.context) body.context_id = options.context;

    const res = await dataPlane('POST', '/v1/query', body);

    // Print answer
    if (res.answer?.summary) {
      console.log(chalk.bold('\nAnswer:'));
      console.log(res.answer.summary);
      if (res.answer.confidence) {
        console.log(chalk.dim(`\nConfidence: ${(res.answer.confidence * 100).toFixed(0)}%`));
      }
    }

    // Print concepts
    if (res.concepts?.length > 0) {
      console.log(chalk.bold('\nConcepts:'));
      for (const c of res.concepts.slice(0, 5)) {
        console.log(`  ${c.label} ${chalk.dim(`(${c.evidence_count} evidence)`)}`);
      }
    }

    // Print people
    if (res.people?.length > 0) {
      console.log(chalk.bold('\nPeople:'));
      for (const p of res.people.slice(0, 5)) {
        console.log(`  ${p.name} ${chalk.dim(p.relationship || '')}`);
      }
    }

    console.log(chalk.dim(`\n${res.latency_ms}ms`));
  } catch (err) {
    console.error(chalk.red(`Query failed: ${err.message}`));
    process.exit(1);
  }
}
