import { GAME_CONFIG, COLORS, LEVELS } from '../config/constants.js';
import { soundManager } from '../utils/SoundManager.js';
import { createLevelBackground } from '../utils/Backgrounds.js';
import { revealScene, transitionTo } from '../utils/Transitions.js';

export class StoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StoryScene' });
    this.isTransitioning = false;
  }

  init(data) {
    this.levelNumber = data?.level || 1;
    this.currentScore = data?.score || 0;
    this.currentLives = data?.lives ?? GAME_CONFIG.INITIAL_LIVES;
    this.isTransitioning = false;
  }

  create() {
    this.cameras.main.setBackgroundColor('#050814');
    revealScene(this);

    const levelData = LEVELS.find((lvl) => lvl.level === this.levelNumber) || LEVELS[0];
    const cx = GAME_CONFIG.WIDTH / 2;

    this.bg = createLevelBackground(this, levelData.theme, { dim: 0.45 });

    if (levelData.type === 'boss') {
      soundManager.playAlarm();
    }

    // Tarjeta táctica
    const borderColor = levelData.type === 'boss' ? 0xe6192e : 0x00e5ff;
    this.add
      .rectangle(cx, GAME_CONFIG.HEIGHT / 2, 720, 500, 0x0b1222, 0.92)
      .setStrokeStyle(3, borderColor);

    // Barra de progreso de sectores (1..5)
    for (let s = 1; s <= LEVELS.length; s += 1) {
      const dotX = cx - 80 + (s - 1) * 40;
      const isActive = s === levelData.level;
      const isDone = s < levelData.level;
      this.add.circle(dotX, 76, isActive ? 9 : 6, isDone ? 0x22c55e : isActive ? 0xffd700 : 0x334155);
      if (s < LEVELS.length) {
        this.add.rectangle(dotX + 20, 76, 22, 2, isDone ? 0x22c55e : 0x334155);
      }
    }

    this.add
      .text(cx, 104, `TRANSMISIÓN DE INTELIGENCIA • SECTOR ${levelData.level}/${LEVELS.length}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '13px',
        fontStyle: 'bold',
        color: levelData.type === 'boss' ? '#f87171' : COLORS.CYAN
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 140, levelData.title, {
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '29px',
        color: COLORS.STAR_WARS_YELLOW,
        align: 'center'
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 174, levelData.subtitle, {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: COLORS.NEON_GREEN
      })
      .setOrigin(0.5);

    // Vista previa del enemigo / Jefe Murillo
    const previewKey =
      levelData.previewTexture === 'MURILLO'
        ? this.registry.get('murilloTextureKey') || 'boss_murillo_placeholder'
        : levelData.previewTexture;

    const preview = this.add.image(cx, 232, previewKey);
    if (levelData.previewTexture === 'MURILLO') {
      preview.setDisplaySize(96, 80);
    } else {
      preview.setScale(2);
    }

    this.tweens.add({
      targets: preview,
      y: 239,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add
      .text(cx, 282, `Amenaza: ${levelData.threat}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#fca5a5'
      })
      .setOrigin(0.5);

    const fullNarrative = levelData.storyLines.join('\n\n');
    const storyTextObj = this.add
      .text(88, 310, '', {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: COLORS.WHITE,
        lineSpacing: 6,
        wordWrap: { width: 624 }
      })
      .setOrigin(0, 0);

    let charIndex = 0;
    this.typeTimer = this.time.addEvent({
      delay: 16,
      repeat: fullNarrative.length - 1,
      callback: () => {
        charIndex += 1;
        storyTextObj.setText(fullNarrative.slice(0, charIndex));
        if (charIndex % 4 === 0) soundManager.playBlip();
      }
    });

    const continueBtn = this.add
      .rectangle(cx, 510, 440, 46, 0xe6192e, 0.96)
      .setStrokeStyle(2, 0xffd700)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(cx, 510, '▶ DESPLEGAR EN EL CAMPUS (ESPACIO / TOCAR)', {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        fontStyle: 'bold',
        color: COLORS.WHITE
      })
      .setOrigin(0.5);

    const proceed = () => {
      if (this.isTransitioning) return;
      this.isTransitioning = true;
      if (this.typeTimer) this.typeTimer.remove(false);
      soundManager.ensureContext();
      soundManager.playLevelUp();
      transitionTo(this, 'GameScene', {
        level: this.levelNumber,
        score: this.currentScore,
        lives: this.currentLives
      });
    };

    continueBtn.on('pointerdown', proceed);
    this.time.delayedCall(380, () => {
      this.input.keyboard.once('keydown-SPACE', proceed);
      this.input.keyboard.once('keydown-ENTER', proceed);
    });
  }

  update(time, delta) {
    if (this.bg) this.bg.update(time, delta / 1000);
  }
}
