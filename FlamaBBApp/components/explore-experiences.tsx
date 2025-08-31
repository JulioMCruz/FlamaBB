"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Search, MapPin, Clock, Users, Star, Heart } from "lucide-react"
import { ExperienceBooking } from "@/components/experience-booking"
import { getAllActiveExperiences, type Experience as FirebaseExperience } from "@/lib/firebase-experiences"

interface ExploreExperiencesProps {
  onBack: () => void
}

// Interface for real experience data
interface RealExperience {
  id: string
  title: string
  location: string
  venue: string
  price: string
  maxParticipants: number
  date: string
  time: string
  description: string
  creator: string
  status: string
  transactionHash: string
  blockchainExperienceId: string
}

// Fallback experiences for when no real data is available
const fallbackExperiences = [
  {
    id: 1,
    title: "Traditional Asado Experience",
    location: "Palermo, Buenos Aires",
    price: "0.08 ETH",
    duration: "4 hours",
    participants: "6/12",
    rating: 4.9,
    image: "/traditional-argentine-asado-barbecue.png",
    description: "Authentic Argentine barbecue with premium cuts and traditional sides",
    host: "Anonymous",
    included: ["Premium beef cuts", "Traditional chimichurri", "Argentine wine", "Cooking lesson"],
    interested: 18,
    category: "Food & Dining",
    flamitas: 18,
    checkinPercentage: 40,
    midExperiencePercentage: 35,
    isReal: false, // Demo experience
  },
  {
    id: 2,
    title: "Palermo Bars & Nightlife",
    location: "Palermo Soho, Buenos Aires",
    price: "0.06 ETH",
    duration: "5 hours",
    participants: "8/15",
    rating: 4.7,
    image: "/buenos-aires-palermo-bars-nightlife.png",
    description: "Explore the best cocktail bars and speakeasies in trendy Palermo",
    host: "Anonymous",
    included: ["3 premium bars", "Welcome drinks", "Local guide", "Bar snacks"],
    interested: 24,
    category: "Nightlife",
    flamitas: 24,
    checkinPercentage: 40,
    midExperiencePercentage: 35,
    isReal: false, // Demo experience
  },
  {
    id: 3,
    title: "San Telmo Walking Tour",
    location: "San Telmo, Buenos Aires",
    price: "0.04 ETH",
    duration: "3 hours",
    participants: "10/20",
    rating: 4.8,
    image: "/san-telmo-buenos-aires-tango-street-art.png",
    description: "Historic neighborhood tour with tango shows and street art",
    host: "CulturalGuide",
    included: ["Professional guide", "Tango demonstration", "Street art tour", "Local snacks"],
    interested: 31,
    category: "Culture & Arts",
    flamitas: 31,
    checkinPercentage: 40,
    midExperiencePercentage: 35,
    isReal: false, // Demo experience
  },
  {
    id: 4,
    title: "Puerto Madero Wine Tasting",
    location: "Puerto Madero, Buenos Aires",
    price: "0.07 ETH",
    duration: "2.5 hours",
    participants: "4/10",
    rating: 4.9,
    image: "/puerto-madero-wine-tasting-malbec.png",
    description: "Premium Malbec tasting with waterfront views",
    host: "Anonymous",
    included: ["5 wine tastings", "Cheese pairings", "Sommelier guide", "Waterfront terrace"],
    interested: 15,
    category: "Food & Dining",
    isReal: false, // Demo experience
    flamitas: 15,
    checkinPercentage: 40,
    midExperiencePercentage: 35,
  },
  {
    id: 5,
    title: "Recoleta Cemetery & Culture",
    location: "Recoleta, Buenos Aires",
    price: "0.03 ETH",
    duration: "2 hours",
    participants: "12/25",
    rating: 4.6,
    image: "/recoleta-cemetery-buenos-aires-evita.png",
    description: "Historic cemetery tour including Eva Perón's tomb",
    host: "HistoryBuff",
    included: ["Cemetery entrance", "Historical guide", "Cultural stories", "Photo opportunities"],
    interested: 22,
    category: "Culture & Arts",
    flamitas: 22,
    checkinPercentage: 40,
    midExperiencePercentage: 35,
  },
]

