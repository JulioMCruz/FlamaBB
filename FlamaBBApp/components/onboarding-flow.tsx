"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  ArrowLeft,
  Search,
  Utensils,
  Coffee,
  Building,
  Palette,
  Mountain,
  ShoppingBag,
  Twitter,
  Instagram,
  Github,
  Wine,
  Trees,
  Music,
  Music2,
  Dumbbell,
  MapPin,
  Apple,
  Shield,
  Award,
  Trophy,
} from "lucide-react"
import { useAccount } from "wagmi"
import { useAuth } from "@/contexts/auth-context"
import { Dashboard } from "@/components/dashboard"
import { getSuggestedCities, type City } from "@/lib/firebase-cities"
import { getSuggestedInterests, type Interest } from "@/lib/firebase-interests"
import { updateUserProfile, createAnonymousUserWithWallet } from "@/lib/firebase-auth"
import { Web3Reputation } from "@/components/web3-reputation"
import { AgeVerification } from "@/components/age-verification"

type OnboardingStep = "cities" | "interests" | "budget" | "profile" | "verifications" | "complete"

interface CityWithSelection extends City {
  selected: boolean
}

interface InterestWithSelection extends Interest {
  selected: boolean
}

const defaultInterests = [
  { name: "Restaurants", icon: Utensils, selected: true },
  { name: "Bars & Nightlife", icon: Wine, selected: true },
  { name: "Coffee & Cafés", icon: Coffee, selected: true },
  { name: "Cultural Attractions", icon: Palette, selected: true },
  { name: "Parks & Outdoor", icon: Trees, selected: false },
  { name: "Shopping", icon: ShoppingBag, selected: false },
  { name: "Live Music", icon: Music, selected: false },
  { name: "Tango & Dance", icon: Music2, selected: true },
  { name: "Wine Tastings", icon: Wine, selected: false },
  { name: "Food Markets", icon: Apple, selected: false },
  { name: "Tours & Sightseeing", icon: MapPin, selected: false },
  { name: "Sports & Fitness", icon: Dumbbell, selected: false },
]

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("cities")
  const [cities, setCities] = useState<CityWithSelection[]>([])
  const [selectedCities, setSelectedCities] = useState<CityWithSelection[]>([])
  const [selectedInterests, setSelectedInterests] = useState<InterestWithSelection[]>([])
  const [loadingInterests, setLoadingInterests] = useState(true)
  const [budgetAmount, setBudgetAmount] = useState(0.5)
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [shareProfilePublicly, setShareProfilePublicly] = useState(true)
  const [privacySettings, setPrivacySettings] = useState(true)
  const [loading, setLoading] = useState(true)
  const [activeVerification, setActiveVerification] = useState<string | null>(null)
  const [completedVerifications, setCompletedVerifications] = useState<Set<string>>(new Set())
  
  // Wagmi hook to get wallet address
  const { address } = useAccount()
  const { user, userProfile } = useAuth()

  const stepNumber = {
    cities: 1,
    interests: 2,
    budget: 3,
    profile: 4,
    verifications: 5,
    complete: 5,
  }[currentStep]

  // verification options
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

  // Load cities and interests from Firebase on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        setLoading(true)
        console.log('🔄 Loading cities from Firebase...')
        const citiesData = await getSuggestedCities()
        console.log('✅ Cities loaded:', citiesData.length, 'cities')
        
        const citiesWithSelection = citiesData.map(city => ({
          ...city,
          selected: false // Default to unselected
        }))
        setCities(citiesWithSelection)
        setSelectedCities(citiesWithSelection)
      } catch (error) {
        console.error('❌ Error loading cities:', error)
        // Fallback to default cities if Firebase fails
        console.log('🔄 Using fallback cities...')
        const fallbackCities = [
          { id: 'buenos-aires', name: 'Buenos Aires', icon: '🌆', country: 'Argentina', popular: true, selected: true },
          { id: 'new-york', name: 'New York', icon: '🏙️', country: 'USA', popular: true, selected: true },
          { id: 'paris', name: 'Paris', icon: '🏛️', country: 'France', popular: true, selected: true },
          { id: 'tokyo', name: 'Tokyo', icon: '🏯', country: 'Japan', popular: true, selected: true },
          { id: 'london', name: 'London', icon: '🏛️', country: 'UK', popular: true, selected: false },
          { id: 'singapore', name: 'Singapore', icon: '🏢', country: 'Singapore', popular: true, selected: true },
          { id: 'dubai', name: 'Dubai', icon: '🕌', country: 'UAE', popular: true, selected: false },
          { id: 'sydney', name: 'Sydney', icon: '🏛️', country: 'Australia', popular: true, selected: false },
        ] as CityWithSelection[]
        setCities(fallbackCities)
        setSelectedCities(fallbackCities)
      } finally {
        setLoading(false)
        console.log('✅ Cities loading complete')
      }
    }

    const loadInterests = async () => {
      try {
        setLoadingInterests(true)
        const interestsData = await getSuggestedInterests()
        const interestsWithSelection = interestsData.map(interest => ({
          ...interest,
          selected: false
        }))
        setSelectedInterests(interestsWithSelection)
      } catch (error) {
        console.error('Error loading interests:', error)
        // Fallback to default interests if Firebase fails
        setSelectedInterests(defaultInterests.map(interest => ({ 
          ...interest, 
          id: interest.name.toLowerCase().replace(/[^a-z0-9]/g, '-'), 
          selected: interest.selected, 
          category: 'Experience', 
          popular: true,
          icon: interest.name // use name as icon string for fallback
        })))
      } finally {
        setLoadingInterests(false)
      }
    }

    // Load cities with timeout fallback
    const loadCitiesWithTimeout = async () => {
      const timeout = setTimeout(() => {
        console.log('⏰ Cities loading timeout, using fallback...')
        setLoading(false)
        const fallbackCities = [
          { id: 'buenos-aires', name: 'Buenos Aires', icon: '🌆', country: 'Argentina', popular: true, selected: true },
          { id: 'new-york', name: 'New York', icon: '🏙️', country: 'USA', popular: true, selected: true },
          { id: 'paris', name: 'Paris', icon: '🏛️', country: 'France', popular: true, selected: true },
          { id: 'tokyo', name: 'Tokyo', icon: '🏯', country: 'Japan', popular: true, selected: true },
          { id: 'london', name: 'London', icon: '🏛️', country: 'UK', popular: true, selected: false },
          { id: 'singapore', name: 'Singapore', icon: '🏢', country: 'Singapore', popular: true, selected: true },
          { id: 'dubai', name: 'Dubai', icon: '🕌', country: 'UAE', popular: true, selected: false },
          { id: 'sydney', name: 'Sydney', icon: '🏛️', country: 'Australia', popular: true, selected: false },
        ] as CityWithSelection[]
        setCities(fallbackCities)
        setSelectedCities(fallbackCities)
      }, 5000) // 5 second timeout

      try {
        await loadCities()
      } finally {
        clearTimeout(timeout)
      }
    }

    loadCitiesWithTimeout()
    loadInterests()
  }, [])

  const handleBack = () => {
    const steps: OnboardingStep[] = ["cities", "interests", "budget", "profile", "verifications", "complete"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleNext = async () => {
    const steps: OnboardingStep[] = ["cities", "interests", "budget", "profile", "verifications", "complete"]
    const currentIndex = steps.indexOf(currentStep)
    
    // Create Firebase user if needed, then save complete profile when finishing profile step
    if (currentStep === "profile" && address) {
      let currentUser = user
      
      // Create Firebase user if one doesn't exist
      if (!currentUser) {
        try {
          console.log('👤 No Firebase user found, creating anonymous user with wallet...')
          const result = await createAnonymousUserWithWallet(address, displayName)
          currentUser = result.user
          console.log('✅ Anonymous user created:', currentUser.uid)
        } catch (error) {
          console.error('❌ Failed to create Firebase user:', error)
          console.log('🔧 BYPASS: Continuing with wallet-only testing for CDP functionality')
          // TEMP: Create mock user for CDP wallet testing
          currentUser = {
            uid: `temp_${address.slice(2, 10)}`,
            email: `${address.slice(2, 10)}@testing.local`,
            displayName: displayName || 'Test User'
          } as any
        }
      }
      
      // Now save the profile with the current user
      if (currentUser) {
        try {
          const selectedCityNames = selectedCities.filter(city => city.selected).map(city => city.name)
          const selectedInterestNames = selectedInterests.filter(interest => interest.selected).map(interest => interest.name)
          
          const profileData = {
            displayName: displayName || currentUser.displayName || undefined,
            bio,
            avatar: avatars[selectedAvatar].icon,
            walletAddress: address,
            cities: selectedCityNames,
            interests: selectedInterestNames,
            budget: budgetAmount,
            shareProfilePublicly,
            privacySettings
          }
          
          console.log('💾 Saving complete profile data:', profileData)
          
          // Save complete profile data to Firebase
          const result = await updateUserProfile(currentUser.uid, profileData)
          
          if (result.error) {
            console.error('❌ Error saving profile:', result.error)
            return // Don't proceed if save fails
          } else {
            console.log('✅ Profile wizard completed - all data saved to Firebase user profile')
          }
        } catch (error) {
          console.error('❌ Exception saving complete profile:', error)
          return // Don't proceed if save fails
        }
      }
    }
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleSkip = async () => {
    console.log('⏭️ Skipping onboarding, going to dashboard')
    
    // Generate a fun anonymous username
    const generateAnonymousName = () => {
      const adjectives = [
        "Mysterious", "Crypto", "Digital", "Anonymous", "Secret", "Hidden", 
        "Stealth", "Ghost", "Shadow", "Ninja", "Phantom", "Incognito",
        "Wanderer", "Explorer", "Adventurer", "Nomad", "Voyager", "Pioneer"
      ]
      const nouns = [
        "Whale", "Diamond", "Hodler", "Moon", "Rocket", "Laser", "Dragon",
        "Phoenix", "Eagle", "Wolf", "Tiger", "Lion", "Bear", "Bull",
        "Wizard", "Mage", "Knight", "Warrior", "Hunter", "Scout"
      ]
      const emojis = ["🚀", "💎", "🔥", "⚡", "🌟", "🌙", "🐉", "🦅", "🐺", "🦁", "🧙‍♂️", "⚔️"]
      
      const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
      const noun = nouns[Math.floor(Math.random() * nouns.length)]
      const emoji = emojis[Math.floor(Math.random() * emojis.length)]
      
      return `${adjective} ${noun} ${emoji}`
    }
    
    // Create user if needed, then save minimal profile data
    if (address) {
      let currentUser = user
      
      // Create Firebase user if one doesn't exist
      if (!currentUser) {
        try {
          console.log('👤 Creating anonymous user for skip flow...')
          const result = await createAnonymousUserWithWallet(address)
          currentUser = result.user
          console.log('✅ Anonymous user created for skip:', currentUser.uid)
        } catch (error) {
          console.error('❌ Failed to create Firebase user for skip:', error)
          return // Don't proceed if user creation fails
        }
      }
      
      if (currentUser) {
        try {
          // Get existing profile to preserve user-set values like bio
          const existingProfile = await getUserProfile(currentUser.uid)
          
          const profileData = {
            displayName: displayName || currentUser.displayName || generateAnonymousName(),
            walletAddress: address,
          cities: selectedCities.filter(city => city.selected).map(city => city.name),
          interests: selectedInterests.filter(interest => interest.selected).map(interest => interest.name),
          budget: budgetAmount,
          avatar: avatars[selectedAvatar].icon,
          // Preserve existing bio if user has set one, otherwise use default
          bio: existingProfile?.bio || bio || "Ready to explore experiences!",
          shareProfilePublicly,
          privacySettings
        }
        
        console.log('💾 Saving minimal profile data for skipped onboarding (preserving existing bio):', profileData)
        console.log('📝 Existing bio preserved:', existingProfile?.bio)
        
        // Save profile data to Firebase
        const result = await updateUserProfile(currentUser.uid, profileData)
        
        if (result.error) {
          console.error('❌ Error saving skipped profile:', result.error)
        } else {
          console.log('✅ Skipped profile data saved to Firebase')
        }
      } catch (error) {
        console.error('❌ Exception saving skipped profile:', error)
      }
      }
    }
    
    // Go directly to dashboard
    setCurrentStep("complete")
  }

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

  const toggleCitySelection = (index: number) => {
    const updated = [...selectedCities]
    updated[index].selected = !updated[index].selected
    setSelectedCities(updated)
  }

  const toggleInterestSelection = (index: number) => {
    const updated = [...selectedInterests]
    updated[index].selected = !updated[index].selected
    setSelectedInterests(updated)
  }

  const avatars = [
    { id: 0, gradient: "from-blue-400 to-blue-600", icon: "🔥" },
    { id: 1, gradient: "from-purple-400 to-purple-600", icon: "🌟" },
    { id: 2, gradient: "from-green-400 to-green-600", icon: "🌿" },
    { id: 3, gradient: "from-orange-400 to-orange-600", icon: "⚡" },
  ]

  if (currentStep === "complete") {
    return <Dashboard />
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
            <button onClick={handleBack} className="flex items-center text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span className="underline">Back</span>
            </button>
            {currentStep !== "profile" && currentStep !== "verifications" && <button onClick={handleSkip} className="text-gray-600 underline text-sm">Skip for now</button>}
          </div>

          {/* Cities Step */}
          {currentStep === "cities" && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center text-balance">
                Which cities would you like to explore?
              </h2>

              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input placeholder="Search for cities..." className="pl-10 py-3 rounded-2xl border-gray-200" />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading cities...</div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {selectedCities.map((city, index) => (
                    <button
                      key={city.id}
                      onClick={() => toggleCitySelection(index)}
                      className={`relative p-4 rounded-2xl border-2 transition-all ${
                        city.selected
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "bg-white border-blue-200 text-gray-700 hover:border-blue-300"
                      }`}
                    >
                      <div className="text-2xl mb-2">{city.icon}</div>
                      <div className="text-sm font-medium">{city.name}</div>
                      {city.selected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Interests Step */}
          {currentStep === "interests" && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center text-balance">
                What types of experiences interest you?
              </h2>

              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input placeholder="Search for interests..." className="pl-10 py-3 rounded-2xl border-gray-200" />
                </div>
              </div>

              {loadingInterests ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">Loading interests...</div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {selectedInterests.map((interest, index) => {
                    const getIconComponent = (iconName: string) => {
                      const iconMap: { [key: string]: any } = {
                        Utensils,
                        Wine,
                        Coffee,
                        Palette,
                        Trees,
                        ShoppingBag,
                        Music,
                        Music2,
                        Dumbbell,
                        MapPin,
                        Apple,
                        Building,
                        Mountain,
                      }
                      return iconMap[iconName] || Building
                    }
                    
                    const IconComponent = getIconComponent(interest.icon)
                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterestSelection(index)}
                        className={`relative p-4 rounded-2xl border-2 transition-all ${
                          interest.selected
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-white border-blue-200 text-gray-700 hover:border-blue-300"
                        }`}
                      >
                        <IconComponent className="w-6 h-6 mx-auto mb-2" />
                        <div className="text-sm font-medium">{interest.name}</div>
                        {interest.selected && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* Budget Step */}
          {currentStep === "budget" && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center text-balance">
                How much would you like to set aside for experiences?
              </h2>

              <h3 className="text-xl font-semibold text-gray-700 mb-8 text-center">Budget Allocation</h3>

              <div className="mb-8">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium text-gray-700">
                      {budgetAmount} ETH / {Math.round(budgetAmount * 1900)} USC
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.05"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(Number.parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div
                      className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full shadow-lg pointer-events-none"
                      style={{ left: `${((budgetAmount - 0.1) / 1.9) * 100}%`, marginLeft: "-12px" }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-8">
                {[0.1, 0.25, 1, 2].map((amount, index) => (
                  <button
                    key={index}
                    onClick={() => setBudgetAmount(amount)}
                    className={`py-3 px-4 rounded-2xl border-2 transition-all ${
                      budgetAmount === amount
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-white border-blue-200 text-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <div className="text-sm font-medium">{amount} ETH</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Profile Step */}
          {currentStep === "profile" && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Complete Your Profile</h2>

              {/* Avatar Selection */}
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <div
                    className={`w-20 h-20 bg-gradient-to-br ${avatars[selectedAvatar].gradient} rounded-full flex items-center justify-center shadow-lg`}
                  >
                    <span className="text-2xl">{avatars[selectedAvatar].icon}</span>
                  </div>
                </div>

                <div className="flex justify-center space-x-3 mb-4">
                  {avatars.map((avatar) => (
                    <button
                      key={avatar.id}
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`w-12 h-12 bg-gradient-to-br ${avatar.gradient} rounded-full flex items-center justify-center shadow-md transition-all ${
                        selectedAvatar === avatar.id ? "ring-4 ring-blue-300" : "opacity-60 hover:opacity-80"
                      }`}
                    >
                      <span className="text-lg">{avatar.icon}</span>
                    </button>
                  ))}
                </div>

                <div className="text-center">
                  <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent">
                    Choose Avatar
                  </Button>
                </div>
              </div>

              {/* Display Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                <Input
                  placeholder="e.g, FlamaFan22"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="rounded-2xl border-gray-200"
                />
              </div>

              {/* Bio */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio/Description</label>
                <Textarea
                  placeholder="Tell us about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="rounded-2xl border-gray-200 resize-none"
                  rows={3}
                />
              </div>

              {/* Privacy Settings */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Privacy Settings</span>
                  <Switch checked={privacySettings} onCheckedChange={setPrivacySettings} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Share Profile Publicly</span>
                  <Switch checked={shareProfilePublicly} onCheckedChange={setShareProfilePublicly} />
                </div>
              </div>

              {/* Social Links */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Link Socials (Optional)</label>
                <div className="flex justify-center space-x-4">
                  <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Twitter className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Instagram className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Github className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Web3 Reputation Section */}
              {address && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Your Web3 Reputation</label>
                  <Web3Reputation 
                    walletAddress={address} 
                    showDetailed={false}
                    className="bg-gray-50 rounded-2xl p-4"
                  />
                </div>
              )}

              {/* Privacy Notice */}
              <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-600 text-center">
                  Your privacy is paramount. You always remain anonymous.
                </p>
              </div>
            </>
          )}

          {/* Verifications Step */}
          {currentStep === "verifications" && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Optional Verifications</h2>
              <p className="text-gray-600 text-balance leading-relaxed mb-6 text-center">
                Enhance your profile with trusted verifications. These are optional but help build community trust.
              </p>

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
                              <Shield className="w-6 h-6 text-white" />
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

              {/* Privacy Notice */}
              <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-600 text-center">
                  Verifications are optional and help build trust in the community. You can always add them later.
                </p>
              </div>
            </>
          )}

          {/* Next/Save Button */}
          <Button
            onClick={handleNext}
            disabled={loading || loadingInterests}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(loading || loadingInterests) ? "Loading..." : currentStep === "profile" ? "Save Profile" : currentStep === "verifications" ? "Continue to App" : "Next"}
          </Button>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full ${step <= stepNumber ? "bg-blue-500" : "bg-white/50"}`}
            ></div>
          ))}
        </div>

        <div className="text-center mt-4">
          <span className="text-white/80 text-sm">Step {stepNumber} of 5</span>
        </div>
      </div>
    </div>
  )
}
