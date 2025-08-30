"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, MapPin, Clock, Users, Heart, Timer } from "lucide-react"

interface Experience {
  id: number
  title: string
  location: string
  price: string
  duration: string
  participants: string
  rating: number
  image: string
  description: string
  host: string
  included: string[]
  flamitas: number
  checkinPercentage: number
  midExperiencePercentage: number
}

interface ExperienceBookingProps {
  experience: Experience
  onBack: () => void
  onComplete: () => void
}

type BookingStep = "details" | "interest" | "join" | "checkin" | "midexperience" | "complete" | "review"

export function ExperienceBooking({ experience, onBack, onComplete }: ExperienceBookingProps) {
  const [currentStep, setCurrentStep] = useState<BookingStep>("details")
  const [nickname, setNickname] = useState("")
  const [completedItems, setCompletedItems] = useState<boolean[]>(experience.included.map(() => false))
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [isInterested, setIsInterested] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState("02:45:17")

  const handleShowInterest = () => {
    setIsInterested(true)
    setCurrentStep("interest")
  }

  const handleJoinExperience = () => {
    setCurrentStep("join")
  }

  const handleConfirmJoin = () => {
    setCurrentStep("checkin")
  }

  const handleCheckin = () => {
    setCurrentStep("midexperience")
  }

  const handleMidExperience = () => {
    setCurrentStep("complete")
  }

  const handleCompleteExperience = () => {
    setCurrentStep("review")
  }

  const handleSubmitReview = () => {
    onComplete()
  }

  const toggleCompletedItem = (index: number) => {
    const updated = [...completedItems]
    updated[index] = !updated[index]
    setCompletedItems(updated)
  }

  const experiencePrice = Number.parseFloat(experience.price.replace(" ETH", ""))
  const advancePayment = experiencePrice * 0.05
  const checkinPayment = experiencePrice * (experience.checkinPercentage / 100)
  const midExperiencePayment = experiencePrice * (experience.midExperiencePercentage / 100)

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
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔥</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">FlamaBB</span>
                </div>
                <div className="w-6"></div>
              </div>

              {/* Experience Details Step */}
              {currentStep === "details" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Experience Details</h2>

                  <div className="mb-6">
                    <img
                      src={experience.image || "/placeholder.svg"}
                      alt={experience.title}
                      className="w-full h-32 rounded-2xl object-cover mb-4"
                    />

                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{experience.title}</h3>

                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">Buenos Aires, Argentina</span>
                      <span className="ml-auto text-lg font-semibold text-blue-600">{experience.price}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{experience.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{experience.participants}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-red-500 mr-1">🔥</span>
                        <span>{experience.flamitas} flamitas</span>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-4">{experience.description}</p>

                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">What's Included:</h4>
                      <ul className="space-y-1">
                        {experience.included.map((item, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-sm text-gray-600 mb-6">
                      <span className="font-medium">Host:</span> {experience.host}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleShowInterest}
                      variant="outline"
                      className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 font-semibold py-4 rounded-2xl bg-transparent"
                    >
                      <Heart className="w-5 h-5 mr-2" />
                      Show Interest (Free)
                    </Button>

                    <Button
                      onClick={handleJoinExperience}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg"
                    >
                      Join Experience (5% advance)
                    </Button>
                  </div>
                </>
              )}

              {currentStep === "interest" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Interest Registered!</h2>

                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-10 h-10 text-red-500 fill-current" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{experience.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      You've shown interest in this experience! You'll be notified of updates.
                    </p>

                    <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                      <p className="text-sm text-gray-600">
                        <strong>Ready to join?</strong> Pay 5% advance ({advancePayment.toFixed(3)} ETH) to secure your
                        spot.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={handleJoinExperience}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg"
                    >
                      Join Experience Now
                    </Button>

                    <Button
                      onClick={onBack}
                      variant="outline"
                      className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-4 rounded-2xl bg-transparent"
                    >
                      Maybe Later
                    </Button>
                  </div>
                </>
              )}

              {/* Join Experience Step */}
              {currentStep === "join" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Join Experience</h2>

                  <div className="space-y-4 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{experience.title}</h3>
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">Buenos Aires, Argentina</span>
                        <span className="ml-auto text-lg font-semibold text-blue-600">{experience.price}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Nickname</label>
                      <Input
                        placeholder="Enter a nickname for this experience"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="rounded-2xl border-gray-200"
                      />
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-4">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Payment Structure:</strong>
                      </p>
                      <p className="text-sm text-gray-600 mb-1">• Now: 5% advance ({advancePayment.toFixed(3)} ETH)</p>
                      <p className="text-sm text-gray-600 mb-1">
                        • Check-in: {experience.checkinPercentage}% ({checkinPayment.toFixed(3)} ETH)
                      </p>
                      <p className="text-sm text-gray-600">
                        • Mid-experience: {experience.midExperiencePercentage}% ({midExperiencePayment.toFixed(3)} ETH)
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleConfirmJoin}
                    disabled={!nickname.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg disabled:opacity-50"
                  >
                    Pay {advancePayment.toFixed(3)} ETH & Join
                  </Button>
                </>
              )}

              {currentStep === "checkin" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Experience starts in</h2>
                  <div className="text-4xl font-bold text-center text-blue-600 mb-2">{timeRemaining}</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Confirm Participation</h3>

                  <div className="space-y-4 mb-8">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">{experience.title}</h4>
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">Buenos Aires, Argentina</span>
                        <span className="ml-auto text-lg font-semibold text-blue-600">{experience.price}</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                      <p className="text-sm text-gray-600">
                        Confirming participation will transfer {experience.checkinPercentage}% (
                        {checkinPayment.toFixed(3)} ETH) of your staked funds to experience pool. This step is
                        irreversible.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Participants (14/20)</span>
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">You (Ready)</span>
                        <div className="text-blue-600 text-sm font-medium">Ready</div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckin}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg"
                  >
                    <span className="mr-2">🔥</span>
                    Confirm Participation
                  </Button>
                </>
              )}

              {currentStep === "midexperience" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Mid-Experience Payment</h2>

                  <div className="space-y-4 mb-8">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Timer className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Experience in Progress</h3>
                      <p className="text-gray-600 text-sm mb-4">Time to make the mid-experience payment</p>
                    </div>

                    <div className="bg-blue-50 rounded-2xl p-4">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Payment Required:</strong>
                      </p>
                      <p className="text-sm text-gray-600">
                        Transfer {experience.midExperiencePercentage}% ({midExperiencePayment.toFixed(3)} ETH) to
                        continue the experience.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleMidExperience}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg"
                  >
                    <span className="mr-2">🔥</span>
                    Pay {midExperiencePayment.toFixed(3)} ETH
                  </Button>
                </>
              )}

              {/* Complete Experience Step */}
              {currentStep === "complete" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Complete Experience</h2>

                  <div className="space-y-6 mb-8">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{experience.title}</h3>
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="text-sm">Buenos Aires, Argentina</span>
                        <span className="ml-auto text-lg font-semibold text-blue-600">{experience.price}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">What was included</h4>
                      <div className="space-y-2">
                        {experience.included.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <Checkbox
                              checked={completedItems[index]}
                              onCheckedChange={() => toggleCompletedItem(index)}
                            />
                            <span className={`text-sm ${completedItems[index] ? "text-gray-800" : "text-gray-500"}`}>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-2xl p-4">
                      <p className="text-sm text-gray-600">
                        🎉 Experience completed! All payments have been processed successfully.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleCompleteExperience}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 rounded-2xl shadow-lg"
                  >
                    Continue to Review
                  </Button>
                </>
              )}

              {currentStep === "review" && (
                <>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Review Experience</h2>

                  <div className="space-y-6 mb-8">
                    <div className="flex items-center space-x-4">
                      <img
                        src={experience.image || "/placeholder.svg"}
                        alt={experience.title}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800">Experience Name: "{experience.title}"</h3>
                        <p className="text-sm text-gray-600">Date: November 15, 2024</p>
                        <p className="text-sm text-gray-600">Location: Buenos Aires, Argentina</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 text-center">Your Rating</h4>
                      <div className="flex justify-center space-x-2 mb-4">
                        {[1, 2, 3, 4, 5].map((flama) => (
                          <button
                            key={flama}
                            onClick={() => setRating(flama)}
                            className={`text-3xl transition-all ${flama <= rating ? "text-red-500" : "text-gray-300"}`}
                          >
                            🔥
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Written Feedback</h4>
                      <Textarea
                        placeholder="Share details about your experience..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="rounded-2xl border-gray-200 resize-none"
                        rows={3}
                      />
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Verify Photos from Experience</h4>
                      <div className="space-y-2">
                        {experience.included.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <Checkbox
                              checked={completedItems[index]}
                              onCheckedChange={() => toggleCompletedItem(index)}
                            />
                            <span className="text-sm text-gray-600">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Review Privacy</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <input type="radio" name="privacy" className="text-blue-600" defaultChecked />
                          <span className="text-sm text-gray-600">Public (shared with community)</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="radio" name="privacy" className="text-blue-600" />
                          <span className="text-sm text-gray-600">Private (visible only to you)</span>
                        </label>
                      </div>
                    </div>

                    <div className="text-center text-sm text-gray-500">
                      Submitting this review finalizes your experience and all associated Web3 transactions.
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitReview}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg"
                  >
                    Submit Review
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
