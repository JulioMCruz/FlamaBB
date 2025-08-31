"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { talentProtocol } from "@/lib/talent-protocol"
import { poapService } from "@/lib/poap"
import { useEnsProfile } from "@/lib/ens"

export function ApiTestDebug() {
  const [testResults, setTestResults] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  
  // Use connected wallet address
  const { address: connectedAddress } = useAccount()
  
  // Test ENS resolution
  const { profile: ensProfile, loading: ensLoading, error: ensError } = useEnsProfile(connectedAddress)

  const runTests = async () => {
    setIsLoading(true)
    const results: any = {}

    try {
      console.log("🧪 Starting API tests...")
      
      // Test Talent Protocol
      console.log("🔍 Testing Talent Protocol API...")
      const talentScore = await talentProtocol.getTalentScore(connectedAddress)
      results.talentProtocol = {
        success: !!talentScore,
        data: talentScore,
        error: talentScore ? null : "No score found"
      }

      // Test POAP API
      console.log("🔍 Testing POAP API...")
      const poapStats = await poapService.getPoapStats(connectedAddress)
      results.poap = {
        success: poapStats.totalPoaps >= 0,
        data: poapStats,
        error: null
      }

      console.log("✅ API tests completed:", results)
    } catch (error) {
      console.error("❌ API test failed:", error)
      results.error = error
    }

    setTestResults(results)
    setIsLoading(false)
  }

  useEffect(() => {
    if (connectedAddress) {
      runTests()
    }
  }, [connectedAddress])

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-800">🧪 API Debug Test</h3>
        <button 
          onClick={runTests}
          disabled={isLoading || !connectedAddress}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? "Testing..." : "Retest APIs"}
        </button>
      </div>
      
      <div className="text-sm space-y-2">
        {connectedAddress ? (
          <div>
            <strong>Connected Wallet:</strong> <code className="bg-gray-100 px-1 rounded">{connectedAddress}</code>
          </div>
        ) : (
          <div className="text-red-600">
            <strong>⚠️ No wallet connected</strong>
          </div>
        )}
        
        {/* Talent Protocol Results */}
        <div>
          <strong>Talent Protocol:</strong>{" "}
          {isLoading ? (
            "Loading..."
          ) : testResults.talentProtocol ? (
            <span className={testResults.talentProtocol.success ? "text-green-600" : "text-red-600"}>
              {testResults.talentProtocol.success ? "✅ Working" : "❌ Failed"}
              {testResults.talentProtocol.data && (
                <span> - Score: {testResults.talentProtocol.data.score}</span>
              )}
            </span>
          ) : (
            "Not tested"
          )}
        </div>

        {/* POAP Results */}
        <div>
          <strong>POAP API:</strong>{" "}
          {isLoading ? (
            "Loading..."
          ) : testResults.poap ? (
            <span className={testResults.poap.success ? "text-green-600" : "text-red-600"}>
              {testResults.poap.success ? "✅ Working" : "❌ Failed"}
              {testResults.poap.data && (
                <span> - POAPs: {testResults.poap.data.totalPoaps}</span>
              )}
            </span>
          ) : (
            "Not tested"
          )}
        </div>

        {/* ENS Results */}
        <div>
          <strong>ENS Resolution:</strong>{" "}
          {ensLoading ? (
            "Loading..."
          ) : ensProfile?.resolved ? (
            <span className="text-green-600">
              ✅ Found: {ensProfile.name}
              {ensProfile.avatar && " (with avatar)"}
            </span>
          ) : ensError ? (
            <span className="text-red-600">❌ Error: {ensError}</span>
          ) : (
            <span className="text-yellow-600">⚠️ No ENS name found</span>
          )}
        </div>
      </div>

      {/* Detailed Results */}
      {Object.keys(testResults).length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-gray-600">View Raw Results</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}