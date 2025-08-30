"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, QrCode, Smartphone, Shield, Award, Trophy } from "lucide-react"
import { AgeVerification } from "@/components/age-verification"
import { useAuth } from "@/contexts/auth-context"
import { updateUserProfile } from "@/lib/firebase-auth"

interface VerificationsScreenProps {
  onNext: () => void
  onBack: () => void
}

export function VerificationsScreen({ onNext, onBack }: VerificationsScreenProps) {
  const [activeVerification, setActiveVerification] = useState<string | null>(null)
  const [completedVerifications, setCompletedVerifications] = useState<Set<string>>(new Set())
  const { user, userProfile } = useAuth()

  const verifications = [
    {
      id: "zkpassport",
      name: "Age Verification",
      description: "Verify you're 18+ using zero-knowledge technology",
      icon: Shield,
      color: "from-blue-500 to-blue-600",
      implemented: true
    },
    {
      id: "talentProtocol",
      name: "Talent Protocol",
      description: "Verify your professional reputation and skills",
      icon: Award,
      color: "from-purple-500 to-purple-600",
      implemented: false
    },
    {
      id: "poap",
      name: "POAP Collection",
      description: "Show your event attendance and community participation",
      icon: Trophy,
      color: "from-orange-500 to-orange-600",
      implemented: false
    }
  ]

  const handleVerificationComplete = async (verificationType: string) => {
    try {
      // Update Firebase with verification status
      if (user) {
        const currentVerifications = userProfile?.verifications || {}
        await updateUserProfile(user.uid, {
          verifications: {
            ...currentVerifications,
            [verificationType]: true
          }
        })
      }
      
      setCompletedVerifications(prev => new Set([...prev, verificationType]))
      setActiveVerification(null)
    } catch (error) {
      console.error("Error updating verification status:", error)
    }
  }

  const handleBackFromVerification = () => {
    setActiveVerification(null)
  }

  // Show specific verification component
  if (activeVerification === "zkpassport") {
    return (
      <AgeVerification 
        onVerified={() => handleVerificationComplete("zkpassport")}
        onBack={handleBackFromVerification}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-white/10 rounded-full blur-lg"></div>
      </div>

      <div className="relative w-full max-w-sm">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={onBack} 
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="underline">Back</span>
            </button>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Optional Verifications</h2>
            <p className="text-gray-600 text-balance leading-relaxed">
              Enhance your profile with trusted verifications. These are optional but help build community trust.
            </p>
          </div>

          {/* Verification Options */}
          <div className="space-y-4 mb-6">
            {verifications.map((verification) => {
              const IconComponent = verification.icon
              const isCompleted = completedVerifications.has(verification.id) || 
                               userProfile?.verifications?.[verification.id as keyof typeof userProfile.verifications]
              
              return (
                <div key={verification.id} className="relative">
                  <button
                    onClick={() => verification.implemented ? setActiveVerification(verification.id) : null}
                    disabled={!verification.implemented || isCompleted}
                    className={`w-full p-4 rounded-2xl border transition-all duration-200 text-left ${
                      isCompleted 
                        ? "bg-green-50 border-green-200" 
                        : verification.implemented
                        ? "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                        : "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? "bg-green-500" 
                          : `bg-gradient-to-br ${verification.color}`
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-white" />
                        ) : (
                          <IconComponent className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {verification.name}
                          {!verification.implemented && (
                            <span className="text-xs text-gray-500 ml-2">(Coming Soon)</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">{verification.description}</p>
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>

          {/* Skip Button */}
          <Button
            onClick={onNext}
            variant="outline"
            className="w-full mb-4 border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-2xl transition-all duration-200"
          >
            Skip Verifications
          </Button>

          {/* Continue Button - Show when at least one verification is completed */}
          {(completedVerifications.size > 0 || Object.values(userProfile?.verifications || {}).some(Boolean)) && (
            <Button
              onClick={onNext}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200"
            >
              Continue with Verifications
            </Button>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <div className="w-3 h-3 bg-white/50 rounded-full"></div>
          <div className="w-3 h-3 bg-white/50 rounded-full"></div>
          <div className="w-3 h-3 bg-white/50 rounded-full"></div>
          <div className="w-3 h-3 bg-white/50 rounded-full"></div>
        </div>

        <div className="text-center mt-4">
          <span className="text-white/80 text-sm">Step 2 of 6</span>
        </div>
      </div>
    </div>
  )
}