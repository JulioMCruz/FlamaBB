import { CdpClient } from "@coinbase/cdp-sdk"

export interface CDPAccount {
  address: string
  name?: string
  network: string
  created_at: string
}

export interface ExperienceWallet {
  experienceId: string
  experienceTitle?: string
  accountAddress: string
  accountName: string
  network: string
  createdAt: string
  balance?: string
  status: 'active' | 'funded' | 'error'
}

export interface WalletTransfer {
  from: string
  to: string
  amount: string
  token: string
  network: string
  transactionHash?: string
  status: 'pending' | 'confirmed' | 'failed'
}

export type SupportedNetwork = 'base' | 'base-sepolia' | 'ethereum' | 'polygon'
export type SupportedToken = 'eth' | 'usdc' | 'dai'

class CDPWalletService {
  private cdpClient: CdpClient | null = null
  private isInitialized = false
  private readonly defaultNetwork: SupportedNetwork = 'base-sepolia' // Always use Base Sepolia testnet
  private readonly productionNetwork: SupportedNetwork = 'base-sepolia' // Use Base Sepolia even in production for now

  constructor() {
    this.initializeClient()
  }

  private initializeClient() {
    try {
      // CDP SDK should only run in Node.js server environment, not in the browser
      if (typeof window !== 'undefined') {
        console.log('🌐 CDP Wallet Service: Running in browser - server features will be handled by API')
        this.isInitialized = false
        return
      }

      const apiKeyId = process.env.NEXT_PUBLIC_CDP_API_KEY_ID
      const apiKeySecret = process.env.NEXT_PUBLIC_CDP_API_KEY_SECRET
      const walletSecret = process.env.NEXT_PUBLIC_CDP_WALLET_SECRET

      if (!apiKeyId || !apiKeySecret || !walletSecret || 
          walletSecret === 'your-wallet-secret' ||
          apiKeyId === 'your-api-key-id' ||
          apiKeySecret === 'your-api-key-secret') {
        console.warn('⚠️ CDP credentials not properly configured. Please check environment variables.')
        return
      }

      // Initialize CDP client with credentials (server-side only)
      this.cdpClient = new CdpClient({
        apiKeyId,
        apiKeySecret,
        walletSecret
      })

      this.isInitialized = true
      console.log('✅ CDP Client initialized successfully for FlamaBB on Base Sepolia testnet')
      
    } catch (error) {
      console.error('❌ Error initializing CDP client:', error)
      this.isInitialized = false
    }
  }

  /**
   * Check if CDP service is ready to use
   */
  isReady(): boolean {
    return this.isInitialized && this.cdpClient !== null
  }

  /**
   * Get current network (Base Sepolia testnet by default)
   */
  getCurrentNetwork(): SupportedNetwork {
    // Always use Base Sepolia testnet for now
    return 'base-sepolia'
  }

  /**
   * Create a server wallet account for an experience
   * Each experience gets its own dedicated wallet account for escrow functionality
   */
  async createExperienceWallet(experienceId: string, experienceTitle?: string): Promise<ExperienceWallet | null> {
    try {
      console.log('🔨 Creating CDP server wallet for experience:', {
        experienceId,
        experienceTitle,
        network: 'base-sepolia'
      })

      // If running in browser, call the API endpoint
      if (typeof window !== 'undefined') {
        console.log('🌐 Browser environment - calling API endpoint...')
        
        const response = await fetch('/api/create-experience-wallet', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            experienceId,
            experienceTitle
          })
        })

        const result = await response.json()
        
