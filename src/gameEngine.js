const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  level: document.getElementById("levelText"),
  tool: document.getElementById("toolText"),
  score: document.getElementById("scoreText"),
  combo: document.getElementById("comboText"),
  exp: document.getElementById("expText"),
  expBar: document.getElementById("expBar"),
  coin: document.getElementById("coinText"),
  startPanel: document.getElementById("startPanel"),
  resultPanel: document.getElementById("resultPanel"),
  resultTitle: document.getElementById("resultTitle"),
  resultSummary: document.getElementById("resultSummary"),
  startButton: document.getElementById("startButton"),
  restartButton: document.getElementById("restartButton"),
  skillButton: document.getElementById("skillButton"),
  skillName: document.getElementById("skillName"),
  skillCharge: document.getElementById("skillCharge"),
  venue: document.getElementById("venueText"),
  range: document.getElementById("rangeText"),
  skillShop: document.getElementById("skillShop"),
  testPanel: document.getElementById("testPanel"),
  levelSlider: document.getElementById("levelSlider"),
  coinGrantButton: document.getElementById("coinGrantButton"),
  venueRollButton: document.getElementById("venueRollButton"),
  venueSelect: document.getElementById("venueSelect"),
  toolList: document.getElementById("toolList"),
  dockTabs: document.querySelectorAll(".dock-tab"),
  futureSlots: document.querySelectorAll(".future-slots button"),
  soundToggle: document.getElementById("soundToggle"),
  soundIcon: document.getElementById("soundIcon"),
};

let W = canvas.width;
let H = canvas.height;
const ROUND_TIME = 60;
const SAVE_KEY = "lovebug-cleanup-v1";
const mapImages = new Map();
const toolSpritesImage = new Image();
toolSpritesImage.src = "assets/tool-spritesheet-source.png";
const insectSpritesImage = new Image();
insectSpritesImage.src = "assets/insect-spritesheet-source.png";
const effectSpritesImage = new Image();
effectSpritesImage.src = "assets/effect-spritesheet-source.png";
const heroSpritesImage = new Image();
heroSpritesImage.src = "assets/hero-spritesheet-source.png";
const heroAttackImage = new Image();
heroAttackImage.src = "assets/hero-attack-effect.png";
let processedToolSprites = null;
let processedInsectSprites = null;
let processedEffectSprites = null;
let processedHeroSprites = null;
const HERO_ATTACK_FRAMES = 3;
const isTestMode = Boolean(ui.testPanel);

function sx(value) {
  return (value / 720) * W;
}

function sy(value) {
  return (value / 960) * H;
}

function scaledPoint(point) {
  return { x: sx(point.x), y: sy(point.y) };
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const nextW = Math.max(1, Math.round(rect.width));
  const nextH = Math.max(1, Math.round(rect.height));
  if (canvas.width === nextW && canvas.height === nextH) return;
  canvas.width = nextW;
  canvas.height = nextH;
  W = nextW;
  H = nextH;
  if (!state?.running) {
    state.pointer.x = W / 2;
    state.pointer.y = H * 0.62;
  }
}

const tools = [
  { level: 1, id: "hand", name: "손", radius: 32, color: "#f8f4df", skill: null, sprite: 0 },
  { level: 5, id: "glove", name: "장갑", radius: 42, color: "#69a7ff", skill: null, sprite: 1 },
  { level: 10, id: "stick", name: "나무 막대기", radius: 48, color: "#c98b55", skill: "라인 톡", sprite: 2 },
  { level: 20, id: "newspaper", name: "신문지", radius: 58, color: "#d9d3b0", skill: "연속 찰싹", sprite: 3 },
  { level: 30, id: "swatter", name: "파리채", radius: 72, color: "#78c45b", skill: "원형 팡", sprite: 4 },
  { level: 40, id: "sticky", name: "끈끈이 패들", radius: 82, color: "#b982ff", skill: "콤보 보호", sprite: 5 },
  { level: 50, id: "spray", name: "스프레이", radius: 92, color: "#8de3b2", skill: "민트 구름", sprite: 6 },
  { level: 60, id: "electric", name: "전기 파리채", radius: 100, color: "#ffd166", skill: "찌릿 연쇄", sprite: 7 },
  { level: 70, id: "fan", name: "선풍기", radius: 108, color: "#9ed0ff", skill: "가로 쓸기", sprite: 8 },
  { level: 80, id: "turret", name: "미니 터렛", radius: 112, color: "#ffb86b", skill: "자동 조준", sprite: 9 },
  { level: 90, id: "drone", name: "클린 드론", radius: 118, color: "#75f0ff", skill: "클러스터 빔", sprite: 10 },
  { level: 100, id: "guardian", name: "가디언 EX", radius: 128, color: "#ffffff", skill: "전체 정리", sprite: 11 },
];

const venues = [
  {
    id: "bukhansan",
    name: "북한산 은평 숲길",
    image: "assets/maps/bukhansan-eunpyeong.png",
    meme: "산림 인접지",
    tint: "rgba(42, 176, 145, 0.04)",
    field: { x: [30, 190], y: [60, 250] },
    car: { x: [420, 650], y: [610, 790] },
    lamp: { x: [40, 160], y: [420, 570] },
    attract: { x: 118, y: 190 },
  },
  {
    id: "eunpyeong_apartment",
    name: "은평 아파트 화단",
    image: "assets/maps/eunpyeong-apartment.png",
    meme: "방충망/화단",
    tint: "rgba(86, 190, 226, 0.05)",
    field: { x: [45, 230], y: [90, 300] },
    car: { x: [390, 650], y: [690, 830] },
    lamp: { x: [520, 680], y: [230, 430] },
    attract: { x: 135, y: 210 },
  },
  {
    id: "goyang_greenway",
    name: "고양 숲세권 산책로",
    image: "assets/maps/goyang-greenway.png",
    meme: "고양/숲세권",
    tint: "rgba(70, 190, 120, 0.04)",
    field: { x: [40, 240], y: [90, 290] },
    car: { x: [410, 660], y: [620, 800] },
    lamp: { x: [80, 220], y: [360, 560] },
    attract: { x: 150, y: 720 },
  },
  {
    id: "gyeyangsan",
    name: "계양산 밈 산책로",
    image: "assets/maps/gyeyangsan-trail.png",
    meme: "바이럴 등산로",
    tint: "rgba(44, 160, 112, 0.05)",
    field: { x: [30, 210], y: [80, 260] },
    car: { x: [380, 650], y: [600, 820] },
    lamp: { x: [240, 420], y: [180, 380] },
    attract: { x: 360, y: 220 },
  },
  {
    id: "han_river",
    name: "한강공원 물가길",
    image: "assets/maps/han-river-park.png",
    meme: "하천/물가",
    tint: "rgba(60, 180, 230, 0.06)",
    field: { x: [0, 230], y: [520, 840] },
    car: { x: [420, 690], y: [610, 780] },
    lamp: { x: [50, 210], y: [160, 360] },
    attract: { x: 140, y: 720 },
  },
  {
    id: "mapo_bus",
    name: "마포 버스정류장",
    image: "assets/maps/mapo-bus-stop.png",
    meme: "정류장/유리벽",
    tint: "rgba(255, 208, 92, 0.05)",
    field: { x: [30, 190], y: [660, 880] },
    car: { x: [400, 690], y: [590, 780] },
    lamp: { x: [70, 220], y: [190, 410] },
    attract: { x: 180, y: 330 },
  },
  {
    id: "subway_exit",
    name: "지하철 출구 광장",
    image: "assets/maps/subway-exit.png",
    meme: "지하철 탑승 밈",
    tint: "rgba(110, 190, 245, 0.05)",
    field: { x: [50, 230], y: [110, 300] },
    car: { x: [420, 690], y: [620, 820] },
    lamp: { x: [300, 500], y: [120, 300] },
    attract: { x: 390, y: 180 },
  },
  {
    id: "urban_stream",
    name: "도심 하천 산책길",
    image: "assets/maps/urban-stream.png",
    meme: "하천변 습지",
    tint: "rgba(55, 185, 210, 0.06)",
    field: { x: [0, 220], y: [540, 850] },
    car: { x: [420, 690], y: [620, 790] },
    lamp: { x: [50, 210], y: [120, 330] },
    attract: { x: 120, y: 730 },
  },
  {
    id: "white_parking",
    name: "흰차 주차장",
    image: "assets/maps/white-car-parking.png",
    meme: "흰 차량 밈",
    tint: "rgba(255, 255, 255, 0.04)",
    field: { x: [30, 190], y: [40, 170] },
    car: { x: [350, 680], y: [520, 850] },
    lamp: { x: [40, 160], y: [420, 650] },
    attract: { x: 560, y: 720 },
  },
  {
    id: "screen_wall",
    name: "아파트 방충망 벽",
    image: "assets/maps/apartment-wall-screen.png",
    meme: "방충망 대기열",
    tint: "rgba(125, 210, 180, 0.05)",
    field: { x: [20, 200], y: [690, 900] },
    car: { x: [400, 690], y: [610, 790] },
    lamp: { x: [450, 670], y: [170, 390] },
    attract: { x: 560, y: 210 },
  },
];

