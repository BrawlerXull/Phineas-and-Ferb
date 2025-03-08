'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import useChat from "@/hooks/useChat"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useQuestionnaire } from "@/hooks/useQuestionnaire"



export default function Chatbot() {
  const { messages, input, setInput, error, handleSend } = useChat([
    { role: 'bot', content: 'Hello! I\'m your MindAI your mental health assistant. How can I help you today?' },
  ]);

  const {
    questions,
    options,
    answers,
    currentQuestion,
    response,
    loading,
    handleAnswer,
    handleSubmit,
    setCurrentQuestion,
  } = useQuestionnaire();


  return (
    <div>
      <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>MindAI Health Assistant</CardTitle>
        <CardDescription>Chat with our AI for support and guidance</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[370px] w-full pr-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
              <div className={`rounded-lg p-2 max-w-[70%] ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 items-center">
              <div className="w-2 h-2 rounded-full animate-bounce bg-gray-600"></div>
              <div className="w-3 h-3 rounded-full animate-bounce bg-gray-600"></div>
              <div className="w-4 h-4 rounded-full animate-bounce bg-gray-600"></div>
            </div>
          
          )}
          {error && (
            <div className="flex justify-start mb-4">
              <div className="rounded-lg p-2 max-w-[70%] bg-red-500 text-white">
                {error}
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
          />
          <Button type="submit" disabled={loading}>Send</Button>
        </form>
      </CardFooter>
    </Card>
        <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Mental Health Questionnaire</CardTitle>
          <CardDescription>Please answer the following questions about your mental health over the past two weeks</CardDescription>
        </CardHeader>
  
        <CardContent>
          {response ? (
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-4">Thank you for completing the questionnaire</h2>
              <p>{response}</p>
            </div>
          ) : (
            currentQuestion < questions.length && (
              <div key={questions[currentQuestion].id}>
                <h2 className="text-lg font-semibold mb-4">{questions[currentQuestion].text}</h2>
                <RadioGroup onValueChange={handleAnswer} value={answers[questions[currentQuestion].id]}>
                  {options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`q${questions[currentQuestion].id}-${option.value}`} />
                      <Label htmlFor={`q${questions[currentQuestion].id}-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )
          )}
        </CardContent>
  
        <CardFooter className="flex justify-between">
          {currentQuestion > 0 && !response && (
            <Button onClick={() => setCurrentQuestion(prev => prev - 1)}>Previous</Button>
          )}
          {currentQuestion < questions.length - 1 && !response ? (
            <Button onClick={() => setCurrentQuestion(prev => prev + 1)} disabled={!answers[questions[currentQuestion].id]}>
              Next
            </Button>
          ) : null}
  
          {!response && (
            <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== questions.length || loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
