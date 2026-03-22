import chalk from 'chalk';
import { dataPlane } from '../client.js';

export async function entitiesListCommand(options) {
  try {
    const params = new URLSearchParams();
    if (options.type) params.set('type', options.type);
    if (options.limit) params.set('limit', options.limit);
    const qs = params.toString();
    const path = `/v1/entities${qs ? `?${qs}` : ''}`;

    const res = await dataPlane('GET', path);
    const entities = res.data?.entities || [];

    if (entities.length === 0) {
      console.log(chalk.yellow('No entities found.'));
      return;
    }

    for (const e of entities) {
      console.log(`${chalk.bold(e.entityId)} ${chalk.dim(`[${e.type}]`)}`);
      if (e.recipe_id) console.log(`  recipe: ${chalk.dim(e.recipe_id)}`);
      if (e.properties && Object.keys(e.properties).length > 0) {
        console.log(`  properties: ${chalk.dim(JSON.stringify(e.properties))}`);
      }
      if (e.heartbeat_enabled !== undefined) console.log(`  heartbeat: ${chalk.dim(e.heartbeat_enabled)}`);
      if (e.confidence !== undefined) console.log(`  confidence: ${chalk.dim(e.confidence)}`);
      if (e.temporal !== undefined) console.log(`  temporal: ${chalk.dim(e.temporal)}`);
    }
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}

export async function entitiesGetCommand(entityId) {
  try {
    const res = await dataPlane('GET', `/v1/entities/${entityId}`);
    const e = res.data || res;

    console.log(`${chalk.bold(e.entityId)} ${chalk.dim(`[${e.type}]`)}`);
    if (e.recipe_id) console.log(`  recipe: ${chalk.dim(e.recipe_id)}`);
    if (e.properties && Object.keys(e.properties).length > 0) {
      console.log(`  properties: ${chalk.dim(JSON.stringify(e.properties))}`);
    }
    if (e.heartbeat_enabled !== undefined) console.log(`  heartbeat: ${chalk.dim(e.heartbeat_enabled)}`);
    if (e.confidence !== undefined) console.log(`  confidence: ${chalk.dim(e.confidence)}`);
    if (e.temporal !== undefined) console.log(`  temporal: ${chalk.dim(e.temporal)}`);
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}

export async function entitiesCreateCommand(options) {
  try {
    if (!options.id) {
      console.error(chalk.red('--id is required'));
      process.exit(1);
    }
    if (!options.type) {
      console.error(chalk.red('--type is required'));
      process.exit(1);
    }

    const body = {
      entityId: options.id,
      type: options.type,
    };

    if (options.properties) {
      try {
        body.properties = JSON.parse(options.properties);
      } catch {
        console.error(chalk.red('Invalid properties JSON'));
        process.exit(1);
      }
    }

    if (options.recipe) body.recipe_id = options.recipe;
    if (options.heartbeat === false) body.heartbeat_enabled = false;
    if (options.confidence !== undefined) body.confidence = parseFloat(options.confidence);
    if (options.temporal !== undefined) body.temporal = options.temporal;

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

    const res = await dataPlane('POST', '/v1/entities', body);
    const e = res.data || res;
    console.log(chalk.green(`Created: ${chalk.bold(e.entityId || options.id)}`));
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}

export async function entitiesUpdateCommand(entityId, options) {
  try {
    const body = {};

    if (options.properties) {
      try {
        body.properties = JSON.parse(options.properties);
      } catch {
        console.error(chalk.red('Invalid properties JSON'));
        process.exit(1);
      }
    }

    if (options.recipe) body.recipe_id = options.recipe;
    if (options.heartbeat !== undefined) body.heartbeat_enabled = options.heartbeat;
    if (options.confidence !== undefined) body.confidence = parseFloat(options.confidence);
    if (options.temporal !== undefined) body.temporal = options.temporal;

    await dataPlane('PUT', `/v1/entities/${entityId}`, body);
    console.log(chalk.green(`Updated: ${entityId}`));
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}

export async function entitiesDeleteCommand(entityId) {
  try {
    await dataPlane('DELETE', `/v1/entities/${entityId}`);
    console.log(chalk.green(`Deleted: ${entityId}`));
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}
