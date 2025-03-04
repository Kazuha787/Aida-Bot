# Aisa Bot  

Aisa Bot is an advanced automation tool designed to streamline referral-based account creation, task completion, and website interactions. It efficiently manages multiple accounts, automates website tasks, and securely saves generated wallet addresses for future use.  
## 📢 Join Our Community

# Telegram Channel: .[Channel](https://t.me/Offical_Im_kazuha)
# GitHub Repository: [Aida](https://github.com/Kazuha787/Aida-Bot.git)

## Features  
✅ **Automated Account Creation** – Creates multiple accounts using your referral link.  
✅ **Task Completion** – Automatically completes assigned tasks on the website.  
✅ **Seamless Website Interaction** – Fills forms, submits data, and navigates through websites.  
✅ **Wallet Generation & Storage** – Saves generated wallets in `wallets.txt`.  
✅ **Multi-Account Support** – Reads accounts from `account.txt` for easy management.  
✅ **Scheduled Execution** – Runs at intervals for continuous automation.  

## Installation & Usage  

Clone the repository:  
```sh
git clone https://github.com/Kazuha787/Aida-BotV2.git
```
Directory 
```sh
cd Aida-BotV2
```

Install Dependency 
```sh
npm install 
```
Run The Bot
```sh
node main.js
```

## Setup

1. **Open `refs.txt`:**

   Open a file named `refs.txt` in the project directory and add one referral code per line.

   Example:
   ```
   REFERRAL_CODE_1
   REFERRAL_CODE_2
   REFERRAL_CODE_3
   ```

2. **Create `proxies.txt` (Optional but recommended):**

   Create a file named `proxies.txt` in the project directory and add one proxy URL per line.

   Example:
   ```
   http://username:password@proxy1.example.com:port
   http://username:password@proxy2.example.com:port
   ```

## Usage

To run the script, execute:

- Multi Referral
```bash
node multi.js
```
- Single Referral
```bash
node main.js
```
- Auto Task using token // use this if there's a new task, you can simply find the taskid through Network Tab and replace the Id's, I do that so its way safer
```bash
node autotask.js
```
- Auto Extract Referral Code from `accounts.txt`
```bash
node refcodeextractor.js
```


## Customization

- **Task IDs:**  
  The four mission IDs are hardcoded in the script. You can update or add more as needed.

## License

This project is licensed under the MIT License.

## Disclaimer

Use at your risk, all risk are borne with the user.

This `README.md` is well-structured and provides clear instructions. Let me know if you want any modifications!
