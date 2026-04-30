# Lovebug Hunter Growth System

## 1. Growth Design Goal

100 levels should feel long enough to grow, but not exhausting. The player should get a visible reward often, while major tool changes happen at memorable milestones.

Core loop:

```text
Play one 60-second round
-> catch lovebugs
-> gain score, coin, exp
-> level up
-> unlock stronger tool tier or tool effect
-> upgrade tool stats with coins
-> play again with better catch feel
```

Design principles:

- A major tool tier unlocks every 10 levels.
- Every 5 levels adds a visible effect upgrade.
- Every level gives at least one stat increase.
- Effects should be cute, pixel-like, and not gruesome.
- Use "catch", "clear", "pop", "shoo", and "repel" language rather than violent wording.

## 2. Core Stats

Each tool and level can modify these stats.

```ts
type GrowthStats = {
  tapRadius: number;          // touch hit radius in pixels
  catchPower: number;         // how many normal lovebugs can be cleared per action
  bonusScoreRate: number;     // score multiplier
  coinBonusRate: number;      // coin multiplier
  comboWindowMs: number;      // allowed time between catches
  skillCooldownSec: number;   // active skill cooldown
  chainChance: number;        // chance to affect nearby lovebugs
  autoCatchPerSec: number;    // passive catch rate
};
```

Recommended baseline:

```text
Lv.1 tapRadius: 28
Lv.100 tapRadius: 120

Lv.1 score multiplier: x1.00
Lv.100 score multiplier: x6.00

Lv.1 combo window: 900ms
Lv.100 combo window: 1800ms
```

## 3. Exp Curve

Use a soft exponential curve so early levels are fast and late levels still feel reachable.

```ts
requiredExp(level) = floor(80 + level * 45 + Math.pow(level, 1.65) * 18)
```

Milestone pacing:

```text
Lv.1-10: learn the loop, 1-3 rounds per major unlock
Lv.11-40: frequent upgrades, 3-6 rounds per major unlock
Lv.41-70: stronger effects, 6-10 rounds per major unlock
Lv.71-100: prestige-like late game, 10+ rounds per major unlock
```

## 4. Tool Tier Overview

| Level | Tool Tier | Theme | Main Feel |
|---:|---|---|---|
| 1 | Bare Hand | tap | precise single catch |
| 5 | Gloved Hand | safer tap | bigger tap radius |
| 10 | Wooden Stick | poke | small line hit |
| 20 | Rolled Newspaper | slap | wider area hit |
| 30 | Fly Swatter | smack | circular splash |
| 40 | Sticky Paddle | capture | combo and coin bonus |
| 50 | Bug Spray | cloud | short area damage over time |
| 60 | Electric Swatter | zap | chain clear |
| 70 | Fan Blower | push | lane sweep |
| 80 | Mini Repel Turret | auto | passive targeting |
| 90 | Clean Zone Drone | smart auto | periodic smart clear |
| 100 | Lovebug Guardian EX | ultimate | screen-wide special burst |

## 5. Level-by-Level Growth Table

