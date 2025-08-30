"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Dashboard } from "@/components/dashboard"

type OnboardingStep = "cities" | "interests" | "budget" | "profile" | "complete"

const cities = [
  { name: "Paris", icon: "🏛️", selected: true },
  { name: "York", icon: "🏰", selected: false },
  { name: "Tokyo", icon: "🏯", selected: true },
  { name: "London", icon: "🏛️", selected: false },
  { name: "Singapore", icon: "🏢", selected: true },
  { name: "Dubai", icon: "🕌", selected: true },
  { name: "Sydney", icon: "🏛️", selected: true },
]

const interests = [
  { name: "Restaurants", icon: Utensils, selected: false },
  { name: "Bars", icon: Coffee, selected: false },
  { name: "Tokyo", icon: Building, selected: true },
  { name: "Cultural", icon: Palette, selected: true },
  { name: "Cafés", icon: Coffee, selected: true },
  { name: "Attractions", icon: Building, selected: true },
  { name: "Sydney", icon: Mountain, selected: false },
  { name: "Outdoor Activities", icon: Mountain, selected: true },
  { name: "Shopping & Retail", icon: ShoppingBag, selected: true },
]

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("cities")
  const [selectedCities, setSelectedCities] = useState(cities)
  const [selectedInterests, setSelectedInterests] = useState(interests)
  const [budgetAmount, setBudgetAmount] = useState(0.5)
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [shareProfilePublicly, setShareProfilePublicly] = useState(true)
  const [privacySettings, setPrivacySettings] = useState(true)

  const stepNumber = {
    cities: 3,
    interests: 4,
    budget: 5,
    profile: 6,
    complete: 6,
  }[currentStep]

  const handleBack = () => {
    const steps: OnboardingStep[] = ["cities", "interests", "budget", "profile", "complete"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const handleNext = () => {
    const steps: OnboardingStep[] = ["cities", "interests", "budget", "profile", "complete"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
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
            {currentStep !== "profile" && <button className="text-gray-600 underline text-sm">Skip for now</button>}
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

              <div className="grid grid-cols-3 gap-3 mb-8">
                {selectedCities.map((city, index) => (
                  <button
                    key={city.name}
                    onClick={() => toggleCitySelection(index)}
                    className={`p-4 rounded-2xl border-2 transition-all ${
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
                  <Input placeholder="Search for cities..." className="pl-10 py-3 rounded-2xl border-gray-200" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                {selectedInterests.map((interest, index) => {
                  const IconComponent = interest.icon
                  return (
                    <button
                      key={interest.name}
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
            </>
          )}

          {/* Budget Step */}
          {currentStep === "budget" && (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center text-balance">
                How much would to like like to set aside for experiences?
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
                {[0.1, 0.25, 1, 1].map((amount, index) => (
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

              {/* Privacy Notice */}
              <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-600 text-center">
                  Your privacy is paramount. You always remain anonymous.
                </p>
              </div>
            </>
          )}

          {/* Next/Save Button */}
          <Button
            onClick={handleNext}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200"
          >
            {currentStep === "profile" ? "Save Profile" : "Next"}
          </Button>
        </div>

        {/* Step indicator */}
        <div className="flex justify-center mt-6 space-x-2">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full ${step <= stepNumber ? "bg-blue-500" : "bg-white/50"}`}
            ></div>
          ))}
        </div>

        <div className="text-center mt-4">
          <span className="text-white/80 text-sm">Step {stepNumber} of 6</span>
        </div>
      </div>
    </div>
  )
}
