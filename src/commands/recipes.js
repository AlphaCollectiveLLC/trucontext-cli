import chalk from 'chalk';
import { controlPlane } from '../client.js';
import { getActiveApp } from '../config.js';

function requireApp() {
  const appId = getActiveApp();
  if (!appId) {
    console.error(chalk.red('No active app. Run: trucontext use <app>'));
    process.exit(1);
  }
  return appId;
}

export async function recipesListCommand() {
  try {
    const appId = requireApp();
    const res = await controlPlane('GET', `/apps/${appId}/recipes`);
    const recipes = res.data?.recipes || [];

    if (recipes.length === 0) {
      console.log(chalk.yellow('No recipes found.'));
      return;
    }

    for (const r of recipes) {
      console.log(`${chalk.bold(r.recipeId)} ${chalk.dim(`[${r.type || 'custom'}]`)}`);
      if (r.name) console.log(`  ${r.name}`);
    }
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}

export async function recipesGetCommand(recipeId) {
  try {
    const appId = requireApp();
    const res = await controlPlane('GET', `/apps/${appId}/recipes/${recipeId}`);
    const r = res.data || res;

    console.log(chalk.bold(r.recipeId || recipeId));
    if (r.name) console.log(`  name: ${r.name}`);
    if (r.type) console.log(`  type: ${chalk.dim(r.type)}`);

    // Show interpretation (WHY) — present on both system and custom recipes
    if (r.interpretation) {
      console.log();
      console.log(chalk.bold('Interpretation:'));
      console.log(`  ${r.interpretation}`);
    }

    // System recipes have operational details (HOW)
    if (r.type === 'system') {
      if (r.entity_setup) {
        console.log();
        console.log(chalk.bold('Entity Setup:'));
        console.log(`  ${chalk.dim(JSON.stringify(r.entity_setup, null, 2).replace(/\n/g, '\n  '))}`);
      }
      if (r.ingest_patterns) {
        console.log();
        console.log(chalk.bold('Ingest Patterns:'));
        console.log(`  ${chalk.dim(JSON.stringify(r.ingest_patterns, null, 2).replace(/\n/g, '\n  '))}`);
      }
      if (r.query_patterns) {
        console.log();
        console.log(chalk.bold('Query Patterns:'));
        console.log(`  ${chalk.dim(JSON.stringify(r.query_patterns, null, 2).replace(/\n/g, '\n  '))}`);
      }
      if (r.lifecycle) {
        console.log();
        console.log(chalk.bold('Lifecycle:'));
        console.log(`  ${chalk.dim(JSON.stringify(r.lifecycle, null, 2).replace(/\n/g, '\n  '))}`);
      }
      if (r.example_scenario) {
        console.log();
        console.log(chalk.bold('Example Scenario:'));
        console.log(`  ${r.example_scenario}`);
      }
    }
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}

export async function recipesCreateCommand(options) {
  try {
    const appId = requireApp();

    if (!options.id) {
      console.error(chalk.red('--id is required'));
      process.exit(1);
    }
    if (!options.name) {
      console.error(chalk.red('--name is required'));
      process.exit(1);
    }
    if (!options.purpose) {
      console.error(chalk.red('--purpose is required'));
      process.exit(1);
    }

    const body = {
      recipeId: options.id,
      name: options.name,
      purpose: options.purpose,
    };

    if (options.decayProfile) body.decay_profile = options.decayProfile;
    if (options.confidenceBias) body.confidence_bias = options.confidenceBias;

    const res = await controlPlane('POST', `/apps/${appId}/recipes`, body);
    const r = res.data || res;
    console.log(chalk.green(`Created: ${chalk.bold(r.recipeId || options.id)}`));
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}

export async function recipesDeleteCommand(recipeId) {
  try {
    const appId = requireApp();
    await controlPlane('DELETE', `/apps/${appId}/recipes/${recipeId}`);
    console.log(chalk.green(`Deleted: ${recipeId}`));
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}
