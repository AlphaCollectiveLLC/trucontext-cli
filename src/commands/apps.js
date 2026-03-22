import chalk from 'chalk';
import { controlPlane } from '../client.js';
import { getActiveApp, setActiveApp } from '../config.js';

export async function appsCommand() {
  try {
    const res = await controlPlane('GET', '/apps');
    const apps = res.data?.apps || [];
    const activeApp = getActiveApp();

    if (apps.length === 0) {
      console.log(chalk.yellow('No apps. Create one in the dashboard.'));
      return;
    }

    for (const app of apps) {
      const active = app.appId === activeApp ? chalk.green(' (active)') : '';
      console.log(`${chalk.bold(app.name)}${active}`);
      console.log(`  ${chalk.dim(app.appId)} — ${app.status}`);
    }
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}

export async function useCommand(appId) {
  try {
    const res = await controlPlane('GET', '/apps');
    const apps = res.data?.apps || [];
    const app = apps.find(a => a.appId === appId || a.name.toLowerCase() === appId.toLowerCase());

    if (!app) {
      console.error(chalk.red(`App not found: ${appId}`));
      console.log(chalk.dim('Available apps:'));
      for (const a of apps) {
        console.log(`  ${a.name} ${chalk.dim(a.appId)}`);
      }
      process.exit(1);
    }

    setActiveApp(app.appId);
    console.log(chalk.green(`Active app: ${chalk.bold(app.name)} (${app.appId})`));
  } catch (err) {
    console.error(chalk.red(`Failed: ${err.message}`));
    process.exit(1);
  }
}
