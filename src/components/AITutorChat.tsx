import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AITutorChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !user) return

    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('https://ftnfjpyasooqbzhkblpo.functions.supabase.co/ai-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, userId: user.id })
      })

      const data = await response.json()

      if (data.message) {
        setMessages([...newMessages, data.message])
      } else if (data.error) {
        setMessages([...newMessages, { role: 'assistant', content: 'Error: ' + data.error }])
      }
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Error: ' + error.message }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-[500px] flex flex-col shadow-lg z-50">
      <CardHeader>
        <CardTitle>AI Tutor</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block rounded-lg p-2 ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="p-4 border-t border-gray-200 flex items-center space-x-2">
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask me anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !loading) {
              e.preventDefault()
              sendMessage()
            }
          }}
          disabled={loading}
        />
        <Button onClick={sendMessage} disabled={loading}>
          {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Send'}
        </Button>
      </div>
    </Card>
  )
}