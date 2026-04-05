const DEBUG = {
  infiniteHealth: false,
  startAt: "ending", // "start" | 1 | 2 | 3 | "1" | "2" | "3" | "level1" | "level2" | "level3" | "ending"
};

const IMAGE_ASSETS = {
  home: "images/home.png",
  ending: "images/ending.png",
  level1Intro: "images/home.png",
  level2Intro: "images/ending.png",
  level3Intro: "images/ending.png",
};

const AUDIO_ASSETS = {
  music: {
    title: "sfx/music_title.mp3",
    level1: "sfx/music_level_1.mp3",
    level2: "sfx/music_level_2.mp3",
    level3: "sfx/music_level_3.mp3",
    ending: "sfx/music_ending.mp3",
    gameOver: "sfx/music_game_over.mp3",
  },
  sfx: {
    uiConfirm: "sfx/ui_confirm.wav",
    jump: "sfx/jump.mp3",
    playerHit: "sfx/player_hit.mp3",
    eggCatch: "sfx/egg.wav",
    eggCollect: "sfx/egg.wav",
    portalOpen: "sfx/portal_open.mp3",
    portalEnter: "sfx/portal_enter.mp3",
    enemyDefeat: "sfx/enemy_defeat.wav",
    keyPickup: "sfx/key_pickup.wav",
    pillarActivate: "sfx/pillar_activate.wav",
    bossPhase: "sfx/boss_phase.wav",
    bossBallLaunch: "sfx/boss_ball_launch.wav",
    bossBallBounce: "sfx/boss_ball_bounce.mp3",
    bossDefeat: "sfx/boss_defeat.wav",
    pauseToggle: "sfx/pause_toggle.wav",
  },
};

const AUDIO_SETTINGS = {
  musicVolume: 0.45,
  sfxVolume: 0.75,
};

const GAME_TEXT = {
  subtitles: {
    default: "Recorre tres desafíos, encuentra los huevos y vence al guardián final.",
    level1: "Nivel 1: Reúne 5 huevitos y encuentra la salida.",
    level2: "Nivel 2: junta los 5 huevos, esquiva enemigos y cruza el portal.",
    level3: "Nivel 3: busca cada llave arriba y activa los pilares abajo.",
  },
  levelLabels: {
    0: "Inicio",
    1: "Laberinto",
    2: "Plataformas",
    3: "Ritual",
    final: "Final",
  },
  intros: {
    1: {
      title: "Nivel 1: El laberinto",
      description: "Explora el laberinto, reúne los 5 huevitos y encuentra la salida para seguir la aventura.",
    },
    2: {
      title: "Nivel 2: El salto",
      description: "Sube por plataformas, esquiva enemigos y junta los huevos antes de cruzar el portal.",
    },
    3: {
      title: "Nivel 3: El ritual final",
      description: "Busca las llaves en las alturas, activa los pilares en orden y sobrevive al guardián.",
    },
  },
  messages: {
    gameOver: "Los huevitos se escondieron otra vez...",
    bossProgressDone: "Todos los pilares están listos: entra al portal final",
    bossNextLeft: "Sube por la izquierda y busca la primera llave",
    bossNextRight: "Cruza hacia la derecha para buscar la segunda llave",
    bossNextCenter: "Ve al centro superior y recoge la ultima llave",
    bossCarryKey: "Vuelve al suelo y activa el pilar iluminado",
    mazePortalLocked: "Reúne los 5 huevos para abrir la salida del laberinto",
    levelPortalLocked: "Reúne los 5 huevos para abrir el portal",
    bossPortalLocked: "Activa los 3 pilares de luz para sellar al guardián",
    bossSealed: "El guardián ha sido sellado",
    pause: "Pausa",
    gameOverTitle: "Inténtalo de nuevo",
    gameOverRestart: "Presiona Enter para reiniciar",
    introContinue: "Presiona Enter para continuar",
    introStartButton: "Presiona Enter para empezar",
    bossBar: "Pilares de luz",
    carriedKey: "Llave activa",
    mazeStart: "Inicio",
    mazeExit: "Salida",
  },
  ending: {
    lines: [
        "Hay un huevo oculto que no está a la vista,",
        "guarda un antiguo puzzle… no es cualquier pista.",
        "Pero antes debes saber dónde empezar…",
        "en aguas profundas lo tendrás que buscar.",
        "Sumergido en lo más hondo del “mar” espera sin hablar,",
        "¿te atreves a encontrarlo y su enigma descifrar?",
    ],
  },
  startScreen: {
    title: "Lukas Easter's Adventure",
    subtitle: "Una misión entre laberintos, portales y huevos mágicos",
    story:
      "Lukas sale a buscar 5 huevitos perdidos en cada fase. Cuando los reúne, la aventura avanza hasta enfrentar al gran guardián del portal.",
  },
};

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const homeScreen = document.getElementById("homeScreen");
const gameShell = document.getElementById("gameShell");
const startButton = document.getElementById("startButton");
const homeImage = document.getElementById("homeImage");

const endingBackgroundImage = new Image();
endingBackgroundImage.src = IMAGE_ASSETS.ending;
homeImage.src = IMAGE_ASSETS.home;

const musicPlayers = Object.fromEntries(
  Object.entries(AUDIO_ASSETS.music).map(([key, src]) => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = AUDIO_SETTINGS.musicVolume;
    return [key, audio];
  })
);

const audioState = {
  unlocked: false,
  currentMusic: null,
};

const hud = {
  level: document.getElementById("levelLabel"),
  eggs: document.getElementById("eggLabel"),
  health: document.getElementById("healthLabel"),
  subtitle: document.getElementById("subtitle"),
};

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GRAVITY = 0.52;
const PLAYER_LIVES = 5;
const LEVEL3_BALL_COUNT = 2;
const LEVEL3_BALL_INTERVAL = 75;
const keys = new Set();
const LEVEL_INTROS = {
  1: {
    title: GAME_TEXT.intros[1].title,
    description: GAME_TEXT.intros[1].description,
    image: IMAGE_ASSETS.level1Intro,
  },
  2: {
    title: GAME_TEXT.intros[2].title,
    description: GAME_TEXT.intros[2].description,
    image: IMAGE_ASSETS.level2Intro,
  },
  3: {
    title: GAME_TEXT.intros[3].title,
    description: GAME_TEXT.intros[3].description,
    image: IMAGE_ASSETS.level3Intro,
  },
};
const levelIntroImages = Object.fromEntries(
  Object.entries(LEVEL_INTROS).map(([level, intro]) => {
    const image = new Image();
    image.src = intro.image;
    return [level, image];
  })
);



const game = {
  scene: "start",
  currentLevel: 0,
  pendingLevel: null,
  levelMode: "menu",
  transitionTimer: 0,
  fade: 0,
  message: "",
  player: null,
  eggs: [],
  platforms: [],
  solids: [],
  enemies: [],
  spikes: [],
  pits: [],
  bullets: [],
  bossBullets: [],
  portal: null,
  boss: null,
  pillars: [],
  bossKeys: [],
  carriedKey: null,
  mazeMeta: null,
  phaseTimer: 0,
  endingStep: 0,
  paused: false,
};

function unlockAudio() {
  if (audioState.unlocked) return;
  audioState.unlocked = true;
  syncMusicForState();
}

