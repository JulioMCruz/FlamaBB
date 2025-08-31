"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, Plus, Home, Compass, Settings, Wallet, User, MapPin, Info } from "lucide-react"
import { ProfileScreen } from "@/components/profile-screen"
import { WalletScreen } from "@/components/wallet-screen"
import { CreateExperienceFlow } from "@/components/create-experience-flow"
import { ExploreExperiences } from "@/components/explore-experiences"


export function Dashboard() {
  const [activeTab, setActiveTab] = useState("home")
  const [showCreateExperience, setShowCreateExperience] = useState(false)

  if (activeTab === "profile") {
    return <ProfileScreen onBack={() => setActiveTab("home")} />
  }

  if (activeTab === "wallet") {
    return <WalletScreen onBack={() => setActiveTab("home")} />
  }

  if (activeTab === "explore") {
    return <ExploreExperiences onBack={() => setActiveTab("home")} />
  }

  if (activeTab === "create" || showCreateExperience) {
    return (
      <CreateExperienceFlow
        onBack={() => {
          setActiveTab("home")
          setShowCreateExperience(false)
        }}
      />
    )
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
        {/* Main Content */}
        <div className="flex-1 p-4 pb-24">
          <div className="max-w-sm mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 text-white">
              <div>
                <h1 className="text-xl font-semibold">Welcome [FlamaFan22]</h1>
                <p className="text-sm opacity-80">5/6</p>
              </div>
            </div>



            {/* Wallet Balance Card */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center">
                    <img src="/flamabb-mascot.png" alt="FlamaBB" className="w-10 h-10" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Wallet Balance:</p>
                    <p className="text-lg font-semibold text-gray-800">0.25 ETH</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-full">
                    <div className="w-4 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                      TP
                    </div>
                    <span className="text-xs text-blue-700 font-medium">+50</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-purple-100 px-2 py-1 rounded-full">
                    <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                    <span className="text-xs text-purple-700 font-medium">+20</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cities You're Following */}
            <div className="mb-6">
              <h2 className="text-white font-semibold mb-3">Cities You're Following</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <div className="w-24 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-medium">Buenos Aires</span>
                  </div>
                  <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-blue-600" />
                  </div>
                </div>
                <div className="relative">
                  <div className="w-24 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-sm font-medium">Palermo</span>
                  </div>
                  <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <MapPin className="w-3 h-3 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Experiences Near You */}
            <div className="mb-6">
              <h2 className="text-white font-semibold mb-3">Experiences Near You</h2>
              <div className="flex space-x-3">
                <button onClick={() => setActiveTab("explore")} className="relative">
                  <div className="w-32 h-24 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                    <span className="text-white text-xs font-medium mb-1">Asado Night</span>
                    <div className="flex items-center space-x-1">
                      <img src="/flamabb-mascot.png" alt="Flamitas" className="w-3 h-3" />
                      <span className="text-xs text-white">12</span>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <Info className="w-3 h-3 text-orange-600" />
                  </div>
                </button>
                <button onClick={() => setActiveTab("explore")} className="relative">
                  <div className="w-32 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                    <span className="text-white text-xs font-medium mb-1">Palermo Bars</span>
                    <div className="flex items-center space-x-1">
                      <img src="/flamabb-mascot.png" alt="Flamitas" className="w-3 h-3" />
                      <span className="text-xs text-white">8</span>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <Info className="w-3 h-3 text-purple-600" />
                  </div>
                </button>
              </div>
            </div>

            {/* Create New Experience */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-lg">
              <button
                onClick={() => setShowCreateExperience(true)}
                className="w-full flex items-center space-x-3 text-left"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-800">Create New Experience</span>
              </button>
            </div>

            {/* Search */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <button onClick={() => setActiveTab("explore")} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search Asados, Bars, Tours in Buenos Aires..."
                    className="pl-10 py-3 rounded-xl border-gray-200 bg-white pointer-events-none"
                    readOnly
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200">
          <div className="flex justify-around py-3">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center space-y-1 px-4 py-2 ${
                activeTab === "home" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </button>
            <button
              onClick={() => setActiveTab("explore")}
              className={`flex flex-col items-center space-y-1 px-4 py-2 ${
                activeTab === "explore" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-xs">Explore</span>
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`flex flex-col items-center space-y-1 px-4 py-2 ${
                activeTab === "create" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Settings className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs">Create</span>
            </button>
            <button
              onClick={() => setActiveTab("wallet")}
              className={`relative flex flex-col items-center space-y-1 px-4 py-2 ${
                activeTab === "wallet" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <Wallet className="w-5 h-5" />
              <span className="text-xs">Wallet</span>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white">1</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center space-y-1 px-4 py-2 ${
                activeTab === "profile" ? "text-blue-600" : "text-gray-600"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
