# DoBlocks - Decentralized To-Do Frontend

This repository contains the frontend for **DoBlocks**, a decentralized to-do application built with Next.js. It provides a user-friendly interface for managing tasks, interacting with an AI assistant, and leverages blockchain technology for task verification and optional bounties.


## Features

*   **Task Management:** Add, view, edit, delete, and mark tasks as complete/pending.
*   **Filtering & Sorting:** Filter tasks by status (All, Pending, Completed) and category.
*   **Task Details:** View comprehensive details for each task, including AI-generated descriptions.
*   **Visual Analytics:** Progress bar and an overview section displaying task completion statistics.
*   **Authentication:** User registration and login  
*   **Wallet Integration:** Connect with MetaMask 
*   **Blockchain Features (UI):**
    *   Displays task verification status via blockchain hash.
    *   Supports USDT bounties for tasks (locking via smart contract interaction, for approval and claiming).
    *   Shows USDT balance and contract allowance indicator when wallet is connected.
*   **AI Assistant:**
    *   Interactive chat interface (powered by LangChain with Groq/OpenAI) to manage tasks (add, update, query status, find tasks, etc.).
    *   AI-driven task suggestions banner.
    *   Automatic generation of task descriptions using AI upon creation.
    *   supports graphQl queries for better context




## Prerequisites

*   Node.js (v20 or later recommended)
*   npm, yarn, pnpm, or bun
*   A compatible web browser with a wallet extension like MetaMask installed and configured for the target testnet  Base Sepolia
*   setup backend from 
*   get mock usdt for bounties at https://mockusdt.vercel.app/ 

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/priyanshur66/dcentralized-todo
    cd 
    ```

2.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory of the project. Copy the contents of `.env.example` and fill in the required values.

    ```plaintext
    # .env.local

    # URL for your running backend API
    NEXT_PUBLIC_API_URL=http://localhost:3000 # Or your deployed backend URL

    # Deployed Smart Contract Addresses (on your chosen testnet)
    NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_TASK_REGISTRY_CONTRACT_ADDRESS
    NEXT_PUBLIC_USDT_ADDRESS=YOUR_USDT_TOKEN_CONTRACT_ADDRESS

    # AI Provider API Keys (Choose one or both)
    NEXT_PUBLIC_GROQ_API_KEY=YOUR_GROQ_API_KEY # Preferred for faster responses
    NEXT_PUBLIC_OPENAI_API_KEY=YOUR_OPENAI_API_KEY # Fallback

    # Hasura GraphQL Endpoint Credentials 
    # The endpoint URL is hardcoded in graphqlClient.ts, only secret is needed here
    NEXT_PUBLIC_HASURA_ADMIN_SECRET=YOUR_HASURA_ADMIN_SECRET
    ```
    *   **Important:** Ensure your backend service (API) is running and accessible at the `NEXT_PUBLIC_API_URL`.

3.  **Install Dependencies:**
    Choose your preferred package manager:
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

5.  **Open the Application:**
    Open [http://localhost:3000](http://localhost:3000) (or the port specified) in your browser.


## Screenshots
<img width="1439" alt="Screenshot 2025-04-03 at 7 28 48 PM" src="https://github.com/user-attachments/assets/070df798-6c35-45bc-ab6e-7dac21f8f478" />
<img width="1440" alt="Screenshot 2025-04-03 at 7 37 48 PM" src="https://github.com/user-attachments/assets/10e1711a-113e-44cc-a95c-8ebc14b3d209" />
<img width="1440" alt="Screenshot 2025-04-03 at 7 34 21 PM" src="https://github.com/user-attachments/assets/25da37ba-b9d6-41ed-8fc9-02d827f1f885" />
<img width="1440" alt="Screenshot 2025-04-03 at 7 36 09 PM" src="https://github.com/user-attachments/assets/9c8d7e53-7f5c-4abc-a910-6d332ad4f472" />
<img width="210" alt="image" src="https://github.com/user-attachments/assets/7143d5ed-b50c-4542-86de-09299d50afc1" />




