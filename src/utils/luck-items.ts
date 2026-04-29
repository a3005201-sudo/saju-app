import type { PillarDetail } from '@orrery/core/types'
import { BRANCH_ELEMENT, STEM_INFO } from '@orrery/core/constants'

export type FiveElement = 'tree' | 'fire' | 'earth' | 'metal' | 'water'

export const ELEMENT_LABEL: Record<FiveElement, string> = {
  tree: '목(木)',
  fire: '화(火)',
  earth: '토(土)',
  metal: '금(金)',
  water: '수(水)',
}

export const ELEMENT_SEARCH_KEYWORDS: Record<FiveElement, string[]> = {
  tree: ['초록색 인테리어 소품', '공기정화 식물 화분', '나무 소재 가구'],
  fire: ['빨간색 장지갑', '세련된 무드등', '붉은 계열 의류'],
  earth: ['황토색 패션 잡화', '도자기 장식품', '베이지색 침구'],
  metal: ['메탈 손목시계', '금속 액세서리', '화이트톤 최신 가전'],
  water: ['검은색 고급 가방', '미니 가습기', '물 멍용 수조 소품'],
}

export function detectWeakElement(pillars: PillarDetail[]): FiveElement {
  const score: Record<FiveElement, number> = {
    tree: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  }

  for (const pillar of pillars) {
    const stemEl = STEM_INFO[pillar.pillar.stem]?.element as FiveElement | undefined
    const branchEl = BRANCH_ELEMENT[pillar.pillar.branch] as FiveElement | undefined
    if (stemEl) score[stemEl] += 1.4
    if (branchEl) score[branchEl] += 1
  }

  return (Object.entries(score).sort((a, b) => a[1] - b[1])[0][0]) as FiveElement
}

export interface LuckItem {
  productId: number
  productName: string
  productImage: string
  productUrl: string
  productPrice: number
  productRating: number
  isRocket: boolean
  isFreeShipping: boolean
}