const purchasableSkills = [
  {
    id: "static",
    name: "스태틱 팡",
    cost: 120,
    minLevel: 10,
    cooldown: 7,
    desc: "터치 지점에서 번개가 퍼져 주변 8마리를 연쇄 정리",
  },
  {
    id: "redBurst",
    name: "레드 버스트",
    cost: 220,
    minLevel: 20,
    cooldown: 9,
    desc: "큰 빨간 픽셀 폭발로 화면 중앙 근처를 한 번에 정리",
  },
  {
    id: "lampTrap",
    name: "램프 트랩",
    cost: 340,
    minLevel: 35,
    cooldown: 11,
    desc: "밝은 미끼를 켜서 러브버그를 모은 뒤 터뜨림",
  },
  {
    id: "coinFever",
    name: "코인 피버",
    cost: 520,
    minLevel: 50,
    cooldown: 14,
    desc: "5초 동안 처치 코인이 3배",
  },
];

const heroes = [
  {
    id: "gil_dong",
    name: "홍길동",
    role: "검기 난무",
    sprite: 0,
    desc: "빠른 검기로 터치 지점을 베어냅니다.",
  },
  {
    id: "woo_chi",
    name: "전우치",
    role: "부적 술법",
    sprite: 1,
    desc: "부적과 도술로 주변 벌레를 흔듭니다.",
  },
  {
    id: "swordmaster",
    name: "조선 검객",
    role: "일격 베기",
    sprite: 2,
    desc: "큰 참격으로 전방을 정리합니다.",
  },
];

const state = {
  running: false,
  time: ROUND_TIME,
  score: 0,
  combo: 0,
  bestCombo: 0,
  catches: 0,
  level: 1,
  exp: 0,
  coins: 0,
  bugs: [],
  effects: [],
  clouds: [],
  splats: [],
  lastSpawn: 0,
  spawnEvery: 820,
  skillReady: 0,
  skillCooldown: 8,
  unlockedSkills: [],
  equippedSkillId: null,
  coinFever: 0,
  sound: false,
  lastTime: 0,
  autoTimer: 0,
  shake: 0,
  pointer: { x: W / 2, y: H * 0.72, active: false },
  weaponHit: 0,
  venueId: "bukhansan",
  shopTab: "skill",
  heroId: "gil_dong",
  heroAttack: 0,
  heroTarget: { x: W / 2, y: H * 0.4 },
};

function requiredExp(level) {
  return Math.floor(80 + level * 45 + Math.pow(level, 1.65) * 18);
}

function getAttackRadius() {
  const tool = getTool();
  return Math.round(tool.radius + Math.min(32, state.level * 0.45));
}

function getTool() {
  let current = tools[0];
  for (const tool of tools) {
    if (state.level >= tool.level) current = tool;
  }
  return current;
}

function getVenue() {
  return venues.find((venue) => venue.id === state.venueId) || venues[0];
}

function getMapImage(venue) {
  if (!venue?.image) return null;
  if (!mapImages.has(venue.id)) {
    const image = new Image();
    image.src = venue.image;
    mapImages.set(venue.id, image);
  }
  return mapImages.get(venue.id);
}

function getEquippedSkill() {
  if (!state.equippedSkillId) return null;
  return purchasableSkills.find((skill) => skill.id === state.equippedSkillId) || null;
}

function getHero() {
  return heroes.find((hero) => hero.id === state.heroId) || heroes[0];
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved) return;
    state.level = saved.level || 1;
    state.exp = saved.exp || 0;
    state.coins = saved.coins || 0;
    state.unlockedSkills = saved.unlockedSkills || [];
    state.equippedSkillId = saved.equippedSkillId || null;
    if (saved.venueId && venues.some((venue) => venue.id === saved.venueId)) state.venueId = saved.venueId;
    if (saved.heroId && heroes.some((hero) => hero.id === saved.heroId)) state.heroId = saved.heroId;
  } catch {
    // Ignore broken local data.
  }
}

function save() {
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({
      level: state.level,
      exp: state.exp,
      coins: state.coins,
      unlockedSkills: state.unlockedSkills,
      equippedSkillId: state.equippedSkillId,
      venueId: state.venueId,
      heroId: state.heroId,
    })
  );
}

