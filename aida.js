const axios = require('axios');
const { ethers } = require('ethers');
const fs = require('fs').promises;
const readline = require('readline');

// Banner
console.log(`
██╗  ██╗ █████╗ ███████╗██╗   ██╗██╗  ██╗ █████╗ 
██║ ██╔╝██╔══██╗╚══███╔╝██║   ██║██║  ██║██╔══██╗
█████╔╝ ███████║  ███╔╝ ██║   ██║███████║███████║
██╔═██╗ ██╔══██║ ███╔╝  ██║   ██║██╔══██║██╔══██║
██║  ██╗██║  ██║███████╗╚██████╔╝██║  ██║██║  ██║
╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝
By Kazuha 🚀🔥
`);

console.log("🔥 Initializing bot... Please wait. 🚀");

// Function to display a loading animation
async function loadingAnimation(message, duration = 3000) {
    const frames = ['-', '\\', '|', '/'];
    let i = 0;
    process.stdout.write(`\r${message} ${frames[i]}`);
    const interval = setInterval(() => {
        process.stdout.write(`\r${message} ${frames[i = (i + 1) % frames.length]}`);
    }, 200);
    
    await new Promise(resolve => setTimeout(resolve, duration));
    clearInterval(interval);
    process.stdout.write(`\r${message} ✅\n`);
}

// Referral Configuration
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

// User Input Function
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Create Wallet
function createWallet() {
    const wallet = ethers.Wallet.createRandom();
    console.log(`🆕 New Wallet: ${wallet.address}`);
    return wallet;
}

// Save Account
async function saveAccount(wallet, refCode) {
    await loadingAnimation("💾 Saving account", 2000);
    const data = `Address: ${wallet.address}\nPrivateKey: ${wallet.privateKey}\nRefCode: ${refCode}\n\n`;
    await fs.appendFile('accounts.txt', data);
    console.log(`✅ Account saved successfully!`);
}

// Save Token
async function saveToken(token) {
    await loadingAnimation("🔑 Storing access token", 2000);
    await fs.appendFile('token.txt', `${token.access_token}\n`);
    console.log(`✅ Token saved successfully!`);
}

// Sign Message for Authentication
async function signMessage(wallet, message) {
    return await wallet.signMessage(message);
}

// Login Function
async function login(wallet, inviterCode) {
    const timestamp = Date.now();
    const message = `MESSAGE_ETHEREUM_${timestamp}:${timestamp}`;
    const signature = await signMessage(wallet, message);

    const url = `${defaultConfig.baseUrl}/user-auth/login?strategy=WALLET&chainType=EVM&address=${wallet.address}&token=${message}&signature=${signature}&inviter=${inviterCode}`;

    await loadingAnimation("🔗 Connecting to server", 3000);

    try {
        const response = await axios.get(url, { headers: defaultConfig.headers });
        console.log(`✅ Login Successful! 🎉`);
        
        // Save account and token
        await saveAccount(wallet, response.data.user.refCode);
        await saveToken(response.data.tokens);
    } catch (error) {
        console.error(`❌ Login Failed!`);
    }
}

// Read Tokens
async function readTokens(filename) {
    try {
        const content = await fs.readFile(filename, 'utf8');
        return content.trim().split('\n').filter(token => token.length > 0);
    } catch (error) {
        console.error(`⚠️ Error reading ${filename}:`, error.message);
        return [];
    }
}

// Get Available Missions
async function getAvailableMissions(accessToken) {
    try {
        await loadingAnimation("🔍 Fetching available missions", 3000);
        const currentDate = new Date().toISOString();
        const response = await axios.get(
            `${defaultConfig.baseUrl}/questing/missions?filter%5Bdate%5D=${currentDate}&filter%5BcampaignId%5D=${defaultConfig.campaignId}`,
            { headers: { ...defaultConfig.headers, 'authorization': `Bearer ${accessToken}` } }
        );

        return response.data.data.filter(mission => mission.progress === "0" && mission.id !== defaultConfig.excludedMissionId);
    } catch (error) {
        console.error('⚠️ Error fetching available missions:', error.response?.data || error.message);
        return [];
    }
}

// Complete Mission
async function completeMission(missionId, accessToken) {
    try {
        await loadingAnimation(`🚀 Completing mission ${missionId}`, 3000);
        await axios.post(`${defaultConfig.baseUrl}/questing/mission-activity/${missionId}`, {}, {
            headers: { ...defaultConfig.headers, 'authorization': `Bearer ${accessToken}` }
        });
        console.log(`✅ Mission ${missionId} completed successfully!`);
        return true;
    } catch (error) {
        console.error(`❌ Error completing mission ${missionId}`);
        return false;
    }
}

// Claim Mission Reward
async function claimMissionReward(missionId, accessToken) {
    try {
        await loadingAnimation(`🎁 Claiming reward for mission ${missionId}`, 3000);
        await axios.post(`${defaultConfig.baseUrl}/questing/mission-reward/${missionId}`, {}, {
            headers: { ...defaultConfig.headers, 'authorization': `Bearer ${accessToken}` }
        });
        console.log(`✅ Reward for mission ${missionId} claimed successfully!`);
        return true;
    } catch (error) {
        console.error(`❌ Error claiming reward for mission ${missionId}`);
        return false;
    }
}

// Run Bot
async function runBot() {
    console.log(`\n🔥 Starting Mission Processing 🚀`);

    const tokens = await readTokens('token.txt');
    if (tokens.length === 0) {
        console.error('⚠️ No tokens found in token.txt');
        return;
    }

    for (let i = 0; i < tokens.length; i++) {
        const accessToken = tokens[i];
        console.log(`\n🔍 Processing token ${i + 1}/${tokens.length}: ${accessToken.slice(0, 20)}...`);

        const availableMissions = await getAvailableMissions(accessToken);
        if (availableMissions.length === 0) {
            console.log('⚠️ No available missions to complete.');
            continue;
        }

        for (const mission of availableMissions) {
            const completed = await completeMission(mission.id, accessToken);
            if (completed) {
                await claimMissionReward(mission.id, accessToken);
            }
        }
    }
    console.log('\n🎉 Bot finished processing all tokens! 🎯');
}

// Main Function
async function main() {
    const inviterCode = await askQuestion('🔗 Enter referral code: ');
    const numAccounts = parseInt(await askQuestion('🆕 Enter number of accounts to create: '), 10);
    rl.close();

    for (let i = 0; i < numAccounts; i++) {
        console.log(`\n🛠 Creating account ${i + 1}/${numAccounts}...`);
        const wallet = createWallet();
        await login(wallet, inviterCode);
    }

    await runBot();
}

main().catch(error => console.error('⚠️ Bot encountered an error:', error));
