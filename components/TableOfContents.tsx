"use client"

import { useEffect, useState } from "react"
import { Link as ScrollLink } from "react-scroll"

interface TOCItem {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [toc, setToc] = useState<TOCItem[]>([])

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll("h2, h3"))
    const tocItems = headings.map((heading) => ({
      id: heading.id,
      text: heading.textContent || "",
      level: parseInt(heading.tagName.charAt(1)),
    })).filter(item => item.id !== "")
    setToc(tocItems)
  }, [])

  if (toc.length === 0) return null

  return (
    <nav className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
      <h2 className="text-xl font-semibold mb-6 text-gray-800 pb-2 border-b border-gray-200">目次</h2>
      <ul className="space-y-3">
        {toc.map((item) => (
          <li 
            key={item.id} 
            className={`
              ${item.level === 3 ? "ml-4 border-l-2 pl-2 border-gray-200" : ""}
              hover:bg-blue-50 rounded transition-colors duration-150
            `}
          >
            <ScrollLink
              to={item.id}
              spy={true}
              smooth={true}
              offset={-100}
              duration={500}
              className="text-gray-700 hover:text-blue-600 cursor-pointer block py-1 text-sm"
              activeClass="text-blue-600 font-medium"
            >
              {item.text}
            </ScrollLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

