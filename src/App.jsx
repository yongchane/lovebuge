import { useEffect, useState } from "react";

const isTestMode = window.location.pathname.endsWith("test.html");
const initialGameUi = {
  level: 1,
  toolName: "손",
  score: "0",
  combo: 0,
  timeLeft: 60,
  coins: "0",
  venueName: "공원길",
  range: 32,
  expText: "0 / 80",
  expPercent: 0,
  skillName: "스킬 대기",
  skillCharge: "잠김",
  skillDisabled: true,
  shopTab: "tool",
  skills: [],
  tools: [],
  venues: [],
  heroes: [],
  upgrades: [],
  selectedVenueId: "",
  selectedHeroId: "",
  currentToolId: "",
};

function Topbar({ gameUi, setScreen }) {
  return (
    <header className="topbar">
      <button className="profile-chip" type="button" onClick={() => setScreen("home")}>
        <span className="profile-avatar">♥</span>
        <span>
          <small>{isTestMode ? "TEST" : "방역ON"}</small>
          <strong>{isTestMode ? "레벨 테스트" : "LOVEBUG"}</strong>
        </span>
      </button>
      <div className="resource-strip" aria-label="보유 재화">
        <span className="wallet coin"><b id="coinText">{gameUi.coins}</b></span>
        <span className="wallet spray"><b>스프레이</b></span>
        <button id="soundToggle" className="icon-btn" type="button" aria-label="효과음 켜기">
          <span id="soundIcon">♪</span>
        </button>
      </div>
    </header>
  );
}

function TestPanel() {
  if (!isTestMode) return null;

  return (
    <section id="testPanel" className="test-panel">
      <label>
        <span>레벨 선택</span>
        <input id="levelSlider" type="range" min="1" max="100" defaultValue="1" />
      </label>
      <div className="test-actions">
        <button id="coinGrantButton" type="button">코인 +1000</button>
        <button id="venueRollButton" type="button">장소 랜덤</button>
      </div>
      <select id="venueSelect" aria-label="장소 선택" />
      <div id="toolList" className="tool-list" />
    </section>
  );
}

function Hud({ gameUi }) {
  const items = [
    ["남은 시간", "timeText", `${gameUi.timeLeft}s`],
    ["처치 점수", "scoreText", gameUi.score],
    ["킬 콤보", "comboText", `${gameUi.combo} HIT`],
    ["현장", "venueText", gameUi.venueName],
  ];

  return (
    <section className="hud-grid" aria-label="게임 상태">
      {items.map(([label, id, value]) => (
        <div className="hud-item" key={id}>
          <span>{label}</span>
          <strong id={id}>{value}</strong>
        </div>
      ))}
    </section>
  );
}

function Stage() {
  return (
    <section className="stage-wrap">
      <canvas id="gameCanvas" width="720" height="960" aria-label="러브버그 게임 화면" />
      <div id="startPanel" className="overlay-panel">
        <div className="pixel-badge">{isTestMode ? "TEST ZONE" : "출몰주의"}</div>
        <h2>{isTestMode ? "도구 테스트" : "60초 러브버그 슈팅"}</h2>
        <p>
          {isTestMode
            ? "레벨을 바꾸며 타격 범위와 스킬 상태를 확인하세요."
            : "조준점을 움직여 러브버그를 터치 사격으로 빠르게 처치하세요."}
        </p>
        <button id="startButton" className="primary-btn" type="button">
          {isTestMode ? "테스트 시작" : "방역 시작"}
        </button>
      </div>
      <div id="resultPanel" className="overlay-panel hidden">
        <div className="pixel-badge">현장 제압</div>
        <h2 id="resultTitle">러브버그 처치 완료!</h2>
        <p id="resultSummary" />
        <button id="restartButton" className="primary-btn" type="button">다시 사격</button>
      </div>
    </section>
  );
}

