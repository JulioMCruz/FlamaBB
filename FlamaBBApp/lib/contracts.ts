// FlamaBB Smart Contract Integration
// Base Sepolia Contract Addresses
export const CONTRACT_ADDRESSES = {
  EXPERIENCE_MANAGER: process.env.NEXT_PUBLIC_EXPERIENCE_MANAGER_ADDRESS || "0x9E904aaf00ad1B0578588C56301319255218522D",
  PAYMENT_ESCROW: process.env.NEXT_PUBLIC_PAYMENT_ESCROW_ADDRESS || "0x053F3EB75c9E78F5D53b9aEab16DfD006Cb1A08c",
  REGISTRY: process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "0x480b1f8aEF49c02334CA17A598bEc8dA7d5b1B28",
} as const

// ExperienceManager ABI (corrected for experience creation)
export const EXPERIENCE_MANAGER_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_experienceWallet",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_location",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_maxParticipants",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_scheduledAt",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "advancePercentage",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "checkinPercentage",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "midExperiencePercentage",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "completionPercentage",
            "type": "uint256"
          }
        ],
        "internalType": "struct ExperienceManagerUpgradeable.PaymentStructure",
        "name": "_paymentStructure",
        "type": "tuple"
      }
    ],
    "name": "createExperience",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "experienceId",
        "type": "uint256"
      }
    ],
    "name": "getExperience",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "id",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "creator",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "experienceWallet",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "description",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "location",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxParticipants",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "currentParticipants",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "scheduledAt",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "advancePercentage",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "checkinPercentage",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "midExperiencePercentage",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "completionPercentage",
                "type": "uint256"
              }
            ],
            "internalType": "struct ExperienceManagerUpgradeable.PaymentStructure",
            "name": "paymentStructure",
            "type": "tuple"
          }
        ],
        "internalType": "struct ExperienceManagerUpgradeable.Experience",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Registry ABI for experience registration
export const REGISTRY_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "experienceId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "category",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "city",
        "type": "string"
      }
    ],
    "name": "registerExperience",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const

// Experience creation interface
export interface CreateExperienceParams {
  title: string
  description: string
  location: string
  price: string // ETH amount as string
  maxParticipants: number
  date: Date
  venue: string
  category?: string
  city?: string
}

// Convert ETH to Wei
export function ethToWei(ethAmount: string): bigint {
  const eth = parseFloat(ethAmount)
  return BigInt(Math.floor(eth * 10 ** 18))
}

// Convert Wei to ETH
export function weiToEth(weiAmount: bigint): string {
  const eth = Number(weiAmount) / 10 ** 18
  return eth.toFixed(6)
}

// Convert date to Unix timestamp
export function dateToTimestamp(date: Date): bigint {
  return BigInt(Math.floor(date.getTime() / 1000))
}

// Check if contract is paused
export const PAUSED_ABI = [
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const
