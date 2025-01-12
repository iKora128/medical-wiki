import Link from 'next/link'
import Header from "@/components/Header"
import { AuthProvider } from "@/contexts/AuthContext"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">医療用語Wiki</h1>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">本日のWiki</h2>
              <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition duration-300 ease-in-out">
                <div className="px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">高血圧（ハイパーテンション）</h3>
                  <p className="text-gray-700 mb-4">
                    血圧が正常値よりも高い状態が続く病気です。長期間放置すると、心臓病や脳卒中などの深刻な合併症を引き起こす可能性があります。
                  </p>
                  <Link href="/wiki/hypertension" className="text-blue-600 hover:text-blue-800 font-medium">
                    詳細を見る →
                  </Link>
                </div>
              </div>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">新機能</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition duration-300 ease-in-out">
                  <div className="px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">質問掲示板</h3>
                    <p className="text-gray-700 mb-4">医療に関する質問を投稿し、回答を得ることができます。</p>
                    <Link href="/questions" className="text-blue-600 hover:text-blue-800 font-medium">
                      質問する →
                    </Link>
                  </div>
                </div>
                <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition duration-300 ease-in-out">
                  <div className="px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">医療クイズ</h3>
                    <p className="text-gray-700 mb-4">医療知識を楽しく学べるクイズに挑戦しましょう。</p>
                    <Link href="/quiz" className="text-blue-600 hover:text-blue-800 font-medium">
                      クイズに挑戦 →
                    </Link>
                  </div>
                </div>
                <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition duration-300 ease-in-out">
                  <div className="px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">コメント機能</h3>
                    <p className="text-gray-700 mb-4">各記事にコメントを残し、議論に参加しましょう。</p>
                    <Link href="/wiki/hypertension" className="text-blue-600 hover:text-blue-800 font-medium">
                      記事を見る →
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">カテゴリー</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {['循環器', '消化器', '呼吸器', '神経'].map((category) => (
                  <div key={category} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition duration-300 ease-in-out">
                    <div className="px-6 py-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{category}</h3>
                      <Link href={`/category/${category.toLowerCase()}`} className="text-blue-600 hover:text-blue-800 font-medium">
                        このカテゴリーを見る →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">最近の更新</h2>
              <ul className="bg-white shadow-lg rounded-lg overflow-hidden">
                {['糖尿病', '心筋梗塞', '肺炎', '脳卒中'].map((term, index) => (
                  <li key={term} className={`px-6 py-4 ${index !== 3 ? 'border-b' : ''}`}>
                    <Link href={`/wiki/${term.toLowerCase()}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      {term}
                    </Link>
                    <span className="text-gray-500 text-sm ml-2">2023年6月{index + 1}日更新</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}