function pixelText(text, x, y, size = 18, color = "#f8f4df", align = "left") {
  ctx.font = `${size}px ui-monospace, monospace`;
  ctx.textAlign = align;
  ctx.fillStyle = "#071014";
  ctx.fillText(text, x + 3, y + 3);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawBackground() {
  const venue = getVenue();
  const mapImage = getMapImage(venue);
  if (mapImage?.complete && mapImage.naturalWidth) {
    const imageRatio = mapImage.naturalWidth / mapImage.naturalHeight;
    const canvasRatio = W / H;
    let drawW = W;
    let drawH = H;
    let dx = 0;
    let dy = 0;
    if (canvasRatio > imageRatio) {
      drawW = W;
      drawH = W / imageRatio;
      dy = (H - drawH) / 2;
    } else {
      drawH = H;
      drawW = H * imageRatio;
      dx = (W - drawW) / 2;
    }
    ctx.drawImage(mapImage, dx, dy, drawW, drawH);
    ctx.fillStyle = venue.tint;
    ctx.fillRect(0, 0, W, H);
    drawVenueMarks(venue);
    return;
  }

  ctx.fillStyle = "#477d50";
  ctx.fillRect(0, 0, W, H);

  for (let y = 0; y < H; y += 48) {
    for (let x = 0; x < W; x += 48) {
      ctx.fillStyle = (x / 48 + y / 48) % 2 ? "#4f8957" : "#44784e";
      ctx.fillRect(x, y, 48, 48);
    }
  }

  ctx.fillStyle = "#667172";
  ctx.fillRect(0, 690, W, 150);
  ctx.fillStyle = "#737f80";
  ctx.fillRect(0, 706, W, 8);
  ctx.fillStyle = "#f5f0dc";
  ctx.fillRect(438, 724, 190, 82);
  ctx.fillStyle = "#b7d5ed";
  ctx.fillRect(474, 738, 74, 28);
  ctx.fillStyle = "#262f35";
  ctx.fillRect(462, 798, 34, 22);
  ctx.fillRect(566, 798, 34, 22);

  ctx.fillStyle = "#2f603a";
  ctx.fillRect(0, 0, W, 96);
  ctx.fillStyle = "#6ab85a";
  for (let x = 8; x < W; x += 28) {
    ctx.fillRect(x, 72 + ((x / 28) % 2) * 7, 12, 30);
  }

  ctx.fillStyle = "#355340";
  ctx.fillRect(44, 142, 130, 86);
  ctx.fillStyle = "#5aa055";
  ctx.fillRect(58, 126, 102, 72);
  ctx.fillStyle = "#7fd06a";
  ctx.fillRect(82, 112, 54, 44);

  ctx.fillStyle = "#f8f4df";
  ctx.fillRect(64, 500, 44, 44);
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(72, 508, 28, 28);
  ctx.fillStyle = "#34414a";
  ctx.fillRect(81, 544, 10, 118);

  pixelText("습한 풀밭", 28, 38, 16, "#d9ffd0");
  pixelText("흰 차량", 505, 846, 16, "#ffffff", "center");
  drawVenueMarks(venue);
}

function drawVenueMarks(venue) {
  const labelColor = venue.id === "gyeyangsan" ? "#ffd166" : "#f8f4df";
  pixelText(venue.name, 24, 38, Math.max(14, Math.min(18, W * 0.022)), labelColor);

  if (venue.id === "eunpyeong_apartment") {
    ctx.fillStyle = "rgba(210, 220, 230, 0.55)";
    ctx.fillRect(sx(22), sy(58), sx(160), sy(90));
    ctx.fillStyle = "rgba(80, 100, 130, 0.75)";
    for (let x = 42; x < 160; x += 34) ctx.fillRect(sx(x), sy(78), sx(18), sy(18));
  }

  if (venue.id === "han_river" || venue.id === "urban_stream") {
    ctx.fillStyle = "rgba(80, 180, 205, 0.58)";
    ctx.fillRect(0, 0, W, sy(118));
    ctx.fillStyle = "rgba(245, 245, 220, 0.5)";
    ctx.fillRect(0, sy(118), W, sy(14));
  }

  if (venue.id === "white_parking") {
    ctx.fillStyle = "rgba(210, 215, 210, 0.35)";
    for (let y = 380; y < 860; y += 110) ctx.fillRect(sx(40), sy(y), W - sx(80), sy(8));
    for (let x = 80; x < 720; x += 150) ctx.fillRect(sx(x), sy(400), sx(8), sy(420));
  }

  if (venue.id === "mapo_bus" || venue.id === "subway_exit") {
    ctx.fillStyle = "rgba(235, 96, 70, 0.5)";
    ctx.fillRect(sx(230), sy(42), sx(280), sy(72));
    ctx.fillStyle = "rgba(255, 210, 90, 0.6)";
    ctx.fillRect(sx(250), sy(56), sx(48), sy(28));
    ctx.fillRect(sx(330), sy(56), sx(48), sy(28));
    ctx.fillRect(sx(410), sy(56), sx(48), sy(28));
  }
}

function drawSplat(x, y, power = 1) {
  const dots = 10 + Math.floor(power * 7);
  state.splats.push({ x, y, power, life: 2.4, max: 2.4, dots });
}

function processToolSprites() {
  if (processedToolSprites || !toolSpritesImage.complete || !toolSpritesImage.naturalWidth) return;
  const sheet = document.createElement("canvas");
  sheet.width = toolSpritesImage.naturalWidth;
  sheet.height = toolSpritesImage.naturalHeight;
  const sheetCtx = sheet.getContext("2d");
  sheetCtx.drawImage(toolSpritesImage, 0, 0);
  const pixels = sheetCtx.getImageData(0, 0, sheet.width, sheet.height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i];
    const g = pixels.data[i + 1];
    const b = pixels.data[i + 2];
    if (r > 170 && g < 95 && b > 170) pixels.data[i + 3] = 0;
  }
  sheetCtx.putImageData(pixels, 0, 0);
  processedToolSprites = sheet;
}

function processChromaSprite(image, cacheSetter) {
  if (!image.complete || !image.naturalWidth) return null;
  const sheet = document.createElement("canvas");
  sheet.width = image.naturalWidth;
  sheet.height = image.naturalHeight;
  const sheetCtx = sheet.getContext("2d");
  sheetCtx.drawImage(image, 0, 0);
  const pixels = sheetCtx.getImageData(0, 0, sheet.width, sheet.height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const r = pixels.data[i];
    const g = pixels.data[i + 1];
    const b = pixels.data[i + 2];
    if (r > 170 && g < 95 && b > 170) pixels.data[i + 3] = 0;
  }
  sheetCtx.putImageData(pixels, 0, 0);
  cacheSetter(sheet);
  return sheet;
}

function getInsectSheet() {
  return processedInsectSprites || processChromaSprite(insectSpritesImage, (sheet) => {
    processedInsectSprites = sheet;
  });
}

function getEffectSheet() {
  return processedEffectSprites || processChromaSprite(effectSpritesImage, (sheet) => {
    processedEffectSprites = sheet;
  });
}

function getHeroSheet() {
  return processedHeroSprites || processChromaSprite(heroSpritesImage, (sheet) => {
    processedHeroSprites = sheet;
  });
}

function drawGeneratedToolSprite(tool, x, y, scale, hit) {
  processToolSprites();
  if (!processedToolSprites) return false;
  const cols = 4;
  const rows = 3;
  const cellW = processedToolSprites.width / cols;
  const cellH = processedToolSprites.height / rows;
  const sx = (tool.sprite % cols) * cellW;
  const sy = Math.floor(tool.sprite / cols) * cellH;
  const size = 116 * scale;

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate((-0.18 + hit * 0.34) * Math.PI);
  ctx.drawImage(processedToolSprites, sx, sy, cellW, cellH, -size / 2, -size / 2, size, size);
  ctx.restore();
  return true;
}

function drawToolSprite(tool, x, y, scale = 1, hit = 0) {
  if (drawGeneratedToolSprite(tool, x, y, scale, hit)) return;

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.rotate((-0.22 + hit * 0.45) * Math.PI);
  ctx.scale(scale, scale);

  const rect = (rx, ry, rw, rh, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(rx), Math.round(ry), Math.round(rw), Math.round(rh));
  };

  const outline = "#10161d";
  if (tool.id === "hand" || tool.id === "glove") {
    const palm = tool.id === "glove" ? "#5ba1ff" : "#f1c7a1";
    const shade = tool.id === "glove" ? "#2867bd" : "#c98b6f";
    rect(-17, -13, 34, 30, outline);
    rect(-13, -10, 28, 24, palm);
    rect(-20, -25, 8, 18, outline);
    rect(-17, -22, 5, 15, palm);
    rect(-8, -30, 8, 20, outline);
    rect(-6, -27, 5, 17, palm);
    rect(3, -29, 8, 19, outline);
    rect(5, -26, 5, 16, palm);
    rect(13, -22, 8, 15, outline);
    rect(15, -19, 5, 12, palm);
    rect(-8, 12, 22, 15, outline);
    rect(-5, 14, 16, 10, shade);
    if (tool.id === "glove") {
      rect(-12, -8, 10, 6, "#9fd0ff");
      rect(0, -7, 8, 5, "#9fd0ff");
    }
  }

  if (tool.id === "stick") {
    rect(-8, -64, 16, 110, outline);
    rect(-4, -60, 8, 102, "#9b623c");
    rect(-10, -66, 20, 10, "#d19a61");
    rect(-12, 34, 24, 18, "#633a25");
  }

  if (tool.id === "newspaper") {
    rect(-22, -62, 44, 86, outline);
    rect(-18, -58, 36, 78, "#ece5c8");
    rect(-12, -46, 24, 6, "#9ca3a8");
    rect(-12, -32, 24, 6, "#9ca3a8");
    rect(-12, -18, 18, 6, "#ef6f6c");
    rect(-8, 22, 16, 34, "#8c6b4a");
  }

  if (tool.id === "swatter" || tool.id === "electric") {
    const frame = tool.id === "electric" ? "#ffd166" : "#75cf65";
    rect(-25, -68, 50, 54, outline);
    rect(-20, -63, 40, 44, frame);
    rect(-14, -57, 6, 32, "#1d2630");
    rect(-2, -57, 6, 32, "#1d2630");
    rect(10, -57, 6, 32, "#1d2630");
    rect(-14, -45, 28, 5, "#1d2630");
    rect(-14, -33, 28, 5, "#1d2630");
    rect(-5, -16, 10, 76, outline);
    rect(-2, -12, 4, 70, "#d0d6c8");
    if (tool.id === "electric") {
      rect(21, -57, 10, 8, "#ffffff");
      rect(-32, -42, 10, 8, "#ffffff");
    }
  }

  if (tool.id === "sticky") {
    rect(-22, -56, 44, 44, outline);
    rect(-17, -51, 34, 34, "#b982ff");
    rect(-9, -43, 18, 10, "#dfc5ff");
    rect(-5, -14, 10, 76, outline);
    rect(-2, -10, 4, 70, "#6f4d9e");
  }

  if (tool.id === "spray") {
    rect(-17, -30, 34, 70, outline);
    rect(-12, -24, 24, 58, "#7bdca6");
    rect(-10, -42, 20, 16, outline);
    rect(-5, -48, 28, 8, "#e9f8ef");
    rect(-8, -2, 16, 18, "#ffffff");
    rect(18, -52, 12, 6, "#8de3b2");
    rect(34, -60, 8, 8, "#8de3b2");
    rect(48, -67, 6, 6, "#8de3b2");
  }

  if (tool.id === "fan") {
    rect(-22, -52, 44, 44, outline);
    rect(-17, -47, 34, 34, "#d9f0ff");
    rect(-5, -35, 10, 10, "#5a7ea0");
    rect(-3, -45, 6, 20, "#9ed0ff");
    rect(-13, -35, 26, 6, "#9ed0ff");
    rect(-5, -8, 10, 68, outline);
    rect(-2, -5, 4, 62, "#596b7c");
  }

  if (tool.id === "turret") {
    rect(-28, -26, 56, 42, outline);
    rect(-22, -21, 44, 32, "#ffb86b");
    rect(-8, -50, 16, 28, outline);
    rect(-4, -46, 8, 24, "#ffd166");
    rect(-34, 13, 68, 18, outline);
    rect(-25, 17, 50, 10, "#596b7c");
  }

  if (tool.id === "drone" || tool.id === "guardian") {
    const body = tool.id === "guardian" ? "#f8f4df" : "#75f0ff";
    rect(-34, -26, 68, 36, outline);
    rect(-27, -20, 54, 24, body);
    rect(-49, -39, 22, 22, outline);
    rect(27, -39, 22, 22, outline);
    rect(-44, -34, 12, 12, "#9ed0ff");
    rect(32, -34, 12, 12, "#9ed0ff");
    rect(-10, 7, 20, 36, outline);
    rect(-6, 10, 12, 28, tool.id === "guardian" ? "#ffd166" : "#5f8fff");
  }

  ctx.restore();
}

