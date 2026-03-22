import chalk from 'chalk';
import { controlPlane } from '../client.js';
import { getActiveApp } from '../config.js';

function requireActiveApp() {
  const appId = getActiveApp();
  if (!appId) {
    console.error(chalk.red('No active app. Run: trucontext use <app-id>'));
    process.exit(1);
  }
  return appId;
}

export async function schemaShowCommand() {
  const appId = requireActiveApp();
  try {
    const res = await controlPlane('GET', `/apps/${appId}/schema`);
    const schema = res.data;

    if (!schema) {
      console.log(chalk.yellow('No schema configured. Generate one with: trucontext schema generate'));
      return;
    }

    console.log(chalk.bold('Schema:'), schema.name || appId);
    console.log(chalk.bold('Version:'), schema.version || 'v1');

    if (schema.custom_node_types?.length > 0) {
      console.log(chalk.bold('\nNode Types:'));
      for (const t of schema.custom_node_types) {
        console.log(`  ${chalk.cyan(t.name)} — ${t.description || ''}`);
        if (t.properties?.length > 0) {
          console.log(`    ${chalk.dim(t.properties.join(', '))}`);
        }
      }
    }

    if (schema.custom_edge_types?.length > 0) {
      console.log(chalk.bold('\nEdge Types:'));
      console.log(`  ${chalk.dim(schema.custom_edge_types.join(', '))}`);
    }
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}

export async function schemaGenerateCommand(options) {
  const appId = requireActiveApp();
  try {
    if (!options.description) {
      console.error(chalk.red('Description required: trucontext schema generate --description "..."'));
      process.exit(1);
    }

    console.log(chalk.dim('Generating schema...'));
    const res = await controlPlane('POST', '/schema/generate', {
      description: options.description,
      appName: options.name || appId,
    });

    console.log(chalk.green('Schema generated.'));
    const schema = res.data;
    if (schema?.custom_node_types) {
      console.log(chalk.bold('Node types:'), schema.custom_node_types.map(t => t.name).join(', '));
    }
    if (schema?.custom_edge_types) {
      console.log(chalk.bold('Edge types:'), schema.custom_edge_types.join(', '));
    }
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}
