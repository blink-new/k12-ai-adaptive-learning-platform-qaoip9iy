import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'

interface Message {
  id: string
  parent_id: string
  teacher_id: string
  content: string
  created_at: string
}

interface ParentMessagingProps {
  parentId: string
  teacherId: string
}

export default function ParentMessaging({ parentId, teacherId }: ParentMessagingProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = async () => {
    if (!parentId || !teacherId) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`https://ftnfjpyasooqbzhkblpo.functions.supabase.co/messages?parent_id=${parentId}&teacher_id=${teacherId}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to fetch messages')
      } else {
        const data = await res.json()
        setMessages(data)
      }
    } catch (e) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [parentId, teacherId])

  const handleSend = async () => {
    if (!newMessage.trim() || !parentId || !teacherId) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('https://ftnfjpyasooqbzhkblpo.functions.supabase.co/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent_id: parentId, teacher_id: teacherId, content: newMessage }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to send message')
      } else {
        setNewMessage('')
        fetchMessages()
      }
    } catch (e) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl p-4 bg-white rounded shadow space-y-4">
      <h3 className="text-lg font-semibold">Messages with Teachers</h3>
      <div className="h-64 overflow-y-auto border rounded p-2 space-y-2 bg-gray-50">
        {loading && <p className="text-gray-500">Loading messages...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {messages.length === 0 && !loading && <p className="text-gray-600">No messages yet.</p>}
        {messages.map((msg) => (
          <div key={msg.id} className="p-2 rounded bg-white shadow-sm">
            <p className="text-sm text-gray-700">{msg.content}</p>
            <p className="text-xs text-gray-400">{new Date(msg.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={loading}
        />
        <Button onClick={handleSend} disabled={loading || !newMessage.trim()}>
          Send
        </Button>
      </div>
    </div>
  )
}