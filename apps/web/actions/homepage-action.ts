//used server actions for this 
'use server'

import { prismaFrontend } from "@repo/db-client"


async function incrementVisitor() {
  const stat = await prismaFrontend.stat.upsert({
    where: { id: 1 },
    update: { visitors: { increment: 1 } },
    create: { id: 1, visitors: 1, likes: 0 },
  })
  return stat.visitors
}

async function getStats() {
  const stat = await prismaFrontend.stat.findUnique({ where: { id: 1 } })
  return { visitors: stat?.visitors ?? 0, likes: stat?.likes ?? 0 }
}

async function likePortfolio() {
  const stat = await prismaFrontend.stat.update({
    where: { id: 1 },
    data: { likes: { increment: 1 } },
  })
  return stat.likes
}

export {
  incrementVisitor,
  getStats,
  likePortfolio
} 