function HeroShowcase({ gameUi }) {
  return (
    <div className="hero-showcase">
      <img className="generated-hero-art" src="assets/generated/lovebug-hunter-squad.png" alt="" />
      <div className="hero-status">
        <span>러브버그 헌터 스쿼드</span>
        <strong>Lv.{Math.max(1, gameUi.level)} · {gameUi.toolName}</strong>
      </div>
    </div>
  );
}

function HomeScreen({ gameUi, setScreen }) {
  return (
    <section className="screen home-screen" aria-label="메인 화면">
      <div className="lobby-bg" />
      <div className="notice-card">
        <span>긴급 신고 접수 · 러브버그 대량 출몰</span>
      </div>
      <div className="lobby-brief">
        <span>헌터 본부</span>
        <h1>Lovebug Shooter</h1>
        <p>{gameUi.venueName} 현장에 홍길동·전우치·사무라이 팀을 투입하세요.</p>
      </div>
      <HeroShowcase gameUi={gameUi} />
      <div className="lobby-status-strip" aria-label="출동 상태">
        <button type="button" onClick={() => setScreen("map")}><b>{gameUi.venueName}</b><small>출몰 현장</small></button>
        <button type="button" onClick={() => setScreen("equipment")}><b>{gameUi.toolName}</b><small>장착 도구</small></button>
        <button type="button" onClick={() => setScreen("crew")}><b>헌터 동료</b><small>지원 사격</small></button>
      </div>
      <div className="mission-cta">
        <button className="side-cta map" type="button" onClick={() => setScreen("map")}><span>현장지도</span></button>
        <button className="ready-btn" type="button" onClick={() => setScreen("select")}>
          <small>BUG RUSH</small>
          <strong>사격 준비</strong>
          <span>브리핑 확인 후 러브버그 처치</span>
        </button>
        <button className="side-cta gear" type="button" onClick={() => setScreen("equipment")}><span>장비실</span></button>
      </div>
    </section>
  );
}

function ShopGrid({ gameUi }) {
  if (gameUi.shopTab === "tool") {
    return gameUi.upgrades.map((upgrade) => (
      <button
        className={`shop-card shop-card-large ${upgrade.maxed ? "equipped" : ""}`}
        type="button"
        data-upgrade={upgrade.id}
        disabled={upgrade.maxed || !upgrade.afford}
        key={upgrade.id}
      >
        <PixelIcon type={upgrade.id === "skillBattery" ? "skill" : "tool"} />
        <span>
          <b>{upgrade.name}</b>
          <small>{upgrade.desc}</small>
          <em>Lv.{upgrade.level}/{upgrade.maxLevel} · 다음 효과 {upgrade.nextEffect}</em>
        </span>
        <strong>{upgrade.maxed ? "MAX" : `${upgrade.cost}C`}</strong>
      </button>
    ));
  }

  if (gameUi.shopTab === "companion") {
    return gameUi.heroes.map((hero, index) => {
      const selected = hero.id === gameUi.selectedHeroId;
      return (
        <button className={`shop-card ${selected ? "equipped" : ""}`} type="button" data-placeholder={index} key={hero.id}>
          <SpritePreview kind="hero" item={hero} compact />
          <span><b>{hero.name}</b><small>{hero.role} - {hero.desc}</small></span>
          <strong>{selected ? "사격중" : "출전"}</strong>
        </button>
      );
    });
  }

  if (gameUi.shopTab === "place") {
    return gameUi.venues.map((venue, index) => {
      const selected = venue.id === gameUi.selectedVenueId;
      return (
        <button className={`shop-card ${selected ? "equipped" : ""}`} type="button" data-placeholder={index} key={venue.id}>
          <PixelIcon type="map" />
          <span><b>{venue.name}</b><small>{venue.meme || "러브버그 출몰 콘셉트"}</small></span>
          <strong>{selected ? "선택됨" : "선택"}</strong>
        </button>
      );
    });
  }

  return gameUi.skills.map((skill) => {
    const status = skill.locked ? `Lv.${skill.minLevel}` : skill.equipped ? "장착중" : skill.unlocked ? "장착" : `${skill.cost}C`;
    return (
      <button className={`shop-card ${skill.equipped ? "equipped" : ""}`} type="button" data-skill={skill.id} disabled={skill.locked || (!skill.unlocked && !skill.afford)} key={skill.id}>
        <SpritePreview kind="skill" compact />
        <span><b>{skill.name}</b><small>{skill.desc}</small></span>
        <strong>{status}</strong>
      </button>
    );
  });
}