function playMusic(key) {
  if (!audioState.unlocked || audioState.currentMusic === key || !musicPlayers[key]) return;

  if (audioState.currentMusic && musicPlayers[audioState.currentMusic]) {
    musicPlayers[audioState.currentMusic].pause();
    musicPlayers[audioState.currentMusic].currentTime = 0;
  }

  const track = musicPlayers[key];
  track.volume = AUDIO_SETTINGS.musicVolume;
  track.currentTime = 0;
  track.play().catch(() => {});
  audioState.currentMusic = key;
}

function stopMusic() {
  if (!audioState.currentMusic || !musicPlayers[audioState.currentMusic]) return;
  musicPlayers[audioState.currentMusic].pause();
  musicPlayers[audioState.currentMusic].currentTime = 0;
  audioState.currentMusic = null;
}

function playSfx(key, volumeMultiplier = 1) {
  if (!audioState.unlocked || !AUDIO_ASSETS.sfx[key]) return;
  const audio = new Audio(AUDIO_ASSETS.sfx[key]);
  audio.preload = "auto";
  audio.volume = Math.min(1, AUDIO_SETTINGS.sfxVolume * volumeMultiplier);
  audio.play().catch(() => {});
}

function syncMusicForState() {
  if (!audioState.unlocked) return;

  if (game.scene === "start") {
    playMusic("title");
    return;
  }

  if (game.scene === "ending") {
    playMusic("ending");
    return;
  }

  if (game.scene === "gameover") {
    playMusic("gameOver");
    return;
  }

  if (game.currentLevel >= 1 && game.currentLevel <= 3) {
    playMusic(`level${game.currentLevel}`);
  }
}

function isJumpEvent(event) {
  return (
    event.key === " " ||
    event.key === "Spacebar" ||
    event.key === "ArrowUp" ||
    event.key === "w" ||
    event.key === "W" ||
    event.code === "Space" ||
    event.code === "ArrowUp" ||
    event.code === "KeyW"
  );
}

function setHomeScreenVisible(isVisible) {
  homeScreen.classList.toggle("hidden", !isVisible);
  gameShell.classList.toggle("hidden", isVisible);
}

function createPlayer() {
  return {
    x: 70,
    y: HEIGHT - 110,
    w: 28,
    h: 38,
    vx: 0,
    vy: 0,
    speed: 3.4,
    jump: 10.8,
    grounded: false,
    facing: 1,
    eggs: 0,
    health: PLAYER_LIVES,
    invincible: 0,
    shotCooldown: 0,
  };
}

function resetForLevel(level) {
  game.currentLevel = level;
  game.levelMode = "platformer";
  game.player = createPlayer();
  game.eggs = [];
  game.platforms = [];
  game.solids = [];
  game.enemies = [];
  game.spikes = [];
  game.pits = [];
  game.bullets = [];
  game.bossBullets = [];
  game.portal = null;
  game.boss = null;
  game.pillars = [];
  game.bossKeys = [];
  game.carriedKey = null;
  game.mazeMeta = null;
  game.phaseTimer = 0;

  if (level === 1) {
    buildMazeLevel();
  } else if (level === 2) {
    buildPlatformLevel();
  } else if (level === 3) {
    buildBossLevel();
  }

  playMusic(`level${level}`);
  updateHud();
}

function addEgg(x, y, meta = {}) {
  game.eggs.push({ x, y, r: 12, collected: false, bob: Math.random() * Math.PI * 2, ...meta });
}

function addPlatform(x, y, w, h, kind = "solid", meta = {}) {
  game.platforms.push({ x, y, w, h, kind, ...meta });
}

function addSolid(x, y, w, h) {
  game.solids.push({ x, y, w, h });
}

function buildMazeLevel() {
  hud.subtitle.textContent = GAME_TEXT.subtitles.level1;

  game.levelMode = "maze";
  game.player.w = 22;
  game.player.h = 22;
  game.player.speed = 2.8;
  game.player.jump = 0;

  const mazeMap = [
    "###################",
    "#SA.#.....#....B..#",
    "###.#.###.#.###.###",
    "#...#...#...#...#.#",
    "#.#####.#####.#.#.#",
    "#.#.....#D..#.#.#.#",
    "#.#.###.#.#.#.##..#",
    "#...#.#...#.#....##",
    "#.###.#####.####..#",
    "#C....#.......E.P.#",
    "###################",
  ];

  const cell = 44;
  const originX = Math.floor((WIDTH - mazeMap[0].length * cell) / 2);
  const originY = Math.floor((HEIGHT - mazeMap.length * cell) / 2);

  game.mazeMeta = {
    map: mazeMap,
    cell,
    originX,
    originY,
    finalEggTeleportTriggered: false,
    finalEggTeleport: {
      x: originX + 5 * cell + cell / 2,
      y: originY + 7 * cell + cell / 2,
    },
  };

  for (let row = 0; row < mazeMap.length; row += 1) {
    for (let col = 0; col < mazeMap[row].length; col += 1) {
      const tile = mazeMap[row][col];
      const x = originX + col * cell;
      const y = originY + row * cell;
      const centerX = x + cell / 2;
      const centerY = y + cell / 2;

      if (tile === "#") {
        addSolid(x, y, cell, cell);
        continue;
      }

      if (tile === "S") {
        game.player.x = centerX - game.player.w / 2;
        game.player.y = centerY - game.player.h / 2;
      }

      if ("ABCDE".includes(tile)) {
        addEgg(centerX, centerY, { mazeEgg: true });
      }

      if (tile === "P") {
        game.portal = {
          x: x + 8,
          y: y + 8,
          w: cell - 16,
          h: cell - 16,
          active: false,
          label: GAME_TEXT.messages.mazeExit,
        };
      }
    }
  }
}

function buildPlatformLevel() {
  hud.subtitle.textContent = GAME_TEXT.subtitles.level2;

  game.player.x = 60;
  game.player.y = HEIGHT - 110;

  addPlatform(0, HEIGHT - 24, WIDTH, 24);
  addPlatform(100, 430, 160, 18);
  addPlatform(310, 370, 140, 18);
  addPlatform(510, 315, 150, 18, "vanish", { cycle: 180, offset: 10 });
  addPlatform(715, 250, 150, 18);
  addPlatform(500, 185, 130, 18, "vanish", { cycle: 150, offset: 65 });
  addPlatform(120, 170, 140, 18);
  addPlatform(750, 120, 180, 18);
  addPlatform(330, 110, 130, 18);
  addPlatform(820, 380, 100, 18, "vanish", { cycle: 120, offset: 35 });

  //game.spikes.push({ x: 255, y: HEIGHT - 44, w: 80, h: 28 });
  game.spikes.push({ x: 570, y: HEIGHT - 44, w: 80, h: 28 });
  game.spikes.push({ x: 835, y: HEIGHT - 44, w: 80, h: 28 });

  //game.pits.push({ x: 560, y: HEIGHT - 24, w: 70, h: 24 });
  //game.pits.push({ x: 780, y: HEIGHT - 24, w: 90, h: 24 });

  addEgg(180, 395);
  addEgg(180, 135);
  addEgg(585, 280);
  addEgg(870, 355);
  addEgg(385, 75);

  game.enemies.push(
    { x: 115, y: 406, w: 30, h: 24, minX: 110, maxX: 225, vx: 1.5 },
    { x: 345, y: 346, w: 30, h: 24, minX: 315, maxX: 415, vx: 1.8 },
    { x: 730, y: 226, w: 30, h: 24, minX: 720, maxX: 835, vx: -1.9 }
  );

  game.portal = { x: 865, y: 55, w: 38, h: 56, active: false, label: "Portal" };
}