function drawWeaponCursor() {
  if (!state.running) return;
  const tool = getTool();
  const hit = Math.max(0, state.weaponHit);
  const x = state.pointer.x + 34 - hit * 18;
  const y = state.pointer.y + 42 - hit * 28;
  ctx.globalAlpha = state.pointer.active ? 1 : 0.82;
  drawToolSprite(tool, x, y, 1.25, hit);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = tool.color;
  ctx.globalAlpha = 0.28;
  ctx.lineWidth = 3;
  ctx.strokeRect(state.pointer.x - 12, state.pointer.y - 12, 24, 24);
  ctx.globalAlpha = 1;
}

function drawHeroCharacter() {
  if (!state.running) return;
  const hero = getHero();
  const sheet = getHeroSheet();
  const attack = state.heroAttack;
  const baseX = W * 0.5;
  const baseY = H + Math.min(H * 0.1, 70);
  const target = state.heroTarget || { x: W / 2, y: H * 0.35 };

  if (attack > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.75, attack + 0.18);
    ctx.strokeStyle = hero.id === "woo_chi" ? "#ffd166" : "#f8f4df";
    ctx.lineWidth = Math.max(4, W * 0.006);
    ctx.beginPath();
    ctx.moveTo(baseX, baseY - H * 0.2);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.restore();
  }

  if (!sheet) {
    drawFallbackHero(baseX, baseY, attack);
    return;
  }

  const cols = 3;
  const cellW = sheet.width / cols;
  const cellH = sheet.height;
  const sxp = hero.sprite * cellW;
  const size = Math.min(H * 0.42, W * 0.42, 420);
  const lean = attack * 18;

  ctx.save();
  ctx.translate(baseX + (target.x - baseX) * 0.035 * attack, baseY - lean);
  ctx.rotate(((target.x - baseX) / Math.max(W, 1)) * 0.18 * attack);
  ctx.globalAlpha = 0.96;
  ctx.drawImage(sheet, sxp, 0, cellW, cellH, -size / 2, -size, size, size);
  ctx.restore();
}

function drawFallbackHero(x, y, attack) {
  ctx.save();
  ctx.translate(x, y - attack * 18);
  ctx.fillStyle = "#1d3e63";
  ctx.fillRect(-36, -150, 72, 130);
  ctx.fillStyle = "#123041";
  ctx.fillRect(-52, -160, 104, 18);
  ctx.fillStyle = "#ffd166";
  ctx.fillRect(-6, -132, 12, 112);
  ctx.restore();
}

function spawnBug(forceType) {
  const venue = getVenue();
  const r = Math.random();
  let zone = "field";
  if (r > 0.62) zone = "car";
  if (r > 0.82) zone = "lamp";
  if (r > 0.92) zone = "swarm";

  let x = Math.random() * W;
  let y = -40;
  if (zone === "field") {
    x = sx(venue.field.x[0] + Math.random() * (venue.field.x[1] - venue.field.x[0]));
    y = sy(venue.field.y[0] + Math.random() * (venue.field.y[1] - venue.field.y[0]));
  }
  if (zone === "car") {
    x = sx(venue.car.x[0] + Math.random() * (venue.car.x[1] - venue.car.x[0]));
    y = sy(venue.car.y[0] + Math.random() * (venue.car.y[1] - venue.car.y[0]));
  }
  if (zone === "lamp") {
    x = sx(venue.lamp.x[0] + Math.random() * (venue.lamp.x[1] - venue.lamp.x[0]));
    y = sy(venue.lamp.y[0] + Math.random() * (venue.lamp.y[1] - venue.lamp.y[0]));
  }

  const typeRoll = Math.random();
  let type = forceType || "lovebug";
  if (!forceType) {
    if (typeRoll > 0.94) type = "goldPair";
    else if (typeRoll > 0.78) type = "fly";
    else if (typeRoll > 0.62) type = "mosquito";
    else if (typeRoll > 0.38) type = "lovebugPair";
  }

  const profile = {
    lovebug: { value: 15, exp: 5, speed: 1, size: 1, sprite: 1 },
    lovebugPair: { value: 32, exp: 9, speed: 0.9, size: 1.25, sprite: 0 },
    fly: { value: 24, exp: 7, speed: 1.35, size: 0.92, sprite: 2 },
    mosquito: { value: 30, exp: 8, speed: 1.55, size: 0.95, sprite: 3 },
    goldPair: { value: 95, exp: 20, speed: 1.05, size: 1.28, sprite: 4 },
    fastFly: { value: 35, exp: 9, speed: 1.8, size: 0.82, sprite: 5 },
  }[type] || { value: 15, exp: 5, speed: 1, size: 1, sprite: 1 };

  const bug = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    x,
    y,
    vx: (Math.random() - 0.5) * 34,
    vy: (26 + Math.random() * 44) * profile.speed,
    size: 24 * profile.size * Math.max(0.82, Math.min(1.35, W / 720)),
    type,
    sprite: profile.sprite,
    wobble: Math.random() * Math.PI * 2,
    life: 1,
    value: profile.value,
    exp: profile.exp,
  };
  state.bugs.push(bug);
}

