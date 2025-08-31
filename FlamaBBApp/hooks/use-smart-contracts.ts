import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
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

  // Function to create experience
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

    try {
      console.log('🚀 Creating experience with params:', params)
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
    } catch (error) {
      console.error('❌ Error creating experience:', error)
      throw error
    }
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

  return {
    // State
    isConnected,
    address,
    
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
    
    // Read data
    experienceData,
    refetchExperience,
  }
}
