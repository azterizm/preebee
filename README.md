## Overview

**Preebee** is a powerful, user-friendly platform designed to help anyone create their own online shop for free. Whether you're a small business owner or an individual seller, Preebee offers a simple and effective solution to streamline your sales process. With Preebee, you can say goodbye to the time-consuming tasks of negotiating with each customer individually and managing them manually through messaging apps like WhatsApp. 

Preebee also allows you to share your products across multiple platforms, including live streaming shows, making it easier than ever to reach a broader audience.

## Key Features

- **Free Shop Creation:** Set up your online shop without any cost.
- **Time-Saving Automation:** Automate customer interactions, eliminating the need for manual negotiations.
- **Product Sharing:** Effortlessly share your products across different platforms, including live streams.
- **User-Friendly Interface:** Built with simplicity in mind, Preebee ensures a smooth and intuitive user experience.

## Technology Stack

- RemixJS
- PrismaJS (MySQL)
- GSAP
- DaisyUI (TailwindCSS)
- Typescript React (Vite)
- SharpJS
- Zod
- Zustand
- Redis

## Requirements
- NodeJS
- MySQL or MariaDB
- Redis

# Getting Started

## Setup Google App

Setting up Google authentication in an app involves several steps. Here's a step-by-step guide:

### Step 1: Create a Project on Google Cloud Console
1. **Go to the Google Cloud Console:**
   - Navigate to [Google Cloud Console](https://console.cloud.google.com/).
   - Sign in with your Google account.

2. **Create a New Project:**
   - Click on the project dropdown at the top.
   - Click on "New Project."
   - Give your project a name and click "Create."

3. **Enable the Google Identity API:**
   - Once your project is created, go to the "APIs & Services" section.
   - Click on "Library."
   - Search for "Google Identity Platform" or "OAuth 2.0 API" and click on it.
   - Click "Enable" to enable the API for your project.

### Step 2: Configure OAuth Consent Screen
1. **Navigate to the OAuth Consent Screen:**
   - Go to "APIs & Services" > "OAuth consent screen."
   - Choose whether your app is for internal (only available to your organization) or external (available to anyone) use.

2. **Configure the Consent Screen:**
   - Fill in the required fields, like App Name, User Support Email, and Developer Contact Information.
   - Add the required scopes if needed (you can start with basic scopes).
   - Save your changes.

### Step 3: Create OAuth 2.0 Credentials
1. **Create Credentials:**
   - Go to "APIs & Services" > "Credentials."
   - Click on "Create Credentials" and select "OAuth 2.0 Client IDs."

2. **Set Up the OAuth Client ID:**
   - Choose "Web application" as the Application Type.
   - Provide a name for the client ID (e.g., "My App Google Auth").
   - Add the appropriate **Authorized Redirect URIs** (e.g., `http://localhost:3000/auth/google/callback` if you're testing locally).

3. **Generate the Client ID and Client Secret:**
   - Once you’ve added the details, click "Create."
   - Google will provide you with a `CLIENT_ID` and `CLIENT_SECRET`.



## Setup Database

To set up a MySQL database in your app with the provided environment variable format (`DATABASE_URL`), follow these steps:

### Step 1: Install MySQL

1. **Install MySQL Server:**
   - On **Ubuntu/Linux**:
     ```bash
     sudo apt update
     sudo apt install mysql-server
     ```
   - On **macOS** (using Homebrew):
     ```bash
     brew install mysql
     ```
   - On **Windows**:
     - Download the MySQL installer from the [official MySQL website](https://dev.mysql.com/downloads/installer/).
     - Run the installer and follow the instructions to set up MySQL.

2. **Start MySQL Service:**
   - On **Ubuntu/Linux**:
     ```bash
     sudo systemctl start mysql
     ```
   - On **macOS**:
     ```bash
     brew services start mysql
     ```
   - On **Windows**, the MySQL service should start automatically after installation. If not, start it via the Services app.

### Step 2: Secure MySQL Installation

1. **Run the Secure Installation Script:**
   - This step is important to set a root password and secure your MySQL installation.
   - On **Ubuntu/Linux** and **macOS**:
     ```bash
     sudo mysql_secure_installation
     ```
   - On **Windows**, you can find the `mysql_secure_installation` command in the MySQL bin directory.

2. **Follow the prompts:**
   - Set a root password.
   - Remove anonymous users.
   - Disallow root login remotely.
   - Remove test databases.
   - Reload privilege tables.

### Step 3: Create a MySQL User and Database

1. **Log in to MySQL as Root:**
   ```bash
   mysql -u root -p
   ```
   - Enter the root password you set during the secure installation.

2. **Create a New Database:**
   ```sql
   CREATE DATABASE preebee;
   ```

3. **Create a New MySQL User:**
   ```sql
   CREATE USER 'abdiel'@'localhost' IDENTIFIED BY '0300';
   ```

4. **Grant Privileges to the User:**
   ```sql
   GRANT ALL PRIVILEGES ON preebee.* TO 'abdiel'@'localhost';
   ```

5. **Flush Privileges:**
   ```sql
   FLUSH PRIVILEGES;
   ```

6. **Exit MySQL:**
   ```sql
   EXIT;
   ```

## Setup Application

1. Install Dependencies
```bash
npm i
cd seller-dashboard
npm i
```

2. Copy `.env.exmaple` to `.env` and set database url if needed (if you followed the above steps to setup database then it is not required)

3. Open `seller-dashboard` folder
4. Copy `.env.exmaple` to `.env` and set information from Google app.
```
GOOGLE_CLIENT_ID="<provide_google_id_here>"
GOOGLE_CLIENT_SECRET="<provide_google_secret_here>"
```

5. Access by running `npm run dev` in seller-dashboard

## Contribution

Contributions are welcome! If you'd like to contribute to Preebee, please fork the repository and submit a pull request with your changes. Make sure to follow the contribution guidelines.

## Contact

For any inquiries or support, please reach out or create an issue on the GitHub repository.