function drawLovebug(bug) {
  if (drawGeneratedInsect(bug)) return;

  const x = Math.round(bug.x);
  const y = Math.round(bug.y);
  const s = bug.size;
  const drawOne = (ox, oy, tint, flip = 1) => {
    const bx = x + ox;
    const by = y + oy;

    ctx.fillStyle = "rgba(218, 229, 225, 0.55)";
    ctx.fillRect(bx - s - 4, by - 8, s + 2, 14);
    ctx.fillRect(bx + 2, by - 8, s + 2, 14);
    ctx.fillStyle = "rgba(160, 177, 180, 0.48)";
    ctx.fillRect(bx - s, by - 4, s - 2, 6);
    ctx.fillRect(bx + 4, by - 4, s - 2, 6);

    ctx.fillStyle = "#0d1115";
    ctx.fillRect(bx - 7, by - 16, 14, 8);
    ctx.fillStyle = bug.type === "goldPair" ? "#d9a735" : "#b8573d";
    ctx.fillRect(bx - 8, by - 21, 16, 8);
    ctx.fillStyle = "#733126";
    ctx.fillRect(bx - 5, by - 20, 10, 3);

    ctx.fillStyle = tint;
    ctx.fillRect(bx - 8, by - 7, 16, 25);
    ctx.fillStyle = "#252c31";
    ctx.fillRect(bx - 5, by - 4, 10, 20);
    ctx.fillStyle = "#11161a";
    ctx.fillRect(bx - 2, by - 6, 4, 24);

    ctx.fillStyle = "#070a0c";
    const leg = (lx, ly, dx, dy) => {
      ctx.fillRect(bx + lx, by + ly, dx, 4);
      ctx.fillRect(bx + lx + dx - 2 * flip, by + ly + dy, 4, 4);
    };
    leg(-9, -10, -18 * flip, -6);
    leg(7, -9, 20 * flip, -8);
    leg(-9, 1, -22 * flip, 8);
    leg(7, 3, 22 * flip, 9);
    leg(-8, 12, -17 * flip, 15);
    leg(6, 14, 19 * flip, 13);

    ctx.fillStyle = "#050708";
    ctx.fillRect(bx - 11, by - 21, 5, 5);
    ctx.fillRect(bx + 6, by - 21, 5, 5);
    ctx.fillRect(bx - 3, by - 26, 3, 8);
    ctx.fillRect(bx + 2, by - 26, 3, 8);
  };

  if (bug.type === "lovebugPair" || bug.type === "goldPair") {
    drawOne(-13, 8, bug.type === "goldPair" ? "#4b3d1b" : "#161c21", -1);
    drawOne(13, -8, bug.type === "goldPair" ? "#4b3d1b" : "#1d252b", 1);
    ctx.strokeStyle = "#11161a";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x - 6, y + 12);
    ctx.lineTo(x + 6, y - 2);
    ctx.stroke();
    ctx.fillStyle = bug.type === "goldPair" ? "#ffd166" : "#ef6f6c";
    ctx.fillRect(x - 6, y - 5, 12, 10);
    ctx.fillRect(x - 3, y + 5, 6, 5);
  } else {
    drawOne(0, 0, bug.type === "goldPair" ? "#4b3d1b" : "#171d22");
    if (bug.type === "goldPair") {
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(x - 12, y - 18, 24, 4);
    }
  }
}

function drawGeneratedInsect(bug) {
  const sheet = getInsectSheet();
  if (!sheet) return false;
  const cols = 3;
  const rows = 2;
  const cellW = sheet.width / cols;
  const cellH = sheet.height / rows;
  const sprite = bug.sprite ?? 1;
  const sxp = (sprite % cols) * cellW;
  const syp = Math.floor(sprite / cols) * cellH;
  const bob = Math.sin(bug.wobble) * 3;
  const size = bug.size * (bug.type === "mosquito" ? 2.0 : 2.25);

  ctx.save();
  ctx.translate(Math.round(bug.x), Math.round(bug.y + bob));
  ctx.rotate(Math.sin(bug.wobble * 0.45) * 0.08);
  ctx.drawImage(sheet, sxp, syp, cellW, cellH, -size / 2, -size / 2, size, size);
  ctx.restore();
  return true;
}

function drawEffects(dt) {
  state.splats = state.splats.filter((splat) => {
    splat.life -= dt;
    const t = Math.max(0, splat.life / splat.max);
    ctx.globalAlpha = Math.min(0.9, t + 0.12);
    ctx.fillStyle = "#8f1018";
    ctx.fillRect(splat.x - 8 * splat.power, splat.y - 5 * splat.power, 16 * splat.power, 10 * splat.power);
    ctx.fillStyle = "#e51f2d";
    for (let i = 0; i < splat.dots; i += 1) {
      const a = (i * 2.399 + splat.x) % (Math.PI * 2);
      const d = 8 + ((i * 13) % 44) * splat.power;
      const px = splat.x + Math.cos(a) * d;
      const py = splat.y + Math.sin(a) * d * 0.72;
      const size = 3 + ((i * 7) % 8);
      ctx.fillRect(px, py, size, size);
    }
    ctx.globalAlpha = 1;
    return splat.life > 0;
  });

  state.effects = state.effects.filter((effect) => {
    effect.life -= dt;
    const t = Math.max(0, effect.life / effect.max);
    ctx.globalAlpha = t;
    const drewSprite = drawGeneratedEffect(effect, t);
    if (drewSprite && effect.kind !== "text") {
      ctx.globalAlpha = 1;
      return effect.life > 0;
    }
    if (effect.kind === "ring") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 6;
      ctx.strokeRect(effect.x - effect.r * (1 - t), effect.y - effect.r * (1 - t), effect.r * 2 * (1 - t), effect.r * 2 * (1 - t));
    } else if (effect.kind === "text") {
      pixelText(effect.text, effect.x, effect.y - (1 - t) * 26, 20, effect.color, "center");
    } else if (effect.kind === "beam") {
      ctx.fillStyle = effect.color;
      ctx.fillRect(effect.x - 8, 0, 16, H);
      ctx.fillRect(0, effect.y - 8, W, 16);
    } else if (effect.kind === "slash") {
      ctx.fillStyle = effect.color;
      ctx.fillRect(effect.x - 58 * (1 - t), effect.y - 8, 116 * (1 - t), 16);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(effect.x - 36 * (1 - t), effect.y - 3, 72 * (1 - t), 6);
    } else if (effect.kind === "stamp") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 8;
      ctx.strokeRect(effect.x - 46 * (1 - t), effect.y - 36 * (1 - t), 92 * (1 - t), 72 * (1 - t));
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillRect(effect.x - 30, effect.y - 3, 60, 6);
      ctx.fillRect(effect.x - 3, effect.y - 30, 6, 60);
    } else if (effect.kind === "zap") {
      ctx.strokeStyle = "#fff6a8";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(effect.x - 58, effect.y - 22);
      ctx.lineTo(effect.x - 16, effect.y - 4);
      ctx.lineTo(effect.x - 36, effect.y + 16);
      ctx.lineTo(effect.x + 12, effect.y + 2);
      ctx.lineTo(effect.x + 48, effect.y + 24);
      ctx.stroke();
    } else if (effect.kind === "mist") {
      ctx.fillStyle = "rgba(141,227,178,0.55)";
      for (let i = 0; i < 6; i += 1) ctx.fillRect(effect.x + i * 18 - 54, effect.y - 20 + (i % 2) * 16, 22, 22);
    } else if (effect.kind === "goo") {
      ctx.fillStyle = "rgba(185,130,255,0.75)";
      ctx.fillRect(effect.x - 30, effect.y - 18, 60, 36);
      ctx.fillStyle = "#dfc5ff";
      ctx.fillRect(effect.x - 12, effect.y - 26, 24, 10);
    } else if (effect.kind === "wind") {
      ctx.fillStyle = "rgba(158,208,255,0.5)";
      ctx.fillRect(0, effect.y - 18, W, 8);
      ctx.fillRect(0, effect.y + 8, W, 6);
    } else if (effect.kind === "target") {
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 5;
      ctx.strokeRect(effect.x - 38, effect.y - 38, 76, 76);
      ctx.fillStyle = effect.color;
      ctx.fillRect(effect.x - 6, effect.y - 46, 12, 92);
      ctx.fillRect(effect.x - 46, effect.y - 6, 92, 12);
    } else if (effect.kind === "beamHit" || effect.kind === "guardianBurst") {
      ctx.fillStyle = effect.kind === "guardianBurst" ? "rgba(255,255,255,0.72)" : "rgba(117,240,255,0.65)";
      ctx.fillRect(effect.x - 12, 0, 24, H);
      ctx.strokeStyle = effect.color;
      ctx.lineWidth = 7;
      ctx.strokeRect(effect.x - 70 * (1 - t), effect.y - 70 * (1 - t), 140 * (1 - t), 140 * (1 - t));
    } else if (effect.kind === "paper") {
      ctx.fillStyle = "#ece5c8";
      ctx.fillRect(effect.x - 40, effect.y - 28, 80, 56);
      ctx.fillStyle = "#9ca3a8";
      ctx.fillRect(effect.x - 28, effect.y - 12, 56, 6);
    } else {
      ctx.fillStyle = effect.color;
      for (let i = 0; i < 8; i += 1) {
        const a = (Math.PI * 2 * i) / 8;
        ctx.fillRect(effect.x + Math.cos(a) * effect.r * (1 - t), effect.y + Math.sin(a) * effect.r * (1 - t), 8, 8);
      }
    }
    ctx.globalAlpha = 1;
    return effect.life > 0;
  });
}

