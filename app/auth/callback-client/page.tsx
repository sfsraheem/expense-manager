'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ClientCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Processing authentication...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Client callback processing URL:', window.location.href)
        
        // Extract tokens from URL fragment
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')
        const expiresAt = hashParams.get('expires_at')

        console.log('Extracted tokens:', {
          accessToken: accessToken ? 'present' : 'missing',
          refreshToken: refreshToken ? 'present' : 'missing',
          expiresAt
        })

        if (!accessToken || !refreshToken) {
          console.error('Missing tokens in URL fragment')
          router.push('/auth/auth-code-error?error=missing_tokens')
          return
        }

        setStatus('Setting up session...')

        // Set the session manually
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        })

        if (sessionError) {
          console.error('Error setting session:', sessionError)
          router.push('/auth/auth-code-error?error=session_setup_failed')
          return
        }

        console.log('Session set successfully:', sessionData.user?.id)

        // Check if user has completed profile setup
        if (sessionData.user) {
          setStatus('Checking profile setup...')
          
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('starting_balance_set')
            .eq('id', sessionData.user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error checking profile:', profileError)
          }

          if (!profile?.starting_balance_set) {
            console.log('Redirecting to setup')
            router.push('/setup')
            return
          }
        }

        console.log('Redirecting to dashboard')
        router.push('/')

      } catch (error) {
        console.error('Client callback error:', error)
        router.push('/auth/auth-code-error?error=client_processing_failed')
      }
    }

    // Process the callback when component mounts
    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 mx-auto"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0 left-1/2 transform -translate-x-1/2"></div>
        </div>
        <p className="text-gray-600 font-medium">{status}</p>
      </div>
    </div>
  )
}