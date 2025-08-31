"use client"

import { useEffect, useState } from 'react'
import { callFarcasterReady } from '@/lib/farcaster-sdk'
import { detectEnvironment } from '@/lib/environment-detection'

/**
 * Farcaster Ready Component
 * Calls sdk.actions.ready() only when app interface is fully loaded
 * Per docs: "As soon as possible while avoiding jitter and content reflows"
 */
export function FarcasterReadySignal() {
  const [isInterfaceReady, setIsInterfaceReady] = useState(false)

  useEffect(() => {
    const environment = detectEnvironment()
    
    if (environment === 'farcaster-web' || environment === 'farcaster-mobile') {
      console.log('🎯 Farcaster environment detected - preparing ready signal')
      
      // Check if interface is ready (DOM fully loaded + components rendered)
      const checkIfReady = () => {
        const isDocumentReady = document.readyState === 'complete'
        const hasContent = document.body.children.length > 0
        
        if (isDocumentReady && hasContent) {
          console.log('✅ Interface ready - DOM complete and content rendered')
          setIsInterfaceReady(true)
          return true
        }
        return false
      }

      // Check immediately
      if (checkIfReady()) {
        return
      }

      // Wait for window load if not ready yet
      const handleWindowLoad = () => {
        console.log('📱 Window loaded event - checking if ready')
        setTimeout(() => {
          if (checkIfReady()) {
            console.log('✅ Ready after window load')
          }
        }, 50) // Small delay to ensure rendering is complete
      }

      window.addEventListener('load', handleWindowLoad)
      
      // Also check periodically until ready
      const readyInterval = setInterval(() => {
        if (checkIfReady()) {
          clearInterval(readyInterval)
        }
      }, 100)

      return () => {
        window.removeEventListener('load', handleWindowLoad)
        clearInterval(readyInterval)
      }
    }
  }, [])

  useEffect(() => {
    if (isInterfaceReady) {
      console.log('🚀 Interface fully ready - calling Farcaster ready()')
      
      // Call ready immediately when interface is ready
      const callReady = async () => {
        try {
          await callFarcasterReady()
          console.log('✅ Farcaster ready() called successfully')
        } catch (error) {
          console.error('❌ Failed to call ready():', error)
        }
      }

      callReady()
    }
  }, [isInterfaceReady])

  // This component renders nothing but ensures proper ready timing
  return null
}