| Lv | Tool / Upgrade | Gameplay Effect | Pixel Effect |
|---:|---|---|---|
| 1 | Bare Hand I | Basic single tap catch. tapRadius 28. | Small white pixel pop. |
| 2 | Bare Hand II | tapRadius +2, score +2%. | 2-frame pop sparkle. |
| 3 | Bare Hand III | comboWindow +50ms. | Tiny combo number bounce. |
| 4 | Bare Hand IV | coin +3%. | Yellow coin pixel blink. |
| 5 | Gloved Hand I | New tool. tapRadius 38. | Soft glove stamp effect. |
| 6 | Gloved Hand II | catch response faster, tapRadius +2. | Blue-white tap ring. |
| 7 | Gloved Hand III | combo score +5%. | Combo text gets small shine. |
| 8 | Gloved Hand IV | 3% chance to catch 1 nearby bug. | Mini side-pop. |
| 9 | Gloved Hand V | coin +5%, comboWindow +50ms. | Coin trail on catch. |
| 10 | Wooden Stick I | New tool. Short line hit in tap direction. | Brown pixel slash. |
| 11 | Wooden Stick II | line length +8px. | Longer slash trail. |
| 12 | Wooden Stick III | score +5%. | Orange hit spark. |
| 13 | Wooden Stick IV | chainChance 5%. | Small rebound tick. |
| 14 | Wooden Stick V | comboWindow +75ms. | Combo meter pulse. |
| 15 | Wooden Stick Plus | Minor tier. line hit can clear 2 normal bugs. | Double slash frame. |
| 16 | Wooden Stick Plus II | tapRadius +3. | Wider slash particles. |
| 17 | Wooden Stick Plus III | coin +5%. | Pixel coin burst. |
| 18 | Wooden Stick Plus IV | fast lovebug slow-on-hit 0.4s. | Tiny dizzy star, cute style. |
| 19 | Wooden Stick Plus V | score +8%. | Red-orange impact pop. |
| 20 | Rolled Newspaper I | New tool. Wider slap cone. | Paper slap sprite. |
| 21 | Rolled Newspaper II | cone width +8 degrees. | Paper dust pixels. |
| 22 | Rolled Newspaper III | catchPower +1 for normal bugs. | Two-pop effect. |
| 23 | Rolled Newspaper IV | comboWindow +75ms. | Combo meter gets paper icon. |
| 24 | Rolled Newspaper V | coin +7%. | Falling coin pixels. |
| 25 | Rolled Newspaper Plus | Active skill unlock: Quick Slap, 5s cooldown. | Fast paper afterimage. |
| 26 | Quick Slap II | skill cooldown -0.3s. | Brighter afterimage. |
| 27 | Quick Slap III | score +10%. | Score text shake. |
| 28 | Quick Slap IV | chainChance 8%. | Sideways paper flick. |
| 29 | Quick Slap V | tapRadius +4. | Bigger paper stamp. |
| 30 | Fly Swatter I | New tool. Circular splash around tap. | Green swatter impact ring. |
| 31 | Fly Swatter II | splash radius +6px. | Ring expands 1 extra frame. |
| 32 | Fly Swatter III | catchPower +1. | Multi-pop sparkles. |
| 33 | Fly Swatter IV | combo score +10%. | Combo number turns gold at 20+. |
| 34 | Fly Swatter V | coin +8%. | Gold pixel crumbs. |
| 35 | Fly Swatter Plus | Perfect Catch: centered taps give +30% score. | Bullseye pixel flash. |
| 36 | Perfect Catch II | perfect radius +4px. | Bullseye ring clearer. |
| 37 | Perfect Catch III | comboWindow +100ms. | Combo bar lingers longer. |
| 38 | Perfect Catch IV | chainChance 10%. | Tiny green ricochet pixels. |
| 39 | Perfect Catch V | score +12%. | Impact ring color upgrade. |
| 40 | Sticky Paddle I | New tool. Catches and sticks nearby bugs briefly. | Purple sticky splash. |
| 41 | Sticky Paddle II | sticky radius +6px. | Goo pixels, cute round blobs. |
| 42 | Sticky Paddle III | coin +10%. | Bugs turn into coin puffs. |
| 43 | Sticky Paddle IV | combo does not break once per round. | Combo shield icon. |
| 44 | Sticky Paddle V | catchPower +1. | Triple pop. |
| 45 | Sticky Paddle Plus | Sticky Combo: every 15 combo gives coin bonus. | Combo coin rain. |
| 46 | Sticky Combo II | bonus coin +10%. | Denser coin rain. |
| 47 | Sticky Combo III | tapRadius +5. | Wider sticky stamp. |
| 48 | Sticky Combo IV | fast bugs slow 0.7s. | Blue sticky slow sparkle. |
| 49 | Sticky Combo V | score +15%. | Purple-gold pop. |
| 50 | Bug Spray I | New tool. Cone spray active skill, 8s cooldown. | Mint spray cloud. |
| 51 | Bug Spray II | spray duration +0.2s. | Cloud lasts longer. |
| 52 | Bug Spray III | spray width +10 degrees. | Wider mist pixels. |
| 53 | Bug Spray IV | coin +12%. | Mint coin sparkle. |
| 54 | Bug Spray V | comboWindow +100ms. | Combo bar gets mist trail. |
| 55 | Bug Spray Plus | Lingering Cloud: area remains 1.0s. | Transparent mint cloud tile. |
| 56 | Lingering Cloud II | cloud duration +0.2s. | Cloud edge shimmer. |
| 57 | Lingering Cloud III | catchPower +1 in cloud. | Multi-clear puff. |
| 58 | Lingering Cloud IV | skill cooldown -0.5s. | Spray can quick blink. |
| 59 | Lingering Cloud V | score +18%. | Mint star burst. |
| 60 | Electric Swatter I | New tool. Chain zap to 1 nearby bug. | Yellow pixel lightning. |
| 61 | Electric Swatter II | chainChance 20%. | Longer lightning link. |
| 62 | Electric Swatter III | chain range +10px. | Link sparkle. |
| 63 | Electric Swatter IV | coin +15%. | Electric coin pop. |
| 64 | Electric Swatter V | combo score +15%. | Combo text gains lightning icon. |
| 65 | Electric Swatter Plus | Chain can hit 2 nearby bugs. | Forked lightning. |
| 66 | Chain Zap II | chainChance +5%. | Brighter fork. |
| 67 | Chain Zap III | tapRadius +6. | Electric ring. |
| 68 | Chain Zap IV | skill cooldown -0.5s. | Swatter glow pulse. |
| 69 | Chain Zap V | score +20%. | Yellow-white impact flash. |
| 70 | Fan Blower I | New tool. Horizontal lane sweep skill. | Wind stripe pixels. |
| 71 | Fan Blower II | lane height +8px. | Wider wind stripe. |
| 72 | Fan Blower III | slow all visible bugs 0.5s after sweep. | Pale blue slow frame. |
| 73 | Fan Blower IV | coin +16%. | Wind-carried coins. |
| 74 | Fan Blower V | comboWindow +125ms. | Combo bar wave motion. |
| 75 | Fan Blower Plus | Double Sweep: second weaker lane follows. | Two wind bands. |
| 76 | Double Sweep II | second sweep power +20%. | Stronger second band. |
| 77 | Double Sweep III | lane height +6px. | Wind band thickens. |
| 78 | Double Sweep IV | chainChance 15% after sweep. | Wind ricochet pixels. |
| 79 | Double Sweep V | score +24%. | Blue-white burst. |
| 80 | Mini Repel Turret I | New tool. Passive auto-catch 0.3/sec. | Tiny turret pew pixel. |
| 81 | Mini Repel Turret II | autoCatchPerSec +0.05. | Faster pew blink. |
| 82 | Mini Repel Turret III | turret targets golden bugs first at low chance. | Gold target reticle. |
| 83 | Mini Repel Turret IV | coin +18%. | Coin reticle sparkle. |
| 84 | Mini Repel Turret V | tapRadius +7. | Wider manual tap ring. |
| 85 | Twin Turret | Second mini shot every 5s. | Dual pew pixels. |
| 86 | Twin Turret II | second shot interval -0.4s. | Dual blink faster. |
| 87 | Twin Turret III | combo score +18%. | Combo reticle icon. |
| 88 | Twin Turret IV | auto catches count toward combo at 50% value. | Auto combo tick. |
| 89 | Twin Turret V | score +28%. | Reticle burst upgrade. |
| 90 | Clean Zone Drone I | New tool. Drone smart-clears cluster every 6s. | Small drone shadow and beam. |
| 91 | Clean Zone Drone II | drone cooldown -0.3s. | Beam charges faster. |
| 92 | Clean Zone Drone III | cluster radius +8px. | Wider beam circle. |
| 93 | Clean Zone Drone IV | coin +20%. | Beam converts to coin pixels. |
| 94 | Clean Zone Drone V | comboWindow +150ms. | Combo bar gets drone light. |
| 95 | Drone Swarm | Two drones alternate cluster clears. | Two beam colors. |
| 96 | Drone Swarm II | drone cooldown -0.5s. | Alternating beam rhythm. |
| 97 | Drone Swarm III | chainChance 25% after drone hit. | Beam-to-zap sparkle. |
| 98 | Drone Swarm IV | auto catches count toward combo at full value. | Auto combo shine. |
| 99 | Drone Swarm V | score +35%, coin +25%. | Gold-blue screen sparkle. |
| 100 | Lovebug Guardian EX | Final tool. Ultimate clears all visible normal bugs every charged use. | Full-screen rainbow pixel clean burst. |