function drawGeneratedEffect(effect, t) {
  if (effect.kind === "heroAttack" && heroAttackImage.complete && heroAttackImage.naturalWidth) {
    const progress = 1 - t;
    const frame = Math.min(HERO_ATTACK_FRAMES - 1, Math.floor(progress * HERO_ATTACK_FRAMES));
    const cellW = heroAttackImage.naturalWidth / HERO_ATTACK_FRAMES;
    const cellH = heroAttackImage.naturalHeight;
    const dx = effect.toX - effect.fromX;
    const dy = effect.toY - effect.fromY;
    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const size = Math.min(Math.max(distance * 1.18, W * 0.46), Math.max(W, H) * 0.92);

    ctx.save();
    ctx.globalAlpha = Math.min(1, t + 0.35);
    ctx.translate(effect.fromX + dx * 0.5, effect.fromY + dy * 0.5);
    ctx.rotate(angle);
    ctx.drawImage(
      heroAttackImage,
      frame * cellW,
      0,
      cellW,
      cellH,
      -size * 0.5,
      -size * 0.34,
      size,
      size * 0.68
    );
    ctx.restore();
    return true;
  }

  const sheet = getEffectSheet();
  if (!sheet || effect.kind === "text" || effect.kind === "beam") return false;
  const map = {
    slap: 0,
    slash: 1,
    paper: 2,
    stamp: 3,
    goo: 4,
    mist: 5,
    zap: 6,
    wind: 7,
    target: 8,
    beamHit: 9,
    guardianBurst: 10,
    burst: 11,
    ring: 11,
  };
  const sprite = map[effect.kind];
  if (sprite === undefined) return false;
  const cols = 4;
  const rows = 3;
  const cellW = sheet.width / cols;
  const cellH = sheet.height / rows;
  const sxp = (sprite % cols) * cellW;
  const syp = Math.floor(sprite / cols) * cellH;
  const scale = 0.82 + (1 - t) * 0.62;
  const size = Math.min(W, H) * 0.18 * scale;

  ctx.save();
  ctx.translate(effect.x, effect.y);
  ctx.rotate((1 - t) * 0.18);
  if (effect.kind === "wind") {
    ctx.drawImage(sheet, sxp, syp, cellW, cellH, -W * 0.45, -size * 0.45, W * 0.9, size);
  } else if (effect.kind === "beamHit" || effect.kind === "guardianBurst") {
    ctx.drawImage(sheet, sxp, syp, cellW, cellH, -size * 0.62, -size * 0.62, size * 1.24, size * 1.24);
  } else {
    ctx.drawImage(sheet, sxp, syp, cellW, cellH, -size / 2, -size / 2, size, size);
  }
  ctx.restore();
  return true;
}

function addEffect(kind, x, y, color, text = "") {
  state.effects.push({ kind, x, y, color, text, r: 76, life: 0.5, max: 0.5 });
}

function addToolImpact(tool, x, y, isGold = false) {
  const color = isGold ? "#ffd166" : tool.color;
  const kindByTool = {
    hand: "slap",
    glove: "slap",
    stick: "slash",
    newspaper: "paper",
    swatter: "stamp",
    sticky: "goo",
    spray: "mist",
    electric: "zap",
    fan: "wind",
    turret: "target",
    drone: "beamHit",
    guardian: "guardianBurst",
  };
  addEffect(kindByTool[tool.id] || "burst", x, y, color);
}

function addHeroAttackEffect(x, y) {
  const hero = getHero();
  state.effects.push({
    kind: "heroAttack",
    fromX: W / 2,
    fromY: H + Math.min(H * 0.1, 70) - H * 0.2,
    toX: x,
    toY: y,
    x,
    y,
    color: hero.id === "woo_chi" ? "#ffd166" : "#8de3ff",
    life: 0.42,
    max: 0.42,
  });
  addEffect(hero.id === "woo_chi" ? "zap" : "ring", x, y, hero.id === "swordmaster" ? "#d8f7ff" : "#8de3ff");
}

function catchAt(x, y, fromSkill = false) {
  const tool = getTool();
  let radius = getAttackRadius();
  if (fromSkill) radius *= 1.65;

  let caught = 0;
  const remaining = [];
  for (const bug of state.bugs) {
    const dist = Math.hypot(bug.x - x, bug.y - y);
    const lineHit = state.level >= 10 && Math.abs(bug.y - y) < radius * 0.42 && Math.abs(bug.x - x) < radius * 1.35;
    const circleHit = dist <= radius || (fromSkill && dist <= radius * 1.2) || lineHit;
    if (circleHit) {
      caught += 1;
      state.catches += bug.type === "lovebugPair" || bug.type === "goldPair" ? 2 : 1;
      const comboBonus = 1 + Math.min(state.combo, 80) * 0.025;
      const levelBonus = 1 + state.level * 0.035;
      state.score += Math.floor(bug.value * comboBonus * levelBonus);
      state.exp += bug.exp;
      state.coins += (bug.type === "goldPair" ? 6 : 1) * (state.coinFever > 0 ? 3 : 1);
      drawSplat(bug.x, bug.y, bug.type === "lovebugPair" || bug.type === "goldPair" ? 1.4 : 1);
      addToolImpact(tool, bug.x, bug.y, bug.type === "goldPair");
    } else {
      remaining.push(bug);
    }
  }

  state.bugs = remaining;
  if (caught > 0) {
    state.combo += caught;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    addEffect("ring", x, y, tool.color);
    addEffect("text", x, y - 24, caught >= 4 ? "#ffd166" : "#f8f4df", `+${caught}`);
    state.shake = Math.min(12, state.shake + 3 + caught * 0.8);
    beep(380 + Math.min(500, state.combo * 8), 0.035);
    levelUpCheck();
  } else {
    state.combo = Math.max(0, state.combo - 2);
    addEffect("ring", x, y, "#7e8c94");
  }
}

function levelUpCheck() {
  let req = requiredExp(state.level);
  while (state.level < 100 && state.exp >= req) {
    state.exp -= req;
    state.level += 1;
    const tool = getTool();
    addEffect("text", W / 2, 150, "#ffd166", `LV ${state.level}`);
    addEffect("ring", W / 2, 170, tool.color);
    req = requiredExp(state.level);
  }
  save();
}

function useSkill() {
  if (!state.running || state.skillReady > 0 || state.level < 10) return;
  const purchasedSkill = getEquippedSkill();
  if (purchasedSkill && state.unlockedSkills.includes(purchasedSkill.id)) {
    state.skillReady = purchasedSkill.cooldown;
    usePurchasedSkill(purchasedSkill);
    return;
  }

  const tool = getTool();
  state.skillReady = state.skillCooldown;

  if (state.level >= 100) {
    for (const bug of [...state.bugs]) catchAt(bug.x, bug.y, true);
    addEffect("beam", W / 2, H / 2, "#ffffff");
    return;
  }

  if (state.level >= 90) {
    const target = state.bugs[Math.floor(Math.random() * state.bugs.length)];
    if (target) catchAt(target.x, target.y, true);
    addEffect("beam", target ? target.x : W / 2, target ? target.y : H / 2, "#75f0ff");
    return;
  }

  if (state.level >= 70) {
    const y = 250 + Math.random() * 450;
    for (const bug of [...state.bugs]) {
      if (Math.abs(bug.y - y) < 80) catchAt(bug.x, bug.y, true);
    }
    addEffect("beam", W / 2, y, "#9ed0ff");
    return;
  }

  if (state.level >= 50) {
    state.clouds.push({ x: W / 2, y: H / 2, r: 210, life: 3 });
    addEffect("ring", W / 2, H / 2, "#8de3b2");
    return;
  }

  catchAt(W / 2, H / 2, true);
}

