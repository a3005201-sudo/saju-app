import type { DaewoonItem, PillarDetail } from '@orrery/core/types'
import { BRANCH_ELEMENT, RELATIONS, STEM_INFO } from '@orrery/core/constants'
import { getRelation, getYearGanzi } from '@orrery/core/pillars'
import type { FiveElement } from './luck-items.ts'

export interface DayMasterProfile {
  nature: string
  title: string
  description: string
  keywords: string[]
  caution: string
}

export const DAY_MASTER_PROFILE: Record<string, DayMasterProfile> = {
  甲: {
    nature: '큰 나무',
    title: '곧게 위로 뻗는 큰 나무',
    description: '목표를 세우면 밀고 나가는 추진력과 리더십이 있어요. 정의감이 강하고 남을 이끄는 자리에서 빛나요.',
    keywords: ['리더십', '추진력', '정의감', '성장'],
    caution: '한번 정하면 굽히기 어려워 고집으로 보일 수 있어요.',
  },
  乙: {
    nature: '풀과 꽃',
    title: '유연하게 뻗어가는 풀과 꽃',
    description: '어떤 환경에서도 적응하는 유연함과 친화력이 강점이에요. 섬세하고 사람 사이를 잘 이어줘요.',
    keywords: ['적응력', '친화력', '섬세함', '인내'],
    caution: '남의 눈치를 많이 봐서 결정을 미루기 쉬워요.',
  },
  丙: {
    nature: '태양',
    title: '모두를 비추는 태양',
    description: '밝고 열정적이며 표현력이 뛰어나요. 어디서든 분위기를 띄우고 사람을 끌어당겨요.',
    keywords: ['열정', '표현력', '낙천', '사교성'],
    caution: '마음이 급해 쉽게 달아올랐다 식을 수 있어요.',
  },
  丁: {
    nature: '촛불',
    title: '은은하게 밝히는 촛불',
    description: '따뜻하고 배려심이 깊으며 한 가지에 깊이 몰입하는 집중력이 있어요.',
    keywords: ['따뜻함', '집중력', '배려', '섬세함'],
    caution: '속으로 삭이는 편이라 혼자 속앓이하기 쉬워요.',
  },
  戊: {
    nature: '큰 산',
    title: '듬직하게 자리 잡은 큰 산',
    description: '믿음직하고 포용력이 커서 주변이 기대는 사람이에요. 쉽게 흔들리지 않는 안정감이 강점이에요.',
    keywords: ['신뢰', '포용력', '안정감', '뚝심'],
    caution: '변화에 느리고 속마음을 잘 드러내지 않아요.',
  },
  己: {
    nature: '논밭',
    title: '곡식을 길러내는 기름진 땅',
    description: '실속 있고 꼼꼼하며 사람과 일을 잘 챙기고 키워내요. 현실 감각이 뛰어나요.',
    keywords: ['실속', '꼼꼼함', '돌봄', '현실감각'],
    caution: '걱정이 많아 스스로를 소극적으로 만들 수 있어요.',
  },
  庚: {
    nature: '바위와 쇠',
    title: '단단한 바위와 원석',
    description: '결단력과 강단이 있고 의리를 중요하게 여겨요. 위기에서 오히려 강해지는 타입이에요.',
    keywords: ['결단력', '의리', '강단', '실행력'],
    caution: '말과 행동이 직설적이라 거칠게 느껴질 수 있어요.',
  },
  辛: {
    nature: '보석',
    title: '반짝이는 보석',
    description: '감각이 예리하고 섬세하며 완성도를 중시해요. 자기만의 기준과 품격이 뚜렷해요.',
    keywords: ['섬세함', '감각', '완벽주의', '품격'],
    caution: '자존심이 강하고 예민해 상처를 잘 받아요.',
  },
  壬: {
    nature: '바다',
    title: '넓게 흐르는 바다와 큰 강',
    description: '생각의 스케일이 크고 지혜로우며 포용력이 있어요. 새로운 곳을 향한 호기심이 많아요.',
    keywords: ['지혜', '포용', '스케일', '자유로움'],
    caution: '관심사가 많아 산만하거나 한곳에 머물기 어려워요.',
  },
  癸: {
    nature: '비와 이슬',
    title: '만물을 적시는 비와 이슬',
    description: '직관과 공감 능력이 뛰어나고 조용히 깊게 생각해요. 사람의 마음을 잘 읽어요.',
    keywords: ['직관', '공감', '지혜', '차분함'],
    caution: '생각이 많아 걱정과 불안이 커질 수 있어요.',
  },
}

