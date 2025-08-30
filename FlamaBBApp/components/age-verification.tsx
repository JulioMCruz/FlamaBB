"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, QrCode, Smartphone } from "lucide-react"
import { ZKPassport } from "@zkpassport/sdk"
import QRCode from "qrcode"

interface AgeVerificationProps {
  onVerified: () => void
  onBack: () => void
}

export function AgeVerification({ onVerified, onBack }: AgeVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [verificationUrl, setVerificationUrl] = useState<string>("")
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState<string>("")

  const startVerification = async () => {
    try {
      setIsVerifying(true)
      setError("")
      
      const zkPassport = new ZKPassport()
      
      const queryBuilder = await zkPassport.request({
        name: "FlamaBB",
        logo: "https://flamabb.com/flamabb-mascot.png",
        purpose: "Prove you are 18+ years old to access FlamaBB experiences",
        scope: "adult-verification",
        devMode: true // Enable dev mode for testing
      })

      const { url, requestId, onResult } = queryBuilder
        .gte("age", 18)
        .done()

      setVerificationUrl(url)
      
      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1E40AF',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrDataUrl)

      // Handle verification result
      onResult((result) => {
        console.log('Age verification result:', result)
        if (result.verified) {
          setIsVerified(true)
          setTimeout(() => {
            onVerified()
          }, 2000) // Show success for 2 seconds before proceeding
        } else {
          setError("Age verification failed. Please try again or ensure you are 18+.")
          setIsVerifying(false)
        }
      })

    } catch (err) {
      console.error('Age verification error:', err)
      setError("Failed to start verification. Please try again.")
      setIsVerifying(false)
    }
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Verification Complete!</h2>
            <p className="text-gray-600">Age verification successful. Welcome to FlamaBB!</p>
          </div>
        </div>
      </div>
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

          {!isVerifying ? (
            <>
              {/* Title */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Age Verification Required</h2>
                <p className="text-gray-600 text-balance leading-relaxed">
                  To access FlamaBB experiences, we need to verify that you're 18 or older using your ID document.
                </p>
              </div>

              {/* Privacy Notice */}
              <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">🔒 Privacy Protected</h3>
                <p className="text-sm text-gray-600">
                  We use zero-knowledge technology to verify your age without storing or accessing your personal information.
                </p>
              </div>

              {/* Dev Mode Notice */}
              <div className="bg-amber-50 rounded-2xl p-4 mb-6 border border-amber-200">
                <h3 className="font-semibold text-amber-800 mb-2">🧪 Development Mode</h3>
                <p className="text-sm text-amber-700">
                  This is running in dev mode with mock passports for testing. No real ID required.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 rounded-2xl p-4 mb-6 border border-red-200">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Start Verification Button */}
              <Button
                onClick={startVerification}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200"
              >
                Start Age Verification
              </Button>
            </>
          ) : (
            <>
              {/* Verification in Progress */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Verify Your Age</h2>
                <p className="text-gray-600 mb-6">
                  Scan the QR code with your mobile device to complete verification
                </p>
              </div>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-white p-4 rounded-2xl shadow-lg mb-4">
                    <img src={qrCodeUrl} alt="Verification QR Code" className="w-48 h-48" />
                  </div>
                  
                  {/* Mobile Link */}
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Smartphone className="w-4 h-4 mr-2" />
                      <span>Or open on mobile:</span>
                    </div>
                    <a
                      href={verificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                    >
                      Open Verification Link
                    </a>
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-sm">Waiting for verification...</span>
                </div>
              </div>
            </>
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