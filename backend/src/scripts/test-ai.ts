import 'dotenv/config'
import { generateRoadmap } from '../services/ai'

async function main() {
  console.log('Model:', process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3.3-70b-instruct:free')
  console.log('Key present:', !!process.env.OPENROUTER_API_KEY)
  const result = await generateRoadmap({ goal: 'Learn TypeScript', level: 'beginner' } as any)
  console.log('nodes:', result.nodes.length, 'edges:', result.edges.length)
  console.log(JSON.stringify(result, null, 2))
}

main().catch((e) => {
  console.error('FAILED:', e)
  process.exit(1)
})
