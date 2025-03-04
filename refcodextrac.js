const fs = require('fs').promises;
const chalk = require('chalk').default;

function printBanner() {
  console.log(chalk.cyan("╔════════════════════════════════════════════════════╗"));
  console.log(chalk.cyan("║                    Aida AUTO BOT                   ║"));
  console.log(chalk.cyan("║            Automate your Aida registration!        ║"));
  console.log(chalk.cyan("║    Developed by: https://t.me/Offical_Im_kazuha    ║"));
  console.log(chalk.cyan("║    GitHub: https://github.com/Kazuha787            ║"));
  console.log(chalk.cyan("╠════════════════════════════════════════════════════╣"));
  console.log(chalk.cyan("║                                                    ║"));
  console.log(chalk.cyan("║  ██╗  ██╗ █████╗ ███████╗██╗   ██╗██╗  ██╗ █████╗  ║"));
  console.log(chalk.cyan("║  ██║ ██╔╝██╔══██╗╚══███╔╝██║   ██║██║  ██║██╔══██╗ ║"));
  console.log(chalk.cyan("║  █████╔╝ ███████║  ███╔╝ ██║   ██║███████║███████║ ║"));
  console.log(chalk.cyan("║  ██╔═██╗ ██╔══██║ ███╔╝  ██║   ██║██╔══██║██╔══██║ ║"));
  console.log(chalk.cyan("║  ██║  ██╗██║  ██║███████╗╚██████╔╝██║  ██║██║  ██║ ║"));
  console.log(chalk.cyan("║  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ║"));
  console.log(chalk.cyan("║                                                    ║"));
  console.log(chalk.cyan("╚════════════════════════════════════════════════════╝"));
}

async function extractRefCodes() {
  try {
    printBanner();
    
    const content = await fs.readFile('accounts.txt', 'utf8');
    // Split the file into lines and filter out lines that contain "RefCode:"
    const lines = content.split('\n');
    const refCodes = lines
      .filter(line => line.startsWith('RefCode:'))
      .map(line => line.substring('RefCode:'.length).trim())
      .filter(code => code.length > 0);

    // Remove duplicate referral codes if necessary
    const uniqueRefCodes = [...new Set(refCodes)];

    await fs.writeFile('refs.txt', uniqueRefCodes.join('\n'));
    console.log(chalk.green(`Extracted ${uniqueRefCodes.length} referral code(s) and saved to refs.txt`));
  } catch (error) {
    console.error(chalk.red('Error extracting referral codes:'), error.message);
  }
}

extractRefCodes();