function PixelIcon({ type }) {
  return <i className={`pixel-icon ${type}`} aria-hidden="true" />;
}

function StatusTag({ children }) {
  return <em className="status-tag">{children}</em>;
}

function spritePosition(index = 0, columns = 1, rows = 1) {
  const column = index % columns;
  const row = Math.floor(index / columns);
  const x = columns <= 1 ? 0 : (column / (columns - 1)) * 100;
  const y = rows <= 1 ? 0 : (row / (rows - 1)) * 100;
  return `${x}% ${y}%`;
}

function SpritePreview({ kind, item, compact = false }) {
  const className = `sprite-preview ${kind}-preview ${compact ? "compact" : ""}`;
  if (kind === "tool") {
    return (
      <i
        className={className}
        style={{ "--sprite-position": spritePosition(item?.sprite || 0, 4, 3) }}
        aria-hidden="true"
      />
    );
  }
  if (kind === "hero") {
    return (
      <i
        className={className}
        style={{ "--sprite-position": spritePosition(item?.sprite || 0, 3, 1) }}
        aria-hidden="true"
      />
    );
  }
  return <i className={className} aria-hidden="true" />;
}

function EquipmentScreen({ gameUi, setScreen }) {
  const currentTool = gameUi.tools.find((tool) => tool.id === gameUi.currentToolId);
  const equippedSkill = gameUi.skills.find((skill) => skill.equipped);
  const unlockedTools = gameUi.tools.filter((tool) => tool.level <= gameUi.level);

  return (
    <section className="screen loadout-screen equipment-screen" aria-label="장비">
      <div className="screen-heading">
        <span>슈터 도구실</span>
        <h1>도구와 스킬 점검</h1>
        <p>사격 범위, 자동 조준, 스킬 충전 상태를 확인합니다.</p>
      </div>
      <div className="equipped-summary">
        <article className="selected-card selected-tool">
          <SpritePreview kind="tool" item={currentTool} />
          <span>장착 도구</span>
          <strong>{gameUi.toolName}</strong>
          <small>사격 범위 {gameUi.range} · Lv.{currentTool?.level || gameUi.level}</small>
          <StatusTag>자동 장착</StatusTag>
        </article>
        <article className="selected-card selected-skill">
          <SpritePreview kind="skill" />
          <span>장착 슈팅 스킬</span>
          <strong>{equippedSkill?.name || gameUi.skillName}</strong>
          <small>{equippedSkill?.desc || gameUi.skillCharge}</small>
          <StatusTag>{equippedSkill ? "장착중" : "Lv.10 해금"}</StatusTag>
        </article>
      </div>
      <section className="inventory-panel" aria-label="보유 도구">
        <div className="shop-title">
          <span>해금 도구</span>
          <strong>{unlockedTools.length}/{gameUi.tools.length}</strong>
        </div>
        <div className="compact-list">
          {gameUi.tools.map((tool) => {
            const active = tool.id === gameUi.currentToolId;
            const locked = tool.level > gameUi.level;
            return (
              <article className={`compact-card ${active ? "selected" : ""} ${locked ? "locked" : ""}`} key={tool.id}>
                <SpritePreview kind="tool" item={tool} compact />
                <span>
                  <b>{tool.name}</b>
                  <small>Lv.{tool.level} · 범위 {Math.round(tool.radius)}</small>
                </span>
                <strong>{active ? "착용중" : locked ? "잠김" : "보유"}</strong>
              </article>
            );
          })}
        </div>
      </section>
      <button className="primary-btn" type="button" onClick={() => setScreen("shop")}>도구 강화하기</button>
    </section>
  );
}

