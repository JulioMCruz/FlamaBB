"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, ExternalLink } from "lucide-react"
import { format } from "date-fns"

interface Experience {
  id: string
  title: string
  description: string
  location: string
  venue: string
  price: string
  maxParticipants: number
  date: Date
  time: string
  creator: string
  status: string
}

export default function ExperiencePage() {
  const params = useParams()
  const experienceId = params.id as string
  const [experience, setExperience] = useState<Experience | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/experiences/${experienceId}`)
        
        if (!response.ok) {
          throw new Error('Experience not found')
        }
        
        const data = await response.json()
        setExperience({
          ...data,
          date: new Date(data.date)
        })
      } catch (error) {
        console.error('Error fetching experience:', error)
        setError('Failed to load experience')
      } finally {
        setLoading(false)
      }
    }

    fetchExperience()
  }, [experienceId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading experience...</p>
        </div>
      </div>
    )
  }

  if (error || !experience) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Experience Not Found</h1>
          <p className="text-gray-600 mb-4">The experience you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🔥</span>
                </div>
                <span className="text-xl font-bold text-gray-900">FlamaBB</span>
              </div>
              <div className="w-6"></div>
            </div>

            {/* Experience Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{experience.title}</h1>
            
            {/* Status Badge */}
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-6">
              {experience.status}
            </div>

            {/* Experience Details */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{experience.venue}</p>
                  <p className="text-gray-600">{experience.location}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    {format(experience.date, "EEEE, MMMM do, yyyy")}
                  </p>
                  <p className="text-gray-600">at {experience.time}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Max {experience.maxParticipants} participants</p>
                  <p className="text-gray-600">Join this amazing experience!</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">{experience.price} ETH</p>
                  <p className="text-gray-600">Full payment required when booking</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Experience</h2>
            <p className="text-gray-700 leading-relaxed">{experience.description}</p>
          </div>

          {/* Blockchain Info */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Blockchain Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Experience ID</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{experience.id}</p>
              </div>
                             <div>
                 <p className="text-sm text-gray-600">Creator</p>
                 <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                   {experience.creator.length > 10 
                     ? `${experience.creator.slice(0, 6)}...${experience.creator.slice(-4)}`
                     : experience.creator
                   }
                 </p>
               </div>
              <div>
                <p className="text-sm text-gray-600">Transaction Hash</p>
                <a 
                  href={`https://sepolia.basescan.org/tx/${experience.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <span className="font-mono text-sm bg-gray-100 p-2 rounded">{experience.id}</span>
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="space-y-4">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl">
                Book This Experience
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-4 rounded-2xl"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  alert('Link copied to clipboard!')
                }}
              >
                Share Experience
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