function buildBossLevel() {
  hud.subtitle.textContent = GAME_TEXT.subtitles.level3;

  game.player.x = 90;
  game.player.y = HEIGHT - 110;

  addPlatform(0, HEIGHT - 24, WIDTH, 24);
  addPlatform(90, 438, 88, 16);
  addPlatform(210, 398, 76, 16);
  addPlatform(325, 352, 74, 16);
  addPlatform(438, 304, 76, 16);
  addPlatform(552, 258, 72, 16, "vanish", { cycle: 160, offset: 20 });
  addPlatform(665, 214, 72, 16);
  addPlatform(780, 168, 92, 16);
  addPlatform(652, 314, 74, 16);
  addPlatform(780, 276, 74, 16);
  addPlatform(182, 250, 74, 16);
  addPlatform(88, 190, 92, 16);
  addPlatform(378, 190, 70, 16, "vanish", { cycle: 145, offset: 52 });
  addPlatform(500, 148, 68, 16);

  //game.spikes.push({ x: 250, y: HEIGHT - 24, w: 78, h: 18 });
  //game.spikes.push({ x: 470, y: HEIGHT - 24, w: 92, h: 18 });
  //game.spikes.push({ x: 720, y: HEIGHT - 24, w: 88, h: 18 });

  game.pillars.push(
    { id: "left", x: 105, y: HEIGHT - 104, w: 24, h: 80, active: false, glow: 0, order: 0 },
    { id: "center", x: 468, y: HEIGHT - 104, w: 24, h: 80, active: false, glow: 0, order: 2 },
    { id: "right", x: 832, y: HEIGHT - 104, w: 24, h: 80, active: false, glow: 0, order: 1 }
  );

  game.bossKeys.push(
    { id: "left", x: 118, y: 150, r: 13, collected: false, active: true },
    { id: "right", x: 825, y: 128, r: 13, collected: false, active: false },
    { id: "center", x: 522, y: 108, r: 13, collected: false, active: false }
  );

  game.portal = { x: 890, y: 72, w: 40, h: 62, active: false, label: "Portal" };

  game.boss = {
    x: WIDTH / 2 - 180,
    y: 48,
    w: 360,
    h: 300,
    baseY: 48,
    fireTimer: 0,
    targetBalls: LEVEL3_BALL_COUNT,
    sealed: false,
    ritualTimer: 0,
    phase: 1,
    phaseAnimation: 0,
    pain: 0,
    defeatedFall: 0,
    defeatedLanded: false,
  };
}

function startGame() {
  unlockAudio();
  playSfx("uiConfirm");
  showLevelIntro(1);
}

function restartCurrentLevel() {
  playSfx("uiConfirm");
  showLevelIntro(game.currentLevel || 1);
}

function showLevelIntro(level) {
  keys.clear();
  setHomeScreenVisible(false);
  game.scene = "levelIntro";
  game.pendingLevel = level;
  game.currentLevel = level;
  playMusic(`level${level}`);
  updateHud();
}

function beginPendingLevel() {
  if (!game.pendingLevel) return;
  keys.clear();
  playSfx("uiConfirm");
  game.scene = "playing";
  resetForLevel(game.pendingLevel);
  game.pendingLevel = null;
}

