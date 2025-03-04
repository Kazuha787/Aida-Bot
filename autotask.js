const axios = require('axios');
const fs = require('fs').promises;
const { HttpsProxyAgent } = require('https-proxy-agent');
const chalk = require('chalk').default;

// Banner
function printBanner() {
  console.log(chalk.cyan(`
╔════════════════════════════════════════════════════╗
║                 AIDA AUTO BOT                   ║
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

// Print banner at the start
printBanner();

// Default configuration for endpoints and headers
const defaultConfig = {
  baseUrl: 'https://back.aidapp.com',
  campaignId: '6b963d81-a8e9-4046-b14f-8454bc3e6eb2',
  excludedMissionId: 'f8edb0b4-ac7d-4a32-8522-65c5fb053725',
  headers: {
    'accept': '*/*',
    'origin': 'https://my.aidapp.com',
    'referer': 'https://my.aidapp.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  }
};

// Hardcoded task IDs to complete
const taskIds = [
  'f8a1de65-613d-4500-85e9-f7c572af3248',
  '34ec5840-3820-4bdd-b065-66a127dd1930',
  '2daf1a21-6c69-49f0-8c5c-4bca2f3c4e40',
  'df2a34a4-05a9-4bde-856a-7f5b8768889a'
];

// Load bearer tokens from token.txt (one token per line)
async function loadTokens() {
  try {
    const content = await fs.readFile('token.txt', 'utf8');
    return content.trim().split('\n').filter(token => token.length > 0);
  } catch (error) {
    console.error(chalk.red('Error reading token.txt:'), error.message);
    return [];
  }
}

// Load proxies from proxies.txt (if available)
async function loadProxies() {
  try {
    const content = await fs.readFile('proxies.txt', 'utf8');
    return content.trim().split('\n').filter(proxy => proxy.length > 0);
  } catch (error) {
    console.error(chalk.red('Error reading proxies.txt:'), error.message);
    return [];
  }
}

// Create an axios instance using a proxy if provided
function createAxiosInstance(proxy) {
  if (proxy) {
    return axios.create({
      proxy: false, // Disable default proxy handling
      httpsAgent: new HttpsProxyAgent(proxy),
      headers: defaultConfig.headers
    });
  } else {
    return axios.create({
      headers: defaultConfig.headers
    });
  }
}

// Attempt to complete a mission (task)
async function completeMission(missionId, accessToken, axiosInstance) {
  try {
    console.log(chalk.cyan(`Attempting to complete mission: ${missionId}`));
    await axiosInstance.post(`${defaultConfig.baseUrl}/questing/mission-activity/${missionId}`, {}, {
      headers: { ...defaultConfig.headers, 'authorization': `Bearer ${accessToken}` }
    });
    console.log(chalk.green(`Mission ${missionId} completed successfully!`));
    return true;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(chalk.yellow(`Mission ${missionId} already completed, skipping...`));
      return 'skipped';
    } else {
      console.error(chalk.red(`Error completing mission ${missionId}: ${error.message}`));
      return false;
    }
  }
}

// Attempt to claim the reward for a mission (task)
async function claimMissionReward(missionId, accessToken, axiosInstance) {
  try {
    console.log(chalk.cyan(`Claiming reward for mission: ${missionId}`));
    await axiosInstance.post(`${defaultConfig.baseUrl}/questing/mission-reward/${missionId}`, {}, {
      headers: { ...defaultConfig.headers, 'authorization': `Bearer ${accessToken}` }
    });
    console.log(chalk.green(`Reward for mission ${missionId} claimed successfully!`));
    return true;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(chalk.yellow(`Reward for mission ${missionId} already claimed or not available, skipping...`));
      return 'skipped';
    } else {
      console.error(chalk.red(`Error claiming reward for mission ${missionId}: ${error.message}`));
      return false;
    }
  }
}

// Helper function to obfuscate a token (show first 4 and last 4 characters)
function obfuscateToken(token) {
  if (token.length <= 8) return token;
  return token.substring(0, 4) + '****' + token.substring(token.length - 4);
}

// Main function: Process each token (account) with its proxy and complete tasks
async function main() {
  const tokens = await loadTokens();
  if (tokens.length === 0) {
    console.error(chalk.red('No tokens found in token.txt'));
    process.exit(1);
  }

  const proxies = await loadProxies();
  if (proxies.length === 0) {
    console.log(chalk.yellow('No proxies found, proceeding without proxies.'));
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    // Rotate proxies if available
    const proxy = proxies.length > 0 ? proxies[i % proxies.length] : '';
    const axiosInstance = createAxiosInstance(proxy);
    
    // Log the obfuscated token
    console.log(chalk.cyan(`\nToken: ${obfuscateToken(token)}`));
    
    // Instead of printing the raw proxy, fetch IP details using ip-api.com/json
    try {
      let ipResponse;
      if (proxy) {
        ipResponse = await axiosInstance.get("http://ip-api.com/json");
      } else {
        ipResponse = await axios.get("http://ip-api.com/json");
      }
      console.log(chalk.cyan(`Ip used: ${ipResponse.data.query}`));
    } catch (err) {
      console.log(chalk.cyan(`Ip used: Unknown`));
    }
    
    // Process each task for the account
    for (const missionId of taskIds) {
      console.log(chalk.magenta(`Processing mission ID: ${missionId}`));
      const result = await completeMission(missionId, token, axiosInstance);
      // Only claim reward if mission completion succeeded (not skipped)
      if (result === true) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await claimMissionReward(missionId, token, axiosInstance);
      }
      // Delay between tasks
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    // Delay before processing the next account
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log(chalk.green('\nAll tasks processed for all tokens successfully!'));
}

main().catch(error => console.error(chalk.red('Script encountered an error:'), error));
