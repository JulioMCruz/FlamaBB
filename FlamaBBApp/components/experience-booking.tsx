"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, MapPin, Clock, Users, Heart, Timer } from "lucide-react"
import { useSmartContracts } from "@/hooks/use-smart-contracts"

interface Experience {
  id: number
  title: string
  location: string
  price: string
  duration: string
  participants: string
  rating: number
  image: string
  description: string
  host: string
  included: string[]
  flamitas: number
  checkinPercentage: number
  midExperiencePercentage: number
  // Real experience data properties
  isReal?: boolean
  realData?: {
    blockchainExperienceId?: string
    transactionHash?: string
    [key: string]: any
  }
}

interface ExperienceBookingProps {
  experience: Experience
  onBack: () => void
  onComplete: () => void
}

type BookingStep = "details" | "interest" | "join" | "checkin" | "checkedin"

export function ExperienceBooking({ experience, onBack, onComplete }: ExperienceBookingProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>("details")
  const [nickname, setNickname] = useState("")
  const [completedItems, setCompletedItems] = useState<boolean[]>(experience.included.map(() => false))
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [isInterested, setIsInterested] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("02:45:17")
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  
  // Smart contract integration for booking
  const {
    isConnected,
    balance,
    bookExperienceOnChain,
    isBookingExperience,
    bookExperienceError,
    isBookExperienceSuccess,
    bookExperienceReceipt
  } = useSmartContracts()

  const handleShowInterest = () => {
    setIsInterested(true)
    setCurrentStep("interest")
  }

  const handleJoinExperience = () => {
    setCurrentStep("join")
  }

  const handleConfirmJoin = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }

    try {
      console.log('🎯 Confirming booking for experience:', experience)
      
      // Extract experience ID from the experience object
      let experienceId: bigint
      
      // Check if this is a real experience with blockchain ID
      console.log('🔍 Experience data for booking:', {
        isReal: experience.isReal,
        realData: experience.realData,
        blockchainExperienceId: experience.realData?.blockchainExperienceId,
        hasRealData: !!experience.realData,
        realDataKeys: experience.realData ? Object.keys(experience.realData) : []
      })
      
      if (experience.isReal && experience.realData?.blockchainExperienceId) {
        // Use the actual blockchain experience ID from the experience data
        experienceId = BigInt(experience.realData.blockchainExperienceId)
        console.log('🔗 Using actual blockchain experience ID:', experience.realData.blockchainExperienceId)
        console.log('🔗 Experience ID for booking:', experienceId.toString())
      } else {
        // Prevent booking demo experiences
        console.log('❌ Cannot book - missing blockchain experience ID')
        console.log('❌ Real data available:', !!experience.realData)
        console.log('❌ Blockchain ID available:', !!experience.realData?.blockchainExperienceId)
        throw new Error('Cannot book demo experiences. Please book a real experience that has been published to the blockchain.')
      }
      
      const paymentAmount = fullPayment.toString() // Use full payment amount
      
      await bookExperienceOnChain(experienceId, paymentAmount)
      
      console.log('✅ Booking initiated successfully')
    } catch (error) {
      console.error('❌ Error booking experience:', error)
      alert(`Failed to book experience: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Handle successful booking
  useEffect(() => {
    if (isBookExperienceSuccess && bookExperienceReceipt) {
      console.log('✅ Experience booked successfully!', bookExperienceReceipt)
      
      // Store booking in Firebase if this is a real experience
      if (experience.isReal && experience.realData) {
        const realData = experience.realData
        if (realData.id) {
          const storeBooking = async () => {
            try {
              // Import the joinExperience function
              const { joinExperience } = await import('@/lib/firebase-experiences')
              
              // Add user to experience participants
              const userId = "wallet-user" // This should come from auth context
              await joinExperience(realData.id, userId)
              
              console.log('✅ Booking stored in Firebase')
            } catch (error) {
              console.error('❌ Error storing booking in Firebase:', error)
              // Don't fail the flow if Firebase fails
            }
          }
          
          storeBooking()
        }
      }
      
      setCurrentStep("checkin")
    }
  }, [isBookExperienceSuccess, bookExperienceReceipt, experience])

  // Handle booking errors with better user feedback
  useEffect(() => {
    if (bookExperienceError) {
      console.error('❌ Booking error detected:', bookExperienceError)
      
      let userMessage = 'Booking failed. Please try again.'
      
      // Provide specific error messages for common issues
      if (bookExperienceError.message?.includes('rate limited')) {
        userMessage = 'Network is busy. Please wait a moment and try again.'
      } else if (bookExperienceError.message?.includes('insufficient funds')) {
        userMessage = 'Insufficient funds in your wallet. Please add more ETH.'
      } else if (bookExperienceError.message?.includes('user rejected')) {
        userMessage = 'Transaction was cancelled. Please try again.'
      } else if (bookExperienceError.message?.includes('nonce')) {
        userMessage = 'Transaction conflict. Please try again in a moment.'
      } else if (bookExperienceError.message?.includes('execution reverted')) {
        userMessage = 'Transaction failed on blockchain. This might be due to insufficient funds or invalid experience ID.'
      } else {
        // Show the actual error message for debugging
        userMessage = `Booking failed: ${bookExperienceError.message || 'Unknown error'}`
      }
      
      // Show error in a more user-friendly way
      const errorDiv = document.createElement('div')
      errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50 max-w-md'
      errorDiv.innerHTML = `
        <div class="flex items-start">
          <span class="font-bold mr-2 mt-0.5">⚠️</span>
          <div class="flex-1">
            <span class="block">${userMessage}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="mt-2 text-red-700 hover:text-red-900 text-sm underline">Dismiss</button>
          </div>
        </div>
      `
      document.body.appendChild(errorDiv)
      
      // Auto-remove after 8 seconds
      setTimeout(() => {
        if (errorDiv.parentElement) {
          errorDiv.remove()
        }
      }, 8000)
    }
  }, [bookExperienceError])

  const handleCheckin = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }

    setIsCheckingIn(true)
    
    try {
      console.log('🎯 Checking in to experience:', experience)
      
      // Extract experience ID from the experience object
      let experienceId: bigint
      
      if (experience.isReal && experience.realData?.blockchainExperienceId) {
        experienceId = BigInt(experience.realData.blockchainExperienceId)
        console.log('🔗 Using blockchain experience ID for check-in:', experienceId.toString())
      } else {
        throw new Error('Cannot check in to demo experience')
      }
      
      // TODO: Implement on-chain check-in functionality
      // This would call the smart contract's checkInToExperience function
      // For now, we'll simulate the check-in
      console.log('✅ Check-in initiated for experience:', experienceId.toString())
      
      // Simulate blockchain transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setCurrentStep("checkedin")
      console.log('✅ Check-in completed successfully')
      
    } catch (error) {
      console.error('❌ Error checking in:', error)
      alert(`Failed to check in: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleCompleteExperience = () => {
    onComplete()
  }

  const toggleCompletedItem = (index: number) => {
    const updated = [...completedItems]
    updated[index] = !updated[index]
    setCompletedItems(updated)
  }

  const experiencePrice = Number.parseFloat(experience.price.replace(" ETH", ""))
  // Single payment - full amount when joining
  const fullPayment = experiencePrice

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
      </div>

      <div className="relative min-h-screen flex flex-col">
        <div className="flex-1 p-4">
          <div className="max-w-sm mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800">
                  <ArrowLeft className="w-5 h-5 mr-1" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔥</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">FlamaBB</span>
                </div>
                <div className="w-6"></div>
              </div>

              {/* Experience Details Step */}
              {currentStep === "details" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Experience Details</h2>

                  <div className="mb-6">
                    <img
                      src={experience.image || "/placeholder.svg"}
                      alt={experience.title}
                      className="w-full h-32 rounded-2xl object-cover mb-4"
                    />

                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{experience.title}</h3>

                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">Buenos Aires, Argentina</span>
                      <span className="ml-auto text-lg font-semibold text-blue-600">{experience.price}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{experience.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{experience.participants}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-red-500 mr-1">🔥</span>
                        <span>{experience.flamitas} flamitas</span>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-4">{experience.description}</p>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">What's Included:</h4>
                      <ul className="space-y-1">
                        {experience.included.map((item, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-sm text-gray-600 mb-6">
                      <span className="font-medium">Host:</span> {experience.host}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleShowInterest}
                      variant="outline"
                      className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold py-4 rounded-2xl bg-transparent"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      Show Interest (Free)
                    </Button>

                    <Button
                      onClick={handleJoinExperience}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg"
                    >
                      Join Experience (5% advance)
                    </Button>
                  </div>
                </>
              )}

              {currentStep === "interest" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Interest Registered!</h2>

                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-10 h-10 text-red-500 fill-current" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{experience.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      You've shown interest in this experience! You'll be notified of updates.
                    </p>

                    <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                      <p className="text-sm text-gray-600">
                        <strong>Ready to join?</strong> Pay {fullPayment.toFixed(3)} ETH to secure your spot.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleJoinExperience}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg"
                    >
                      Join Experience Now
                    </Button>

                    <Button
                      onClick={onBack}
                      variant="outline"
                      className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-4 rounded-2xl bg-transparent"
                    >
                      Maybe Later
                    </Button>
                  </div>
                </>
              )}

              {/* Join Experience Step */}
              {currentStep === "join" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Join Experience</h2>

                  <div className="space-y-4 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{experience.title}</h3>
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">Buenos Aires, Argentina</span>
                        <span className="ml-auto text-lg font-semibold text-blue-600">{experience.price}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Nickname</label>
                      <Input
                        placeholder="Enter a nickname for this experience"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="rounded-2xl border-gray-200"
                      />
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-4">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Payment Structure:</strong>
                      </p>
                      <p className="text-sm text-gray-600 mb-1">• Full payment: {fullPayment.toFixed(3)} ETH when joining</p>
                      <p className="text-sm text-gray-600 mb-2">
                        • No additional payments required
                      </p>
                      {balance && (
                        <div className="border-t border-blue-200 pt-2 mt-2">
                          <p className="text-xs text-gray-600">
                            <strong>Your Balance:</strong> {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                          </p>
                          {parseFloat(balance.formatted) < fullPayment && (
                            <p className="text-xs text-red-600 mt-1">
                              ⚠️ Insufficient funds. You need {fullPayment.toFixed(3)} ETH
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {!experience.isReal ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                      <div className="flex items-center">
                        <span className="text-yellow-600 mr-2">⚠️</span>
                        <div>
                          <p className="text-yellow-800 font-medium">Demo Experience</p>
                          <p className="text-yellow-700 text-sm">This is a demo experience and cannot be booked. Please book a real experience from the explore page.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Button
                      onClick={handleConfirmJoin}
                      disabled={!nickname.trim() || isBookingExperience || (balance && parseFloat(balance.formatted) < fullPayment)}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg disabled:opacity-50"
                    >
                      {isBookingExperience ? (
                        <div className="flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        `Pay ${fullPayment.toFixed(3)} ETH & Join`
                      )}
                    </Button>
                  )}
                  
                  {isBookingExperience && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      This may take a few moments due to network traffic...
                    </p>
                  )}
                  
                  {bookExperienceError && bookExperienceError.message?.includes('rate limited') && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-sm text-yellow-800 mb-2">
                        <strong>Network Busy:</strong> The blockchain network is experiencing high traffic.
                      </p>
                      <Button
                        onClick={handleConfirmJoin}
                        variant="outline"
                        size="sm"
                        className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                      >
                        🔄 Try Again
                      </Button>
                    </div>
                  )}
                </>
              )}

              {currentStep === "checkin" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Experience starts in</h2>
                  <div className="text-4xl font-bold text-center text-blue-600 mb-2">{timeRemaining}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Confirm Participation</h3>

                  <div className="space-y-4 mb-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">{experience.title}</h4>
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">Buenos Aires, Argentina</span>
                        <span className="ml-auto text-lg font-semibold text-blue-600">{experience.price}</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                      <p className="text-sm text-gray-600">
                        You have successfully joined the experience! Payment of {fullPayment.toFixed(3)} ETH has been processed.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Participants (14/20)</span>
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">You (Ready)</span>
                        <div className="text-blue-600 text-sm font-medium">Ready</div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckin}
                    disabled={isCheckingIn}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg disabled:opacity-50"
                  >
                    {isCheckingIn ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Checking In...
                      </div>
                    ) : (
                      <>
                        <span className="mr-2">🔥</span>
                        Check In to Experience
                      </>
                    )}
                  </Button>
                  
                  {isCheckingIn && (
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Processing check-in on blockchain...
                    </p>
                  )}
                </>
              )}

              {currentStep === "checkedin" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">🎉 Checked In!</h2>

                  <div className="space-y-6 mb-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✅</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Successfully Checked In</h3>
                      <p className="text-gray-600 text-sm mb-4">You're now checked in to the experience!</p>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">{experience.title}</h4>
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">Buenos Aires, Argentina</span>
                        <span className="ml-auto text-lg font-semibold text-blue-600">{experience.price}</span>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-2xl p-4">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Status:</strong>
                      </p>
                      <p className="text-sm text-gray-600">
                        ✅ Checked in successfully<br/>
                        ✅ Payment processed<br/>
                        ✅ Ready to enjoy your experience!
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Your Status</span>
                        <div className="text-green-600 text-sm font-medium">Checked In</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Experience Status</span>
                        <div className="text-blue-600 text-sm font-medium">In Progress</div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCompleteExperience}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 rounded-2xl shadow-lg"
                  >
                    <span className="mr-2">🎉</span>
                    Complete Experience
                  </Button>
                </>
              )}

              {/* Review Step - Removed, now goes directly to completion */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
