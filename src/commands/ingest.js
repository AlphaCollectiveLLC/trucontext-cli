import chalk from 'chalk';
import { readFileSync, existsSync } from 'fs';
import { basename } from 'path';
import { dataPlane } from '../client.js';

export async function ingestCommand(source, options) {
  try {
    let body;

    if (existsSync(source)) {
      const content = readFileSync(source);
      const filename = basename(source);
      const ext = filename.split('.').pop().toLowerCase();

      const textExts = ['txt', 'md', 'csv', 'html', 'json'];
      const isText = textExts.includes(ext);

      body = {
        content: isText ? content.toString('utf-8') : content.toString('base64'),
        content_type: isText ? 'text/plain' : `application/${ext}`,
        encoding: isText ? undefined : 'base64',
        metadata: { original_filename: filename, source_medium: 'cli' },
      };
    } else {
      body = {
        content: source,
        content_type: 'text/plain',
        metadata: { source_medium: 'cli' },
      };
    }

    if (options.confidence !== undefined) body.confidence = parseFloat(options.confidence);
    if (options.temporal !== undefined) body.temporal = options.temporal;

    // Build contexts array from --context flags: "entity-id:RELATIONSHIP"
    if (options.context?.length > 0) {
      body.contexts = options.context.map(entry => {
        const colonIdx = entry.indexOf(':');
        if (colonIdx === -1) {
          return { context_id: entry, relationship: 'ABOUT' };
        }
        return {
          context_id: entry.slice(0, colonIdx),
          relationship: entry.slice(colonIdx + 1),
        };
      });
    }

    const res = await dataPlane('POST', '/v1/ingest', body);
    console.log(chalk.green('Accepted'));
    console.log(chalk.dim(`Content ID: ${res.contentId}`));
    if (res.status === 'upload_required') {
      console.log(chalk.yellow(`Large file — upload to: ${res.uploadUrl}`));
    }
  } catch (err) {
    console.error(chalk.red(`Ingest failed: ${err.message}`));
    process.exit(1);
  }
}
