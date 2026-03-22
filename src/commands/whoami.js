import chalk from 'chalk';
import { getCredentials, getActiveApp } from '../config.js';

export async function whoamiCommand() {
  const creds = getCredentials();
  if (!creds) {
    console.log(chalk.yellow('Not logged in. Run: trucontext login'));
    process.exit(1);
  }

  console.log(chalk.bold('Email:'), creds.email);
  console.log(chalk.bold('Sub:'), chalk.dim(creds.sub));

  const activeApp = getActiveApp();
  if (activeApp) {
    console.log(chalk.bold('Active app:'), activeApp);
  } else {
    console.log(chalk.bold('Active app:'), chalk.yellow('none — run: trucontext use <app-id>'));
  }

  const expiresIn = Math.max(0, Math.round((creds.expiresAt - Date.now()) / 1000));
  console.log(chalk.bold('Token expires in:'), expiresIn > 0 ? `${expiresIn}s` : chalk.red('expired'));
}
