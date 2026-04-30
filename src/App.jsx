import { useEffect, useState } from "react";

const isTestMode = window.location.pathname.endsWith("test.html");
const initialGameUi = {
  level: 1,
  toolName: "손",
  score: "0",
  combo: 0,
  coins: "0",
  venueName: "공원길",
  range: 32,
  expText: "0 / 80",
  expPercent: 0,
  skillName: "스킬 대기",
  skillCharge: "잠김",
  skillDisabled: true,
  shopTab: "skill",
  skills: [],
  tools: [],
  venues: [],
  heroes: [],
  selectedVenueId: "",
  selectedHeroId: "",
  currentToolId: "",
};

function Topbar() {
  return (
    <header className="topbar">
      <div>
        {isTestMode ? (
          <>
            <p className="eyebrow">TEST MODE</p>
            <h1>레벨 테스트</h1>
          </>
        ) : (
          <h1 className="eyebrow">LOVEBUG CLEANUP</h1>
        )}
      </div>
      <button id="soundToggle" className="icon-btn" type="button" aria-label="효과음 켜기">
        <span id="soundIcon">♪</span>
      </button>
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
    ["Lv", "levelText", gameUi.level],
    ["도구", "toolText", gameUi.toolName],
    ["점수", "scoreText", gameUi.score],
    ["콤보", "comboText", gameUi.combo],
    ["장소", "venueText", gameUi.venueName],
    ["범위", "rangeText", gameUi.range],
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
        <div className="pixel-badge">{isTestMode ? "테스트 모드" : "60초 타임어택"}</div>
        <h2>{isTestMode ? "레벨과 장소를 바꿔가며 도구를 확인하세요" : "몰려드는 러브버그를 톡톡 정리하세요"}</h2>
        <p>
          {isTestMode
            ? "슬라이더로 레벨을 바꾸면 도구, 타격 범위, 스킬 잠금 상태가 즉시 바뀝니다."
            : "쌍으로 날아오고, 습한 풀밭과 흰 차량 주변에 더 자주 모여요. 많이 잡을수록 도구가 업그레이드됩니다."}
        </p>
        <button id="startButton" className="primary-btn" type="button">
          {isTestMode ? "테스트 시작" : "게임 시작"}
        </button>
      </div>
      <div id="resultPanel" className="overlay-panel hidden">
        <div className="pixel-badge">결과</div>
        <h2 id="resultTitle">클린업 완료</h2>
        <p id="resultSummary" />
        <button id="restartButton" className="primary-btn" type="button">다시 하기</button>
      </div>
    </section>
  );
}

function ShopGrid({ gameUi }) {
  if (gameUi.shopTab === "tool") {
    const cards = [
      ["도구 강화", "현재 도구의 타격 범위와 점수 보너스 강화", "준비"],
      ["이펙트 강화", "타격 스플래시와 흔들림 강화", "준비"],
    ];
    return cards.map(([title, desc, status], index) => (
      <button className="shop-card" type="button" data-placeholder={index} key={title}>
        <span><b>{title}</b><small>{desc}</small></span>
        <strong>{status}</strong>
      </button>
    ));
  }

  if (gameUi.shopTab === "companion") {
    return gameUi.heroes.map((hero, index) => {
      const selected = hero.id === gameUi.selectedHeroId;
      return (
        <button className={`shop-card ${selected ? "equipped" : ""}`} type="button" data-placeholder={index} key={hero.id}>
          <span><b>{hero.name}</b><small>{hero.role} - {hero.desc}</small></span>
          <strong>{selected ? "출전중" : "출전"}</strong>
        </button>
      );
    });
  }

  if (gameUi.shopTab === "place") {
    return gameUi.venues.map((venue, index) => {
      const selected = venue.id === gameUi.selectedVenueId;
      return (
        <button className={`shop-card ${selected ? "equipped" : ""}`} type="button" data-placeholder={index} key={venue.id}>
          <span><b>{venue.name}</b><small>{venue.meme || "러브버그 출몰 콘셉트"}</small></span>
          <strong>{selected ? "선택됨" : "선택"}</strong>
        </button>
      );
    });
  }

  return gameUi.skills.map((skill) => {
    const status = skill.locked ? `Lv.${skill.minLevel}` : skill.equipped ? "장착중" : skill.unlocked ? "장착" : `${skill.cost}C`;
    return (
      <button className={`shop-card ${skill.equipped ? "equipped" : ""}`} type="button" data-skill={skill.id} disabled={skill.locked} key={skill.id}>
        <span><b>{skill.name}</b><small>{skill.desc}</small></span>
        <strong>{status}</strong>
      </button>
    );
  });
}