function usePurchasedSkill(skill) {
  if (skill.id === "static") {
    const origin = { x: state.pointer.x, y: state.pointer.y };
    const targets = [...state.bugs]
      .sort((a, b) => Math.hypot(a.x - origin.x, a.y - origin.y) - Math.hypot(b.x - origin.x, b.y - origin.y))
      .slice(0, 8);
    targets.forEach((bug, index) => {
      catchAt(bug.x, bug.y, true);
      addEffect("beam", bug.x, bug.y, index % 2 ? "#ffffff" : "#ffd166");
    });
    state.shake = 14;
    return;
  }

  if (skill.id === "redBurst") {
    addEffect("ring", W / 2, H / 2, "#ff2b3c");
    for (const bug of [...state.bugs]) {
      if (Math.hypot(bug.x - W / 2, bug.y - H / 2) < 260) catchAt(bug.x, bug.y, true);
    }
    state.shake = 18;
    return;
  }

  if (skill.id === "lampTrap") {
    const trap = scaledPoint(getVenue().attract);
    for (const bug of state.bugs) {
      bug.x += (trap.x - bug.x) * 0.58;
      bug.y += (trap.y - bug.y) * 0.58;
    }
    addEffect("ring", trap.x, trap.y, "#ffd166");
    setTimeout(() => {
      for (const bug of [...state.bugs]) {
        if (Math.hypot(bug.x - trap.x, bug.y - trap.y) < 230) catchAt(bug.x, bug.y, true);
      }
    }, 180);
    return;
  }

  if (skill.id === "coinFever") {
    state.coinFever = 5;
    addEffect("text", W / 2, 120, "#ffd166", "COIN x3");
  }
}

function update(dt) {
  if (!state.running) return;
  state.time -= dt;
  state.weaponHit = Math.max(0, state.weaponHit - dt * 5.5);
  state.heroAttack = Math.max(0, state.heroAttack - dt * 4.8);
  state.coinFever = Math.max(0, state.coinFever - dt);
  state.lastSpawn += dt * 1000;
  state.spawnEvery = Math.max(190, 850 - state.level * 6 - Math.floor((ROUND_TIME - state.time) * 5));

  while (state.lastSpawn > state.spawnEvery) {
    state.lastSpawn -= state.spawnEvery;
    spawnBug();
    if (Math.random() > 0.78) spawnBug("lovebugPair");
    if (Math.random() > 0.9) spawnBug("fastFly");
  }

  const tool = getTool();
  if (state.level >= 80) {
    state.autoTimer += dt;
    const autoEvery = state.level >= 90 ? 1.2 : 2.2;
    if (state.autoTimer >= autoEvery) {
      state.autoTimer = 0;
      const target = state.bugs.sort((a, b) => b.value - a.value)[0];
      if (target) {
        catchAt(target.x, target.y, true);
        addEffect("text", target.x, target.y - 40, "#ffb86b", "AUTO");
      }
    }
  }

  for (const bug of state.bugs) {
    const venue = getVenue();
    bug.wobble += dt * (bug.type === "fly" || bug.type === "fastFly" || bug.type === "mosquito" ? 7 : 3);
    const attractedX = bug.y > sy(540) ? sx(venue.attract.x) : bug.x < sx(210) ? sx(venue.field.x[0] + 70) : bug.x;
    bug.vx += (attractedX - bug.x) * 0.025 * dt;
    bug.x += (bug.vx + Math.sin(bug.wobble) * (bug.type === "fly" || bug.type === "fastFly" ? 88 : bug.type === "mosquito" ? 58 : 24)) * dt;
    bug.y += bug.vy * dt;
    if (bug.x < 12 || bug.x > W - 12) bug.vx *= -1;
  }

  state.clouds = state.clouds.filter((cloud) => {
    cloud.life -= dt;
    for (const bug of [...state.bugs]) {
      if (Math.hypot(bug.x - cloud.x, bug.y - cloud.y) < cloud.r) catchAt(bug.x, bug.y, true);
    }
    return cloud.life > 0;
  });

  const before = state.bugs.length;
  state.bugs = state.bugs.filter((bug) => bug.y < H + 50);
  if (state.bugs.length < before) state.combo = Math.max(0, state.combo - 4);

  state.skillReady = Math.max(0, state.skillReady - dt);
  if (state.time <= 0) endRound();
  updateUi();
}

function render(dt) {
  ctx.save();
  if (state.shake > 0.1) {
    const sx = (Math.random() - 0.5) * state.shake;
    const sy = (Math.random() - 0.5) * state.shake;
    ctx.translate(sx, sy);
    state.shake *= 0.86;
  } else {
    state.shake = 0;
  }

  drawBackground();

  for (const cloud of state.clouds) {
    ctx.globalAlpha = Math.max(0, cloud.life / 3) * 0.42;
    ctx.fillStyle = "#8de3b2";
    ctx.fillRect(cloud.x - cloud.r, cloud.y - cloud.r * 0.45, cloud.r * 2, cloud.r * 0.9);
    ctx.globalAlpha = 1;
  }

  state.bugs.forEach(drawLovebug);
  drawEffects(dt);
  drawHeroCharacter();
  drawWeaponCursor();
  ctx.restore();

  pixelText(`${Math.ceil(state.time)}s`, W - 28, 42, 30, state.time < 10 ? "#ef6f6c" : "#f8f4df", "right");
  if (state.running) {
    const tool = getTool();
    pixelText(tool.name, 26, H - 28, 22, tool.color);
  }
}

function loop(time) {
  resizeCanvas();
  const dt = Math.min(0.033, (time - state.lastTime) / 1000 || 0);
  state.lastTime = time;
  update(dt);
  render(dt);
  requestAnimationFrame(loop);
}

function getUiSnapshot() {
  const tool = getTool();
  const req = requiredExp(state.level);
  const skill = getEquippedSkill();
  const skillDisabled = state.level < 10 || !state.running || state.skillReady > 0;
  return {
    level: state.level,
    toolName: tool.name,
    score: state.score.toLocaleString("ko-KR"),
    combo: state.combo,
    coins: state.coins.toLocaleString("ko-KR"),
    venueName: getVenue().name,
    range: getAttackRadius(),
    expText: state.level >= 100 ? "MAX" : `${state.exp} / ${req}`,
    expPercent: state.level >= 100 ? 100 : Math.min(100, (state.exp / req) * 100),
    skillName: skill ? skill.name : tool.skill || "스킬 대기",
    skillCharge: state.level < 10 ? "Lv.10" : state.skillReady > 0 ? `${state.skillReady.toFixed(1)}s` : state.coinFever > 0 ? `x3 ${state.coinFever.toFixed(1)}` : "사용",
    skillDisabled,
    shopTab: state.shopTab,
    skills: purchasableSkills.map((item) => ({
      ...item,
      unlocked: state.unlockedSkills.includes(item.id),
      equipped: state.equippedSkillId === item.id,
      locked: state.level < item.minLevel,
      afford: state.coins >= item.cost,
    })),
    tools,
    venues,
    heroes,
    selectedVenueId: state.venueId,
    selectedHeroId: state.heroId,
    currentToolId: tool.id,
    sound: state.sound,
  };
}

function emitUi() {
  window.dispatchEvent(new CustomEvent("lovebug:update", { detail: getUiSnapshot() }));
}

