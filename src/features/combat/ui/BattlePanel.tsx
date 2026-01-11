"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useBattleStore } from "@/application/stores";
import { useThemeStore } from "@/shared/config";
import type { CharacterStats } from "@/entities/character";
import type { Proficiencies } from "@/entities/ability";
import type { Ability } from "@/entities/ability";
import {
  useAbilities,
  useUserAbilities,
  fetchMonsterAbilities,
  getLearnedAbilities,
  type RawMonsterAbility,
  type UserAbilities,
} from "@/entities/ability";
import { useAbility, useExecuteQueue } from "@/features/combat";
import { BattleHeader } from "./BattleHeader";
import { BattleLog } from "./BattleLog";
import { ActionQueue } from "./ActionQueue";
import { AbilitySelector } from "./AbilitySelector";

// 전투 탭 타입
type BattleTab = "attack" | "defense" | "magic" | "item";

interface BattlePanelProps {
  characterId: string;
  characterStats: CharacterStats;
  proficiencies: Proficiencies | undefined;
  onFlee: () => void;
  onVictory: () => void;
  onDefeat: () => void;
}

export function BattlePanel({
  characterId,
  characterStats,
  proficiencies,
  onFlee,
  onVictory,
  onDefeat,
}: BattlePanelProps) {
  const { theme } = useThemeStore();
  const {
    battle,
    playerFlee,
    resetBattle,
    dealDamageToPlayer,
  } = useBattleStore();

  const [activeTab, setActiveTab] = useState<BattleTab>("attack");
  const [monsterAbilitiesData, setMonsterAbilitiesData] = useState<Map<string, RawMonsterAbility>>(new Map());

  // 어빌리티 데이터 로드
  const { data: allAbilities = [] } = useAbilities();
  const { data: userAbilities } = useUserAbilities(characterId);

  // useAbility 훅
  const {
    queueAbility,
    unqueueAbility,
    clearQueue,
    playerQueue,
  } = useAbility();

  // 큐 실행 훅
  const { executeQueue, isExecuting } = useExecuteQueue({
    characterStats,
    proficiencies,
    monsterAbilitiesData,
  });

  // 몬스터 어빌리티 데이터 로드
  useEffect(() => {
    fetchMonsterAbilities().then(setMonsterAbilitiesData);
  }, []);

  // 배운 어빌리티와 레벨 (userAbilities 기반)
  const learnedAbilities = useMemo(() => {
    if (!userAbilities) return {};
    return getLearnedAbilities(userAbilities);
  }, [userAbilities]);

  // 어빌리티 레벨 맵
  const abilityLevels = useMemo(() => {
    const levels: Record<string, number> = {};
    for (const [id, progress] of Object.entries(learnedAbilities)) {
      levels[id] = progress.level;
    }
    return levels;
  }, [learnedAbilities]);

  // 배운 어빌리티 목록 (allAbilities에서 learnedAbilities에 있는 것만 필터)
  const myAbilities = useMemo(() => {
    const learnedIds = new Set(Object.keys(learnedAbilities));
    return allAbilities.filter((a) => learnedIds.has(a.id));
  }, [allAbilities, learnedAbilities]);

  // 탭별 어빌리티 필터
  const filteredAbilities = useMemo(() => {
    switch (activeTab) {
      case "attack":
        // 공격 스킬만 (combat 카테고리의 attack 타입)
        return myAbilities.filter(
          (a) => a.type === "attack" && a.usageContext === "combat_only"
        );
      case "defense":
        // 방어 스킬 (block, dodge 등)
        return myAbilities.filter((a) => a.type === "defense" || a.id === "block" || a.id === "dodge");
      case "magic":
        // 마법 스킬 (spell 소스)
        return myAbilities.filter((a) => a.source === "spell");
      case "item":
        // 아이템 사용 (향후 구현)
        return [];
      default:
        return [];
    }
  }, [activeTab, myAbilities]);

  // 어빌리티 선택 핸들러
  const handleSelectAbility = useCallback(
    (ability: Ability, level: number) => {
      if (isExecuting) return;
      queueAbility({ ability, abilityLevel: level });
    },
    [queueAbility, isExecuting]
  );

  // 도주 핸들러
  const handleFlee = useCallback(() => {
    if (isExecuting) return;
    const success = playerFlee();
    if (success) {
      onFlee();
    }
  }, [playerFlee, onFlee, isExecuting]);

  // 전투 종료 처리
  const handleCloseBattle = useCallback(() => {
    const currentResult = useBattleStore.getState().battle.result;
    if (currentResult === "victory") {
      onVictory();
    } else if (currentResult === "defeat") {
      onDefeat();
    } else if (currentResult === "fled") {
      resetBattle();
    }
  }, [onVictory, onDefeat, resetBattle]);

  // 선제공격 처리
  useEffect(() => {
    if (
      battle.isInBattle &&
      battle.isPreemptivePhase &&
      battle.monsterGoesFirst &&
      battle.monster &&
      battle.result === "ongoing"
    ) {
      const timer = setTimeout(() => {
        const damage = Math.floor(battle.monster!.stats.attack * 0.8);
        dealDamageToPlayer(
          damage,
          `${battle.monster!.icon} ${battle.monster!.nameKo}의 선제 공격! ${damage} 데미지!`
        );
        // 선제공격 페이즈 종료
        useBattleStore.setState((state) => ({
          battle: {
            ...state.battle,
            isPreemptivePhase: false,
          },
        }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [battle.isInBattle, battle.isPreemptivePhase, battle.monsterGoesFirst, battle.monster, battle.result, dealDamageToPlayer]);

  if (!battle.isInBattle || !battle.monster) return null;

  const isOngoing = battle.result === "ongoing";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
    >
      <div
        className="w-full max-w-lg overflow-hidden"
        style={{
          background: theme.colors.bg,
          border: `2px solid ${theme.colors.border}`,
        }}
      >
        {/* 헤더 (HP/MP/AP 바) */}
        <BattleHeader />

        {/* 전투 로그 */}
        <BattleLog />

        {/* 액션 영역 */}
        {isOngoing ? (
          <>
            {/* 액션 큐 */}
            <ActionQueue
              onRemoveAction={unqueueAbility}
              onClearQueue={clearQueue}
              onExecute={executeQueue}
              disabled={isExecuting}
            />

            {/* 탭 버튼 */}
            <div
              className="flex border-t"
              style={{ borderColor: theme.colors.border }}
            >
              {(["attack", "defense", "magic", "item"] as const).map((tab) => {
                const tabLabels: Record<BattleTab, string> = {
                  attack: "⚔️ 공격",
                  defense: "🛡️ 방어",
                  magic: "🔮 마법",
                  item: "📦 아이템",
                };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    disabled={isExecuting || tab === "item"} // 아이템 탭 비활성화
                    className="flex-1 px-4 py-2 font-mono text-sm transition-colors"
                    style={{
                      background:
                        activeTab === tab ? theme.colors.bgLight : "transparent",
                      color:
                        activeTab === tab
                          ? theme.colors.primary
                          : tab === "item"
                          ? theme.colors.textMuted + "80"
                          : theme.colors.textMuted,
                      borderBottom:
                        activeTab === tab
                          ? `2px solid ${theme.colors.primary}`
                          : "2px solid transparent",
                      opacity: tab === "item" ? 0.5 : 1,
                    }}
                  >
                    {tabLabels[tab]}
                  </button>
                );
              })}
            </div>

            {/* 어빌리티 선택 */}
            <AbilitySelector
              abilities={filteredAbilities}
              abilityLevels={abilityLevels}
              onSelectAbility={handleSelectAbility}
              disabled={isExecuting}
            />

            {/* 도주 버튼 */}
            <div
              className="px-4 py-3 border-t flex justify-end"
              style={{ borderColor: theme.colors.border }}
            >
              <button
                onClick={handleFlee}
                disabled={isExecuting}
                className="px-4 py-2 font-mono text-sm transition-colors"
                style={{
                  background: "transparent",
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.textMuted,
                  opacity: isExecuting ? 0.5 : 1,
                }}
              >
                🏃 도주
              </button>
            </div>
          </>
        ) : (
          <BattleResult
            result={battle.result}
            monster={battle.monster}
            onClose={handleCloseBattle}
          />
        )}
      </div>
    </div>
  );
}

// 전투 결과 컴포넌트
interface BattleResultProps {
  result: "victory" | "defeat" | "fled" | "ongoing";
  monster: { nameKo: string; rewards: { exp: number; gold: number } } | null;
  onClose: () => void;
}

function BattleResult({ result, monster, onClose }: BattleResultProps) {
  const { theme } = useThemeStore();

  return (
    <div className="text-center py-6 font-mono">
      <div
        style={{
          color:
            result === "victory"
              ? theme.colors.success
              : result === "defeat"
              ? theme.colors.error
              : theme.colors.textMuted,
        }}
      >
        {result === "victory" && (
          <div>
            <div className="text-3xl mb-2">🎉</div>
            <div className="text-xl font-bold">승리!</div>
            {monster && (
              <div
                className="text-sm mt-2"
                style={{ color: theme.colors.textMuted }}
              >
                +{monster.rewards.exp} EXP
                {monster.rewards.gold > 0 && ` · +${monster.rewards.gold} Gold`}
              </div>
            )}
          </div>
        )}
        {result === "defeat" && (
          <div>
            <div className="text-3xl mb-2">💀</div>
            <div className="text-xl font-bold">패배...</div>
          </div>
        )}
        {result === "fled" && (
          <div>
            <div className="text-3xl mb-2">🏃</div>
            <div className="text-xl font-bold">도주 성공!</div>
          </div>
        )}
      </div>

      <button
        onClick={onClose}
        className="mt-4 px-6 py-2 font-mono text-sm transition-colors"
        style={{
          background: theme.colors.bgLight,
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.text,
        }}
      >
        닫기
      </button>
    </div>
  );
}