## 6. Major Tool Details

### Lv.1-4: Bare Hand

Purpose: teach tap accuracy.

Effect:

```text
Single target catch.
Small tap radius.
No special skill.
```

Visual:

```text
White pixel pop
Small hand cursor stamp
No bug detail, only cute disappearance puff
```

### Lv.5-9: Gloved Hand

Purpose: make the first upgrade immediately noticeable.

Effect:

```text
Larger tap radius.
Slightly easier combo maintenance.
Very low nearby catch chance.
```

Visual:

```text
Blue glove stamp
Soft rounded impact pixels
```

### Lv.10-19: Wooden Stick

Purpose: introduce directional attack.

Effect:

```text
Tap creates a short line-shaped hitbox.
Can catch bugs aligned around the tap.
Starts feeling more like a tool.
```

Visual:

```text
Brown slash
Tiny wood chip pixels
```

### Lv.20-29: Rolled Newspaper

Purpose: introduce active skill.

Effect:

```text
Wider cone hitbox.
Quick Slap active skill with short cooldown.
Good for catching small groups.
```

Visual:

```text
Paper slap afterimage
Gray dust puff
```

### Lv.30-39: Fly Swatter

Purpose: classic bug-catching fantasy.

Effect:

```text
Circular splash hitbox.
Perfect Catch score bonus for accurate taps.
Good touch feel and combo scoring.
```