function BottomPanel({ gameUi }) {
  return (
    <section className="bottom-panel">
      <div className={isTestMode ? undefined : "dock-status"}>
        <div>
          <div className="meter-label">
            <span>다음 레벨</span>
            <strong id="expText">{gameUi.expText}</strong>
          </div>
          <div className="meter"><span id="expBar" style={{ width: `${gameUi.expPercent}%` }} /></div>
        </div>
        {!isTestMode && <div className="coin-pill">코인 <strong id="coinText">{gameUi.coins}</strong></div>}
      </div>
      {isTestMode ? (
        <div className="tool-row">
          <button id="skillButton" className="skill-btn" type="button" disabled={gameUi.skillDisabled}>
            <span id="skillName">{gameUi.skillName}</span>
            <strong id="skillCharge">{gameUi.skillCharge}</strong>
          </button>
          <div className="coin-pill">코인 <strong id="coinText">{gameUi.coins}</strong></div>
        </div>
      ) : (
        <div className="dock-tabs" aria-label="상점 탭">
          <button className={`dock-tab ${gameUi.shopTab === "skill" ? "active" : ""}`} type="button">스킬</button>
          <button className={`dock-tab ${gameUi.shopTab === "tool" ? "active" : ""}`} type="button">도구</button>
          <button className={`dock-tab ${gameUi.shopTab === "companion" ? "active" : ""}`} type="button">동료</button>
          <button className={`dock-tab ${gameUi.shopTab === "place" ? "active" : ""}`} type="button">장소</button>
        </div>
      )}
      <div className={isTestMode ? undefined : "dock-content"}>
        {!isTestMode && (
          <button id="skillButton" className="skill-btn main-skill" type="button" disabled={gameUi.skillDisabled}>
            <span id="skillName">{gameUi.skillName}</span>
            <strong id="skillCharge">{gameUi.skillCharge}</strong>
          </button>
        )}
        <section className="shop-panel" aria-label="스킬 상점">
          <div className="shop-title">
            <span>스킬 상점</span>
            <strong>{isTestMode ? "테스트 구매/장착" : "코인으로 구매"}</strong>
          </div>
          <div id="skillShop" className="shop-grid">
            <ShopGrid gameUi={gameUi} />
          </div>
        </section>
        {!isTestMode && (
          <div className="future-slots" aria-label="추후 구매 슬롯">
            <button type="button">도구 강화</button>
            <button type="button">동료 슬롯</button>
          </div>
        )}
      </div>
    </section>
  );
}

export default function App() {
  const [gameUi, setGameUi] = useState(initialGameUi);

  useEffect(() => {
    const onUpdate = (event) => setGameUi(event.detail);
    window.addEventListener("lovebug:update", onUpdate);
    import("./gameEngine.js");
    return () => window.removeEventListener("lovebug:update", onUpdate);
  }, []);

  return (
    <main className="app-shell">
      <section className="game-card" aria-label={isTestMode ? "러브버그 클린업 테스트" : "러브버그 클린업 게임"}>
        <Topbar />
        <TestPanel />
        <Hud gameUi={gameUi} />
        <Stage />
        <BottomPanel gameUi={gameUi} />
      </section>
    </main>
  );
}
