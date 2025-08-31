"use client"

import { useEffect, useState } from 'react'
import { callFarcasterReady } from '@/lib/farcaster-sdk'
import { detectEnvironment } from '@/lib/environment-detection'

/**
 * Farcaster Ready Component
 * Enhanced timing for production environments (Vercel)
 * Per docs: "As soon as possible while avoiding jitter and content reflows"
 */
export function FarcasterReadySignal() {
  const [isInterfaceReady, setIsInterfaceReady] = useState(false)
  const [readyCalled, setReadyCalled] = useState(false)

  useEffect(() => {
    const environment = detectEnvironment()
    
    if (environment === 'farcaster-web' || environment === 'farcaster-mobile') {
      console.log('🎯 Farcaster environment detected - preparing ready signal')
      
      // Enhanced readiness check for production environments
      const checkIfReady = () => {
        const isDocumentReady = document.readyState === 'complete'
        const hasContent = document.body.children.length > 0
        const hasMainContent = document.querySelector('[class*="minikit-app"], [id*="app"], main, [role="main"]')
        
        if (isDocumentReady && hasContent && hasMainContent) {
          console.log('✅ Interface ready - DOM complete, content rendered, main elements present')
          setIsInterfaceReady(true)
          return true
        }
        return false
      }

      // Production timing strategy: Multiple checkpoints
      const checkReadiness = () => {
        if (checkIfReady()) return

        // Check after short delay for production hydration
        setTimeout(() => {
          if (checkIfReady()) return
          
          // Final check after longer delay for slow networks
          setTimeout(() => {
            if (checkIfReady()) return
            
            // Force ready after reasonable timeout (production fallback)
            setTimeout(() => {
              console.log('⚠️ Force ready after timeout - production fallback')
              setIsInterfaceReady(true)
            }, 2000)
          }, 1000)
        }, 500)
      }

      // Check immediately
      checkReadiness()

      // Listen for window load as backup
      const handleWindowLoad = () => {
        console.log('📱 Window loaded - checking readiness')
        setTimeout(checkReadiness, 100)
      }

      if (document.readyState === 'loading') {
        window.addEventListener('load', handleWindowLoad)
      } else {
        // Already loaded, check again after hydration time
        setTimeout(checkReadiness, 200)
      }

      return () => {
        window.removeEventListener('load', handleWindowLoad)
      }
    }
  }, [])

  useEffect(() => {
    if (isInterfaceReady && !readyCalled) {
      console.log('🚀 Interface ready - calling Farcaster ready()')
      
      const callReady = async () => {
        try {
          console.log('📡 Production environment - calling ready with enhanced error handling')
          await callFarcasterReady()
          setReadyCalled(true)
          console.log('✅ Production ready() call successful')
        } catch (error) {
          console.error('❌ Production ready() failed:', error)
          
          // Retry once more for production reliability
          setTimeout(async () => {
            try {
              console.log('🔄 Production retry - second attempt')
              await callFarcasterReady()
              setReadyCalled(true)
              console.log('✅ Production retry successful')
            } catch (retryError) {
              console.error('❌ Production retry also failed:', retryError)
            }
          }, 1000)
        }
      }

      callReady()
    }
  }, [isInterfaceReady, readyCalled])

  // This component renders nothing but ensures proper ready timing
  return null
}