function startFromDebugConfig() {
  const rawStartAt = String(DEBUG.startAt).trim().toLowerCase();

  if (rawStartAt === "ending" || rawStartAt === "end") {
    setHomeScreenVisible(false);
    game.scene = "ending";
    game.currentLevel = 0;
    game.levelMode = "menu";
    playMusic("ending");
    hud.subtitle.textContent = GAME_TEXT.subtitles.default;
    updateHud();
    return;
  }

  const levelAliases = {
    1: 1,
    2: 2,
    3: 3,
    "1": 1,
    "2": 2,
    "3": 3,
    level1: 1,
    level2: 2,
    level3: 3,
  };
  const debugLevel = levelAliases[rawStartAt];

  if (debugLevel) {
    setHomeScreenVisible(false);
    game.scene = "playing";
    resetForLevel(debugLevel);
    return;
  }

  game.scene = "start";
  game.currentLevel = 0;
  game.levelMode = "menu";
  setHomeScreenVisible(true);
  playMusic("title");
  hud.subtitle.textContent = GAME_TEXT.subtitles.default;
  updateHud();
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function circleRectOverlap(circle, rect) {
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy < circle.r * circle.r;
}

function activePlatforms() {
  return game.platforms.filter((platform) => {
    if (platform.kind !== "vanish") return true;
    const step = (game.transitionTimer + platform.offset) % platform.cycle;
    return step < platform.cycle * 0.58;
  });
}

function allCollisionRects() {
  return [...game.solids, ...activePlatforms()];
}

function hurtPlayer(forceX = -4, forceY = -7) {
  if (DEBUG.infiniteHealth) {
    game.player.invincible = 12;
    return;
  }

  if (game.player.invincible > 0) return;
  playSfx("playerHit");
  game.player.health -= 1;
  game.player.invincible = 90;
  game.player.vx = forceX;
  game.player.vy = forceY;
  updateHud();

  if (game.player.health <= 0) {
    game.scene = "gameover";
    game.message = GAME_TEXT.messages.gameOver;
    playMusic("gameOver");
  }
}

function nextLevel() {
  if (game.currentLevel < 3) {
    playSfx("portalEnter");
    showLevelIntro(game.currentLevel + 1);
  } else {
    game.scene = "ending";
    game.endingStep = 0;
    playMusic("ending");
  }
}

function updateHud() {
  const activePillars = game.pillars.filter((pillar) => pillar.active).length;
  hud.level.textContent = GAME_TEXT.levelLabels[game.currentLevel] || GAME_TEXT.levelLabels.final;
  hud.eggs.textContent =
    game.currentLevel === 3
      ? `${activePillars} / ${Math.max(game.pillars.length, 3)}`
      : `${game.player ? game.player.eggs : 0} / 5`;
  hud.health.textContent = `${game.player ? Math.max(game.player.health, 0) : PLAYER_LIVES}`;
}

function handleInput() {
  if (!game.player) return;

  const left = keys.has("ArrowLeft") || keys.has("KeyA") || keys.has("a") || keys.has("A");
  const right = keys.has("ArrowRight") || keys.has("KeyD") || keys.has("d") || keys.has("D");
  const up = keys.has("ArrowUp") || keys.has("KeyW") || keys.has("w") || keys.has("W");
  const down = keys.has("ArrowDown") || keys.has("KeyS") || keys.has("s") || keys.has("S");

  game.player.vx = 0;
  game.player.vy = game.levelMode === "maze" ? 0 : game.player.vy;

  if (game.levelMode === "maze") {
    if (left) game.player.vx = -game.player.speed;
    if (right) game.player.vx = game.player.speed;
    if (up) game.player.vy = -game.player.speed;
    if (down) game.player.vy = game.player.speed;
    if (left) game.player.facing = -1;
    if (right) game.player.facing = 1;
    return;
  }

  if (left) {
    game.player.vx = -game.player.speed;
    game.player.facing = -1;
  }
  if (right) {
    game.player.vx = game.player.speed;
    game.player.facing = 1;
  }
}

function jump() {
  if (game.scene !== "playing" || !game.player?.grounded) return;
  playSfx("jump", 0.8);
  game.player.vy = -game.player.jump;
  game.player.grounded = false;
}

function shoot() {
  return;
}

function movePlayer() {
  const player = game.player;
  if (game.levelMode === "maze") {
    player.x += player.vx;
    for (const solid of game.solids) {
      if (!rectsOverlap(player, solid)) continue;
      if (player.vx > 0) player.x = solid.x - player.w;
      if (player.vx < 0) player.x = solid.x + solid.w;
    }

    player.y += player.vy;
    for (const solid of game.solids) {
      if (!rectsOverlap(player, solid)) continue;
      if (player.vy > 0) player.y = solid.y - player.h;
      if (player.vy < 0) player.y = solid.y + solid.h;
    }

    const { originX, originY, map, cell } = game.mazeMeta;
    const maxX = originX + map[0].length * cell - player.w;
    const maxY = originY + map.length * cell - player.h;
    player.x = Math.max(originX, Math.min(maxX, player.x));
    player.y = Math.max(originY, Math.min(maxY, player.y));
    return;
  }

  player.vy += GRAVITY;

  player.x += player.vx;
  for (const solid of allCollisionRects()) {
    if (!rectsOverlap(player, solid)) continue;
    if (player.vx > 0) {
      player.x = solid.x - player.w;
    } else if (player.vx < 0) {
      player.x = solid.x + solid.w;
    }
  }

  player.y += player.vy;
  player.grounded = false;
  for (const solid of allCollisionRects()) {
    if (!rectsOverlap(player, solid)) continue;
    if (player.vy > 0) {
      player.y = solid.y - player.h;
      player.vy = 0;
      player.grounded = true;
    } else if (player.vy < 0) {
      player.y = solid.y + solid.h;
      player.vy = 0;
    }
  }

  player.x = Math.max(0, Math.min(WIDTH - player.w, player.x));
  if (player.y > HEIGHT + 120) {
    hurtPlayer(-3 * player.facing, -9);
    player.x = 60;
    player.y = HEIGHT - 110;
  }
}

function updateEggs() {
  for (const egg of game.eggs) {
    egg.bob += 0.06;
    if (!egg.collected && circleRectOverlap(egg, game.player)) {
      if (
        game.currentLevel === 1 &&
        egg.mazeEgg &&
        game.player.eggs === 4 &&
        game.mazeMeta &&
        !game.mazeMeta.finalEggTeleportTriggered
      ) {
        egg.x = game.mazeMeta.finalEggTeleport.x;
        egg.y = game.mazeMeta.finalEggTeleport.y;
        egg.bob = Math.random() * Math.PI * 2;
        game.mazeMeta.finalEggTeleportTriggered = true;
        playSfx("portalEnter", 0.75);
        continue;
      }

      egg.collected = true;
      game.player.eggs += 1;
      playSfx("eggCatch");
      playSfx("eggCollect");
      updateHud();
      if (game.player.eggs === 5 && game.portal) {
        game.portal.active = true;
        playSfx("portalOpen");
      }
    }
  }
}

function updateLevelTwo() {
  for (const enemy of game.enemies) {
    enemy.x += enemy.vx;
    if (enemy.x <= enemy.minX || enemy.x + enemy.w >= enemy.maxX) {
      enemy.vx *= -1;
    }

    if (rectsOverlap(game.player, enemy)) {
      const playerBottom = game.player.y + game.player.h;
      const stomped =
        game.player.vy > 0 &&
        playerBottom - enemy.y < 18 &&
        game.player.y < enemy.y;

      if (stomped) {
        enemy.defeated = true;
        game.player.y = enemy.y - game.player.h;
        game.player.vy = -6.8;
        playSfx("enemyDefeat");
      } else {
        hurtPlayer(enemy.vx > 0 ? -5 : 5, -6);
      }
    }
  }

  game.enemies = game.enemies.filter((enemy) => !enemy.defeated);

  for (const spike of game.spikes) {
    if (rectsOverlap(game.player, { ...spike, y: spike.y - 6 })) {
      hurtPlayer(-4 * game.player.facing, -7);
    }
  }

  for (const pit of game.pits) {
    if (
      game.player.x + game.player.w > pit.x &&
      game.player.x < pit.x + pit.w &&
      game.player.y + game.player.h >= HEIGHT - 25
    ) {
      hurtPlayer(-3 * game.player.facing, -8);
      game.player.x = 60;
      game.player.y = HEIGHT - 110;
    }
  }
}

function updateBossLevel() {
  const boss = game.boss;
  if (!boss) return;

  for (const spike of game.spikes) {
    if (rectsOverlap(game.player, { ...spike, y: spike.y - 6 })) {
      hurtPlayer(-4 * game.player.facing, -7);
    }
  }

  let activePillars = 0;
  for (const bossKey of game.bossKeys) {
    if (!bossKey.active || bossKey.collected) continue;
    const pickupZone = { x: bossKey.x - bossKey.r, y: bossKey.y - bossKey.r, w: bossKey.r * 2, h: bossKey.r * 2 };
    if (circleRectOverlap({ x: bossKey.x, y: bossKey.y, r: bossKey.r }, game.player) || rectsOverlap(game.player, pickupZone)) {
      bossKey.collected = true;
      game.carriedKey = bossKey.id;
      boss.phaseAnimation = 70;
      playSfx("keyPickup");
    }
  }

  for (const pillar of game.pillars) {
    const hitbox = { x: pillar.x - 10, y: pillar.y, w: pillar.w + 20, h: pillar.h };
    if (!pillar.active && game.carriedKey === pillar.id && rectsOverlap(game.player, hitbox)) {
      pillar.active = true;
      pillar.glow = 1;
      game.carriedKey = null;
      boss.phaseAnimation = 110;
      boss.pain = 36;
      playSfx("pillarActivate");

      const nextKey = game.bossKeys.find((bossKey) => bossKey.id === (pillar.id === "left" ? "right" : pillar.id === "right" ? "center" : ""));
      if (nextKey) nextKey.active = true;
    }

    if (pillar.active) {
      activePillars += 1;
      pillar.glow = Math.min(1, pillar.glow + 0.03);
    } else {
      pillar.glow = Math.max(0, pillar.glow - 0.02);
    }
  }

  if (activePillars >= 1 && boss.phase === 1) {
    boss.phase = 2;
    boss.targetBalls = LEVEL3_BALL_COUNT + 2;
    playSfx("bossPhase");
  }
  if (activePillars >= 2 && boss.phase === 2) {
    boss.phase = 3;
    boss.targetBalls = LEVEL3_BALL_COUNT + 3;
    playSfx("bossPhase");
  }

  if (!boss.sealed) {
    boss.y = boss.baseY + Math.sin(game.transitionTimer * 0.03) * 6;

    boss.fireTimer += 1;
    if (boss.fireTimer >= LEVEL3_BALL_INTERVAL) {
      boss.fireTimer = 0;
      while (game.bossBullets.length < boss.targetBalls) {
        spawnBossBall();
      }
    }
  } else {
    boss.ritualTimer += 1;
    boss.phaseAnimation = Math.max(0, boss.phaseAnimation - 1);
    if (!boss.defeatedLanded) {
      boss.defeatedFall += 0.9;
      boss.y = Math.min(HEIGHT - boss.h + 36, boss.y + boss.defeatedFall);
      if (boss.y >= HEIGHT - boss.h + 36) {
        boss.y = HEIGHT - boss.h + 36;
        boss.defeatedLanded = true;
      }
    }
  }

  if (boss.phaseAnimation > 0) {
    boss.phaseAnimation -= 1;
  }
  if (boss.pain > 0) {
    boss.pain -= 1;
  }

  for (const ball of game.bossBullets) {
    if (ball.bounceCooldown > 0) ball.bounceCooldown -= 1;
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x <= 0) {
      ball.x = 0;
      ball.vx = Math.abs(ball.vx);
      if (ball.bounceCooldown === 0) {
        playSfx("bossBallBounce", 0.45);
        ball.bounceCooldown = 4;
      }
    } else if (ball.x + ball.r * 2 >= WIDTH) {
      ball.x = WIDTH - ball.r * 2;
      ball.vx = -Math.abs(ball.vx);
      if (ball.bounceCooldown === 0) {
        playSfx("bossBallBounce", 0.45);
        ball.bounceCooldown = 4;
      }
    }

    if (ball.y <= 0) {
      ball.y = 0;
      ball.vy = Math.abs(ball.vy);
      if (ball.bounceCooldown === 0) {
        playSfx("bossBallBounce", 0.45);
        ball.bounceCooldown = 4;
      }
    } else if (ball.y + ball.r * 2 >= HEIGHT - 24) {
      ball.y = HEIGHT - 24 - ball.r * 2;
      ball.vy = -Math.abs(ball.vy);
      if (ball.bounceCooldown === 0) {
        playSfx("bossBallBounce", 0.45);
        ball.bounceCooldown = 4;
      }
    }

    for (const platform of activePlatforms()) {
      const rect = { x: ball.x, y: ball.y, w: ball.r * 2, h: ball.r * 2 };
      if (!rectsOverlap(rect, platform)) continue;

      const overlapLeft = rect.x + rect.w - platform.x;
      const overlapRight = platform.x + platform.w - rect.x;
      const overlapTop = rect.y + rect.h - platform.y;
      const overlapBottom = platform.y + platform.h - rect.y;
      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

      if (minOverlap === overlapTop) {
        ball.y = platform.y - rect.h;
        ball.vy = -Math.abs(ball.vy);
      } else if (minOverlap === overlapBottom) {
        ball.y = platform.y + platform.h;
        ball.vy = Math.abs(ball.vy);
      } else if (minOverlap === overlapLeft) {
        ball.x = platform.x - rect.w;
        ball.vx = -Math.abs(ball.vx);
      } else {
        ball.x = platform.x + platform.w;
        ball.vx = Math.abs(ball.vx);
      }

      if (ball.bounceCooldown === 0) {
        playSfx("bossBallBounce", 0.45);
        ball.bounceCooldown = 4;
      }
    }

    const rect = { x: ball.x, y: ball.y, w: ball.r * 2, h: ball.r * 2 };
    if (rectsOverlap(rect, game.player)) {
      hurtPlayer(ball.vx > 0 ? -5 : 5, -7);
    }
  }

  if (activePillars === game.pillars.length && !boss.sealed) {
    boss.sealed = true;
    boss.phaseAnimation = 180;
    boss.pain = 60;
    boss.defeatedFall = 0;
    boss.defeatedLanded = false;
    game.bossBullets = [];
    game.portal.active = true;
    playSfx("bossDefeat");
    playSfx("portalOpen");
  }

  updateHud();
}

