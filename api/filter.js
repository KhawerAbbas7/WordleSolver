import fs from 'fs'
import path from 'path'

const filePath = path.join(process.cwd(), 'public', 'fiveLetterWords.json')
const wordList = JSON.parse(fs.readFileSync(filePath, 'utf8'))
const words = Object.keys(wordList)

export default function handler(req, res) {
  const { known } = req.body
  const mustContain = new Set()
  const mustNotContainRaw = new Set()
  const atPosition = ['', '', '', '', '']
  const knownLetters = known || []

  knownLetters.forEach(({ char, pos, state }) => {
    if (state === 0) mustNotContainRaw.add(char)
    if (state === 1) mustContain.add(char)
    if (state === 2) {
      mustContain.add(char)
      atPosition[pos] = char
    }
  })

  const allValidLetters = new Set(knownLetters.filter(k => k.state > 0).map(k => k.char))
  const mustNotContain = Array.from(mustNotContainRaw).filter(c => !allValidLetters.has(c))

  const filtered = words.filter(word => {
    if (mustNotContain.some(ch => word.includes(ch))) return false
    if (!Array.from(mustContain).every(ch => word.includes(ch))) return false
    for (let i = 0; i < 5; i++) {
      if (atPosition[i] && word[i] !== atPosition[i]) return false
    }
    for (const k of knownLetters) {
      if (k.state === 1 && word[k.pos] === k.char) return false
    }
    return true
  })

  res.status(200).json({ words: filtered.slice(0, 100) })
}
