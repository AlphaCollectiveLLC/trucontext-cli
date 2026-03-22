import chalk from 'chalk';
import { controlPlane } from '../client.js';
import { getActiveApp } from '../config.js';

export async function relationshipTypesListCommand(options) {
  try {
    const appId = getActiveApp();
    if (!appId) {
      console.error(chalk.red('No active app. Run: trucontext use <app>'));
      process.exit(1);
    }

    const params = new URLSearchParams();
    if (options.category) params.set('category', options.category);
    const qs = params.toString();
    const path = `/apps/${appId}/relationship-types${qs ? `?${qs}` : ''}`;

    const res = await controlPlane('GET', path);
    const types = res.data?.relationshipTypes || res.data || [];

    if (Array.isArray(types) && types.length === 0) {
      console.log(chalk.yellow('No relationship types found.'));
      return;
    }

    // Group by category if present
    if (Array.isArray(types)) {
      const grouped = {};
      for (const t of types) {
        const cat = t.category || 'uncategorized';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(t);
      }

      for (const [category, items] of Object.entries(grouped)) {
        console.log(chalk.bold(category));
        for (const t of items) {
          const desc = t.description ? ` — ${t.description}` : '';
          console.log(`  ${chalk.dim(t.type || t.relationshipType)}${desc}`);
        }
      }
    } else if (typeof types === 'object') {
      // Already grouped by category
      for (const [category, items] of Object.entries(types)) {
        console.log(chalk.bold(category));
        for (const t of items) {
          const desc = t.description ? ` — ${t.description}` : '';
          console.log(`  ${chalk.dim(t.type || t.relationshipType)}${desc}`);
        }
      }
    }
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}
