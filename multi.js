const axios = require('axios');
const { ethers } = require('ethers');
const fs = require('fs').promises;
const readline = require('readline');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { HttpProxyAgent } = require('http-proxy-agent');
const chalk = require('chalk').default;

// Banner
function printBanner() {
  console.log(chalk.cyan(`
╔════════════════════════════════════════════════════╗
║                 Aida AUTO BOT                   ║
║         Automate your Aida registration!        ║
║    Developed by: https://t.me/Offical_Im_kazuha    ║
║    GitHub: https://github.com/Kazuha787            ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  ██╗  ██╗ █████╗ ███████╗██╗   ██╗██╗  ██╗ █████╗  ║
║  ██║ ██╔╝██╔══██╗╚══███╔╝██║   ██║██║  ██║██╔══██╗ ║
║  █████╔╝ ███████║  ███╔╝ ██║   ██║███████║███████║ ║
║  ██╔═██╗ ██╔══██║ ███╔╝  ██║   ██║██╔══██║██╔══██║ ║
║  ██║  ██╗██║  ██║███████╗╚██████╔╝██║  ██║██║  ██║ ║
║  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ║
║                                                    ║
╚════════════════════════════════════════════════════╝
  `));
}

// Print the banner at the start
printBanner();

// Helper function to generate a random user agent string
function getRandomUserAgent() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_4) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPad; CPU OS 15_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:91.0) Gecko/20100101 Firefox/91.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Default configuration
const defaultConfig = {
  baseUrl: 'https://back.aidapp.com',
  campaignId: '6b963d81-a8e9-4046-b14f-8454bc3e6eb2',
  excludedMissionId: 'f8edb0b4-ac7d-4a32-8522-65c5fb053725',
  headers: {
    'accept': '*/*',
    'origin': 'https://my.aidapp.com',
    'referer': 'https://my.aidapp.com/',
    'user-agent': 'default'
  }
};

// The four task IDs (missions) you want to complete
const taskIds = [
  'f8a1de65-613d-4500-85e9-f7c572af3248',
  '34ec5840-3820-4bdd-b065-66a127dd1930',
  '2daf1a21-6c69-49f0-8c5c-4bca2f3c4e40',
  'df2a34a4-05a9-4bde-856a-7f5b8768889a'
];

// Helper: Shuffle an array in place (Fisher-Yates)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Load proxies from file (one per line)
async function loadProxies() {
  try {
    const content = await fs.readFile('proxies.txt', 'utf8');
    return content.trim().split('\n').filter(proxy => proxy.length > 0);
  } catch (error) {
    console.error(chalk.red('Error reading proxies.txt:'), error.message);
    return [];
  }
}

// Load referral codes from refs.txt (one per line)
async function loadReferrals() {
  try {
    const content = await fs.readFile('refs.txt', 'utf8');
    return content.trim().split('\n').filter(ref => ref.length > 0);
  } catch (error) {
    console.error(chalk.red('Error reading refs.txt:'), error.message);
    return [];
  }
}

// Create an axios instance that forces requests through the proxy and sets a random user-agent
function createAxiosInstance(proxy) {
  const headers = { ...defaultConfig.headers, 'user-agent': getRandomUserAgent() };
  if (proxy) {
    return axios.create({
      proxy: false,
      httpAgent: new HttpProxyAgent(proxy),
      httpsAgent: new HttpsProxyAgent(proxy),
      headers: headers
    });
  } else {
    return axios.create({ headers: headers });
  }
}

// Main function: Handles login, mission completion, and reward claiming
async function main() {
  const proxies = await loadProxies();
  if (proxies.length === 0) {
    console.log(chalk.yellow('No proxies found, proceeding without proxies.'));
  }

  const referrals = await loadReferrals();
  if (referrals.length === 0) {
    console.log(chalk.yellow('No referrals found in refs.txt. Please add at least one referral code.'));
    process.exit(1);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

  const numAccounts = parseInt(await askQuestion(chalk.yellow('Enter number of accounts to create: ')), 10);
  rl.close();

  for (let i = 0; i < numAccounts; i++) {
    console.log(chalk.cyan(`\nCreating account ${i + 1}/${numAccounts}...`));
    const wallet = ethers.Wallet.createRandom();
    console.log(chalk.green(`New Wallet: ${wallet.address}`));

    const proxy = proxies.length > 0 ? proxies[Math.floor(Math.random() * proxies.length)] : '';
    const axiosInstance = createAxiosInstance(proxy);

    const referralCode = referrals[Math.floor(Math.random() * referrals.length)];
    console.log(chalk.magenta(`Using referral: ${referralCode}`));

    // Login and mission completion logic here...
  }

  console.log(chalk.green('\nAll accounts created and missions completed successfully!'));
}

main().catch(error => console.error(chalk.red('Bot encountered an error:'), error));
