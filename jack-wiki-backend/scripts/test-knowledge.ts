/**
 * Quick integration test for knowledge upload + search.
 * Run: pnpm tsx scripts/test-knowledge.ts
 */
import 'dotenv/config'
import { db } from '../src/infrastructure/database/client'
import { DrizzleKnowledgeRepository } from '../src/infrastructure/repositories/drizzle-knowledge.repository'
import { EmbeddingService } from '../src/infrastructure/ai/embeddings/embedding.service'
import { UploadKnowledgeUseCase } from '../src/core/use-cases/knowledge/upload-knowledge.use-case'
import { SearchKnowledgeUseCase } from '../src/core/use-cases/knowledge/search-knowledge.use-case'

const knowledgeRepo = new DrizzleKnowledgeRepository(db)
const embeddingService = new EmbeddingService()

async function testUpload() {
  console.log('\n📤 [1/2] Testing upload...')

  const useCase = new UploadKnowledgeUseCase(knowledgeRepo, embeddingService)
  const item = await useCase.execute({
    title: '价值投资核心原则',
    content: `
价值投资是一种投资策略，由本杰明·格雷厄姆和沃伦·巴菲特推广。

核心原则：
1. 安全边际：以远低于内在价值的价格买入，为判断失误留出缓冲空间。
2. 护城河：寻找具有持续竞争优势的企业，如品牌、网络效应、成本优势或转换成本。
3. 长期持有：优质企业的复利效应在长时间内极为惊人，频繁交易会摩擦掉大量收益。
4. 能力圈：只投资自己真正理解的业务，不因为市场热门而追逐陌生领域。
5. 市场先生：把市场价格波动看作服务自己的工具，而非指导自己行为的老师。

巴菲特的名言：
- "别人贪婪时我恐惧，别人恐惧时我贪婪。"
- "如果你不愿意持有一只股票十年，就不要持有它十分钟。"
- "价格是你付出的，价值是你得到的。"
    `.trim(),
    sourceType: 'text',
  })

  console.log(`✅ Uploaded: "${item.title}" (id: ${item.id})`)
  return item.id
}

async function testSearch(itemId: string) {
  console.log('\n🔍 [2/2] Testing search...')

  const useCase = new SearchKnowledgeUseCase(knowledgeRepo, embeddingService)

  const queries = ['什么是护城河？', '巴菲特怎么看待市场波动？', '如何控制投资风险？']

  for (const query of queries) {
    const results = await useCase.execute({ query, topK: 2 })
    console.log(`\nQuery: "${query}"`)
    results.forEach((r, i) => {
      console.log(`  [${i + 1}] similarity=${r.similarity.toFixed(4)} | ${r.chunkText.slice(0, 80)}...`)
    })
  }

  // Cleanup: delete the test item (cascades to embeddings)
  await knowledgeRepo.deleteItem(itemId)
  console.log(`\n🧹 Cleaned up test item (id: ${itemId})`)
}

async function main() {
  try {
    const itemId = await testUpload()
    await testSearch(itemId)
    console.log('\n✅ All tests passed!')
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

main()