Visual:

```text
Green swatter stamp
Circular pixel shockwave
```

### Lv.40-49: Sticky Paddle

Purpose: add combo and economy strategy.

Effect:

```text
Nearby bugs are briefly held in place.
Combo protection once per round.
Combo milestones grant coin bonus.
```

Visual:

```text
Cute purple sticky splash
Soft blob particles
```

### Lv.50-59: Bug Spray

Purpose: add area control.

Effect:

```text
Cone spray skill.
Lingering cloud catches bugs that pass through.
Strong against dense waves.
```

Visual:

```text
Mint cloud
Transparent pixel mist
```

### Lv.60-69: Electric Swatter

Purpose: make late-game catches feel powerful.

Effect:

```text
Tap can chain to nearby bugs.
Chain count and chance increase.
Excellent against clusters.
```

Visual:

```text
Yellow pixel lightning
Small electric ring
```

### Lv.70-79: Fan Blower

Purpose: add lane-based sweep control.

Effect:

```text
Horizontal sweep skill clears or pushes a lane.
Slows remaining visible bugs.
Double Sweep at Lv.75.
```

Visual:

```text
Blue wind bands
Pixel leaf-like motion lines, abstract not realistic
```

### Lv.80-89: Mini Repel Turret

Purpose: introduce passive automation without removing player agency.

Effect:

```text
Passive auto-catch.
Prioritizes valuable targets sometimes.
Auto catches partially count toward combo after Lv.88.
```

Visual:

```text
Tiny turret icon
Small reticle
Clean pew effect
```

