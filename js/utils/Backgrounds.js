import { GAME_CONFIG } from '../config/constants.js';

const W = GAME_CONFIG.WIDTH;
const H = GAME_CONFIG.HEIGHT;

/**
 * Crea el fondo temático de cada sector del campus.
 * Devuelve un objeto con update(time, dt) para las partes animadas.
 */
export function createLevelBackground(scene, theme, { dim = 0 } = {}) {
  const stars = [];
  for (let i = 0; i < 70; i += 1) {
    const s = scene.add
      .circle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.FloatBetween(0.7, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.15, 0.8)
      )
      .setDepth(-30);
    s.speed = Phaser.Math.FloatBetween(10, 48);
    stars.push(s);
  }

  const builders = {
    calculo: buildCalculo,
    iguanas: buildIguanas,
    lago: buildLago,
    registro: buildRegistro,
    murillo: buildMurillo,
    menu: buildMenu
  };
  const updater = builders[theme] ? builders[theme](scene) : null;

  if (dim > 0) {
    scene.add.rectangle(W / 2, H / 2, W, H, 0x000000, dim).setDepth(-2);
  }

  return {
    speedBoost: 1,
    update(time, dt) {
      for (let i = 0; i < stars.length; i += 1) {
        const s = stars[i];
        s.y += s.speed * dt * this.speedBoost;
        if (s.y > H) {
          s.y = 0;
          s.x = Phaser.Math.Between(0, W);
        }
      }
      if (updater) updater(time, dt);
    }
  };
}

function buildMenu(scene) {
  const planet = scene.add.circle(W / 2, H + 380, 470, 0x0f2a1d, 1).setDepth(-25);
  planet.setStrokeStyle(6, 0x22c55e, 0.35);
  scene.add.circle(W / 2, H + 380, 500, 0x22c55e, 0.06).setDepth(-26);
  return null;
}

function buildCalculo(scene) {
  const g = scene.add.graphics().setDepth(-20);
  g.lineStyle(1, 0x00e5ff, 0.06);
  for (let x = 0; x <= W; x += 40) g.lineBetween(x, 0, x, H);
  for (let y = 0; y <= H; y += 40) g.lineBetween(0, y, W, y);

  const symbols = ['∫', '∑', 'dx', 'lim', '∂', 'π', '√x', 'f(x)', '∞', 'dy/dx', '∬', 'e^x', 'sen θ'];
  const items = [];
  for (let i = 0; i < 18; i += 1) {
    const t = scene.add
      .text(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Utils.Array.GetRandom(symbols), {
        fontFamily: 'Georgia, serif',
        fontSize: `${Phaser.Math.Between(16, 34)}px`,
        color: '#7dd3fc'
      })
      .setAlpha(Phaser.Math.FloatBetween(0.07, 0.16))
      .setDepth(-19);
    t.speed = Phaser.Math.FloatBetween(8, 22);
    items.push(t);
  }
  return (time, dt) => {
    items.forEach((t) => {
      t.y += t.speed * dt;
      if (t.y > H + 20) {
        t.y = -30;
        t.x = Phaser.Math.Between(0, W);
      }
    });
  };
}