function CrewScreen({ gameUi, setScreen }) {
  const selectedHero = gameUi.heroes.find((hero) => hero.id === gameUi.selectedHeroId);

  return (
    <section className="screen loadout-screen crew-screen" aria-label="동료">
      <div className="screen-heading">
        <span>헌터 동료</span>
        <h1>홍길동·전우치·사무라이</h1>
        <p>이전 캐릭터 3인을 러브버그 처치 스쿼드로 다시 투입합니다.</p>
      </div>
      <article className="selected-card selected-hero">
        <SpritePreview kind="hero" item={selectedHero} />
        <span>선택 동료</span>
        <strong>{selectedHero?.name || "동료 없음"}</strong>
        <small>{selectedHero ? `${selectedHero.role} · ${selectedHero.desc}` : "보급 상점에서 지원 동료를 선택하세요."}</small>
        <StatusTag>사격중</StatusTag>
      </article>
      <section className="inventory-panel" aria-label="동료 목록">
        <div className="shop-title">
          <span>동료 목록</span>
          <strong>{gameUi.heroes.length}명</strong>
        </div>
        <div className="compact-list">
          {gameUi.heroes.map((hero) => {
            const selected = hero.id === gameUi.selectedHeroId;
            return (
              <article className={`compact-card ${selected ? "selected" : ""}`} key={hero.id}>
                <SpritePreview kind="hero" item={hero} compact />
                <span>
                  <b>{hero.name}</b>
                  <small>{hero.role}</small>
                </span>
                <strong>{selected ? "선택됨" : "대기"}</strong>
              </article>
            );
          })}
        </div>
      </section>
      <button className="primary-btn" type="button" onClick={() => setScreen("shop")}>헌터 교체</button>
    </section>
  );
}

function MapScreen({ gameUi, setScreen }) {
  const selectedVenue = gameUi.venues.find((venue) => venue.id === gameUi.selectedVenueId);

  return (
    <section className="screen loadout-screen map-screen" aria-label="지도">
      <div className="screen-heading">
        <span>출몰 지도</span>
        <h1>현장 배치도</h1>
        <p>러브버그가 몰리는 사격 라인과 출몰 지점을 확인합니다.</p>
      </div>
      <article className="venue-hero-card">
        <img src={selectedVenue?.image || "assets/maps/han-river-park.png"} alt="" />
        <div>
          <span>선택 장소</span>
          <strong>{selectedVenue?.name || gameUi.venueName}</strong>
          <small>{selectedVenue?.meme || "러브버그 출몰 지역"}</small>
        </div>
        <StatusTag>출동 위치</StatusTag>
      </article>
      <section className="inventory-panel" aria-label="장소 목록">
        <div className="shop-title">
          <span>장소 목록</span>
          <strong>{gameUi.venues.length}곳</strong>
        </div>
        <div className="compact-list venue-list">
          {gameUi.venues.map((venue) => {
            const selected = venue.id === gameUi.selectedVenueId;
            return (
              <article className={`compact-card ${selected ? "selected" : ""}`} key={venue.id}>
                <PixelIcon type="map" />
                <span>
                  <b>{venue.name}</b>
                  <small>{venue.meme}</small>
                </span>
                <strong>{selected ? "선택됨" : "후보"}</strong>
              </article>
            );
          })}
        </div>
      </section>
      <button className="primary-btn" type="button" onClick={() => setScreen("shop")}>사격 현장 선택</button>
    </section>
  );
}