### Lv.90-99: Clean Zone Drone

Purpose: premium late-game fantasy.

Effect:

```text
Drone clears clustered lovebugs on a timer.
Two drones unlock at Lv.95.
Auto catches fully support combo at Lv.98.
```

Visual:

```text
Small drone shadow
Vertical clean beam
Gold-blue sparkle
```

### Lv.100: Lovebug Guardian EX

Purpose: final capstone reward.

Effect:

```text
Ultimate skill charges through catches.
When used, clears all visible normal lovebugs.
Special bugs take heavy damage or are stunned.
Large score and combo bonus.
```

Visual:

```text
Full-screen pixel clean burst
Rainbow ring
Big but readable celebration text
```

## 7. Recommended Unlock Copy

Use cheerful and non-gory text.

```text
Lv.5  "장갑 장착! 이제 조금 더 쉽게 잡아요."
Lv.10 "나무 막대기 해금! 톡톡 멀리까지!"
Lv.20 "신문지 해금! 빠른 찰싹 스킬!"
Lv.30 "파리채 해금! 주변까지 한 번에!"
Lv.40 "끈끈이 패들 해금! 콤보를 놓치지 마세요."
Lv.50 "방충 스프레이 해금! 구름으로 길목 차단!"
Lv.60 "전기 파리채 해금! 찌릿찌릿 연쇄 퇴치!"
Lv.70 "선풍기 해금! 한 줄을 시원하게 정리!"
Lv.80 "미니 터렛 해금! 자동으로 도와줘요."
Lv.90 "클린존 드론 해금! 똑똑한 공중 지원!"
Lv.100 "가디언 EX 완성! 러브버그 대청소 시작!"
```

## 8. Coin Upgrade Layers

Level unlocks the tool, and coins strengthen it.

Each tool can have 5 upgrade ranks.

```text
Rank 1: unlocked by level
Rank 2: +5% score or radius
Rank 3: skill cooldown reduction
Rank 4: extra coin/combo effect
Rank 5: visual skin and stronger special effect
```

Example:

```text
Fly Swatter Rank 1: splash radius 56
Fly Swatter Rank 2: splash radius 62
Fly Swatter Rank 3: perfect catch bonus +10%
Fly Swatter Rank 4: combo score +10%
Fly Swatter Rank 5: golden swatter skin, splash radius 70
```

## 9. Balancing Notes

Avoid making automation too strong before Lv.80. The fun should still come from tapping.

Recommended power distribution:

```text
Lv.1-29: player tap skill matters 90%
Lv.30-59: player tap skill 75%, tool effects 25%
Lv.60-79: player tap skill 60%, chain/sweep effects 40%
Lv.80-100: player tap skill 50%, automation and ultimate 50%
```

Expected average catches per 60-second round:

```text
Lv.1: 35-50
Lv.10: 55-75
Lv.30: 90-130
Lv.50: 140-190
Lv.70: 200-270
Lv.90: 300-420
Lv.100: 450+
```

## 10. Data-Oriented Implementation Shape

Keep growth data as config so balance can change without touching game logic.

```ts
type ToolTierId =
  | "bare_hand"
  | "gloved_hand"
  | "wooden_stick"
  | "rolled_newspaper"
  | "fly_swatter"
  | "sticky_paddle"
  | "bug_spray"
  | "electric_swatter"
  | "fan_blower"
  | "mini_turret"
  | "clean_zone_drone"
  | "guardian_ex";

type LevelGrowth = {
  level: number;
  toolTierId: ToolTierId;
  title: string;
  unlockType: "stat" | "minor_effect" | "major_tool" | "active_skill" | "ultimate";
  stats: Partial<GrowthStats>;
  effectId: string;
  pixelEffectId: string;
  unlockCopy?: string;
};
```

Game logic should read the current level and equipped tool, then compose:

```text
base tool stats
+ level growth stats
+ coin upgrade rank stats
+ temporary round buffs
```

