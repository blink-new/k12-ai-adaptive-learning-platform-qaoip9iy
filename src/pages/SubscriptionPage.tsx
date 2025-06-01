import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

const SUPABASE_FUNCTIONS_URL = 'https://ftnfjpyasooqbzhkblpo.functions.supabase.co';

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return

    const fetchSubscriptionStatus = async () => {
      setLoading(true)
      // Fetch subscription status from user profile or subscription table
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error fetching subscription status:', error)
        setSubscriptionStatus(null)
      } else {
        setSubscriptionStatus(data?.status || null)
      }
      setLoading(false)
    }

    fetchSubscriptionStatus()
  }, [user])

  const handleManageSubscription = async () => {
    try {
      // Call Supabase Edge Function to get LemonSqueezy customer portal URL
      const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/lemon-squeezy-customer-portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId: user?.id })
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get customer portal URL')
      }
      const data = await response.json()
      window.location.href = data.url
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleCheckout = () => {
    // Redirect to LemonSqueezy checkout page
    // Replace with your LemonSqueezy checkout URL
    window.location.href = 'https://app.lemonsqueezy.com/checkout/YOUR_CHECKOUT_ID'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Subscription Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Your current subscription status: <strong>{subscriptionStatus || 'None'}</strong>
          </p>
          <Button onClick={handleManageSubscription} className="w-full">
            Manage Subscription
          </Button>
          <Button onClick={handleCheckout} className="w-full">
            Upgrade / Subscribe
          </Button>
        </CardContent>
      </Card>
      {error && (
        <div className="text-red-500 text-center mt-4">
          {error}
        </div>
      )}
    </div>
  )
}