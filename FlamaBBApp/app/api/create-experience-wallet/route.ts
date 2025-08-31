import { NextRequest, NextResponse } from 'next/server'
import { CdpClient } from '@coinbase/cdp-sdk'

interface CreateWalletRequest {
  experienceId: string
  experienceTitle?: string
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔨 API: Creating CDP wallet for experience...')
    
    const { experienceId, experienceTitle }: CreateWalletRequest = await request.json()
    
    if (!experienceId) {
      return NextResponse.json(
        { error: 'Experience ID is required' },
        { status: 400 }
      )
    }

    // Initialize CDP client (server-side only)
    const apiKeyId = process.env.NEXT_PUBLIC_CDP_API_KEY_ID
    const apiKeySecret = process.env.NEXT_PUBLIC_CDP_API_KEY_SECRET
    const walletSecret = process.env.NEXT_PUBLIC_CDP_WALLET_SECRET

    if (!apiKeyId || !apiKeySecret || !walletSecret) {
      console.error('❌ CDP credentials not configured')
      return NextResponse.json(
        { error: 'CDP credentials not configured' },
        { status: 500 }
      )
    }

    const cdp = new CdpClient({
      apiKeyId,
      apiKeySecret,
      walletSecret
    })

    console.log('✅ CDP client initialized in API route')

    // Create account name following FlamaBB pattern
    const sanitizedTitle = experienceTitle?.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 10) || 'exp'
    const accountName = `${sanitizedTitle}-${experienceId.slice(0, 8)}-${Date.now().toString().slice(-6)}`
      .toLowerCase()
      .slice(0, 36) // CDP max length

    console.log('🔨 Creating CDP account:', { experienceId, accountName })

    // Create EVM account on Base Sepolia
    const account = await cdp.evm.getOrCreateAccount({
      name: accountName
    })

    console.log('✅ CDP account created:', account.address)

    const experienceWallet = {
      experienceId,
      experienceTitle,
      accountAddress: account.address,
      accountName: accountName,
      network: 'base-sepolia',
      status: 'active' as const,
      createdAt: new Date().toISOString()
    }

    // Auto-fund with testnet ETH
    try {
      console.log('💰 Auto-funding testnet wallet...')
      await cdp.evm.requestFaucet({
        address: account.address,
        network: 'base-sepolia',
        token: 'eth'
      })
      
      experienceWallet.status = 'funded' as const
      console.log('✅ Testnet funding successful')
      
    } catch (faucetError) {
      console.warn('⚠️ Faucet funding failed (rate limited):', faucetError)
      // Continue without funding - wallet is still created
    }

    return NextResponse.json({
      success: true,
      wallet: experienceWallet
    })

  } catch (error) {
    console.error('❌ API Error creating experience wallet:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      wallet: null
    }, { status: 500 })
  }
}