"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Twitter, Instagram, Github } from "lucide-react"

interface ProfileScreenProps {
  onBack: () => void
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [displayName, setDisplayName] = useState("FlamaFan22")
  const [bio, setBio] = useState("")
  const [shareProfilePublicly, setShareProfilePublicly] = useState(true)
  const [privacySettings, setPrivacySettings] = useState(true)

  const avatars = [
    { id: 0, gradient: "from-blue-400 to-blue-600", icon: "🔥" },
    { id: 1, gradient: "from-purple-400 to-purple-600", icon: "🌟" },
    { id: 2, gradient: "from-green-400 to-green-600", icon: "🌿" },
    { id: 3, gradient: "from-orange-400 to-orange-600", icon: "⚡" },
  ]

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
                  <span className="underline">Back</span>
                </button>
              </div>

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

              {/* Save Button */}
              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200">
                Save Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
