const axios = require('axios');
const { ethers } = require('ethers');
const fs = require('fs').promises;
const readline = require('readline');
const { HttpsProxyAgent } = require('https-proxy-agent');
const chalk = require('chalk').default;

// Print Banner
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

// Referral configuration
defaultConfig = {
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

// Load proxies from file (if any)
async function loadProxies() {
    try {
        const content = await fs.readFile('proxies.txt', 'utf8');
        return content.trim().split('\n').filter(proxy => proxy.length > 0);
    } catch (error) {
        console.error(chalk.red('Error reading proxies.txt:'), error.message);
        return [];
    }
}

// Create an axios instance using the provided proxy (if available)
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

// Function to ask user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Create a new wallet
function createWallet() {
    const wallet = ethers.Wallet.createRandom();
    console.log(chalk.green(`New Wallet: ${wallet.address}`));
    return wallet;
}

// Save account details
async function saveAccount(wallet, refCode) {
    const data = `Address: ${wallet.address}\nPrivateKey: ${wallet.privateKey}\nRefCode: ${refCode}\n\n`;
    await fs.appendFile('accounts.txt', data);
    console.log(chalk.blue('Account saved to accounts.txt'));
}

// Save token (and print confirmation)
async function saveToken(token) {
    await fs.appendFile('token.txt', `${token}\n`);
    console.log(chalk.yellow('Access token saved to token.txt'));
}

// Sign authentication message
async function signMessage(wallet, message) {
    return await wallet.signMessage(message);
}

// Login function using the wallet (with proxy if provided)
async function login(wallet, inviterCode, axiosInstance, proxy) {
    const timestamp = Date.now();
    const message = `MESSAGE_ETHEREUM_${timestamp}:${timestamp}`;
    const signature = await signMessage(wallet, message);
    
    const url = `${defaultConfig.baseUrl}/user-auth/login?strategy=WALLET&chainType=EVM&address=${wallet.address}&token=${message}&signature=${signature}&inviter=${inviterCode}`;
    
    try {
        const response = await axiosInstance.get(url);
        console.log(chalk.green(`Login Success for ${wallet.address}`));
        await saveAccount(wallet, response.data.user.refCode);
        await saveToken(response.data.tokens.access_token);
        return response.data.tokens.access_token;
    } catch (error) {
        console.error(chalk.red(`Login Failed for ${wallet.address}:`), error.response?.data || error.message);
        return null;
    }
}

// Fetch available missions
async function getAvailableMissions(accessToken, axiosInstance) {
    try {
        console.log(chalk.cyan('Fetching available missions...'));
        const currentDate = new Date().toISOString();
        const response = await axiosInstance.get(
            `${defaultConfig.baseUrl}/questing/missions?filter%5Bdate%5D=${currentDate}&filter%5BcampaignId%5D=${defaultConfig.campaignId}`,
            { headers: { ...defaultConfig.headers, 'authorization': `Bearer ${accessToken}` } }
        );
        const missions = response.data.data.filter(mission => mission.progress === "0" && mission.id !== defaultConfig.excludedMissionId);
        console.log(chalk.cyan(`Found ${missions.length} available mission(s).`));
        return missions;
    } catch (error) {
        console.error(chalk.red('Error fetching available missions:'), error.response?.data || error.message);
        return [];
    }
}

// Complete a mission
async function completeMission(missionId, accessToken, axiosInstance) {
    try {
        console.log(chalk.cyan(`Attempting to complete mission: ${missionId}`));
        await axiosInstance.post(`${defaultConfig.baseUrl}/questing/mission-activity/${missionId}`, {}, {
            headers: { ...defaultConfig.headers, 'authorization': `Bearer ${accessToken}` }
        });
        console.log(chalk.green(`Mission ${missionId} completed successfully!`));
        return true;
    } catch (error) {
        console.error(chalk.red(`Error completing mission ${missionId}`));
        return false;
    }
}

// Claim mission reward
async function claimMissionReward(missionId, accessToken, axiosInstance) {
    try {
        console.log(chalk.cyan(`Claiming reward for mission: ${missionId}`));
        await axiosInstance.post(`${defaultConfig.baseUrl}/questing/mission-reward/${missionId}`, {}, {
            headers: { ...defaultConfig.headers, 'authorization': `Bearer ${accessToken}` }
        });
        console.log(chalk.green(`Reward for mission ${missionId} claimed successfully!`));
        return true;
    } catch (error) {
        console.error(chalk.red(`Error claiming reward for mission ${missionId}`));
        return false;
    }
}

// Main function: for each account, create wallet, login, complete missions, then proceed to next account
async function main() {
    printBanner();
    const proxies = await loadProxies();
    if (proxies.length === 0) {
        console.log(chalk.yellow('No proxies found, proceeding without proxies.'));
    }
    
    const inviterCode = await askQuestion(chalk.yellow('Enter referral code: '));
    const numAccounts = parseInt(await askQuestion(chalk.yellow('Enter number of accounts to create: ')), 10);
    rl.close();
    
    for (let i = 0; i < numAccounts; i++) {
        console.log(chalk.cyan(`\nCreating account ${i + 1}/${numAccounts}...`));
        const wallet = createWallet();
        const proxy = proxies.length > 0 ? proxies[i % proxies.length] : '';
        const axiosInstance = createAxiosInstance(proxy);
        if (proxy) console.log(chalk.magenta(`Using proxy: ${proxy}`));
        const accessToken = await login(wallet, inviterCode, axiosInstance, proxy);
        if (accessToken) {
            const missions = await getAvailableMissions(accessToken, axiosInstance);
            for (const mission of missions) {
                if (await completeMission(mission.id, accessToken, axiosInstance)) {
                    await claimMissionReward(mission.id, accessToken, axiosInstance);
                }
            }
        }
    }
    console.log(chalk.green('\nAll accounts created and missions completed successfully!'));
}

main().catch(error => console.error(chalk.red('Bot encountered an error:'), error));