function buildIguanas(scene) {
  const makeTree = (x, y, r) => {
    scene.add.rectangle(x, y + r * 0.9, 18, r * 1.4, 0x3f2a14, 0.9).setDepth(-12);
    const crown = [];
    crown.push(scene.add.circle(x, y, r, 0x14532d, 0.92).setDepth(-11));
    crown.push(scene.add.circle(x + r * 0.5, y + r * 0.3, r * 0.7, 0x166534, 0.92).setDepth(-11));
    crown.push(scene.add.circle(x - r * 0.5, y + r * 0.35, r * 0.65, 0x15803d, 0.85).setDepth(-11));
    for (let i = 0; i < 4; i += 1) {
      crown.push(
        scene.add
          .circle(x + Phaser.Math.Between(-r * 0.6, r * 0.6), y + Phaser.Math.Between(-r * 0.4, r * 0.5), 5, 0xf59e0b, 0.9)
          .setDepth(-10)
      );
    }
    scene.tweens.add({
      targets: crown,
      x: '+=5',
      duration: Phaser.Math.Between(1400, 2200),
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  };
  [[-10, 130, 70], [-25, 320, 80], [-5, 500, 60], [W + 10, 110, 75], [W + 25, 300, 85], [W + 5, 490, 62]].forEach(
    ([x, y, r]) => makeTree(x, y, r)
  );
  scene.add
    .text(W / 2, H - 14, 'BIBLIOTECA MARIO CARVAJAL', {
      fontFamily: '"Courier New", monospace',
      fontSize: '11px',
      color: '#86efac'
    })
    .setOrigin(0.5)
    .setAlpha(0.35)
    .setDepth(-9);
  return null;
}

function buildLago(scene) {
  const sky = scene.add.graphics().setDepth(-28);
  sky.fillGradientStyle(0x3b0764, 0x3b0764, 0x070913, 0x070913, 0.55, 0.55, 0, 0);
  sky.fillRect(0, 0, W, H * 0.6);
  scene.add.circle(640, 150, 46, 0xfb923c, 0.45).setDepth(-27);
  scene.add.circle(640, 150, 70, 0xfb923c, 0.08).setDepth(-27);

  const lakeTop = H - 120;
  const lake = scene.add.graphics().setDepth(-15);
  lake.fillGradientStyle(0x0c4a6e, 0x0c4a6e, 0x082f49, 0x082f49, 0.6, 0.6, 0.85, 0.85);
  lake.fillRect(0, lakeTop, W, H - lakeTop);

  const reeds = scene.add.graphics().setDepth(-14);
  reeds.lineStyle(3, 0x14532d, 0.9);
  for (let i = 0; i < 14; i += 1) {
    const x = i < 7 ? 8 + i * 9 : W - 8 - (i - 7) * 9;
    reeds.lineBetween(x, lakeTop + 6, x + Phaser.Math.Between(-6, 6), lakeTop - Phaser.Math.Between(26, 54));
  }

  scene.add.rectangle(46, lakeTop - 20, 6, 46, 0x5b3a1a).setDepth(-13);
  scene.add.rectangle(46, lakeTop - 44, 80, 22, 0x7c4a1e).setStrokeStyle(2, 0x3f2a14).setDepth(-13);
  scene.add
    .text(46, lakeTop - 44, 'EL LAGO', { fontFamily: '"Courier New", monospace', fontSize: '12px', fontStyle: 'bold', color: '#fde68a' })
    .setOrigin(0.5)
    .setDepth(-12);

  const waves = scene.add.graphics().setDepth(-14);
  const mist = [];
  for (let i = 0; i < 5; i += 1) {
    const m = scene.add.ellipse(Phaser.Math.Between(0, W), lakeTop - 6, 220, 26, 0xe0f2fe, 0.06).setDepth(-13);
    m.speed = Phaser.Math.FloatBetween(6, 16);
    mist.push(m);
  }

  return (time, dt) => {
    waves.clear();
    for (let row = 0; row < 4; row += 1) {
      waves.lineStyle(2, 0x7dd3fc, 0.18 - row * 0.03);
      const y0 = lakeTop + 16 + row * 24;
      waves.beginPath();
      for (let x = 0; x <= W; x += 16) {
        const y = y0 + Math.sin(time / 520 + x / 60 + row) * 3;
        if (x === 0) waves.moveTo(x, y);
        else waves.lineTo(x, y);
      }
      waves.strokePath();
    }
    mist.forEach((m) => {
      m.x += m.speed * dt;
      if (m.x > W + 120) m.x = -120;
    });
  };
}

function buildRegistro(scene) {
  const g = scene.add.graphics().setDepth(-15);
  const windows = [];
  let x = 0;
  while (x < W) {
    const bw = Phaser.Math.Between(60, 110);
    const bh = Phaser.Math.Between(70, 150);
    g.fillStyle(0x111827, 0.95);
    g.fillRect(x, H - bh, bw - 6, bh);
    for (let wy = H - bh + 10; wy < H - 14; wy += 18) {
      for (let wx = x + 8; wx < x + bw - 16; wx += 16) {
        windows.push(scene.add.rectangle(wx, wy, 7, 9, 0xfacc15, Math.random() < 0.5 ? 0.5 : 0.05).setDepth(-14));
      }
    }
    x += bw;
  }
  const alarm = scene.add.rectangle(W / 2, H / 2, W, H, 0xff0000, 0).setDepth(-3);
  scene.tweens.add({ targets: alarm, fillAlpha: 0.07, duration: 700, yoyo: true, repeat: -1 });

  const ticker = scene.add
    .text(W, H - 10, 'SISTEMA DE MATRÍCULAS: ERROR 503 • INTENTE MÁS TARDE • SU HORARIO HA SIDO CANCELADO • ', {
      fontFamily: '"Courier New", monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#f87171'
    })
    .setOrigin(0, 0.5)
    .setDepth(-2)
    .setAlpha(0.8);

  let acc = 0;
  return (time, dt) => {
    ticker.x -= 60 * dt;
    if (ticker.x < -ticker.width) ticker.x = W;
    acc += dt;
    if (acc > 0.4) {
      acc = 0;
      const w = Phaser.Utils.Array.GetRandom(windows);
      if (w) w.setFillStyle(0xfacc15, w.fillAlpha > 0.2 ? 0.05 : 0.5);
    }
  };
}

function buildMurillo(scene) {
  scene.add.rectangle(W / 2, 175, 680, 220, 0x0f2f1f, 0.6).setStrokeStyle(8, 0x5b3a1a, 0.9).setDepth(-20);
  const chalk = [
    'NOTA FINAL = 0.4·PF + 0.3·P1 + 0.3·P2',
    'Entrega: HOY 11:59 PM',
    'IEEE 830 • UML • Scrum • Pruebas',
    'Sustentación: INDIVIDUAL'
  ];
  chalk.forEach((line, i) => {
    scene.add
      .text(110 + (i % 2) * 40, 100 + i * 40, line, { fontFamily: '"Comic Sans MS", "Courier New", cursive', fontSize: '18px', color: '#e2e8f0' })
      .setAlpha(0.22)
      .setDepth(-19);
  });

  const vignette = scene.add.graphics().setDepth(-4);
  vignette.fillGradientStyle(0x7f1d1d, 0x7f1d1d, 0x000000, 0x000000, 0.35, 0.35, 0, 0);
  vignette.fillRect(0, H - 160, W, 160);
  vignette.setAngle(180).setPosition(W, H * 2 - 160);

  const flash = scene.add.rectangle(W / 2, H / 2, W, H, 0xffffff, 0).setDepth(-1);
  let next = 4000;
  return (time) => {
    if (time > next) {
      next = time + Phaser.Math.Between(4000, 8000);
      scene.tweens.add({ targets: flash, fillAlpha: 0.14, duration: 60, yoyo: true, repeat: 1 });
    }
  };
}
