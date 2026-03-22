import chalk from 'chalk';
import select from '@inquirer/select';
import checkbox from '@inquirer/checkbox';
import { performLogin } from '../auth.js';
import { controlPlane } from '../client.js';
import { setActiveApp, hasAcceptedTerms, recordTermsAcceptance } from '../config.js';

async function promptTermsAcceptance() {
  if (hasAcceptedTerms()) return true;

  console.log(`
${chalk.bold('Welcome to TruContext')}

Before continuing, please review and accept our legal agreements.

${chalk.cyan('Key Points:')}

  ${chalk.bold('Your Data')}
  - You own your data. We claim no ownership rights.
  - We will NOT use your data to train AI models without
    your separate, explicit written consent.
  - Your data is isolated to your tenant. Other users
    cannot access it.

  ${chalk.bold('Privacy')}
  - Content you ingest is processed by AI providers
    (Anthropic, Google) via their APIs to operate the
    Service. These providers do not train on API inputs.
  - We do not sell, rent, or share your data with third
    parties for commercial purposes.

  ${chalk.bold('Liability')}
  - The Service is provided "as is" without warranties.
  - Our total liability is limited to fees paid in the
    prior 12 months or $100, whichever is greater.
`);

  // Offer to view full documents
  const viewChoice = await select({
    message: 'Would you like to read the full legal documents?',
    choices: [
      { name: 'Continue to acceptance', value: 'continue' },
      { name: 'View Terms of Service', value: 'terms' },
      { name: 'View Privacy Policy', value: 'privacy' },
      { name: 'View both', value: 'both' },
    ],
  });

  if (viewChoice !== 'continue') {
    const { default: open } = await import('open');
    if (viewChoice === 'terms' || viewChoice === 'both') {
      console.log(chalk.dim('Opening Terms of Service...'));
      await open('https://trucontext.ai/terms');
    }
    if (viewChoice === 'privacy' || viewChoice === 'both') {
      console.log(chalk.dim('Opening Privacy Policy...'));
      await open('https://trucontext.ai/privacy');
    }
    console.log();
  }

  // Checkbox acceptance — both must be checked
  const accepted = await checkbox({
    message: 'To continue, check both boxes:',
    required: true,
    choices: [
      { name: 'I have read and agree to the Terms of Service', value: 'terms' },
      { name: 'I have read and agree to the Privacy Policy', value: 'privacy' },
    ],
  });

  if (!accepted.includes('terms') || !accepted.includes('privacy')) {
    console.log(chalk.yellow('\nYou must accept both the Terms of Service and Privacy Policy to use TruContext.'));
    return false;
  }

  recordTermsAcceptance();
  console.log(chalk.green('\nTerms accepted.\n'));
  return true;
}

export async function loginCommand(options) {
  // Terms acceptance gate — must accept before first login
  const accepted = await promptTermsAcceptance();
  if (!accepted) {
    process.exit(0);
  }

  const provider = options.google ? 'Google' : undefined;
  console.log(chalk.dim(`Opening browser for sign-in${provider ? ` (${provider})` : ''}...`));

  try {
    const creds = await performLogin({ provider });
    console.log(chalk.green(`\nLogged in as ${chalk.bold(creds.email)}`));

    // Fetch apps and select or create one
    try {
      const res = await controlPlane('GET', '/apps');
      const apps = res.data?.apps || [];

      if (apps.length === 1) {
        setActiveApp(apps[0].appId);
        console.log(chalk.dim(`Active app: ${apps[0].name} (${apps[0].appId})\n`));
      } else if (apps.length > 1) {
        const chosen = await select({
          message: 'Select an app:',
          choices: apps.map(app => ({
            name: `${app.name}  ${chalk.dim(app.appId)}`,
            value: app.appId,
          })),
        });
        setActiveApp(chosen);
        const app = apps.find(a => a.appId === chosen);
        console.log(chalk.green(`Active app: ${app.name}\n`));
      } else {
        console.log(chalk.yellow('\nNo apps yet. Let\'s create your first one.\n'));
        const { initCommand } = await import('./init.js');
        await initCommand(undefined, {});
      }
    } catch {
      // Non-fatal — login still succeeded
      console.log();
    }
  } catch (err) {
    console.error(chalk.red(`Login failed: ${err.message}`));
    process.exit(1);
  }
}
