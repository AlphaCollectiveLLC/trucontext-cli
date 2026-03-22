import chalk from 'chalk';
import { clearCredentials } from '../config.js';

export async function logoutCommand() {
  clearCredentials();
  console.log(chalk.green('Logged out. Credentials cleared.'));
}