function updateUi() {
  const snapshot = getUiSnapshot();
  const tool = getTool();
  const req = requiredExp(state.level);
  const skill = getEquippedSkill();
  ui.level.textContent = state.level;
  ui.tool.textContent = tool.name;
  ui.score.textContent = state.score.toLocaleString("ko-KR");
  ui.combo.textContent = state.combo;
  ui.coin.textContent = state.coins.toLocaleString("ko-KR");
  if (ui.venue) ui.venue.textContent = getVenue().name;
  if (ui.range) ui.range.textContent = getAttackRadius();
  ui.exp.textContent = state.level >= 100 ? "MAX" : `${state.exp} / ${req}`;
  ui.expBar.style.width = state.level >= 100 ? "100%" : `${Math.min(100, (state.exp / req) * 100)}%`;

  ui.skillName.textContent = skill ? skill.name : tool.skill || "스킬 대기";
  if (state.level < 10) {
    ui.skillButton.disabled = true;
    ui.skillCharge.textContent = "Lv.10";
  } else {
    ui.skillButton.disabled = !state.running || state.skillReady > 0;
    ui.skillCharge.textContent = state.skillReady > 0 ? `${state.skillReady.toFixed(1)}s` : state.coinFever > 0 ? `x3 ${state.coinFever.toFixed(1)}` : "사용";
  }
  renderShop();
  renderTestPanel();
  emitUi();
}

function startRound() {
  state.running = true;
  if (!isTestMode) state.venueId = venues[Math.floor(Math.random() * venues.length)].id;
  state.time = ROUND_TIME;
  state.score = 0;
  state.combo = 0;
  state.bestCombo = 0;
  state.catches = 0;
  state.bugs = [];
  state.effects = [];
  state.clouds = [];
  state.splats = [];
  state.skillReady = 0;
  state.autoTimer = 0;
  state.coinFever = 0;
  state.pointer.x = W / 2;
  state.pointer.y = H * 0.72;
  state.heroTarget = { x: W / 2, y: H * 0.38 };
  state.heroAttack = 0;
  state.weaponHit = 0;
  ui.startPanel.classList.add("hidden");
  ui.resultPanel.classList.add("hidden");
  for (let i = 0; i < 8; i += 1) spawnBug(i % 3 === 0 ? "lovebugPair" : undefined);
  updateUi();
}

function buyOrEquipSkill(skillId) {
  const skill = purchasableSkills.find((item) => item.id === skillId);
  if (!skill || state.level < skill.minLevel) return;
  if (!state.unlockedSkills.includes(skill.id)) {
    if (state.coins < skill.cost) return;
    state.coins -= skill.cost;
    state.unlockedSkills.push(skill.id);
  }
  state.equippedSkillId = skill.id;
  save();
  updateUi();
}

function renderShop() {
  if (ui.dockTabs?.length) {
    ui.dockTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === state.shopTab || (!tab.dataset.tab && tab.textContent.trim() === tabName(state.shopTab))));
  }
  emitUi();
}

function tabName(tab) {
  return { skill: "스킬", tool: "도구", companion: "동료", pet: "동료", place: "장소" }[tab] || "스킬";
}

function renderTestPanel() {
  if (!isTestMode) return;
  if (ui.levelSlider && Number(ui.levelSlider.value) !== state.level) {
    ui.levelSlider.value = state.level;
  }
  if (ui.venueSelect && !ui.venueSelect.options.length) {
    ui.venueSelect.innerHTML = venues.map((venue) => `<option value="${venue.id}">${venue.name}</option>`).join("");
  }
  if (ui.venueSelect) ui.venueSelect.value = state.venueId;
  if (ui.toolList) {
    const current = getTool();
    ui.toolList.innerHTML = tools
      .map((tool) => `<span class="tool-chip ${tool.id === current.id ? "active" : ""}">Lv.${tool.level} ${tool.name} R${Math.round(tool.radius)}</span>`)
      .join("");
  }
}

function endRound() {
  state.running = false;
  const earnedCoins = Math.floor(state.score / 650);
  const earnedExp = Math.floor(state.catches * 0.6 + state.bestCombo * 0.8);
  state.coins += earnedCoins;
  state.exp += earnedExp;
  levelUpCheck();
  save();
  ui.resultTitle.textContent = `Lv.${state.level} ${getTool().name}`;
  ui.resultSummary.textContent = `${state.catches}마리 정리, 최고 콤보 ${state.bestCombo}, 보너스 코인 ${earnedCoins}, 경험치 ${earnedExp} 획득`;
  ui.resultPanel.classList.remove("hidden");
  updateUi();
}

function pointerPos(event) {
  const rect = canvas.getBoundingClientRect();
  const point = event.touches ? event.touches[0] : event;
  return {
    x: ((point.clientX - rect.left) / rect.width) * W,
    y: ((point.clientY - rect.top) / rect.height) * H,
  };
}

canvas.addEventListener("pointerdown", (event) => {
  if (!state.running) return;
  const pos = pointerPos(event);
  state.pointer = { x: pos.x, y: pos.y, active: true };
  state.heroTarget = { x: pos.x, y: pos.y };
  state.heroAttack = 1;
  state.weaponHit = 1;
  addHeroAttackEffect(pos.x, pos.y);
  catchAt(pos.x, pos.y);
});

canvas.addEventListener("pointermove", (event) => {
  const pos = pointerPos(event);
  state.pointer = { x: pos.x, y: pos.y, active: true };
});

canvas.addEventListener("pointerleave", () => {
  state.pointer.active = false;
});

if (ui.skillShop) {
  ui.skillShop.addEventListener("click", (event) => {
    const button = event.target.closest("[data-skill]");
    if (button) {
      buyOrEquipSkill(button.dataset.skill);
      return;
    }
    const placeholder = event.target.closest("[data-placeholder]");
    if (!placeholder) return;
    if (state.shopTab === "place") {
      state.venueId = venues[Number(placeholder.dataset.placeholder)]?.id || state.venueId;
      save();
      updateUi();
    } else if (state.shopTab === "companion") {
      state.heroId = heroes[Number(placeholder.dataset.placeholder)]?.id || state.heroId;
      save();
      updateUi();
    }
  });
}

if (ui.dockTabs?.length) {
  ui.dockTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const label = tab.textContent.trim();
      state.shopTab = { "스킬": "skill", "도구": "tool", "동료": "companion", "펫": "companion", "장소": "place" }[label] || "skill";
      renderShop();
    });
  });
}

if (ui.futureSlots?.length) {
  ui.futureSlots.forEach((button, index) => {
    button.addEventListener("click", () => {
      state.shopTab = index === 0 ? "tool" : "companion";
      renderShop();
    });
  });
}

if (ui.levelSlider) {
  ui.levelSlider.addEventListener("input", () => {
    state.level = Number(ui.levelSlider.value);
    state.exp = Math.min(state.exp, requiredExp(state.level) - 1);
    save();
    updateUi();
  });
}

if (ui.coinGrantButton) {
  ui.coinGrantButton.addEventListener("click", () => {
    state.coins += 1000;
    save();
    updateUi();
  });
}

if (ui.venueRollButton) {
  ui.venueRollButton.addEventListener("click", () => {
    const others = venues.filter((venue) => venue.id !== state.venueId);
    state.venueId = others[Math.floor(Math.random() * others.length)].id;
    updateUi();
  });
}

if (ui.venueSelect) {
  ui.venueSelect.addEventListener("change", () => {
    state.venueId = ui.venueSelect.value;
    updateUi();
  });
}

ui.startButton.addEventListener("click", startRound);
ui.restartButton.addEventListener("click", startRound);
ui.skillButton.addEventListener("click", useSkill);
ui.soundToggle.addEventListener("click", () => {
  state.sound = !state.sound;
  ui.soundIcon.textContent = state.sound ? "♫" : "♪";
});

let audioCtx;
function beep(freq, duration) {
  if (!state.sound) return;
  audioCtx = audioCtx || new AudioContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.frequency.value = freq;
  osc.type = "square";
  gain.gain.value = 0.03;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

load();
updateUi();
requestAnimationFrame(loop);
