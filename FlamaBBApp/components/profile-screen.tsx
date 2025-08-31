"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, X, Instagram as InstagramIcon, Github, Loader2, Upload, Camera } from "lucide-react"
import { useAccount } from "wagmi"
import { Web3Reputation } from "@/components/web3-reputation"
import { getProfileByWallet, updateProfileByWallet } from "@/lib/firebase-auth"
import { storage } from "@/lib/firebase-config"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { toast } from "sonner"

interface ProfileScreenProps {
  onBack: () => void
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(0)
  const [displayName, setDisplayName] = useState("")
  const [bio, setBio] = useState("")
  const [shareProfilePublicly, setShareProfilePublicly] = useState(true)
  const [privacySettings, setPrivacySettings] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  
  // File input ref for avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Get wallet address for reputation data
  const { address } = useAccount()

  // Load current user profile on component mount
  useEffect(() => {
    async function loadProfile() {
      if (!address) {
        setIsLoading(false)
        return
      }
      
      try {
        console.log('🔍 Loading user profile for wallet:', address)
        const profile = await getProfileByWallet(address)
        
        if (profile) {
          console.log('👤 Profile loaded:', profile)
          console.log('📝 Loaded bio:', profile.bio)
          console.log('📝 Loaded displayName:', profile.displayName)
          setDisplayName(profile.displayName || "")
          setBio(profile.bio || "")
          setShareProfilePublicly(profile.shareProfilePublicly ?? true)
          setPrivacySettings(profile.privacySettings ?? true)
          
          // Handle avatar - either custom uploaded image or emoji
          if (profile.avatarUrl) {
            // Custom uploaded avatar
            setCustomAvatarUrl(profile.avatarUrl)
            setSelectedAvatar(0) // Reset to first emoji as fallback
          } else if (profile.avatar) {
            // Emoji avatar
            const avatarIndex = avatars.findIndex(a => a.icon === profile.avatar)
            if (avatarIndex !== -1) {
              setSelectedAvatar(avatarIndex)
            }
            setCustomAvatarUrl(null)
          }
        } else {
          console.log('📝 No existing profile found, using defaults')
          setDisplayName(`Anonymous ${address.slice(0, 6)}...${address.slice(-4)}`)
        }
      } catch (error) {
        console.error('❌ Error loading profile:', error)
        toast.error('Failed to load profile')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [address])

  // Handle avatar image upload
  async function handleAvatarUpload(file: File) {
    if (!address) {
      toast.error('No wallet connected')
      return
    }

    setIsUploadingAvatar(true)
    try {
      console.log('📸 Uploading avatar image...')
      
      // Validate file
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast.error('Image must be smaller than 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }

      // Create unique filename with wallet address
      const fileExtension = file.name.split('.').pop()
      const fileName = `avatar_${address.toLowerCase()}_${Date.now()}.${fileExtension}`
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `avatars/${fileName}`)
      const snapshot = await uploadBytes(storageRef, file)
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref)
      
      console.log('✅ Avatar uploaded successfully:', downloadURL)
      
      // Update local state
      setCustomAvatarUrl(downloadURL)
      
      toast.success('Avatar uploaded successfully!')
      
    } catch (error) {
      console.error('❌ Error uploading avatar:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Handle file input change
  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      handleAvatarUpload(file)
    }
  }

  // Save profile changes to Firebase
  async function handleSaveProfile() {
    if (!address) {
      toast.error('No wallet connected')
      return
    }

    setIsSaving(true)
    try {
      console.log('💾 Saving profile updates...')
      console.log('📝 Current bio value:', bio)
      console.log('📝 Bio length:', bio.length)
      
      const profileUpdates = {
        displayName,
        bio,
        avatar: customAvatarUrl ? null : avatars[selectedAvatar].icon,
        avatarUrl: customAvatarUrl,
        shareProfilePublicly,
        privacySettings,
        email: `${address.toLowerCase()}@wallet.flamabb.local`
      }
      
      console.log('📋 Profile updates object:', profileUpdates)

      const result = await updateProfileByWallet(address, profileUpdates)
      
      if (result.error) {
        throw result.error
      }
      
      console.log('✅ Profile updated successfully')
      
      // Verify what was actually saved by re-reading from Firebase
      console.log('🔍 Verifying saved data...')
      
      // Add small delay to ensure Firebase write is complete
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const savedProfile = await getProfileByWallet(address)
      console.log('📋 Profile after save:', savedProfile)
      console.log('📝 Bio after save:', savedProfile?.bio)
      console.log('📝 DisplayName after save:', savedProfile?.displayName)
      
      // Update local state to match what was actually saved
      if (savedProfile) {
        setDisplayName(savedProfile.displayName || "")
        setBio(savedProfile.bio || "")
        console.log('🔄 Local state updated with saved values')
      }
      
      toast.success('Profile updated successfully!')
      
    } catch (error) {
      console.error('❌ Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

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

              <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                {isLoading ? "Loading Profile..." : "Edit Your Profile"}
              </h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <>
              {/* Avatar Selection */}
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <div
                    className={`w-20 h-20 ${customAvatarUrl ? 'bg-gray-100' : `bg-gradient-to-br ${avatars[selectedAvatar].gradient}`} rounded-full flex items-center justify-center shadow-lg overflow-hidden`}
                  >
                    {customAvatarUrl ? (
                      <img
                        src={customAvatarUrl}
                        alt="Custom avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">{avatars[selectedAvatar].icon}</span>
                    )}
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    className="text-blue-600 border-blue-200 hover:bg-blue-50 bg-transparent"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Uploading...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Camera className="w-4 h-4 mr-2" />
                        Choose Avatar
                      </div>
                    )}
                  </Button>
                  
                  {customAvatarUrl && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="ml-2 text-gray-500 hover:text-gray-700"
                      onClick={() => setCustomAvatarUrl(null)}
                    >
                      Use Emoji
                    </Button>
                  )}
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

              {/* Web3 Reputation Section */}
              {address && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Your Web3 Reputation</label>
                  <Web3Reputation 
                    walletAddress={address} 
                    showDetailed={true}
                    className=""
                  />
                </div>
              )}

              {/* Social Links */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Link Socials (Optional)</label>
                <div className="flex justify-center space-x-4">
                  <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <InstagramIcon className="w-5 h-5 text-gray-600" />
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

              {/* Restart Wizard Button */}
              <Button 
                variant="outline" 
                className="w-full mb-4 border-blue-200 text-blue-600 hover:bg-blue-50 py-3 rounded-2xl transition-all duration-200"
                onClick={() => {
                  window.location.href = "/"
                }}
              >
                Restart Onboarding Wizard
              </Button>

              {/* Save Button */}
              <Button 
                onClick={handleSaveProfile}
                disabled={isSaving || isLoading || !displayName.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving Profile...
                  </div>
                ) : (
                  "Save Profile"
                )}
              </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