function ShopScreen({ gameUi, setScreen }) {
  return (
    <section className="screen shop-screen" aria-label="상점">
      <div className="screen-heading">
        <span>슈터 보급소</span>
        <h1>도구와 헌터 강화</h1>
        <p>도구 효과, 스킬, 헌터, 현장을 사격 세팅에 맞춰 정리합니다.</p>
      </div>
      <div className="dock-tabs" aria-label="상점 탭">
        <button className={`dock-tab ${gameUi.shopTab === "tool" ? "active" : ""}`} data-tab="tool" type="button">강화</button>
        <button className={`dock-tab ${gameUi.shopTab === "skill" ? "active" : ""}`} data-tab="skill" type="button">스킬</button>
        <button className={`dock-tab ${gameUi.shopTab === "companion" ? "active" : ""}`} data-tab="companion" type="button">동료</button>
        <button className={`dock-tab ${gameUi.shopTab === "place" ? "active" : ""}`} data-tab="place" type="button">장소</button>
      </div>
      <section className="shop-panel shop-panel-main" aria-label="상점 목록">
        <div className="shop-title">
          <span>{gameUi.shopTab === "tool" ? "도구 강화" : "출격 카드"}</span>
          <strong>{gameUi.coins}C 보유</strong>
        </div>
        <div id="skillShop" className="shop-grid">
          <ShopGrid gameUi={gameUi} />
        </div>
      </section>
      <div className="future-slots" aria-label="빠른 이동">
        <button type="button">도구 강화</button>
        <button type="button">헌터 편성</button>
      </div>
      <button className="primary-btn" type="button" onClick={() => setScreen("select")}>사격 준비</button>
    </section>
  );
}

function SelectScreen({ gameUi, setScreen }) {
  const currentTool = gameUi.tools.find((tool) => tool.id === gameUi.currentToolId);
  const equippedSkill = gameUi.skills.find((skill) => skill.equipped);
  const selectedHero = gameUi.heroes.find((hero) => hero.id === gameUi.selectedHeroId);
  const selectedVenue = gameUi.venues.find((venue) => venue.id === gameUi.selectedVenueId);
  const startRun = () => {
    setScreen("play");
    requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("lovebug:start-run")));
  };

  return (
    <section className="screen select-screen" aria-label="게임 선택">
      <div className="screen-heading">
        <span>오늘의 러브버그 사격 브리핑</span>
        <h1>현장 사격 준비</h1>
        <p>장소, 도구, 스킬, 헌터를 확인하고 60초 러브버그 슈팅에 들어갑니다.</p>
      </div>
      <article
        className="briefing-card"
        style={{ "--venue-image": `url(${selectedVenue?.image || "assets/maps/han-river-park.png"})` }}
      >
        <span>신고 집중 지역</span>
        <strong>{selectedVenue?.name || gameUi.venueName}</strong>
        <small>{selectedVenue?.meme || "러브버그 출몰 지역"} · 목표: 60초 동안 최대 처치</small>
      </article>
      <div className="loadout-grid">
        <article className="selected-card">
          <SpritePreview kind="tool" item={currentTool} />
          <span>도구</span>
          <strong>{gameUi.toolName}</strong>
          <small>사격 범위 {gameUi.range}</small>
        </article>
        <article className="selected-card">
          <SpritePreview kind="skill" />
          <span>스킬</span>
          <strong>{gameUi.skillName}</strong>
          <small>{equippedSkill?.desc || gameUi.skillCharge}</small>
        </article>
        <article className="selected-card">
          <SpritePreview kind="hero" item={selectedHero} />
          <span>헌터</span>
          <strong>{selectedHero?.name || "홍길동"}</strong>
          <small>{selectedHero?.role || "지원 사격"}</small>
        </article>
        <article
          className="selected-card venue-tile"
          style={{ "--venue-image": `url(${selectedVenue?.image || "assets/maps/han-river-park.png"})` }}
        >
          <span>장소</span>
          <strong>{selectedVenue?.name || gameUi.venueName}</strong>
          <small>{selectedVenue?.meme || "출몰 지역"}</small>
        </article>
      </div>
      <div className="select-actions">
        <button className="secondary-btn" type="button" onClick={() => setScreen("shop")}>도구 교체</button>
        <button className="primary-btn" type="button" onClick={startRun}>사격 시작!</button>
      </div>
    </section>
  );
}

