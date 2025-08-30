"use client"

import { ConnectButton } from "@rainbow-me/rainbowkit"

export function WalletDisconnected() {
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
        <div className="bg-gradient-to-br from-white/95 via-blue-50/90 to-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl text-center border border-white/20">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img 
              src="/flamabb-mascot.png" 
              alt="FlamaBB Mascot" 
              className="w-72 h-72 rounded-full mb-4" 
            />
            <h1 className="text-3xl font-bold text-gray-800">
              Flama<span className="text-blue-500">BB</span>
            </h1>
          </div>

        </div>
      </div>
    </div>
  )
}