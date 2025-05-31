import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export function useSubscription() {
  const { user } = useAuth()
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setIsPremium(false)
      setLoading(false)
      return
    }

    const fetchSubscription = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        setIsPremium(false)
      } else {
        setIsPremium(data.status === 'active')
      }
      setLoading(false)
    }

    fetchSubscription()
  }, [user])

  return { isPremium, loading }
}
