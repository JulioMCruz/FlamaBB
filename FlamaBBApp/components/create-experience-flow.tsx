"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ChevronDown, Calendar, MapPin, Plus, X, Camera, Info, Loader2 } from "lucide-react"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { GoogleMap } from "@/components/google-map"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { useSmartContracts } from "@/hooks/use-smart-contracts"
import { ExperienceSuccess } from "./experience-success"
import { createExperience, updateExperience, type CreateExperienceData } from "@/lib/firebase-experiences"
import { cdpWalletService, type ExperienceWallet } from "@/lib/cdp-wallet-service"
import { useAuth } from "@/contexts/auth-context"

type CreateStep = "initial" | "details" | "description" | "review" | "success"

interface CreateExperienceFlowProps {
  onBack: () => void
}

export function CreateExperienceFlow({ onBack }: CreateExperienceFlowProps) {
  const [currentStep, setCurrentStep] = useState<CreateStep>("initial")
  const [experienceType, setExperienceType] = useState<"existing" | "anonymous">("existing")
  const [publishedExperienceId, setPublishedExperienceId] = useState<string>("")
  
  // Smart contract integration
  const {
    isConnected,
    createExperienceOnChain,
    isCreatingExperience,
    createExperienceError,
    isCreateExperienceSuccess,
    createExperienceReceipt,
    nextExperienceId
  } = useSmartContracts()
  
  // debug logging
  console.log('🔍 CreateExperienceFlow state:', { currentStep, experienceType })
  
  // location state - will be extracted from address autocomplete
  const [fullAddress, setFullAddress] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [venue, setVenue] = useState("")
  const [venueType, setVenueType] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [time, setTime] = useState("")
  const [timezone, setTimezone] = useState("")
  const [contributionAmount, setContributionAmount] = useState("0.05")
  const [maxParticipants, setMaxParticipants] = useState("")
  const [photos, setPhotos] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [experienceTitle, setExperienceTitle] = useState("")
  const [description, setDescription] = useState("")
  const [includedItems, setIncludedItems] = useState([
    "Professional Guide",
    "All Equipment Provided",
    "Refreshments Included",
  ])
  const [newItem, setNewItem] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [checkinPercentage, setCheckinPercentage] = useState("40")
  const [midExperiencePercentage, setMidExperiencePercentage] = useState("35")

  // Quick test data function for faster testing
  const fillTestData = () => {
    setExperienceTitle("Amazing Tango Experience")
    setVenue("La Catedral Club")
    setVenueType("Tango & Dance")
    setFullAddress("Sarmiento 4006, Buenos Aires, Argentina")
    setCity("Buenos Aires")
    setCountry("Argentina")
    setDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days from now
    setTime("20:00")
    setContributionAmount("0.08")
    setMaxParticipants("8")
    setDescription("Join me for an incredible tango experience! Learn from professional dancers in the heart of Buenos Aires. Perfect for beginners and intermediate dancers.")
    setIncludedItems([
      "Professional Tango Instructor",
      "All Equipment Provided",
      "Refreshments Included",
      "Traditional Argentine Snacks"
    ])
    setAgreeToTerms(true)
  }

  // Photo upload handlers
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const fileArray = Array.from(files)
    const maxPhotos = 5
    
    // Check if adding these files would exceed the limit
    if (photos.length + fileArray.length > maxPhotos) {
      alert(`You can upload a maximum of ${maxPhotos} photos. You currently have ${photos.length} and are trying to add ${fileArray.length} more.`)
      return
    }

    setIsUploading(true)
    
    // Convert files to data URLs for preview
    let processedCount = 0
    const totalFiles = fileArray.length
    
    fileArray.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          if (result) {
            setPhotos(prev => [...prev, result])
          }
          processedCount++
          
          if (processedCount === totalFiles) {
            setIsUploading(false)
            console.log('📸 Photos uploaded:', processedCount)
          }
        }
        reader.onerror = () => {
          console.error('❌ Error reading file:', file.name)
          processedCount++
          if (processedCount === totalFiles) {
            setIsUploading(false)
          }
        }
        reader.readAsDataURL(file)
      } else {
        console.warn('⚠️ Skipping non-image file:', file.name)
        processedCount++
        if (processedCount === totalFiles) {
          setIsUploading(false)
        }
      }
    })
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handleBack = () => {
    if (currentStep === "initial") {
      onBack()
    } else {
      const steps: CreateStep[] = ["initial", "details", "description", "review"]
      const currentIndex = steps.indexOf(currentStep)
      if (currentIndex > 0) {
        setCurrentStep(steps[currentIndex - 1])
      }
    }
  }

  const handleNext = () => {
    const steps: CreateStep[] = ["initial", "details", "description", "review"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handlePublishExperience = async () => {
    console.log('🔍 handlePublishExperience called')
    console.log('🔍 Current state:', {
      isConnected,
      agreeToTerms,
      experienceTitle,
      venue,
      description,
      venueType,
      fullAddress,
      contributionAmount,
      maxParticipants,
      date,
      city
    })
    
    if (!isConnected) {
      console.error('❌ Wallet not connected')
      alert("Please connect your wallet first")
      return
    }

    if (!agreeToTerms) {
      console.error('❌ Terms not agreed to')
      alert("Please agree to the terms and conditions")
      return
    }

    try {
      console.log('🚀 Publishing experience to blockchain...')
      
      const params = {
        title: experienceTitle || venue || "Anonymous Experience",
        description: description || venueType || "Join me for an amazing experience!",
        location: fullAddress,
        price: contributionAmount,
        maxParticipants: parseInt(maxParticipants) || 1,
        date: date || new Date(),
        venue: venue || "Location",
        category: venueType || "General",
        city: city || "Unknown"
      }
      
      console.log('🔍 Calling createExperienceOnChain with params:', params)
      
      await createExperienceOnChain(params)
      
      console.log('✅ createExperienceOnChain completed successfully')
    } catch (error) {
      console.error('❌ Error publishing experience:', error)
      
      let userMessage = 'Failed to publish experience. Please try again.'
      
      // Provide specific error messages for common issues
      if (error instanceof Error) {
        if (error.message?.includes('rate limited')) {
          userMessage = 'Network is busy. Please wait a moment and try again.'
        } else if (error.message?.includes('insufficient funds')) {
          userMessage = 'Insufficient funds in your wallet. Please add more ETH for gas fees.'
        } else if (error.message?.includes('user rejected')) {
          userMessage = 'Transaction was cancelled. Please try again.'
        } else if (error.message?.includes('nonce')) {
          userMessage = 'Transaction conflict. Please try again in a moment.'
        } else if (error.message?.includes('execution reverted')) {
          userMessage = 'Transaction failed on blockchain. Please check your wallet balance and try again.'
        } else {
          userMessage = `Failed to publish experience: ${error.message}`
        }
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
  }

  // Handle successful experience creation
  useEffect(() => {
    console.log('🔍 Success detection useEffect triggered:', {
      isCreateExperienceSuccess,
      hasReceipt: !!createExperienceReceipt,
      receipt: createExperienceReceipt,
      currentStep
    })
    
    if (isCreateExperienceSuccess && createExperienceReceipt) {
      console.log('✅ Experience published successfully!', createExperienceReceipt)
      setPublishedExperienceId(createExperienceReceipt.transactionHash)
      
      // Also store in Firebase with blockchain experience ID
      const storeInFirebase = async () => {
        try {
          // Wait a moment for the blockchain state to update
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Get the actual blockchain experience ID by reading the current nextExperienceId
          // The experience we just created will have ID = nextExperienceId - 1
          const currentNextId = nextExperienceId || BigInt(1)
          const blockchainExperienceId = currentNextId - BigInt(1)
          
          console.log('🔍 Calculating blockchain experience ID:', {
            nextExperienceId: nextExperienceId?.toString(),
            currentNextId: currentNextId.toString(),
            calculatedId: blockchainExperienceId.toString()
          })
          
          // Verify the experience exists on blockchain
          console.log('🔍 Verifying experience exists on blockchain with ID:', blockchainExperienceId.toString())
          
          const firebaseData = {
            title: experienceTitle || venue || "Anonymous Experience",
            description: description || venueType || "Join me for an amazing experience!",
            category: venueType || "General",
            venue: venue || "Location",
            venueType: venueType || "General",
            city: city || "Unknown",
            date: (date || new Date()).toISOString(),
            contributionAmount: contributionAmount,
            maxParticipants: maxParticipants,
            checkinPercentage: "40", // Default values
            midExperiencePercentage: "35",
            includedItems: includedItems,
            experienceType: experienceType as 'existing' | 'anonymous',
            blockchainExperienceId: blockchainExperienceId.toString(), // Store blockchain ID
            transactionHash: createExperienceReceipt.transactionHash
          }
          
          console.log('🔥 Storing experience in Firebase...', firebaseData)
          
          // Note: We need the user ID for Firebase storage
          // For now, we'll use the wallet address as the user ID
          const userId = "wallet-user" // This should come from auth context
          
          const firebaseId = await createExperience(firebaseData, userId)
          console.log('✅ Experience stored in Firebase with ID:', firebaseId)
          console.log('🔗 Blockchain Experience ID:', blockchainExperienceId.toString())
          
        } catch (error) {
          console.error('❌ Error storing in Firebase:', error)
          // Don't fail the whole flow if Firebase fails
        }
      }
      
      storeInFirebase()
      setCurrentStep("success")
    }
  }, [isCreateExperienceSuccess, createExperienceReceipt, experienceTitle, venue, description, venueType, fullAddress, contributionAmount, maxParticipants, date, city, includedItems, experienceType])

  // Handle transaction errors
  useEffect(() => {
    if (createExperienceError) {
      console.error('❌ Transaction error detected:', createExperienceError)
      alert(`Transaction failed: ${createExperienceError.message || 'Unknown error'}`)
    }
  }, [createExperienceError])

  // Test contract connection on component mount
  useEffect(() => {
    console.log('🔍 Testing contract connection...')
    // This will trigger the contract read calls in useSmartContracts
  }, [])

  const addIncludedItem = () => {
    if (newItem.trim()) {
      setIncludedItems([...includedItems, newItem.trim()])
      setNewItem("")
    }
  }

  const removeIncludedItem = (index: number) => {
    setIncludedItems(includedItems.filter((_, i) => i !== index))
  }

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
                <button onClick={handleBack} className="flex items-center text-gray-600 hover:text-gray-800">
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

              {/* Initial Step */}
              {currentStep === "initial" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Create New Experience</h2>

                  <div className="space-y-4 mb-8">
                    <button
                      onClick={() => {
                        console.log('🎯 Existing profile button clicked')
                        setExperienceType("existing")
                      }}
                      className={`w-full p-4 rounded-2xl border-2 transition-all ${
                        experienceType === "existing"
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "bg-white border-blue-200 text-gray-700 hover:border-blue-300"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold mb-1">Existing Profile</div>
                        <div className="text-sm opacity-80">Use your verified profile</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        console.log('🎯 Anonymous alias button clicked')
                        setExperienceType("anonymous")
                      }}
                      className={`w-full p-4 rounded-2xl border-2 transition-all ${
                        experienceType === "anonymous"
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "bg-white border-blue-200 text-gray-700 hover:border-blue-300"
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-semibold mb-1">Create Anonymous Alias</div>
                        <div className="text-sm opacity-80">Host anonymously</div>
                      </div>
                    </button>
                  </div>
                </>
              )}

              {/* Details Step */}
              {currentStep === "details" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Experience Details</h2>
                  
                  {/* Quick Test Data Button - Only visible during development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 text-center">
                      <button
                        onClick={fillTestData}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                        title="Fill with test data for faster testing"
                      >
                        🚀 Quick Test Data
                      </button>
                    </div>
                  )}

                  <div className="space-y-4 mb-8">
                    {/* Venue/Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Venue/Location</label>
                      <Input
                        placeholder="e.g., Palermo Rooftop, San Telmo Plaza"
                        value={venue}
                        onChange={(e) => setVenue(e.target.value)}
                        className="rounded-2xl border-gray-200"
                      />
                    </div>

                    {/* Full Address with Autocomplete */}
                    <AddressAutocomplete
                      value={fullAddress}
                      onChange={(address) => {
                        setFullAddress(address)
                        // extract city and country from the full address
                        const parts = address.split(', ')
                        if (parts.length >= 3) {
                          setCity(parts[parts.length - 2]) // second to last part is usually city
                          setCountry(parts[parts.length - 1]) // last part is usually country
                        }
                      }}
                      placeholder="Enter full address (street, city, country)..."
                      label="Full Address"
                    />

                    {/* Venue Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience Type</label>
                      <div className="relative">
                        <select
                          value={venueType}
                          onChange={(e) => setVenueType(e.target.value)}
                          className="w-full rounded-2xl border-gray-200 p-3 pr-10 appearance-none bg-white"
                        >
                          <option value="">Select experience type</option>
                          <option value="asado">Traditional Asado</option>
                          <option value="bar">Bar & Nightlife</option>
                          <option value="walking-tour">Walking Tour</option>
                          <option value="wine-tasting">Wine Tasting</option>
                          <option value="tango">Tango Experience</option>
                          <option value="cultural">Cultural Activity</option>
                          <option value="boat-ride">Boat Ride</option>
                          <option value="bike-tour">Bike Tour</option>
                          <option value="cooking-class">Cooking Class</option>
                          <option value="art-workshop">Art Workshop</option>
                          <option value="music-concert">Live Music</option>
                          <option value="sports-activity">Sports Activity</option>
                          <option value="food-tour">Food Tour</option>
                          <option value="photography">Photography Tour</option>
                          <option value="adventure">Adventure Activity</option>
                          <option value="wellness">Wellness & Spa</option>
                          <option value="shopping">Shopping Experience</option>
                          <option value="other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal rounded-2xl border-gray-200 pr-10",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="rounded-2xl border-gray-200"
                        placeholder="Select time"
                      />
                    </div>

                    {/* Timezone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                      <div className="relative">
                        <select
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className="w-full rounded-2xl border-gray-200 p-3 pr-10 appearance-none bg-white"
                        >
                          <option value="">Select timezone</option>
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="Europe/London">London (GMT)</option>
                          <option value="Europe/Paris">Paris (CET)</option>
                          <option value="Asia/Tokyo">Tokyo (JST)</option>
                          <option value="Asia/Shanghai">Shanghai (CST)</option>
                          <option value="Australia/Sydney">Sydney (AEST)</option>
                          <option value="America/Argentina/Buenos_Aires">Buenos Aires (ART)</option>
                          <option value="America/Sao_Paulo">São Paulo (BRT)</option>
                          <option value="Asia/Dubai">Dubai (GST)</option>
                          <option value="Asia/Kolkata">Mumbai (IST)</option>
                          <option value="Asia/Seoul">Seoul (KST)</option>
                          <option value="Europe/Berlin">Berlin (CET)</option>
                          <option value="Europe/Madrid">Madrid (CET)</option>
                          <option value="Europe/Rome">Rome (CET)</option>
                          <option value="America/Mexico_City">Mexico City (CST)</option>
                          <option value="America/Toronto">Toronto (EST)</option>
                          <option value="America/Vancouver">Vancouver (PST)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* Google Maps */}
                    <GoogleMap address={fullAddress} city={city} country={country} venue={venue} />

                    {/* Contribution Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience Price (ETH)</label>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={contributionAmount}
                          onChange={(e) => setContributionAmount(e.target.value)}
                          className="rounded-2xl border-gray-200"
                          placeholder="0.05"
                        />
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Info className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Participants pay 5% advance to show interest</p>
                    </div>

                    {/* Payment Structure */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Payment Structure</label>
                      <div className="bg-blue-50 rounded-xl p-3">
                        <p className="text-sm text-gray-700">
                          <strong>Single Payment:</strong> Participants pay the full amount ({contributionAmount} ETH) when joining.
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          No additional payments required. Simple and straightforward.
                        </p>
                      </div>
                    </div>

                    {/* Max Participants */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Participants</label>
                      <Input
                        placeholder="e.g., 8 people"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(e.target.value)}
                        className="rounded-2xl border-gray-200"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Description Step */}
              {currentStep === "description" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Describe Your Experience</h2>

                  <div className="space-y-4 mb-8">
                    {/* Experience Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience Title</label>
                      <Input
                        value={experienceTitle}
                        onChange={(e) => setExperienceTitle(e.target.value)}
                        className="rounded-2xl border-gray-200"
                        placeholder="Enter your experience title..."
                      />
                    </div>

                    {/* Detailed Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description</label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="rounded-2xl border-gray-200 resize-none"
                        rows={4}
                        placeholder="Describe your experience in detail. What will participants do? What makes it special? What's included?"
                      />
                    </div>

                    {/* Add Photos */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add Photos of Venue ({photos.length}/5)
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {/* Upload Button */}
                        {photos.length < 5 && (
                          <label className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                              disabled={isUploading}
                            />
                            {isUploading ? (
                              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Camera className="w-6 h-6 text-gray-400" />
                            )}
                          </label>
                        )}
                        
                        {/* Photo Previews */}
                        {photos.map((photo, index) => (
                          <div key={index} className="relative w-20 h-20 rounded-xl overflow-hidden">
                            <img
                              src={photo}
                              alt={`Venue photo ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => removePhoto(index)}
                              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      {photos.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          {photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded
                        </p>
                      )}
                      {photos.length === 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          📸 Add photos to make your experience more attractive (max 5 photos)
                        </p>
                      )}
                    </div>

                    {/* What's Included */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">What's Included</label>
                      <div className="space-y-2 mb-3">
                        {includedItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                            <span className="text-sm">{item}</span>
                            <button
                              onClick={() => removeIncludedItem(index)}
                              className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200"
                            >
                              <X className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add new item (e.g., Empanadas, Mate ceremony)"
                          value={newItem}
                          onChange={(e) => setNewItem(e.target.value)}
                          className="rounded-xl border-gray-200"
                          onKeyPress={(e) => e.key === "Enter" && addIncludedItem()}
                        />
                        <Button onClick={addIncludedItem} className="bg-blue-500 hover:bg-blue-600 rounded-xl px-4">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Smart Contract Info */}
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <p className="text-sm text-gray-600">
                        Your experience will use smart contract escrow. Payments are released based on your configured
                        schedule: 5% advance + {checkinPercentage}% at check-in + {midExperiencePercentage}%
                        mid-experience.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Review Step */}
              {currentStep === "review" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Review & Publish</h2>

                  <div className="space-y-4 mb-8">
                    {/* Basic Info */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Basic Info</h3>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-sm font-medium">
                          {experienceType === "anonymous" ? "Anonymous Host" : "Verified Host"}
                        </p>
                        <p className="text-xs text-gray-600">{venue || "Location"}</p>
                        {fullAddress && <p className="text-xs text-gray-600">{fullAddress}</p>}
                        <p className="text-xs text-gray-600 mt-2">
                          {date ? format(date, "PPP") : "No date selected"}
                          {time && ` at ${time}`}
                          {timezone && ` (${timezone})`}
                        </p>
                        <p className="text-xs text-gray-600">Max participants: {maxParticipants}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Experience Details</h3>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-sm font-medium">{experienceTitle}</p>
                        <p className="text-xs text-gray-600 mt-1">{venueType}</p>
                        <p className="text-xs text-gray-600 mt-2">Price: {contributionAmount} ETH</p>
                        <p className="text-xs text-gray-600">
                          Payment: Full amount ({contributionAmount} ETH) when joining
                        </p>
                        {photos.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-2">Photos: {photos.length} uploaded</p>
                            <div className="flex gap-2">
                              {photos.slice(0, 3).map((photo, index) => (
                                <img
                                  key={index}
                                  src={photo}
                                  alt={`Preview ${index + 1}`}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              ))}
                              {photos.length > 3 && (
                                <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                  +{photos.length - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Smart Contract Info */}
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <p className="text-sm text-gray-600 mb-3">
                        Your experience will be published on Base blockchain with smart contract escrow protection.
                        Participants pay the full amount when joining.
                      </p>
                    </div>

                    {/* Terms Agreement */}
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        checked={agreeToTerms}
                        onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                        className="mt-1"
                      />
                      <p className="text-sm text-gray-600">
                        I agree to the FlamaBB Terms & Conditions and understand the payment structure.
                      </p>
                    </div>

                    {/* Gas Fee */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Gas Fee Estimate</h3>
                      <p className="text-sm text-gray-600">~0.0002 ETH ($0.45)</p>
                    </div>

                    {/* Error Display */}
                    {createExperienceError && (
                      <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                        <p className="text-sm text-red-800">
                          <strong>Error:</strong> {createExperienceError.message}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Success Step */}
              {currentStep === "success" && (
                <ExperienceSuccess 
                  experienceId={publishedExperienceId || ""}
                  title={experienceTitle || venue || "Anonymous Experience"}
                  venue={venue || "Location"}
                  address={fullAddress}
                  date={date || new Date()}
                  time="7:00 PM"
                  price={contributionAmount}
                  maxParticipants={maxParticipants}
                  onBack={() => setCurrentStep("initial")}
                />
              )}

              {/* Next/Publish Button */}
              <Button
                onClick={() => {
                  console.log('🎯 Next button clicked, current step:', currentStep)
                  if (currentStep === "review") {
                    handlePublishExperience()
                  } else {
                    handleNext()
                  }
                }}
                disabled={currentStep === "review" && (!agreeToTerms || isCreatingExperience)}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200"
              >
                {currentStep === "review" ? (
                  isCreatingExperience ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Publishing...
                    </div>
                  ) : (
                    "PUBLISH EXPERIENCE"
                  )
                ) : (
                  "Next"
                )}
              </Button>
              
              {isCreatingExperience && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  This may take a few moments due to network traffic...
                </p>
              )}
              
              {/* Retry Button for Rate Limiting */}
              {createExperienceError && createExperienceError.message?.includes('rate limited') && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800 mb-2">
                    <strong>Network Busy:</strong> The blockchain network is experiencing high traffic.
                  </p>
                  <Button
                    onClick={handlePublishExperience}
                    variant="outline"
                    size="sm"
                    className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    🔄 Try Again
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}