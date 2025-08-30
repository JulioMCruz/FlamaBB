"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, TrendingUp, ArrowDown, ArrowUp } from "lucide-react"

interface WalletScreenProps {
  onBack: () => void
}

export function WalletScreen({ onBack }: WalletScreenProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("3")
  const [depositAmount, setDepositAmount] = useState("1.0")
  const [showDepositModal, setShowDepositModal] = useState(false)

  if (showDepositModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
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
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setShowDepositModal(false)}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <ArrowLeft className="w-5 h-5 mr-1" />
                  </button>
                  <h1 className="text-xl font-semibold text-gray-800">Deposit to Pool</h1>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🔥</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Amount</label>
                    <div className="relative">
                      <Input
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        className="rounded-2xl border-gray-200 pr-16 text-lg font-semibold"
                        placeholder="0.0"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                        <span className="text-blue-500">🔥</span>
                        <span className="text-sm font-medium text-gray-600">ETH</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      ≈ ${(Number.parseFloat(depositAmount) * 1800).toFixed(2)} USD
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Lock Period</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedTimeframe("3")}
                        className={`flex-1 py-3 px-4 rounded-2xl border-2 transition-all ${
                          selectedTimeframe === "3"
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-white border-blue-200 text-blue-600"
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold">3</div>
                          <div className="text-xs">Months</div>
                        </div>
                      </button>
                      <button
                        onClick={() => setSelectedTimeframe("6")}
                        className={`flex-1 py-3 px-4 rounded-2xl border-2 transition-all ${
                          selectedTimeframe === "6"
                            ? "bg-blue-500 border-blue-500 text-white"
                            : "bg-white border-blue-200 text-blue-600"
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-semibold">6</div>
                          <div className="text-xs">Months</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Interest Rate:</span>
                      <span className="text-sm font-semibold text-blue-600">4.5% APR</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Estimated Earnings:</span>
                      <span className="text-sm font-medium text-gray-800">
                        {(Number.parseFloat(depositAmount) * 0.045 * (Number.parseInt(selectedTimeframe) / 12)).toFixed(
                          4,
                        )}{" "}
                        ETH
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total After {selectedTimeframe} months:</span>
                      <span className="text-sm font-semibold text-green-600">
                        {(
                          Number.parseFloat(depositAmount) *
                          (1 + 0.045 * (Number.parseInt(selectedTimeframe) / 12))
                        ).toFixed(4)}{" "}
                        ETH
                      </span>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-2xl p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Funds will be locked for the selected period. Early withdrawal may incur
                      penalties.
                    </p>
                  </div>

                  <Button
                    onClick={() => setShowDepositModal(false)}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg"
                  >
                    Confirm Deposit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
        <div className="flex-1 p-4">
          <div className="max-w-sm mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-800">
                  <ArrowLeft className="w-5 h-5 mr-1" />
                </button>
                <h1 className="text-xl font-semibold text-gray-800">Savings Pool</h1>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">🔥</span>
                </div>
              </div>

              {/* Current Balance */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-gray-700 mb-2">Current Balance</h2>
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-3xl font-bold text-gray-800">2.5 ETH</span>
                  <span className="text-blue-500">🔥</span>
                </div>
                <p className="text-gray-600 text-sm">$4,500 USC</p>
                <div className="mt-4 text-sm text-gray-600">
                  <p>Savings Growth (with interest)</p>
                  <p>Estimated Earnings: 0.15 ETH (6 months)</p>
                </div>

                {/* Enhanced Chart */}
                <div className="mt-4 h-32 bg-gray-50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 300 120">
                    {/* Grid lines */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />

                    {/* Growth curve */}
                    <path
                      d="M20 100 Q50 85 80 80 T140 65 T200 45 T260 35"
                      stroke="#3B82F6"
                      strokeWidth="3"
                      fill="none"
                    />

                    {/* Data points */}
                    <circle cx="80" cy="80" r="3" fill="#3B82F6" />
                    <circle cx="140" cy="65" r="3" fill="#3B82F6" />
                    <circle cx="200" cy="45" r="3" fill="#3B82F6" />
                    <circle cx="260" cy="35" r="4" fill="#3B82F6" />

                    {/* Gradient fill under curve */}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    <path d="M20 100 Q50 85 80 80 T140 65 T200 45 T260 35 L260 120 L20 120 Z" fill="url(#gradient)" />
                  </svg>

                  {/* Decorative droplets */}
                  <div className="absolute top-4 right-8 text-blue-400 animate-pulse">💧</div>
                  <div className="absolute top-8 left-12 text-blue-300 animate-pulse delay-150">💧</div>
                  <div className="absolute bottom-6 right-16 text-blue-400 animate-pulse delay-300">💧</div>
                </div>
              </div>

              {/* Boost Your Savings */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Boost Your Savings</h3>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">🔥</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Powered by Mropool:</p>
                    <p className="text-xs text-gray-600">Earn auto-compounding interest</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Deposit Amount</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-blue-500">🔥</span>
                    <span className="text-lg font-semibold">1.0 ETH</span>
                  </div>

                  <div className="flex space-x-2 mb-4">
                    <button
                      onClick={() => setSelectedTimeframe("3")}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedTimeframe === "3"
                          ? "bg-blue-500 text-white"
                          : "bg-white border border-blue-200 text-blue-600"
                      }`}
                    >
                      3 Months
                    </button>
                    <button
                      onClick={() => setSelectedTimeframe("6")}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedTimeframe === "6"
                          ? "bg-blue-500 text-white"
                          : "bg-white border border-blue-200 text-blue-600"
                      }`}
                    >
                      6 Months
                    </button>
                  </div>

                  <p className="text-sm text-gray-600">Interest Rate: 4.5% APR (based lock)</p>
                </div>
              </div>

              {/* Withdraw Funds */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Withdraw Funds</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-medium text-green-600">0.5 ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Locked:</span>
                    <span className="font-medium text-orange-600">2.0 ETH (until 2024-12-31)</span>
                  </div>
                </div>

                <Button
                  onClick={() => setShowDepositModal(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-2xl"
                >
                  Deposit Now
                </Button>
              </div>

              {/* Transaction History */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <ArrowDown className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Deposit +1 ETH</p>
                        <p className="text-xs text-gray-500">(2024-07/01)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">+1.0 ETH</p>
                      <ArrowDown className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Interest Earned</p>
                        <p className="text-xs text-gray-500">(2024-07/15)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600">+0.02 ETH</p>
                      <ArrowDown className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <ArrowUp className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Experience Payment</p>
                        <p className="text-xs text-gray-500">(2024-07/10)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-orange-600">-0.05 ETH</p>
                      <ArrowDown className="w-4 h-4 text-gray-400 ml-auto" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Manage Savings Button */}
              <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg">
                Manage Savings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