        if (result.success && result.wallet) {
          console.log('✅ CDP server wallet created via API:', result.wallet.accountAddress)
          return result.wallet as ExperienceWallet
        } else {
          console.error('❌ API Error creating wallet:', result.error)
          return {
            experienceId,
            experienceTitle,
            accountAddress: '',
            accountName: '',
            network: 'base-sepolia',
            status: 'error',
            createdAt: new Date().toISOString()
          }
        }
      }

      // Server-side implementation (shouldn't reach here in browser)
      if (!this.isReady()) {
        throw new Error('CDP client not initialized on server side.')
      }

      // Create a unique account name for the experience (CDP requirements: alphanumeric + hyphens, 2-36 chars)
      const sanitizedTitle = experienceTitle?.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 10) || 'exp'
      const accountName = `${sanitizedTitle}-${experienceId.slice(0, 8)}-${Date.now().toString().slice(-6)}`
        .toLowerCase()
        .slice(0, 36) // CDP max length
      
      // Create EVM account using getOrCreateAccount (creates if doesn't exist, returns if exists)
      const account = await this.cdpClient!.evm.getOrCreateAccount({
        name: accountName
      })

      console.log('✅ CDP server wallet created successfully:', {
        accountName,
        address: account.address,
        network: 'base-sepolia'
      })

      const experienceWallet: ExperienceWallet = {
        experienceId,
        experienceTitle,
        accountAddress: account.address,
        accountName: accountName,
        network: 'base-sepolia',
        status: 'active',
        createdAt: new Date().toISOString()
      }

      // For testnet, automatically fund the wallet with test ETH
      try {
        console.log('💰 Auto-funding testnet wallet...')
        await this.cdpClient!.evm.requestFaucet({
          address: account.address,
          network: 'base-sepolia',
          token: 'eth'
        })
        experienceWallet.status = 'funded'
        console.log('✅ Testnet funding successful')
      } catch (faucetError) {
        console.warn('⚠️ Faucet funding failed:', faucetError)
      }

      return experienceWallet

    } catch (error) {
      console.error('❌ Error creating experience wallet:', {
        experienceId,
        experienceTitle,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      // Return error status wallet instead of throwing
      return {
        experienceId,
        experienceTitle,
        accountAddress: '',
        accountName: '',
        network: 'base-sepolia',
        status: 'error',
        createdAt: new Date().toISOString()
      }
    }
  }

  /**
   * Get account details by name or address
   */
  async getAccount(identifier: string): Promise<CDPAccount | null> {
    if (!this.isReady()) {
      throw new Error('CDP client not initialized')
    }

    try {
      // CDP SDK expects an object with address or name
      const accountQuery = identifier.startsWith('0x') 
        ? { address: identifier }
        : { name: identifier }
        
      const account = await this.cdpClient!.evm.getAccount(accountQuery)
      
      return {
        address: account.address,
        name: account.name || identifier,
        network: this.getCurrentNetwork(),
        created_at: new Date().toISOString()
      }

    } catch (error) {
      console.error('❌ Error getting account:', {
        identifier,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return null
    }
  }

  /**
   * List all accounts (useful for debugging/admin)
   */
  async listAccounts(): Promise<CDPAccount[]> {
    if (!this.isReady()) {
      throw new Error('CDP client not initialized')
    }

    try {
      const response = await this.cdpClient!.evm.listAccounts()
      
      return (response.accounts || []).map((account: any) => ({
        address: account.address,
        name: account.name,
        network: this.getCurrentNetwork(),
        created_at: new Date().toISOString()
      }))

    } catch (error) {
      console.error('❌ Error listing accounts:', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return []
    }
  }

  /**
   * Fund an account using Base Sepolia testnet faucet (for testing)
   */
  async fundAccountTestnet(address: string): Promise<boolean> {
    if (!this.isReady()) {
      throw new Error('CDP client not initialized')
    }

    try {
      console.log('💰 Requesting testnet funds for experience wallet:', {
        address,
        network: 'base-sepolia'
      })
      
      // Request testnet ETH from CDP faucet
      const faucetResponse = await this.cdpClient!.evm.requestFaucet({
        address,
        network: 'base-sepolia',
        token: 'eth'
      })

      console.log('✅ Testnet funding successful:', {
        address,
        transactionHash: faucetResponse?.transactionHash || 'N/A'
      })
      return true

    } catch (error) {
      console.error('❌ Error funding testnet account:', {
        address,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return false
    }
  }

  /**
   * Get account balance for a given token
   */
  async getAccountBalance(address: string, tokenSymbol: SupportedToken = 'eth'): Promise<string | null> {
    if (!this.isReady()) {
      throw new Error('CDP client not initialized')
    }

    try {
      const response = await this.cdpClient!.evm.listTokenBalances({
        address,
        network: this.getCurrentNetwork()
      })

      // Find the specific token balance
      const tokenBalance = response.balances?.find((balance: any) => 
        balance.token.toLowerCase() === tokenSymbol.toLowerCase()
      )

      return tokenBalance ? tokenBalance.amount : '0'

    } catch (error) {
      console.error('❌ Error getting account balance:', {
        address,
        tokenSymbol,
        network: this.getCurrentNetwork(),
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return null
    }
  }

  /**
   * Transfer tokens from one account to another
   * Useful for experience payments and refunds
   */
  async transferTokens(
    fromAccountName: string,
    toAddress: string,
    amount: string,
    tokenSymbol: SupportedToken = 'eth'
  ): Promise<WalletTransfer | null> {
    if (!this.isReady()) {
      throw new Error('CDP client not initialized')
    }

    try {
      console.log('💸 Initiating token transfer:', {
        fromAccountName,
        toAddress,
        amount,
        tokenSymbol,
        network: this.getCurrentNetwork()
      })

      // Get the sender account by name
      const fromAccount = await this.cdpClient!.evm.getAccount({ name: fromAccountName })
      
      // Execute the transfer using CDP SDK transfer method
      const transfer = await fromAccount.transfer({
        to: toAddress,
        amount: BigInt(amount), // Convert to BigInt for CDP SDK
        token: tokenSymbol,
        network: this.getCurrentNetwork()
      })

      console.log('✅ Token transfer initiated:', {
        transactionHash: transfer.transactionHash
      })

      return {
        from: fromAccount.address,
        to: toAddress,
        amount,
        token: tokenSymbol,
        network: this.getCurrentNetwork(),
        transactionHash: transfer.transactionHash || '',
        status: 'pending'
      }

    } catch (error) {
      console.error('❌ Error transferring tokens:', {
        fromAccountName,
        toAddress,
        amount,
        tokenSymbol,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return null
    }
  }

  /**
   * Get experience wallet by experience ID
   * Helper method to retrieve wallet info from Firebase if needed
   */
  async getExperienceWallet(experienceId: string): Promise<ExperienceWallet | null> {
    // This would typically query Firebase for the wallet info
    // For now, we'll implement a basic account lookup
    try {
      const accounts = await this.listAccounts()
      const experienceAccount = accounts.find(account => 
        account.name?.includes(experienceId.slice(0, 8))
      )
      
      if (experienceAccount) {
        const balance = await this.getAccountBalance(experienceAccount.address)
        
        return {
          experienceId,
          accountAddress: experienceAccount.address,
          accountName: experienceAccount.name || '',
          network: experienceAccount.network,
          balance: balance || '0',
          status: 'active',
          createdAt: experienceAccount.created_at
        }
      }
      
      return null
    } catch (error) {
      console.error('❌ Error getting experience wallet:', error)
      return null
    }
  }
}

// Export singleton instance
export const cdpWalletService = new CDPWalletService()
export default cdpWalletService