export const ELEMENT_ORDER: FiveElement[] = ['tree', 'fire', 'earth', 'metal', 'water']

export const ELEMENT_INFO: Record<FiveElement, { name: string; hanja: string; meaning: string; barClass: string }> = {
  tree: { name: '나무', hanja: '木', meaning: '성장·기획·배려', barClass: 'bg-green-500' },
  fire: { name: '불', hanja: '火', meaning: '열정·표현·인기', barClass: 'bg-red-500' },
  earth: { name: '흙', hanja: '土', meaning: '안정·신뢰·중재', barClass: 'bg-yellow-500' },
  metal: { name: '쇠', hanja: '金', meaning: '결단·원칙·정리', barClass: 'bg-slate-400' },
  water: { name: '물', hanja: '水', meaning: '지혜·유연·소통', barClass: 'bg-slate-900 dark:bg-slate-200' },
}

export const SIPSIN_PLAIN: Record<string, { ko: string; meaning: string }> = {
  比肩: { ko: '비견', meaning: '나와 같은 기운 — 독립심·자존감·동료가 커지는 시기' },
  劫財: { ko: '겁재', meaning: '경쟁의 기운 — 도전·승부욕, 지출과 경쟁 관리가 중요' },
  食神: { ko: '식신', meaning: '표현의 기운 — 재능 발휘·여유·먹고 즐기는 복' },
  傷官: { ko: '상관', meaning: '창의의 기운 — 말솜씨·아이디어, 틀을 깨는 변화' },
  偏財: { ko: '편재', meaning: '활동적 재물 — 사업·투자·기회가 많아지는 흐름' },
  正財: { ko: '정재', meaning: '안정적 재물 — 꾸준한 수입·성실함·살림 관리' },
  偏官: { ko: '편관', meaning: '도전의 기운 — 압박 속 성장, 책임과 리더십' },
  正官: { ko: '정관', meaning: '명예의 기운 — 직장·승진·인정받는 흐름' },
  偏印: { ko: '편인', meaning: '직관의 기운 — 특별한 재능·새로운 공부·변화' },
  正印: { ko: '정인', meaning: '도움의 기운 — 배움·자격·문서, 윗사람의 도움' },
}

const SIPSIN_KO: Record<string, string> = Object.fromEntries(RELATIONS.map(r => [r.hanja, r.hangul]))

export function sipsinKo(hanja: string): string {
  return SIPSIN_KO[hanja] ?? ''
}

export function countElements(pillars: PillarDetail[], unknownTime?: boolean): Record<FiveElement, number> {
  const counts: Record<FiveElement, number> = { tree: 0, fire: 0, earth: 0, metal: 0, water: 0 }
  pillars.forEach((p, i) => {
    if (i === 0 && unknownTime) return
    const stemEl = STEM_INFO[p.pillar.stem]?.element as FiveElement | undefined
    const branchEl = BRANCH_ELEMENT[p.pillar.branch] as FiveElement | undefined
    if (stemEl) counts[stemEl] += 1
    if (branchEl) counts[branchEl] += 1
  })
  return counts
}

export function findCurrentDaewoon(daewoon: DaewoonItem[], now = new Date()): { item: DaewoonItem; endAge: number } | null {
  let idx = -1
  for (let i = 0; i < daewoon.length; i++) {
    if (daewoon[i].startDate <= now) idx = i
  }
  if (idx < 0) return null
  const item = daewoon[idx]
  const endAge = idx + 1 < daewoon.length ? daewoon[idx + 1].age - 1 : item.age + 9
  return { item, endAge }
}

export function yearLuck(dayStem: string, year = new Date().getFullYear()): { year: number; ganzi: string; sipsin: string } {
  const ganzi = getYearGanzi(year)
  return { year, ganzi, sipsin: getRelation(dayStem, ganzi[0])?.hanja ?? '' }
}
