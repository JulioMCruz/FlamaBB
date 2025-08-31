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
import { createExperience, updateExperience, type CreateExperienceData } from "@/lib/firebase-experiences"
import { cdpWalletService, type ExperienceWallet } from "@/lib/cdp-wallet-service"
import { useAuth } from "@/contexts/auth-context"

type CreateStep = "initial" | "details" | "description" | "review"

interface CreateExperienceFlowProps {
  onBack: () => void
}

export function CreateExperienceFlow({ onBack }: CreateExperienceFlowProps) {
  const [currentStep, setCurrentStep] = useState<CreateStep>("initial")
  const [experienceType, setExperienceType] = useState<"existing" | "anonymous">("existing")
  
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
  
  // Publishing state
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  
  // Get current user
  const { user } = useAuth()

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

  const addIncludedItem = () => {
    if (newItem.trim()) {
      setIncludedItems([...includedItems, newItem.trim()])
      setNewItem("")
    }
  }

  const removeIncludedItem = (index: number) => {
    setIncludedItems(includedItems.filter((_, i) => i !== index))
  }

  const handlePublishExperience = async () => {
    if (!user) {
      setPublishError('You must be logged in to create an experience')
      return
    }

    setIsPublishing(true)
    setPublishError(null)
    
    try {
      console.log('🚀 Publishing experience...')
      
      // Prepare experience data with proper date formatting
      const formattedDate = date && time && timezone 
        ? `${format(date, "PPP")} at ${time} (${timezone})`
        : date 
          ? format(date, "PPP")
          : ""
      
      const experienceData: CreateExperienceData = {
        title: experienceTitle,
        description,
        category: venueType,
        venue,
        venueType,
        city: city || "Buenos Aires, Argentina",
        date: formattedDate,
        contributionAmount,
        maxParticipants,
        checkinPercentage,
        midExperiencePercentage,
        includedItems,
        experienceType
      }
      
      // Create experience in Firebase first to get ID
      console.log('📝 Creating experience in Firebase...')
      const experienceId = await createExperience(experienceData, user.uid)
      
      // Create CDP server wallet for the experience
      console.log('💰 Creating CDP server wallet...')
      let experienceWallet: ExperienceWallet | null = null
      
      try {
        experienceWallet = await cdpWalletService.createExperienceWallet(
          experienceId, 
          experienceTitle
        )
        
        if (experienceWallet) {
          console.log('✅ CDP wallet created:', experienceWallet.accountAddress)
          
          // Update the experience with wallet information
          await updateExperience(experienceId, {
            wallet: {
              accountAddress: experienceWallet.accountAddress,
              accountName: experienceWallet.accountName,
              network: experienceWallet.network,
              createdAt: experienceWallet.createdAt
            }
          })
        }
      } catch (walletError) {
        console.warn('⚠️ CDP wallet creation failed, but experience was created:', walletError)
        // Continue without wallet - the experience is still valid
      }
      
      console.log('🎉 Experience published successfully!')
      
      // Navigate back to dashboard
      onBack()
      
    } catch (error) {
      console.error('❌ Error publishing experience:', error)
      setPublishError('Failed to publish experience. Please try again.')
    } finally {
      setIsPublishing(false)
    }
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
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Check-in Payment (%)</label>
                          <Input
                            value={checkinPercentage}
                            onChange={(e) => setCheckinPercentage(e.target.value)}
                            className="rounded-xl border-gray-200"
                            placeholder="40"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Mid-Experience Payment (%)</label>
                          <Input
                            value={midExperiencePercentage}
                            onChange={(e) => setMidExperiencePercentage(e.target.value)}
                            className="rounded-xl border-gray-200"
                            placeholder="35"
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          Remaining: {100 - Number(checkinPercentage || 0) - Number(midExperiencePercentage || 0) - 5}%
                          (automatic completion)
                        </div>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add Photos of Venue</label>
                      <div className="flex space-x-3">
                        <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                          <Camera className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                          <Camera className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
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
                          Payment: 5% + {checkinPercentage}% + {midExperiencePercentage}%
                        </p>
                      </div>
                    </div>

                    {/* Smart Contract Info */}
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <p className="text-sm text-gray-600 mb-3">
                        Your experience will be published on Base blockchain with smart contract escrow protection.
                        Funds are released according to your payment schedule.
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
                  </div>
                </>
              )}

              {/* Error Message */}
              {publishError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{publishError}</p>
                </div>
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
                disabled={(currentStep === "review" && !agreeToTerms) || isPublishing}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isPublishing ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Publishing...
                  </div>
                ) : (
                  currentStep === "review" ? "PUBLISH EXPERIENCE" : "Next"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}