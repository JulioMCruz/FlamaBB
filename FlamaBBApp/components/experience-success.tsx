"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle, Share2, Copy, ExternalLink, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { useAccount } from "wagmi"

interface ExperienceSuccessProps {
  experienceId: string
  title: string
  venue: string
  address: string
  date: Date
  time: string
  price: string
  maxParticipants: string
  onBack: () => void
}

export function ExperienceSuccess({ 
  experienceId, 
  title, 
  venue, 
  address, 
  date, 
  time, 
  price, 
  maxParticipants,
  onBack 
}: ExperienceSuccessProps) {
  const [copied, setCopied] = useState(false)
  const { address: walletAddress } = useAccount()
  
  // Store the experience data in our API when component mounts
  useEffect(() => {
    const storeExperienceData = async () => {
      try {
        const experienceData = {
          id: experienceId,
          title: title,
          description: `Join me for ${title}! This is an amazing experience hosted at ${venue}.`,
          location: address,
          venue: venue,
          price: price,
          maxParticipants: parseInt(maxParticipants),
          date: date.toISOString(),
          time: time,
          creator: walletAddress || "0x1234...5678", // Use actual wallet address
          status: "Active",
          transactionHash: experienceId
        }
        
        console.log('💾 Storing experience data:', experienceData)
        
        const response = await fetch(`/api/experiences/${experienceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(experienceData)
        })
        
        if (response.ok) {
          console.log('✅ Experience data stored successfully')
        } else {
          console.error('❌ Failed to store experience data')
        }
      } catch (error) {
        console.error('❌ Error storing experience data:', error)
      }
    }
    
    storeExperienceData()
  }, [experienceId, title, venue, address, date, time, price, maxParticipants])
  
  const shareUrl = `${window.location.origin}/experience/${experienceId}`
  console.log('🔗 Generated share URL:', shareUrl)
  const basescanUrl = `https://sepolia.basescan.org/tx/${experienceId}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareExperience = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join me for ${title}`,
          text: `I'm hosting ${title} at ${venue} on ${format(date, "PPP")} at ${time}. Join me!`,
          url: shareUrl,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
            {/* Header */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🔥</span>
                </div>
                <span className="text-xl font-bold text-gray-900">FlamaBB</span>
              </div>
            </div>
        {/* Success Icon */}
        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Experience Published! 🎉
        </h1>
        <p className="text-gray-600 mb-8">
          Your experience has been successfully published on Base blockchain
        </p>

        {/* Experience Details */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>📍 {venue}</p>
            <p>🏠 {address}</p>
            <p>📅 {format(date, "PPP")} at {time}</p>
            <p>💰 {price} ETH</p>
            <p>👥 Max {maxParticipants} participants</p>
          </div>
        </div>

        {/* Blockchain Info */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-8">
          <p className="text-sm text-blue-800">
            <strong>Transaction Hash:</strong> {experienceId.slice(0, 10)}...{experienceId.slice(-8)}
          </p>
          <a 
            href={basescanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2"
          >
            View on Basescan <ExternalLink className="w-4 h-4 ml-1" />
          </a>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={shareExperience}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-2xl"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Experience
          </Button>

          <Button
            onClick={copyToClipboard}
            variant="outline"
            className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-2xl"
          >
            <Copy className="w-5 h-5 mr-2" />
            {copied ? "Copied!" : "Copy Link"}
          </Button>

          <Button
            onClick={onBack}
            variant="ghost"
            className="w-full text-gray-600 hover:text-gray-800 font-semibold py-3 rounded-2xl"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {/* Success Message */}
        <p className="text-xs text-gray-500 mt-6">
          Your experience is now live and discoverable by the FlamaBB community!
        </p>
          </div>
        </div>
      </div>
    </div>
  )
}