function PlayScreen({ gameUi }) {
  return (
    <section className="screen play-screen" aria-label="플레이 화면">
      <Stage />
      <Hud gameUi={gameUi} />
      <section className="battle-dock">
        <div>
          <div className="meter-label">
            <span>도구 성장</span>
            <strong id="expText">{gameUi.expText}</strong>
          </div>
          <div className="meter"><span id="expBar" style={{ width: `${gameUi.expPercent}%` }} /></div>
        </div>
        <button id="skillButton" className="skill-btn main-skill" type="button" disabled={gameUi.skillDisabled}>
          <span id="skillName">{gameUi.skillName}</span>
          <strong id="skillCharge">{gameUi.skillCharge}</strong>
        </button>
      </section>
    </section>
  );
}

export default function App() {
  const [gameUi, setGameUi] = useState(initialGameUi);
  const [screen, setScreen] = useState(isTestMode ? "play" : "home");

  useEffect(() => {
    const onUpdate = (event) => setGameUi(event.detail);
    window.addEventListener("lovebug:update", onUpdate);
    import("./gameEngine.js");
    return () => window.removeEventListener("lovebug:update", onUpdate);
  }, []);

  return (
    <main className="app-shell">
      <section className="game-card" aria-label={isTestMode ? "러브버그 클린업 테스트" : "러브버그 클린업 게임"}>
        <Topbar gameUi={gameUi} setScreen={setScreen} />
        <TestPanel />
        <div className="screen-stack">
          <div className={screen === "home" ? "screen-pane active" : "screen-pane"}>
            <HomeScreen gameUi={gameUi} setScreen={setScreen} />
          </div>
          <div className={screen === "shop" ? "screen-pane active" : "screen-pane"}>
            <ShopScreen gameUi={gameUi} setScreen={setScreen} />
          </div>
          <div className={screen === "equipment" ? "screen-pane active" : "screen-pane"}>
            <EquipmentScreen gameUi={gameUi} setScreen={setScreen} />
          </div>
          <div className={screen === "crew" ? "screen-pane active" : "screen-pane"}>
            <CrewScreen gameUi={gameUi} setScreen={setScreen} />
          </div>
          <div className={screen === "map" ? "screen-pane active" : "screen-pane"}>
            <MapScreen gameUi={gameUi} setScreen={setScreen} />
          </div>
          <div className={screen === "select" ? "screen-pane active" : "screen-pane"}>
            <SelectScreen gameUi={gameUi} setScreen={setScreen} />
          </div>
          <div className={screen === "play" ? "screen-pane active" : "screen-pane"}>
            <PlayScreen gameUi={gameUi} />
          </div>
        </div>
        {!isTestMode && screen !== "play" && <BottomNav screen={screen} setScreen={setScreen} />}
      </section>
    </main>
  );
}

function BottomNav({ screen, setScreen }) {
  const items = [
    ["로비", "home", "home"],
    ["장비", "equipment", "gear"],
    ["동료", "crew", "crew"],
    ["지도", "map", "map"],
    ["상점", "shop", "shop"],
  ];

  return (
    <nav className="bottom-nav" aria-label="하단 메뉴">
      {items.map(([label, target, icon]) => (
        <button className={screen === target ? "active" : ""} type="button" onClick={() => setScreen(target)} key={label}>
          <span className={`nav-icon ${icon}`} />
          <strong>{label}</strong>
        </button>
      ))}
    </nav>
  );
}
