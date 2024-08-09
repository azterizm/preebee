import names from '~/constants/names.json'
import endings from '~/constants/endings.json'
import { prisma } from '~/db.server'
export async function generateBusinessNames(count = 1) {
  const businessNames = []
  for (let i = 0; i < count; i++) {
    const selectedName = names[Math.floor(Math.random() * names.length)]
    const selectedEnding = endings[Math.floor(Math.random() * endings.length)]

    let iteration = 0
    let name = `${selectedName}-${selectedEnding}${iteration || ''}`

    while (true) {
      const shopsCount = await prisma.shop.count({ where: { name } })
      if (shopsCount === 0) {
        break
      }
      iteration++
      name = `${selectedName}-${selectedEnding}${iteration || ''}`
    }

    businessNames.push(name)
  }
  return businessNames
}
