#!/usr/bin/env node

import { program } from 'commander';
import { loginCommand } from '../src/commands/login.js';
import { logoutCommand } from '../src/commands/logout.js';
import { whoamiCommand } from '../src/commands/whoami.js';
import { appsCommand, useCommand } from '../src/commands/apps.js';
import { initCommand } from '../src/commands/init.js';
import { ingestCommand } from '../src/commands/ingest.js';
import { queryCommand } from '../src/commands/query.js';
import { recallCommand } from '../src/commands/recall.js';
import { contextsListCommand, contextsCreateCommand, contextsDeleteCommand } from '../src/commands/contexts.js';
import { schemaShowCommand, schemaGenerateCommand } from '../src/commands/schema.js';
import { entitiesListCommand, entitiesGetCommand, entitiesCreateCommand, entitiesUpdateCommand, entitiesDeleteCommand } from '../src/commands/entities.js';
import { recipesListCommand, recipesGetCommand, recipesCreateCommand, recipesDeleteCommand } from '../src/commands/recipes.js';
import { relationshipTypesListCommand } from '../src/commands/relationship-types.js';

program
  .name('trucontext')
  .description('TruContext CLI — contextual memory for AI applications')
  .version('0.1.1');

// Auth
program.command('login')
  .description('Sign in via browser')
  .option('-g, --google', 'Sign in with Google (skip hosted UI)')
  .action(loginCommand);

program.command('logout')
  .description('Clear stored credentials')
  .action(logoutCommand);

program.command('whoami')
  .description('Show current user and active app')
  .action(whoamiCommand);

// Init
program.command('init [name]')
  .description('Create a new app and set it as active')
  .option('-d, --description <text>', 'App description')
  .action(initCommand);

// Apps
program.command('apps')
  .description('List your apps')
  .action(appsCommand);

program.command('use <app>')
  .description('Set active app (by ID or name)')
  .action(useCommand);

// Ingest
program.command('ingest <source>')
  .description('Ingest a file or text string')
  .option('-c, --context <entry>', 'Link to context node (entity-id:RELATIONSHIP, repeatable)', (val, prev) => [...prev, val], [])
  .option('--confidence <n>', 'Confidence level (0.0-1.0)')
  .option('--temporal', 'Content can decay over time (default)')
  .option('--no-temporal', 'Content is a permanent fact')
  .action(ingestCommand);

// Query
program.command('query <question>')
  .description('Query the knowledge graph')
  .option('-c, --context <id>', 'Scope to a context')
  .option('-m, --mode <mode>', 'Query mode: answer (default) or context', 'answer')
  .option('-l, --limit <n>', 'Max results', '20')
  .action(queryCommand);

// Recall
program.command('recall <query>')
  .description('Semantic memory recall')
  .option('-c, --context <id>', 'Scope to a context')
  .option('-l, --limit <n>', 'Max seed results', '10')
  .option('-d, --depth <n>', 'Graph expansion depth', '2')
  .action(recallCommand);

// Contexts
const contexts = program.command('contexts').description('Manage contexts');
contexts.command('list').description('List contexts').action(contextsListCommand);
contexts.command('create <name>')
  .description('Create a context')
  .option('--metadata <json>', 'JSON metadata object')
  .action(contextsCreateCommand);
contexts.command('delete <id>').description('Delete a context').action(contextsDeleteCommand);

// Entities
const entities = program.command('entities').description('Manage entities');
entities.command('list')
  .description('List entities')
  .option('--type <type>', 'Filter by entity type')
  .option('-l, --limit <n>', 'Max results')
  .action(entitiesListCommand);
entities.command('get <entityId>')
  .description('Get an entity')
  .action(entitiesGetCommand);
entities.command('create')
  .description('Create an entity')
  .requiredOption('--id <entityId>', 'Entity ID')
  .requiredOption('--type <Type>', 'Entity type (PascalCase)')
  .option('--properties <json>', 'JSON properties object')
  .option('--recipe <recipeId>', 'Recipe ID')
  .option('--no-heartbeat', 'Disable heartbeat')
  .option('--confidence <n>', 'Confidence level (0.0-1.0)')
  .option('--temporal', 'Content can decay over time (default)')
  .option('--no-temporal', 'Content is a permanent fact')
  .option('-c, --context <entry>', 'Link to context (entity-id:RELATIONSHIP, repeatable)', (val, prev) => [...prev, val], [])
  .action(entitiesCreateCommand);
entities.command('update <entityId>')
  .description('Update an entity')
  .option('--properties <json>', 'JSON properties object')
  .option('--recipe <recipeId>', 'Recipe ID')
  .option('--heartbeat', 'Enable heartbeat')
  .option('--no-heartbeat', 'Disable heartbeat')
  .option('--confidence <n>', 'Confidence level (0.0-1.0)')
  .option('--temporal', 'Content can decay over time')
  .option('--no-temporal', 'Content is a permanent fact')
  .action(entitiesUpdateCommand);
entities.command('delete <entityId>')
  .description('Delete an entity')
  .action(entitiesDeleteCommand);

// Recipes
const recipes = program.command('recipes').description('Manage recipes');
recipes.command('list')
  .description('List recipes')
  .action(recipesListCommand);
recipes.command('get <recipeId>')
  .description('Get recipe details')
  .action(recipesGetCommand);
recipes.command('create')
  .description('Create a recipe')
  .requiredOption('--id <recipeId>', 'Recipe ID')
  .requiredOption('--name <name>', 'Recipe name')
  .requiredOption('--purpose <text>', 'Recipe purpose')
  .option('--decay-profile <text>', 'Decay profile description')
  .option('--confidence-bias <text>', 'Confidence bias description')
  .action(recipesCreateCommand);
recipes.command('delete <recipeId>')
  .description('Delete a recipe')
  .action(recipesDeleteCommand);

// Relationship Types
program.command('relationship-types')
  .description('List relationship types')
  .option('--category <cat>', 'Filter by category')
  .action(relationshipTypesListCommand);

// Schema
const schema = program.command('schema').description('Manage app schema');
schema.command('show').description('Show current schema').action(schemaShowCommand);
schema.command('generate')
  .description('AI-generate a schema')
  .requiredOption('-d, --description <text>', 'App description for schema generation')
  .option('-n, --name <name>', 'App name')
  .action(schemaGenerateCommand);

program.parse();
