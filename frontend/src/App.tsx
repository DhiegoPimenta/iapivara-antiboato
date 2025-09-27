import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import ChatMessage from './components/ChatMessage'
import TypingIndicator from './components/TypingIndicator'
import { Message, ApiResponse } from './types'
import './App.css'

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Eu sou a IAPivara, sua assistente para verificação de notícias! 🦫\n\nPergunta qualquer coisa que você quer verificar se é verdade ou fake news. Por exemplo:\n\n• "Lula morreu?"\n• "Brasil é pentacampeão?"\n• "Disney vai abrir parque no Brasil?"',
      isUser: false,
      timestamp: new Date(),
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const sendMessage = async (text: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data: ApiResponse = await response.json()
      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsLoading(true)

    try {
      const apiResponse = await sendMessage(inputText)
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: apiResponse.reason,
        isUser: false,
        timestamp: new Date(),
        apiResponse,
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, ocorreu um erro ao verificar essa informação. Tente novamente em alguns instantes.',
        isUser: false,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 font-sans overflow-hidden">
      <header className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl border-b border-white/20 px-4 sm:px-6 py-4 sm:py-5 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center gap-3 sm:gap-5">
          <div className="relative">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center text-2xl sm:text-4xl shadow-2xl ring-2 sm:ring-4 ring-white/30 transform hover:scale-105 transition-all duration-300">
              🦫
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-xl sm:text-3xl tracking-tight bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent truncate">IAPivara</h1>
            <p className="text-emerald-300 text-sm sm:text-base font-semibold tracking-wide flex items-center gap-2">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse flex-shrink-0"></span>
              <span className="truncate">Verificador de Fake News</span>
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 px-3 sm:px-6 py-3 sm:py-6">
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-5">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl border-t border-white/20 px-3 sm:px-6 py-3 sm:py-5 shadow-2xl">
          <div className="max-w-4xl mx-auto flex gap-2 sm:gap-4">
            <div className="flex-1 relative">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta sobre uma notícia..."
                className="w-full bg-white/15 border-2 border-white/30 text-white placeholder:text-white/60 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-medium focus:ring-4 focus:ring-emerald-400/30 focus:border-emerald-400 transition-all duration-300 shadow-xl backdrop-blur-sm min-h-[48px] touch-manipulation"
                disabled={isLoading}
              />
              <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-white/40 pointer-events-none">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white rounded-2xl w-12 h-12 sm:w-16 sm:h-16 p-0 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/40 disabled:opacity-50 disabled:hover:scale-100 ring-2 ring-white/20 touch-manipulation flex-shrink-0"
            >
              <Send className="w-5 h-5 sm:w-7 sm:h-7" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