export function ExploreExperiences({ onBack }: ExploreExperiencesProps) {
  const [selectedExperience, setSelectedExperience] = useState<string | number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [wishlist, setWishlist] = useState<Set<number>>(new Set())
  const [realExperiences, setRealExperiences] = useState<RealExperience[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch real experiences from Firebase
  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true)
        
        // Fetch all active experiences from Firebase
        const firebaseExperiences = await getAllActiveExperiences(20)
        
        console.log('📖 Fetched Firebase experiences:', firebaseExperiences)
        console.log('📖 Number of experiences found:', firebaseExperiences.length)
        
        // Log each experience for debugging
        firebaseExperiences.forEach((exp, index) => {
          console.log(`📖 Experience ${index + 1}:`, {
            id: exp.id,
            title: exp.title,
            city: exp.city,
            venue: exp.venue,
            status: exp.status,
            createdBy: exp.createdBy,
            blockchainExperienceId: exp.blockchainExperienceId,
            transactionHash: exp.transactionHash
          })
        })
        
        // Convert Firebase experiences to our display format
        const convertedExperiences: RealExperience[] = firebaseExperiences.map((exp: FirebaseExperience) => ({
          id: exp.id || "",
          title: exp.title,
          location: exp.venue, // Use venue as location
          venue: exp.venue,
          price: exp.contributionAmount,
          maxParticipants: parseInt(exp.maxParticipants) || 1,
          date: exp.date,
          time: "20:00", // Default time
          description: exp.description,
          creator: exp.createdBy,
          status: exp.status,
          transactionHash: exp.id || "", // Use Firebase ID as transaction hash for now
          blockchainExperienceId: exp.blockchainExperienceId || "" // Include blockchain experience ID
        }))
        
        setRealExperiences(convertedExperiences)
      } catch (error) {
        console.error('❌ Error fetching experiences from Firebase:', error)
        setError('Failed to load experiences')
      } finally {
        setLoading(false)
      }
    }

    fetchExperiences()
  }, [])

  const toggleWishlist = (experienceId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setWishlist((prev) => {
      const newWishlist = new Set(prev)
      if (newWishlist.has(experienceId)) {
        newWishlist.delete(experienceId)
      } else {
        newWishlist.add(experienceId)
      }
      return newWishlist
    })
  }

  // Convert real experiences to display format
  const realExperiencesForDisplay = realExperiences.map((exp, index) => ({
    id: 1000 + index, // Use numeric IDs starting from 1000
    title: exp.title,
    location: exp.location,
    venue: exp.venue,
    price: exp.price,
    duration: "3 hours", // Default duration
    participants: `0/${exp.maxParticipants}`,
    rating: 4.5, // Default rating
    image: "/placeholder.svg",
    description: exp.description,
    host: exp.creator.slice(0, 6) + "..." + exp.creator.slice(-4),
    included: ["Professional Guide", "All Equipment Provided", "Refreshments Included"],
    interested: 5, // Default interest
    category: "General",
    flamitas: 5, // Default flamitas
    checkinPercentage: 40, // Default checkin percentage
    midExperiencePercentage: 35, // Default mid-experience percentage
    isReal: true,
    realData: exp
  }))

  // Combine real and fallback experiences
  const allExperiences = [...realExperiencesForDisplay, ...fallbackExperiences]

  if (selectedExperience) {
    const experience = allExperiences.find((exp) => exp.id === selectedExperience)
    if (experience) {
      return (
        <ExperienceBooking experience={experience} onBack={() => setSelectedExperience(null)} onComplete={onBack} />
      )
    }
  }

  const categories = ["All", "Food & Dining", "Nightlife", "Culture & Arts"]

  const filteredExperiences = allExperiences.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exp.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || exp.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
                  <img src="/flamabb-mascot.png" alt="FlamaBB" className="w-8 h-8" />
                  <span className="text-lg font-semibold text-gray-800">FlamaBB</span>
                </div>
                <div className="w-6"></div>
              </div>

              <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">Discover Experiences</h2>
              <div className="flex items-center justify-center text-sm text-gray-600 mb-6">
                <MapPin className="w-4 h-4 mr-1" />
                <span>All Locations</span>
              </div>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search asados, bars, tours..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 py-3 rounded-2xl border-gray-200"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex space-x-2 mb-6 overflow-x-auto">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading experiences...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-2">Failed to load experiences</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Experience List */}
              {!loading && !error && (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredExperiences.map((experience) => (
                  <div key={experience.id} className="relative">
                    <button
                      onClick={() => setSelectedExperience(experience.id)}
                      className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow text-left"
                    >
                      <div className="flex space-x-4">
                        <img
                          src={experience.image || "/placeholder.svg"}
                          alt={experience.title}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-gray-800 text-sm truncate">{experience.title}</h3>
                            {experience.isReal && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                🔗 Live
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-gray-600 mb-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate">{experience.location}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{experience.duration}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              <span>{experience.participants}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center">
                                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                                <span className="text-xs font-medium">{experience.rating}</span>
                              </div>
                              <div className="flex items-center">
                                <img src="/flamabb-mascot.png" alt="Flamitas" className="w-3 h-3 mr-1" />
                                <span className="text-xs font-medium">{experience.interested}</span>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-blue-600">{experience.price}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={(e) => toggleWishlist(experience.id, e)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          wishlist.has(experience.id) ? "text-red-500 fill-red-500" : "text-gray-400 hover:text-red-400"
                        }`}
                      />
                    </button>
                  </div>
                ))}
                </div>
              )}

              {!loading && !error && filteredExperiences.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No experiences found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
