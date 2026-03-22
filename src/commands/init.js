import chalk from 'chalk';
import input from '@inquirer/input';
import select from '@inquirer/select';
import { controlPlane } from '../client.js';
import { setActiveApp } from '../config.js';

export async function initCommand(name, options) {
  // Step 1: App name
  if (!name) {
    name = await input({ message: 'App name:' });
  }

  // Step 2: Description (required for schema generation)
  let description = options.description;
  if (!description) {
    description = await input({
      message: 'Describe your app (what data will it store, who uses it):',
    });
  }

  // Step 3: Authorship model
  const authorship = await select({
    message: 'Who creates content in your app?',
    choices: [
      { name: 'Multiple users contribute content', value: 'multi', description: 'e.g. team wikis, social apps, collaboration tools' },
      { name: 'Single author / personal use', value: 'single', description: 'e.g. personal notes, solo projects' },
      { name: 'The app itself generates content', value: 'app', description: 'e.g. automated pipelines, bots, scrapers' },
    ],
  });

  // Step 4: Create the app
  console.log(chalk.dim(`\nCreating app "${name}"...`));

  try {
    const res = await controlPlane('POST', '/apps', { name, description });
    const app = res.data;
    setActiveApp(app.appId);

    console.log(chalk.green(`App created: ${app.appId}`));

    // Step 5: Generate schema
    console.log(chalk.dim('Generating schema from description...'));

    const schemaRes = await controlPlane('POST', '/schema/generate', {
      description,
      authorship_model: authorship,
    });
    const schema = schemaRes.data?.schema;

    if (schema) {
      // Step 6: Save schema to app
      await controlPlane('PUT', `/apps/${app.appId}/schema`, schema);

      console.log(chalk.green('Schema generated and saved.\n'));

      // Show a summary
      if (schema.entity_types) {
        console.log(chalk.bold('Entity types:'));
        for (const et of schema.entity_types) {
          console.log(`  ${chalk.cyan(et.name)}  ${chalk.dim(et.description || '')}`);
        }
      }
      if (schema.edge_types) {
        console.log(chalk.bold('\nRelationships:'));
        for (const edge of schema.edge_types) {
          console.log(`  ${chalk.dim(edge.from)} ${chalk.yellow(`—${edge.name}→`)} ${chalk.dim(edge.to)}`);
        }
      }
    } else {
      console.log(chalk.yellow('Schema generation returned empty — you can generate one later:'));
      console.log(chalk.cyan('  trucontext schema generate -d "your description"'));
    }

    console.log(chalk.dim(`\nReady to go:`));
    console.log(chalk.cyan('  trucontext ingest <file>'));
    console.log(chalk.cyan('  trucontext query "your question"'));
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}
