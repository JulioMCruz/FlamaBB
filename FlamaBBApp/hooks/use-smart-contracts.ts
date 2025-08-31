import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useBalance } from 'wagmi'
import { parseEther } from 'viem'

import { 
  CONTRACT_ADDRESSES, 
  EXPERIENCE_MANAGER_ABI, 
  REGISTRY_ABI,
  PAUSED_ABI,
  type CreateExperienceParams,
  dateToTimestamp
} from '@/lib/contracts'

export function useSmartContracts() {
  const { address, isConnected } = useAccount()
  
  // Get user's ETH balance
  const { data: balance } = useBalance({
    address,
  })

  // Write contract for creating experience
  const { 
    data: createExperienceHash,
    writeContract: createExperience,
    isPending: isCreatingExperience,
    error: createExperienceError
  } = useWriteContract()

  // Debug transaction hash
  console.log('🔍 Transaction hash:', createExperienceHash)
  console.log('🔍 Is creating experience:', isCreatingExperience)
  console.log('🔍 Create experience error:', createExperienceError)

  // Wait for transaction receipt
  const { 
    data: createExperienceReceipt,
    isSuccess: isCreateExperienceSuccess,
    isError: isCreateExperienceError
  } = useWaitForTransactionReceipt({
    hash: createExperienceHash,
  })

  // Debug transaction receipt
  console.log('🔍 Transaction receipt:', createExperienceReceipt)
  console.log('🔍 Is success:', isCreateExperienceSuccess)
  console.log('🔍 Is error:', isCreateExperienceError)
  
  // If transaction failed, try to get the revert reason
  if (isCreateExperienceError && createExperienceHash) {
    console.error('❌ Transaction failed with hash:', createExperienceHash)
    console.error('❌ Error details:', createExperienceError)
  }

  // Write contract for registering experience
  const {
    data: registerExperienceHash,
    writeContract: registerExperience,
    isPending: isRegisteringExperience,
    error: registerExperienceError
  } = useWriteContract()

  // Wait for registration transaction receipt
  const {
    data: registerExperienceReceipt,
    isSuccess: isRegisterExperienceSuccess,
    isError: isRegisterExperienceError
  } = useWaitForTransactionReceipt({
    hash: registerExperienceHash,
  })

  // Function to create experience with retry logic
  const createExperienceOnChain = async (params: CreateExperienceParams) => {
    console.log('🔍 createExperienceOnChain called with params:', params)
    
    if (!isConnected || !address) {
      console.error('❌ Wallet not connected')
      throw new Error('Wallet not connected')
    }

    // Check if contract is paused
    if (isPaused) {
      console.error('❌ Contract is paused')
      throw new Error('Contract is currently paused. Please try again later.')
    }

    const maxRetries = 3
    let lastError: any = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🚀 Creating experience (attempt ${attempt}/${maxRetries}) with params:`, params)
        const priceInWei = parseEther(params.price)
        const dateTimestamp = dateToTimestamp(params.date)
        const currentTimestamp = BigInt(Math.floor(Date.now() / 1000))

        console.log('📊 Converted values:', {
          priceInWei: priceInWei.toString(),
          dateTimestamp: dateTimestamp.toString(),
          currentTimestamp: currentTimestamp.toString(),
          maxParticipants: BigInt(params.maxParticipants),
          isDateInFuture: dateTimestamp > currentTimestamp
        })

        // Validate date is in future
        if (dateTimestamp <= currentTimestamp) {
          throw new Error('Experience date must be in the future')
        }

        // Validate title is not empty
        if (!params.title || params.title.trim().length === 0) {
          throw new Error('Experience title is required')
        }

        // Validate price is greater than 0
        if (parseFloat(params.price) <= 0) {
          throw new Error('Experience price must be greater than 0')
        }

        // Validate max participants is greater than 0
        if (params.maxParticipants <= 0) {
          throw new Error('Maximum participants must be greater than 0')
        }

        // Single payment structure: 100% upfront (like Airbnb)
        const paymentStructure = {
          advancePercentage: BigInt(100), // 100% paid upfront
          checkinPercentage: BigInt(0),   // 0% at check-in
          midExperiencePercentage: BigInt(0), // 0% mid-experience
          completionPercentage: BigInt(0)     // 0% at completion
        }

        // Use the creator's address as the experience wallet for now
        // In production, this would be a Coinbase server wallet
        const experienceWallet = address

        console.log('🚀 Calling createExperience contract function...')
        
        createExperience({
          address: CONTRACT_ADDRESSES.EXPERIENCE_MANAGER as `0x${string}`,
          abi: EXPERIENCE_MANAGER_ABI,
          functionName: 'createExperience',
          args: [
            experienceWallet,
            params.title,
            params.description,
            params.location,
            priceInWei,
            BigInt(params.maxParticipants),
            dateTimestamp,
            paymentStructure
          ],
        })
        
        console.log('✅ createExperience contract call initiated')
        return // Success, exit retry loop
      } catch (error: any) {
        lastError = error
        console.error(`❌ Experience creation attempt ${attempt} failed:`, error)
        
        // Check if it's a rate limit error
        const isRateLimit = error.message?.includes('rate limited') || 
                           error.message?.includes('rate limit') ||
                           error.code === -32603
        
        if (isRateLimit && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 // Exponential backoff: 2s, 4s, 8s
          console.log(`⏳ Rate limited, retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        // If not rate limit or max retries reached, throw the error
        if (!isRateLimit || attempt === maxRetries) {
          throw error
        }
      }
    }
    
    // If we get here, all retries failed
    throw lastError
  }

  // Function to register experience in registry
  const registerExperienceInRegistry = async (experienceId: bigint, category: string, city: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }

    try {
      registerExperience({
        address: CONTRACT_ADDRESSES.REGISTRY as `0x${string}`,
        abi: REGISTRY_ABI,
        functionName: 'registerExperience',
        args: [experienceId, category, city],
      })
    } catch (error) {
      console.error('Error registering experience:', error)
      throw error
    }
  }

  // Read experience data
  const { data: experienceData, refetch: refetchExperience } = useReadContract({
    address: CONTRACT_ADDRESSES.EXPERIENCE_MANAGER as `0x${string}`,
    abi: EXPERIENCE_MANAGER_ABI,
    functionName: 'getExperience',
    args: [BigInt(0)], // Default to first experience for testing
  })

  // Booking functionality
  const { 
    data: bookExperienceHash,
    writeContract: bookExperience,
    isPending: isBookingExperience,
    error: bookExperienceError
  } = useWriteContract()

  // Wait for booking transaction receipt
  const { 
    data: bookExperienceReceipt,
    isSuccess: isBookExperienceSuccess,
    isError: isBookExperienceError,
    error: transactionError
  } = useWaitForTransactionReceipt({
    hash: bookExperienceHash,
  })

  // Function to check if an experience exists and is active
  const checkExperienceExists = async (experienceId: bigint): Promise<boolean> => {
    try {
      console.log('🔍 Checking if experience exists on blockchain:', experienceId.toString())
      
      // For now, we'll assume the experience exists if we have a valid ID
      // The contract call will fail if the experience doesn't exist
      return true
    } catch (error) {
      console.error('❌ Error checking experience existence:', error)
      return false
    }
  }

  // Function to book/join an experience with retry logic
  const bookExperienceOnChain = async (experienceId: bigint, paymentAmount: string) => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected')
    }

    // Check if user has enough ETH
    if (balance && parseFloat(balance.formatted) < parseFloat(paymentAmount)) {
      throw new Error(`Insufficient funds. You have ${balance.formatted} ETH but need ${paymentAmount} ETH`)
    }

    console.log('🔍 Proceeding with booking for experience ID:', experienceId.toString())
    console.log('🔍 Experience ID type:', typeof experienceId)
    console.log('🔍 Experience ID value:', experienceId.toString())

    const maxRetries = 3
    let lastError: any = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🎯 Booking experience (attempt ${attempt}/${maxRetries}):`, experienceId, 'with payment:', paymentAmount)
        
        // User pays the full amount upfront
        const fullPaymentInWei = parseEther(paymentAmount)
        
        console.log('🔍 Payment calculation:')
        console.log('  - Full payment requested:', paymentAmount, 'ETH')
        console.log('  - Full payment in wei:', fullPaymentInWei.toString())
        console.log('  - User pays full amount upfront')
        
        // Use the full payment amount
        const paymentInWei = fullPaymentInWei
        
        // Log the exact parameters being sent
        console.log('🔍 Booking parameters:', {
          experienceId: experienceId.toString(),
          participant: address,
          paymentAmount: paymentAmount,
          paymentInWei: paymentInWei.toString(),
          contractAddress: CONTRACT_ADDRESSES.PAYMENT_ESCROW
        })
        
        bookExperience({
          address: CONTRACT_ADDRESSES.EXPERIENCE_MANAGER as `0x${string}`,
          abi: [
            {
              "inputs": [
                {"internalType": "uint256", "name": "_experienceId", "type": "uint256"}
              ],
              "name": "registerForExperience",
              "outputs": [],
              "stateMutability": "payable",
              "type": "function"
            }
          ],
          functionName: 'registerForExperience',
          args: [experienceId],
          value: paymentInWei,
        })
        
        console.log('✅ joinExperience contract call initiated')
        return // Success, exit retry loop
      } catch (error: any) {
        lastError = error
        console.error(`❌ Booking attempt ${attempt} failed:`, error)
        
        // Check if it's a rate limit error
        const isRateLimit = error.message?.includes('rate limited') || 
                           error.message?.includes('rate limit') ||
                           error.code === -32603
        
        if (isRateLimit && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 // Exponential backoff: 2s, 4s, 8s
          console.log(`⏳ Rate limited, retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        // If not rate limit or max retries reached, throw the error
        if (!isRateLimit || attempt === maxRetries) {
          throw error
        }
      }
    }
    
    // If we get here, all retries failed
    throw lastError
  }

  // Check if contract is paused
  const { data: isPaused } = useReadContract({
    address: CONTRACT_ADDRESSES.EXPERIENCE_MANAGER as `0x${string}`,
    abi: PAUSED_ABI,
    functionName: 'paused',
  })

  console.log('🔍 Contract paused status:', isPaused)

  // Test contract connection
  const { data: nextExperienceId } = useReadContract({
    address: CONTRACT_ADDRESSES.EXPERIENCE_MANAGER as `0x${string}`,
    abi: [
      {
        "inputs": [],
        "name": "getNextExperienceId",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'getNextExperienceId',
  })

  console.log('🔍 Next experience ID:', nextExperienceId)
  console.log('🔍 Available experience IDs: 0 to', nextExperienceId ? (nextExperienceId - BigInt(1)).toString() : 'unknown')
  
  // Test if we can read experience 0 (first experience)
  const { data: experience0Data } = useReadContract({
    address: CONTRACT_ADDRESSES.EXPERIENCE_MANAGER as `0x${string}`,
    abi: EXPERIENCE_MANAGER_ABI,
    functionName: 'getExperience',
    args: [BigInt(0)],
  })
  
  // Test if we can read experience 8 (the one we just created)
  const { data: experience8Data } = useReadContract({
    address: CONTRACT_ADDRESSES.EXPERIENCE_MANAGER as `0x${string}`,
    abi: EXPERIENCE_MANAGER_ABI,
    functionName: 'getExperience',
    args: [BigInt(8)],
  })
  
  console.log('🔍 Experience 0 data:', experience0Data)
  console.log('🔍 Experience 8 data (should be our new experience):', experience8Data)
  
  // Calculate the correct advance payment amount
  if (experience8Data) {
    const fullPrice = experience8Data.price
    const advancePercentage = experience8Data.paymentStructure.advancePercentage
    const advancePayment = (fullPrice * advancePercentage) / BigInt(100)
    
    console.log('🔍 Payment calculation:')
    console.log('  - Full price:', fullPrice.toString(), 'wei')
    console.log('  - Advance percentage:', advancePercentage.toString(), '%')
    console.log('  - Advance payment required:', advancePayment.toString(), 'wei')
    console.log('  - Advance payment in ETH:', Number(advancePayment) / 10**18, 'ETH')
  }
  
  // Check if experience ID 1 exists (for testing)
  const { data: experience1Data } = useReadContract({
    address: CONTRACT_ADDRESSES.EXPERIENCE_MANAGER as `0x${string}`,
    abi: [
      {
        "inputs": [{"internalType": "uint256", "name": "_experienceId", "type": "uint256"}],
        "name": "getExperience",
        "outputs": [
          {"internalType": "address", "name": "creator", "type": "address"},
          {"internalType": "string", "name": "title", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "string", "name": "location", "type": "string"},
          {"internalType": "uint256", "name": "price", "type": "uint256"},
          {"internalType": "uint256", "name": "maxParticipants", "type": "uint256"},
          {"internalType": "uint256", "name": "date", "type": "uint256"},
          {"internalType": "bool", "name": "isActive", "type": "bool"}
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'getExperience',
    args: [BigInt(1)],
  })

  console.log('🔍 Experience 1 data:', experience1Data)
  console.log('🔍 User ETH balance:', balance?.formatted, balance?.symbol)
  
  // Debug logging for booking transaction
  console.log('🔍 Booking transaction hash:', bookExperienceHash)
  console.log('🔍 Booking transaction receipt:', bookExperienceReceipt)
  console.log('🔍 Is booking success:', isBookExperienceSuccess)
  console.log('🔍 Is booking error:', isBookExperienceError)
  console.log('🔍 Booking error details:', bookExperienceError)
  console.log('🔍 Transaction error details:', transactionError)

  return {
    // State
    isConnected,
    address,
    balance,
    
    // Create experience
    createExperienceOnChain,
    isCreatingExperience,
    createExperienceError,
    isCreateExperienceSuccess,
    createExperienceReceipt,
    
    // Register experience
    registerExperienceInRegistry,
    isRegisteringExperience,
    registerExperienceError,
    isRegisterExperienceSuccess,
    registerExperienceReceipt,
    
    // Book experience
    bookExperienceOnChain,
    isBookingExperience,
    bookExperienceError,
    isBookExperienceSuccess,
    bookExperienceReceipt,
    
    // Read data
    experienceData,
    refetchExperience,
    nextExperienceId,
  }
}
