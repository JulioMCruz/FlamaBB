"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Award, Shield, ExternalLink } from "lucide-react"
import { useTalentScore } from "@/lib/talent-protocol"
import { usePoapCount } from "@/lib/poap"
import { useEnsProfile } from "@/lib/ens"
import { EnsProfileDisplay } from "@/components/ens-profile-display"

interface Web3ReputationProps {
  walletAddress?: string
  showDetailed?: boolean
  className?: string
}

export function Web3Reputation({ 
  walletAddress, 
  showDetailed = false, 
  className = "" 
}: Web3ReputationProps) {
  const { address: connectedAddress } = useAccount()
  const effectiveAddress = walletAddress || connectedAddress
  
  // API hooks
  const { score: talentScore, loading: talentLoading, error: talentError } = useTalentScore(effectiveAddress)
  const { count: poapCount, loading: poapLoading, error: poapError } = usePoapCount(effectiveAddress)
  const { profile: ensProfile, loading: ensLoading } = useEnsProfile(effectiveAddress)

  // Don't render if no address
  if (!effectiveAddress) {
    return null
  }

  // Error state
  const hasErrors = talentError || poapError

  return (
    <div className={`space-y-4 ${className}`}>
      {/* ENS Profile Display */}
      {ensProfile && (
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-700">ENS Identity</span>
              </div>
              <EnsProfileDisplay 
                address={effectiveAddress}
                showAvatar={true}
                showAddress={!ensProfile.name}
                maxNameLength={20}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reputation Scores */}
      <div className="grid grid-cols-2 gap-3">
        {/* Talent Protocol Score */}
        <Card className="border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Trophy className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Talent Score</span>
            </div>
            
            {talentLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : talentScore ? (
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="secondary" 
                  className="bg-purple-100 text-purple-700 hover:bg-purple-200"
                >
                  {talentScore.score >= 100 ? "100+" : talentScore.score.toString()}
                </Badge>
                {showDetailed && (
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                )}
              </div>
            ) : (
              <Badge variant="outline" className="text-gray-500">
                No Score
              </Badge>
            )}
            
            {talentError && showDetailed && (
              <p className="text-xs text-red-500 mt-1">Failed to load</p>
            )}
          </CardContent>
        </Card>

        {/* POAP Count */}
        <Card className="border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700">POAPs</span>
            </div>
            
            {poapLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="secondary" 
                  className="bg-green-100 text-green-700 hover:bg-green-200"
                >
                  {poapCount >= 100 ? "100+" : poapCount.toString()}
                </Badge>
                {showDetailed && poapCount > 0 && (
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                )}
              </div>
            )}
            
            {poapError && showDetailed && (
              <p className="text-xs text-red-500 mt-1">Failed to load</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed View Additional Information */}
      {showDetailed && (
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-700 mb-3">Web3 Reputation</h4>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Talent Protocol Score:</span>
                <span>
                  {talentLoading ? "Loading..." : talentScore ? `${talentScore.score} points` : "Not available"}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>POAP Collection:</span>
                <span>
                  {poapLoading ? "Loading..." : `${poapCount} events attended`}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span>ENS Name:</span>
                <span>
                  {ensLoading ? "Loading..." : ensProfile?.name || "Not set"}
                </span>
              </div>
            </div>

            {hasErrors && (
              <div className="mt-3 p-2 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-700">
                  ⚠️ Some reputation data couldn't be loaded. This may be due to API limits or network issues.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trust Indicator */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-full">
          <Shield className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-blue-700 font-medium">
            Verified Web3 Identity
          </span>
        </div>
      </div>
    </div>
  )
}

// Compact version for use in lists or cards
export function CompactWeb3Reputation({ walletAddress }: { walletAddress?: string }) {
  const { address: connectedAddress } = useAccount()
  const effectiveAddress = walletAddress || connectedAddress
  
  const { score: talentScore, loading: talentLoading } = useTalentScore(effectiveAddress)
  const { count: poapCount, loading: poapLoading } = usePoapCount(effectiveAddress)

  if (!effectiveAddress) return null

  return (
    <div className="flex items-center space-x-2">
      {/* Talent Score Badge */}
      {talentLoading ? (
        <Skeleton className="h-5 w-12" />
      ) : talentScore ? (
        <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
          🏆 {talentScore.score >= 100 ? "100+" : talentScore.score}
        </Badge>
      ) : null}

      {/* POAP Count Badge */}
      {poapLoading ? (
        <Skeleton className="h-5 w-12" />
      ) : poapCount > 0 ? (
        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
          🎖️ {poapCount >= 100 ? "100+" : poapCount}
        </Badge>
      ) : null}
    </div>
  )
}