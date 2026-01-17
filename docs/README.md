# 게임 시스템 문서

## 📁 문서 목록

### 성능 최적화 (신규)
- [성능 최적화 개요](./performance/README.md) - React Best Practices 기반
- [비동기 워터폴 제거](./performance/async-waterfall.md) - Promise.all, 병렬 쿼리
- [번들 크기 최적화](./performance/bundle-optimization.md) - 동적 임포트
- [데이터 페칭 최적화](./performance/data-fetching.md) - staleTime 전략
- [리렌더링 최적화](./performance/rendering-optimization.md) - useMemo, useCallback
- [PR 체크리스트](./performance/checklist.md) - 코드 리뷰용

### 전투 관련
- [전투 시스템](./combat-system.md) - 데미지 계산, 공격 판정, 몬스터
- [선공/비선공 시스템](./preemptive-system.md) - 몬스터 behavior 기반 선공 규칙
- [숙련도 시스템](./proficiency-system.md) - 무기/마법 숙련도, 요일 보너스

### 성장 관련
- [경험치/레벨 시스템](./experience-level-system.md) - 레벨업 공식, 경험치 보너스
- [피로도 시스템](./stamina-system.md) - 행동 소모, 자동 회복

### 소통 관련
- [통신용 크리스탈](./whisper-crystal-system.md) - 귓속말 기능, 크리스탈 등급

---

## 🗂️ 메인 문서

자세한 개발 가이드는 [CLAUDE.md](../CLAUDE.md) 참조

### CLAUDE.md 주요 섹션
- 프로젝트 개요 및 기술 스택
- FSD 아키텍처 구조
- Git 커밋 컨벤션
- 코딩 컨벤션 (Zustand, 테마 시스템)
- 각 시스템별 상세 API 사용법

---

## 📊 시스템 현황

| 시스템 | 상태 | 문서 |
|--------|------|------|
| 전투 | ✅ 완료 | [combat-system.md](./combat-system.md) |
| 선공 | ✅ 완료 | [preemptive-system.md](./preemptive-system.md) |
| 숙련도 | ✅ 완료 | [proficiency-system.md](./proficiency-system.md) |
| 경험치/레벨 | ✅ 완료 | [experience-level-system.md](./experience-level-system.md) |
| 피로도 | ✅ 완료 | [stamina-system.md](./stamina-system.md) |
| 크리스탈 | ⚠️ 임시 비활성화 | [whisper-crystal-system.md](./whisper-crystal-system.md) |
| PvP 결투 | ✅ 완료 | CLAUDE.md 참조 |
| 월드맵 | ✅ 완료 | CLAUDE.md 참조 |
| 아이템 | ✅ 완료 | CLAUDE.md 참조 |
| 스킬 | ✅ 완료 | CLAUDE.md 참조 |

---

## 🐛 알려진 이슈

### Realtime 연결 문제
- **증상**: 채팅 연결이 "연결 중"에서 멈춤
- **원인**: 조사 중
- **영향**: 크리스탈 체크 로직 임시 비활성화
- **파일**: `src/features/game/lib/useRealtimeChat.ts`