function nextLevelThreeInstruction() {
  const nextKey = game.bossKeys.find((bossKey) => bossKey.active && !bossKey.collected);
  if (!nextKey) {
    return GAME_TEXT.messages.bossProgressDone;
  }

  if (nextKey.id === "left") return GAME_TEXT.messages.bossNextLeft;
  if (nextKey.id === "right") return GAME_TEXT.messages.bossNextRight;
  return GAME_TEXT.messages.bossNextCenter;
}

function spawnBossBall() {
  const boss = game.boss;
  if (!boss || boss.sealed) return;

  const speedBoost = boss.phase >= 3 ? 0.8 : boss.phase >= 2 ? 0.45 : 0;
  const launchX = boss.phase === 1 ? boss.x + boss.w * 0.52 : boss.phase === 2 ? boss.x + boss.w * 0.42 : boss.x + boss.w * 0.62;
  playSfx("bossBallLaunch", 0.55);
  game.bossBullets.push({
    x: launchX - 10,
    y: boss.y + boss.h * 0.68 - 10,
    r: 10,
    vx: (Math.random() > 0.5 ? 1 : -1) * (2.6 + Math.random() * 0.7 + speedBoost),
    vy: -2.4 - Math.random() * 1.4 - speedBoost * 0.4,
    bounceCooldown: 0,
  });
}

function updatePortal() {
  if (game.portal?.active && rectsOverlap(game.player, game.portal)) {
    nextLevel();
  }
}

