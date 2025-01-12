"use client"

import { useState } from "react"
import Header from "@/components/Header"
import Footer from "@/components/Footer"

const quizQuestions = [
  {
    question: "正常な血圧の上限値は？",
    options: ["120/80 mmHg", "130/85 mmHg", "140/90 mmHg", "150/95 mmHg"],
    correctAnswer: 0,
  },
  {
    question: "以下のうち、糖尿病の症状ではないものは？",
    options: ["多尿", "多飲", "多食", "発熱"],
    correctAnswer: 3,
  },
  {
    question: "心臓の左心室から出る大きな動脈の名前は？",
    options: ["大動脈", "肺動脈", "冠状動脈", "頸動脈"],
    correctAnswer: 0,
  },
]

export default function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [showScore, setShowScore] = useState(false)

  const handleAnswerClick = (selectedAnswer: number) => {
    if (selectedAnswer === quizQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }

    const nextQuestion = currentQuestion + 1
    if (nextQuestion < quizQuestions.length) {
      setCurrentQuestion(nextQuestion)
    } else {
      setShowScore(true)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">医療クイズ</h1>
        {showScore ? (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">
              あなたのスコア: {score} / {quizQuestions.length}
            </h2>
            <button
              onClick={() => {
                setCurrentQuestion(0)
                setScore(0)
                setShowScore(false)
              }}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              もう一度挑戦する
            </button>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              問題 {currentQuestion + 1} / {quizQuestions.length}
            </h2>
            <p className="text-lg mb-4">{quizQuestions[currentQuestion].question}</p>
            <div className="space-y-2">
              {quizQuestions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerClick(index)}
                  className="w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

