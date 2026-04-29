const SAJU_KO_LABELS: Record<string, string> = {
  // Pillars
  時柱: '시주',
  日柱: '일주',
  月柱: '월주',
  年柱: '년주',
  // Heavenly stems
  甲: '갑',
  乙: '을',
  丙: '병',
  丁: '정',
  戊: '무',
  己: '기',
  庚: '경',
  辛: '신',
  壬: '임',
  癸: '계',
  // Earthly branches
  子: '자',
  丑: '축',
  寅: '인',
  卯: '묘',
  辰: '진',
  巳: '사',
  午: '오',
  未: '미',
  申: '신',
  酉: '유',
  戌: '술',
  亥: '해',
  // Common terms
  四柱八字: '사주팔자',
  八字關係: '팔자 관계',
  神殺: '신살',
  坐法: '좌법',
  引從法: '인종법',
  大運: '대운',
  歲運: '세운',
  運勢: '운세',
  空亡: '공망',
  // Relations
  合: '합',
  半合: '반합',
  三合: '삼합',
  方合: '방합',
  沖: '충',
  刑: '형',
  害: '해',
  破: '파',
  怨嗔: '원진',
  鬼門: '귀문',
  // Misc
  月運: '월운',
}

export function withSajuKorean(hanja: string): string {
  const ko = SAJU_KO_LABELS[hanja]
  return ko ? `${hanja}(${ko})` : hanja
}

export function charWithKorean(char: string): string {
  const ko = SAJU_KO_LABELS[char]
  return ko ? `${char}(${ko})` : char
}

export function ganzhiWithKorean(ganzi: string): string {
  if (ganzi.length < 2) return ganzi
  const stem = SAJU_KO_LABELS[ganzi[0]] ?? ''
  const branch = SAJU_KO_LABELS[ganzi[1]] ?? ''
  const ko = `${stem}${branch}`
  return ko ? `${ganzi}(${ko})` : ganzi
}
