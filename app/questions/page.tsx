"'use client'"

import { useState } from "react"
import { Header } from "../../components/Header"
import { Footer } from "../../components/Footer"

export default function Questions() {
  const [questions, setQuestions] = useState([
    { id: 1, title: "'高血圧の予防法について教えてください'", answers: 3 },
    { id: 2, title: "'糖尿病の初期症状は何ですか？'", answers: 2 },
    { id: 3, title: "'風邪と新型コロナウイルスの症状の違いは？'", answers: 5 },
  ])
  const [newQuestion, setNewQuestion] = useState("''")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newQuestion.trim()) {
      setQuestions([
        { id: questions.length + 1, title: newQuestion, answers: 0 },
        ...questions,
      ])
      setNewQuestion("''")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">質問掲示板</h1>
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-center">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="あなたの質問を入力してください"
              className="flex-grow mr-2 p-2 border border-neutral-200 border-gray-300 rounded-md dark:border-neutral-800"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              質問する
            </button>
          </div>
        </form>
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">{question.title}</h2>
              <p className="text-gray-600">回答数: {question.answers}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}

