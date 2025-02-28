"use client"

import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { TableOfContents } from "@/components/TableOfContents"
import { Clock, Share2 } from "lucide-react"
import Link from "next/link";
import BookmarkButton from '@/components/BookmarkButton'

export default function Hypertension() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-6 relative first-letter:text-5xl first-letter:text-blue-600 first-letter:font-extrabold after:content-[''] after:block after:h-1 after:bg-gradient-to-r after:from-blue-500 after:to-transparent after:mt-2">
              高血圧（ハイパーテンション）
            </h1>
            <div className="flex items-center space-x-4">
              <BookmarkButton slug="hypertension" initialIsBookmarked={false} />
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                最終更新: 2023年6月15日
              </span>
              <button onClick={() => alert("共有機能は現在開発中です。")} className="flex items-center">
                <Share2 className="w-4 h-4 mr-1" />
                共有
              </button>
            </div>
            <div className="mb-8">
              <TableOfContents />
            </div>
            <div className="grid grid-cols-1 gap-8">
              <div>
                <section>
                  <h2 
                    id="definition" 
                    className="text-2xl font-semibold text-gray-900 mb-4 relative first-letter:text-3xl first-letter:text-blue-600 first-letter:font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-blue-400 after:via-purple-400 after:to-transparent"
                  >
                    定義
                  </h2>
                  <p className="text-gray-700 mb-4">
                    高血圧は、動脈血管内の血液の圧力（血圧）が正常値よりも持続的に高い状態を指します。一般的に、収縮期血圧が130mmHg以上、または拡張期血圧が80mmHg以上の場合を高血圧と定義します。
                  </p>
                </section>

                <section>
                  <h2 
                    id="causes" 
                    className="text-2xl font-semibold text-gray-900 mb-4 relative first-letter:text-3xl first-letter:text-blue-600 first-letter:font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-blue-400 after:via-purple-400 after:to-transparent"
                  >
                    原因
                  </h2>
                  <p className="text-gray-700 mb-4">
                    高血圧の原因は多岐にわたります。主な原因には以下のようなものがあります：
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-4">
                    <li>遺伝的要因</li>
                    <li>過度の塩分摂取</li>
                    <li>肥満</li>
                    <li>運動不足</li>
                    <li>ストレス</li>
                    <li>喫煙</li>
                    <li>過度のアルコール摂取</li>
                  </ul>
                </section>

                <section>
                  <h2 
                    id="symptoms" 
                    className="text-2xl font-semibold text-gray-900 mb-4 relative first-letter:text-3xl first-letter:text-blue-600 first-letter:font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-blue-400 after:via-purple-400 after:to-transparent"
                  >
                    症状
                  </h2>
                  <p className="text-gray-700 mb-4">
                    高血圧は「サイレントキラー」とも呼ばれ、多くの場合、明確な症状がありません。しかし、重度の高血圧の場合、以下のような症状が現れることがあります：
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-4">
                    <li>頭痛</li>
                    <li>めまい</li>
                    <li>視力の問題</li>
                    <li>胸痛</li>
                    <li>息切れ</li>
                  </ul>
                </section>

                <section>
                  <h2 
                    id="diagnosis" 
                    className="text-2xl font-semibold text-gray-900 mb-4 relative first-letter:text-3xl first-letter:text-blue-600 first-letter:font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-blue-400 after:via-purple-400 after:to-transparent"
                  >
                    診断
                  </h2>
                  <p className="text-gray-700 mb-4">
                    高血圧の診断は、通常、複数回の血圧測定によって行われます。診断基準は以下の通りです：
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-4">
                    <li>正常血圧：収縮期血圧120mmHg未満かつ拡張期血圧80mmHg未満</li>
                    <li>高血圧前症：収縮期血圧120-129mmHgかつ拡張期血圧80mmHg未満</li>
                    <li>ステージ1高血圧：収縮期血圧130-139mmHgまたは拡張期血圧80-89mmHg</li>
                    <li>ステージ2高血圧：収縮期血圧140mmHg以上または拡張期血圧90mmHg以上</li>
                  </ul>
                </section>

                <section>
                  <h2 
                    id="treatment" 
                    className="text-2xl font-semibold text-gray-900 mb-4 relative first-letter:text-3xl first-letter:text-blue-600 first-letter:font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-blue-400 after:via-purple-400 after:to-transparent"
                  >
                    治療
                  </h2>
                  <p className="text-gray-700 mb-4">
                    高血圧の治療は、生活習慣の改善と薬物療法の組み合わせで行われます。
                  </p>
                  <h3 
                    id="lifestyle" 
                    className="text-xl font-semibold text-gray-900 mb-2 relative first-letter:text-2xl first-letter:text-purple-600 first-letter:font-bold pl-4 border-l-4 border-purple-400"
                  >
                    生活習慣の改善
                  </h3>
                  <ul className="list-disc list-inside text-gray-700 mb-4">
                    <li>減塩</li>
                    <li>適度な運動</li>
                    <li>体重管理</li>
                    <li>禁煙</li>
                    <li>ストレス管理</li>
                  </ul>
                  <h3 
                    id="medication" 
                    className="text-xl font-semibold text-gray-900 mb-2 relative first-letter:text-2xl first-letter:text-purple-600 first-letter:font-bold pl-4 border-l-4 border-purple-400"
                  >
                    薬物療法
                  </h3>
                  <p className="text-gray-700 mb-4">
                    生活習慣の改善だけでは血圧が下がらない場合、以下のような降圧薬が処方されることがあります：
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mb-4">
                    <li>ACE阻害薬</li>
                    <li>アンジオテンシンII受容体拮抗薬（ARB）</li>
                    <li>カルシウム拮抗薬</li>
                    <li>利尿薬</li>
                    <li>β遮断薬</li>
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </div>
        <section className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 relative first-letter:text-3xl first-letter:text-blue-600 first-letter:font-bold after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-blue-400 after:via-purple-400 after:to-transparent">
            関連記事
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["心臓病", "脳卒中", "腎臓病"].map((relatedTerm) => (
              <div key={relatedTerm} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition duration-300 ease-in-out">
                <div className="px-6 py-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{relatedTerm}</h3>
                  <Link href={`/wiki/${relatedTerm.toLowerCase()}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    詳細を見る →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