function updateGame() {
  if (game.paused) return;

  game.transitionTimer += 1;

  if (game.scene === "playing") {
    handleInput();
    movePlayer();
    updateEggs();
    updatePortal();

    if (game.currentLevel === 2) updateLevelTwo();
    if (game.currentLevel === 3) updateBossLevel();

    if (game.player.invincible > 0) game.player.invincible -= 1;
    if (game.player.shotCooldown > 0) game.player.shotCooldown -= 1;
  } else if (game.scene === "ending") {
    game.endingStep += 1;
  }
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#fff6bf");
  gradient.addColorStop(0.5, "#ffd69d");
  gradient.addColorStop(1, "#c7f0f3");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.arc(120, 85, 55, 0, Math.PI * 2);
  ctx.arc(165, 83, 42, 0, Math.PI * 2);
  ctx.arc(630, 96, 40, 0, Math.PI * 2);
  ctx.arc(675, 82, 52, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#b6df77";
  ctx.fillRect(0, HEIGHT - 24, WIDTH, 24);
}

function drawStartScreen() {
  drawBackground();
  ctx.fillStyle = "rgba(255, 250, 239, 0.92)";
  roundRect(120, 80, WIDTH - 240, HEIGHT - 160, 32, true);

  ctx.fillStyle = "#825225";
  ctx.font = "700 54px 'Baloo 2'";
  ctx.textAlign = "center";
  ctx.fillText(GAME_TEXT.startScreen.title, WIDTH / 2, 170);

  ctx.font = "700 28px 'Nunito'";
  ctx.fillStyle = "#5b6f30";
  ctx.fillText(GAME_TEXT.startScreen.subtitle, WIDTH / 2, 220);

  wrapText(GAME_TEXT.startScreen.story, WIDTH / 2, 290, 560, 32);

  drawButton(WIDTH / 2 - 120, 360, 240, 68, GAME_TEXT.messages.introStartButton);
}

function drawPlatform(platform) {
  const visible = platform.kind !== "vanish" || activePlatforms().includes(platform);
  if (!visible) return;

  ctx.fillStyle = platform.kind === "vanish" ? "#f5b773" : "#7ab85c";
  roundRect(platform.x, platform.y, platform.w, platform.h, 9, true);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  roundRect(platform.x + 8, platform.y + 4, platform.w - 16, 4, 2, true);
}

function drawSolid(solid) {
  ctx.fillStyle = game.levelMode === "maze" ? "#2a221c" : "#ca8d59";
  roundRect(solid.x, solid.y, solid.w, solid.h, 8, true);
}

function drawEgg(egg) {
  if (egg.collected) return;
  const bobY = Math.sin(egg.bob) * 4;
  ctx.save();
  ctx.translate(egg.x, egg.y + bobY);
  ctx.fillStyle = "#fffaf1";
  ctx.beginPath();
  ctx.ellipse(0, 0, 12, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff92a4";
  ctx.beginPath();
  ctx.arc(-3, -3, 2.2, 0, Math.PI * 2);
  ctx.arc(3, 1, 2.2, 0, Math.PI * 2);
  ctx.arc(0, 6, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPortal() {
  if (!game.portal) return;
  ctx.save();
  ctx.globalAlpha = game.portal.active ? 1 : 0.35;
  ctx.fillStyle =
    game.levelMode === "maze"
      ? game.portal.active
        ? "#78d0ff"
        : "#b8c8ff"
      : game.portal.active
        ? "#68b7ff"
        : "#bdb4f8";
  roundRect(game.portal.x, game.portal.y, game.portal.w, game.portal.h, 16, true);
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  roundRect(game.portal.x + 6, game.portal.y + 6, game.portal.w - 12, game.portal.h - 12, 12);
  ctx.restore();
}

function drawSpikes() {
  ctx.fillStyle = "#8c6f62";
  for (const spike of game.spikes) {
    const count = Math.floor(spike.w / 15);
    for (let i = 0; i < count; i += 1) {
      const x = spike.x + i * 15;
      ctx.beginPath();
      ctx.moveTo(x, spike.y + spike.h);
      ctx.lineTo(x + 7.5, spike.y);
      ctx.lineTo(x + 15, spike.y + spike.h);
      ctx.fill();
    }
  }
}

function drawPits() {
  for (const pit of game.pits) {
    const gradient = ctx.createLinearGradient(0, pit.y, 0, pit.y + 42);
    gradient.addColorStop(0, "#5c3b2f");
    gradient.addColorStop(1, "#1f1714");
    ctx.fillStyle = gradient;
    roundRect(pit.x, pit.y - 2, pit.w, 30, 10, true);

    ctx.fillStyle = "rgba(255, 210, 160, 0.18)";
    roundRect(pit.x + 6, pit.y + 4, pit.w - 12, 6, 4, true);
  }
}

function drawEnemies() {
  for (const enemy of game.enemies) {
    ctx.fillStyle = "#db6e54";
    roundRect(enemy.x, enemy.y, enemy.w, enemy.h, 10, true);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(enemy.x + 9, enemy.y + 10, 3, 0, Math.PI * 2);
    ctx.arc(enemy.x + 21, enemy.y + 10, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer() {
  const player = game.player;
  if (!player) return;
  ctx.save();
  if (player.invincible > 0 && Math.floor(player.invincible / 6) % 2 === 0) {
    ctx.globalAlpha = 0.45;
  }

  if (game.levelMode === "maze") {
    ctx.fillStyle = "#f0c44d";
    ctx.beginPath();
    ctx.arc(player.x + player.w / 2, player.y + player.h / 2, player.w / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f7d8b4";
    ctx.beginPath();
    ctx.arc(player.x + player.w / 2, player.y + player.h / 2 + 2, player.w / 2 - 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#4fa8dc";
    roundRect(player.x + 5, player.y + 11, player.w - 10, 8, 3, true);

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(player.x + 8, player.y + 10, 2.2, 0, Math.PI * 2);
    ctx.arc(player.x + 14, player.y + 10, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#3f2d1d";
    ctx.beginPath();
    ctx.arc(player.x + 8, player.y + 10, 1, 0, Math.PI * 2);
    ctx.arc(player.x + 14, player.y + 10, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  const facing = player.facing >= 0 ? 1 : -1;
  const isAirborne = !player.grounded;
  const isMoving = Math.abs(player.vx) > 0.2;
  const walkCycle = game.transitionTimer * 0.24;
  const idleCycle = game.transitionTimer * 0.08;
  const walkSwing = isMoving && !isAirborne ? Math.sin(walkCycle) * 4.5 : 0;
  const idleBob = !isMoving && !isAirborne ? Math.sin(idleCycle) * 1.4 : 0;
  const jumpStretch = isAirborne ? Math.max(-3, Math.min(4, player.vy * 0.35)) : 0;
  const armLift = player.shotCooldown > 10 ? 5 : 0;
  const blink = Math.floor(game.transitionTimer % 240) > 228;
  const baseX = player.x;
  const baseY = player.y + idleBob;
  const leftEyeX = baseX + (facing > 0 ? 10 : 11);
  const rightEyeX = baseX + (facing > 0 ? 18 : 17);

  ctx.fillStyle = "#2b3551";
  roundRect(baseX + 7, baseY + 24 - jumpStretch * 0.15, player.w - 14, 12, 5, true);

  ctx.strokeStyle = "#2b3551";
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (isAirborne) {
    ctx.moveTo(baseX + 10, baseY + 36);
    ctx.lineTo(baseX + 7, baseY + player.h - 2);
    ctx.moveTo(baseX + 18, baseY + 36);
    ctx.lineTo(baseX + 22, baseY + player.h - 1);
  } else {
    ctx.moveTo(baseX + 10, baseY + 36);
    ctx.lineTo(baseX + 8 - walkSwing * 0.22, baseY + player.h);
    ctx.moveTo(baseX + 18, baseY + 36);
    ctx.lineTo(baseX + 20 + walkSwing * 0.22, baseY + player.h);
  }
  ctx.stroke();

  ctx.strokeStyle = "#f7d8b4";
  ctx.beginPath();
  if (isAirborne) {
    ctx.moveTo(baseX + 6, baseY + 21);
    ctx.lineTo(baseX + 2 - facing, baseY + 16 - armLift);
    ctx.moveTo(baseX + player.w - 6, baseY + 21);
    ctx.lineTo(baseX + player.w + facing * 3, baseY + 18 - armLift);
  } else {
    ctx.moveTo(baseX + 6, baseY + 21);
    ctx.lineTo(baseX + 2 - walkSwing * 0.32, baseY + 28 - armLift);
    ctx.moveTo(baseX + player.w - 6, baseY + 21);
    ctx.lineTo(baseX + player.w + walkSwing * 0.32, baseY + 28 - armLift * 0.6);
  }
  ctx.stroke();

  ctx.fillStyle = "#2f6fb8";
  roundRect(baseX + 5, baseY + 16 - jumpStretch * 0.2, player.w - 10, 14 + jumpStretch * 0.15, 6, true);

  ctx.fillStyle = "#f7d8b4";
  roundRect(baseX + 7, baseY + 5 - jumpStretch * 0.15, player.w - 14, 14, 7, true);

  ctx.fillStyle = "#f0c44d";
  ctx.beginPath();
  ctx.arc(baseX + player.w / 2, baseY + 9, 10, Math.PI, Math.PI * 2);
  ctx.fill();
  roundRect(baseX + 6, baseY + 6, player.w - 12, 5, 2, true);

  ctx.fillStyle = "#fff";
  if (blink) {
    ctx.fillRect(leftEyeX - 2, baseY + 12, 4, 1.2);
    ctx.fillRect(rightEyeX - 2, baseY + 12, 4, 1.2);
  } else {
    ctx.beginPath();
    ctx.arc(leftEyeX, baseY + 12, 2.6, 0, Math.PI * 2);
    ctx.arc(rightEyeX, baseY + 12, 2.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#3f2d1d";
    ctx.beginPath();
    ctx.arc(leftEyeX + facing * 0.4, baseY + 12, 1.1, 0, Math.PI * 2);
    ctx.arc(rightEyeX + facing * 0.4, baseY + 12, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "#9b6a42";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (isAirborne) {
    ctx.arc(baseX + 14, baseY + 16, 3.2, 0.15, Math.PI - 0.15);
  } else {
    ctx.arc(baseX + 14, baseY + 15 + Math.sin(idleCycle) * 0.35, 3, 0.2, Math.PI - 0.2);
  }
  ctx.stroke();
  ctx.restore();
}

function drawBoss() {
  const boss = game.boss;
  if (!boss) return;

  const painShake = boss.pain > 0 ? Math.sin(game.transitionTimer * 1.6) * 8 : 0;
  const defeatedEyes = boss.sealed && boss.defeatedLanded;
  const bodyColor =
    boss.sealed ? "#cbbd8d" : boss.pain > 0 ? "#ff8a7a" : boss.phase === 1 ? "#8b5dd6" : boss.phase === 2 ? "#c95a64" : "#db4f5d";

  ctx.save();
  ctx.translate(painShake, 0);

  if (boss.phaseAnimation > 0) {
    ctx.fillStyle = boss.sealed
      ? `rgba(255, 243, 154, ${0.18 + 0.16 * Math.sin(game.transitionTimer * 0.25)})`
      : `rgba(255, 126, 87, ${0.16 + 0.14 * Math.sin(game.transitionTimer * 0.25)})`;
    ctx.beginPath();
    ctx.arc(boss.x + boss.w / 2, boss.y + boss.h / 2, 170, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "rgba(43, 24, 27, 0.18)";
  ctx.beginPath();
  ctx.ellipse(boss.x + boss.w / 2, boss.y + boss.h - 12, boss.w / 2.1, 38, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = bodyColor;
  roundRect(boss.x, boss.y + 34, boss.w, boss.h - 34, 48, true);
  ctx.beginPath();
  ctx.arc(boss.x + boss.w / 2, boss.y + 88, 110, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = boss.sealed ? "#eadfb8" : "#f6d9d1";
  ctx.beginPath();
  ctx.arc(boss.x + boss.w / 2, boss.y + 102, 72, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(boss.x + 132, boss.y + 82, 17, 0, Math.PI * 2);
  ctx.arc(boss.x + 226, boss.y + 82, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = defeatedEyes ? "#5d4a2a" : boss.pain > 0 ? "#7f1423" : "#2b1d33";
  ctx.lineWidth = defeatedEyes ? 4 : 1;
  if (defeatedEyes) {
    ctx.beginPath();
    ctx.moveTo(boss.x + 125, boss.y + 75);
    ctx.lineTo(boss.x + 139, boss.y + 89);
    ctx.moveTo(boss.x + 139, boss.y + 75);
    ctx.lineTo(boss.x + 125, boss.y + 89);
    ctx.moveTo(boss.x + 219, boss.y + 75);
    ctx.lineTo(boss.x + 233, boss.y + 89);
    ctx.moveTo(boss.x + 233, boss.y + 75);
    ctx.lineTo(boss.x + 219, boss.y + 89);
    ctx.stroke();
  } else {
    ctx.fillStyle = boss.pain > 0 ? "#7f1423" : "#2b1d33";
    ctx.beginPath();
    ctx.arc(boss.x + 132 + Math.sin(game.transitionTimer * 0.12) * 2, boss.y + 84, 7, 0, Math.PI * 2);
    ctx.arc(boss.x + 226 + Math.sin(game.transitionTimer * 0.12) * 2, boss.y + 84, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = boss.pain > 0 ? "#7f1423" : "#4b2837";
  ctx.lineWidth = 6;
  ctx.beginPath();
  if (defeatedEyes) {
    ctx.moveTo(boss.x + 136, boss.y + 164);
    ctx.quadraticCurveTo(boss.x + boss.w / 2, boss.y + 178, boss.x + 224, boss.y + 164);
  } else if (boss.pain > 0) {
    ctx.moveTo(boss.x + 132, boss.y + 148);
    ctx.quadraticCurveTo(boss.x + boss.w / 2, boss.y + 182, boss.x + 228, boss.y + 148);
  } else {
    ctx.moveTo(boss.x + 128, boss.y + 154);
    ctx.quadraticCurveTo(boss.x + boss.w / 2, boss.y + 134, boss.x + 232, boss.y + 154);
  }
  ctx.stroke();

  ctx.restore();

  const barX = 545;
  const barY = 32;
  const barW = 300;
  ctx.fillStyle = "rgba(60, 27, 21, 0.35)";
  roundRect(barX, barY, barW, 22, 12, true);
  ctx.fillStyle = "#ffe28a";
  roundRect(
    barX + 3,
    barY + 3,
    (barW - 6) * (game.pillars.filter((pillar) => pillar.active).length / Math.max(game.pillars.length, 1)),
    16,
    10,
    true
  );
  ctx.fillStyle = "#4c2b21";
  ctx.font = "700 16px Nunito";
  ctx.fillText(GAME_TEXT.messages.bossBar, barX + barW / 2, barY - 8);
}

function drawPillars() {
  for (const pillar of game.pillars) {
    const isNext = !pillar.active && game.carriedKey === pillar.id;
    const glowStrength = pillar.active ? 0.55 + 0.2 * Math.sin(game.transitionTimer * 0.18) : isNext ? 0.28 : 0.18;

    if (pillar.active) {
      ctx.fillStyle = `rgba(255, 241, 175, ${glowStrength})`;
      ctx.fillRect(pillar.x - 6, 0, pillar.w + 12, pillar.y + 8);
    }

    ctx.fillStyle = pillar.active ? "#ffe4a0" : isNext ? "#bea47b" : "#8b775f";
    roundRect(pillar.x, pillar.y, pillar.w, pillar.h, 10, true);
    ctx.fillStyle = pillar.active ? "#fffdf1" : "#d1c3ad";
    roundRect(pillar.x - 8, pillar.y - 16, pillar.w + 16, 22, 10, true);
    ctx.fillStyle = pillar.active ? "#fff6bf" : isNext ? "#f7d28a" : "#6d5945";
    ctx.beginPath();
    ctx.arc(pillar.x + pillar.w / 2, pillar.y - 4, pillar.active ? 10 : 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.24)";
    roundRect(pillar.x + 4, pillar.y + 10, pillar.w - 8, pillar.h - 20, 4, true);
  }
}

function drawBossKeys() {
  for (const bossKey of game.bossKeys) {
    if (!bossKey.active || bossKey.collected) continue;

    const bob = Math.sin(game.transitionTimer * 0.12 + bossKey.x * 0.01) * 4;
    ctx.save();
    ctx.translate(bossKey.x, bossKey.y + bob);
    ctx.fillStyle = "#ffe47e";
    ctx.beginPath();
    ctx.arc(0, 0, bossKey.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff7c6";
    ctx.beginPath();
    ctx.arc(0, 0, bossKey.r - 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#cc9f2f";
    roundRect(7, -2, 18, 4, 2, true);
    roundRect(20, -2, 4, 14, 1, true);
    roundRect(16, 4, 4, 4, 1, true);
    roundRect(22, 8, 4, 4, 1, true);
    ctx.restore();
  }

  if (game.carriedKey) {
    ctx.fillStyle = "rgba(255, 248, 204, 0.95)";
    ctx.font = "700 18px Nunito";
    ctx.textAlign = "left";
    ctx.fillText(GAME_TEXT.messages.carriedKey, 24, 64);
  }
}

function drawBullets() {
  if (game.currentLevel === 3) {
    ctx.fillStyle = "#ff9a62";
    for (const bullet of game.bossBullets) {
      ctx.beginPath();
      ctx.arc(bullet.x + bullet.r, bullet.y + bullet.r, bullet.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 244, 194, 0.7)";
      ctx.beginPath();
      ctx.arc(bullet.x + bullet.r - 3, bullet.y + bullet.r - 3, bullet.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff9a62";
    }
    return;
  }

  ctx.fillStyle = "#fef5f5";
  for (const bullet of game.bullets) {
    roundRect(bullet.x, bullet.y, bullet.w, bullet.h, 3, true);
  }

  ctx.fillStyle = "#7f4cff";
  for (const bullet of game.bossBullets) {
    ctx.beginPath();
    ctx.arc(bullet.x + bullet.r, bullet.y + bullet.r, bullet.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayingScene() {
  drawBackground();

  if (game.levelMode === "maze" && game.mazeMeta) {
    const { originX, originY, map, cell } = game.mazeMeta;
    ctx.fillStyle = "#f6e3a1";
    roundRect(originX, originY, map[0].length * cell, map.length * cell, 24, true);
  }

  if (game.currentLevel === 3) drawBoss();
  for (const solid of game.solids) drawSolid(solid);
  for (const platform of game.platforms) drawPlatform(platform);
  drawPits();
  drawSpikes();
  if (game.currentLevel === 3) drawPillars();
  drawPortal();
  if (game.currentLevel === 3) drawBossKeys();
  for (const egg of game.eggs) drawEgg(egg);
  drawEnemies();
  drawBullets();
  drawPlayer();

  if (game.levelMode === "maze" && game.mazeMeta) {
    const { originX, originY, map, cell } = game.mazeMeta;
    ctx.fillStyle = "#58402d";
    ctx.font = "900 22px Nunito";
    ctx.textAlign = "left";
    ctx.fillText(GAME_TEXT.messages.mazeStart, originX + 10, originY - 10);
    ctx.textAlign = "right";
    ctx.fillText(GAME_TEXT.messages.mazeExit, originX + map[0].length * cell - 10, originY + map.length * cell + 26);
  }

  if (game.portal && !game.portal.active) {
    ctx.fillStyle = "#6f5b48";
    ctx.font = "700 20px Nunito";
    ctx.textAlign = "center";
    ctx.fillText(
      game.currentLevel === 3
        ? game.carriedKey
          ? GAME_TEXT.messages.bossCarryKey
          : nextLevelThreeInstruction()
        : game.levelMode === "maze"
        ? GAME_TEXT.messages.mazePortalLocked
        : GAME_TEXT.messages.levelPortalLocked,
      WIDTH / 2,
      24
    );
  }

  if (game.currentLevel === 3 && game.boss?.sealed) {
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.font = "900 28px Nunito";
    ctx.fillText(GAME_TEXT.messages.bossSealed, WIDTH / 2, 82);
  }

  if (game.paused) {
    ctx.fillStyle = "rgba(43, 33, 18, 0.45)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#fff";
    ctx.font = "900 42px 'Baloo 2'";
    ctx.fillText(GAME_TEXT.messages.pause, WIDTH / 2, HEIGHT / 2);
  }
}

function drawGameOver() {
  drawPlayingScene();
  ctx.fillStyle = "rgba(62, 30, 24, 0.55)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#fff7ec";
  roundRect(250, 160, 460, 220, 28, true);
  ctx.fillStyle = "#7a4131";
  ctx.font = "700 42px 'Baloo 2'";
  ctx.fillText(GAME_TEXT.messages.gameOverTitle, WIDTH / 2, 225);
  ctx.font = "700 24px Nunito";
  ctx.fillText(game.message, WIDTH / 2, 278);
  ctx.fillText(GAME_TEXT.messages.gameOverRestart, WIDTH / 2, 330);
}

function drawLevelIntro() {
  const intro = LEVEL_INTROS[game.pendingLevel] || LEVEL_INTROS[1];
  const introImage = levelIntroImages[game.pendingLevel];

  if (introImage?.complete) {
    ctx.drawImage(introImage, 0, 0, WIDTH, HEIGHT);
  } else {
    drawBackground();
  }

  ctx.fillStyle = "rgba(43, 24, 15, 0.38)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "rgba(255, 251, 243, 0.86)";
  roundRect(110, 88, WIDTH - 220, HEIGHT - 176, 30, true);

  ctx.fillStyle = "#805022";
  ctx.font = "800 44px 'Baloo 2'";
  ctx.textAlign = "center";
  ctx.fillText(intro.title, WIDTH / 2, 170);

  ctx.font = "700 26px Nunito";
  ctx.fillStyle = "#5a4635";
  wrapText(intro.description, WIDTH / 2, 240, 600, 34);

  drawButton(WIDTH / 2 - 180, 400, 360, 66, GAME_TEXT.messages.introContinue);
}

function drawEnding() {
  if (endingBackgroundImage.complete) {
    ctx.drawImage(endingBackgroundImage, 0, 0, WIDTH, HEIGHT);
  } else {
    drawBackground();
  }

  ctx.fillStyle = "rgba(255, 251, 243, 0.78)";
  roundRect(110, 340, WIDTH - 220, 250, 28, true);

  ctx.shadowColor = "rgba(36, 18, 12, 0.35)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = "#805022";
  ctx.font = "800 40px 'Baloo 2'";
  ctx.textAlign = "center";
  //ctx.fillText("Final de la aventura", WIDTH / 2, 375);

  const lines = GAME_TEXT.ending.lines;

  ctx.fillStyle = "#58402d";
  ctx.font = "700 22px Nunito";
  lines.forEach((line, index) => {
    ctx.fillText(line, WIDTH / 2, 390 + index * 24);
  });
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

function render() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  if (game.scene === "playing") {
    drawPlayingScene();
  } else if (game.scene === "levelIntro") {
    drawLevelIntro();
  } else if (game.scene === "gameover") {
    drawGameOver();
  } else if (game.scene === "ending") {
    drawEnding();
  }
}

function roundRect(x, y, w, h, r, fill = false) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  if (fill) ctx.fill();
  else ctx.stroke();
}

function drawButton(x, y, w, h, label) {
  ctx.fillStyle = "#7fb756";
  roundRect(x, y, w, h, 20, true);
  ctx.fillStyle = "#fff";
  ctx.font = "800 24px Nunito";
  ctx.fillText(label, x + w / 2, y + h / 2 + 8);
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let offsetY = 0;
  ctx.font = "700 24px Nunito";
  ctx.fillStyle = "#624c35";

  for (const word of words) {
    const testLine = `${line}${word} `;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, y + offsetY);
      line = `${word} `;
      offsetY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line.trim(), x, y + offsetY);
}

function loop() {
  updateGame();
  render();
  requestAnimationFrame(loop);
}

startButton.addEventListener("click", () => {
  unlockAudio();
  if (game.scene === "start") startGame();
});

window.addEventListener(
  "pointerdown",
  () => {
    unlockAudio();
  },
  { once: true }
);

window.addEventListener("keydown", (event) => {
  unlockAudio();

  if (
    ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "Spacebar"].includes(event.key) ||
    ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)
  ) {
    event.preventDefault();
  }

  keys.add(event.key);
  keys.add(event.code);

  if (isJumpEvent(event) && !event.repeat) {
    jump();
  }

  if ((event.key === "f" || event.key === "F" || event.key === "Enter") && !event.repeat) {
    if (game.scene === "start") startGame();
    else if (game.scene === "levelIntro") beginPendingLevel();
    else if (game.scene === "gameover") restartCurrentLevel();
    else if (game.scene !== "ending") {
      shoot();
    }
  }

  if (event.key === "p" || event.key === "P") {
    game.paused = !game.paused;
    playSfx("pauseToggle", 0.7);
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key);
  keys.delete(event.code);
});

startFromDebugConfig();
loop();
