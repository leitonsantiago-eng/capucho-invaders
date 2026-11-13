import { GAME_CONFIG, COLORS, LEVELS } from '../config/constants.js';
import { soundManager } from '../utils/SoundManager.js';

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

    const levelData = LEVELS.find((lvl) => lvl.level === this.levelNumber) || LEVELS[0];
    const cx = GAME_CONFIG.WIDTH / 2;

    // Fondo espacial sutil
    for (let i = 0; i < 45; i += 1) {
      this.add.circle(
        Phaser.Math.Between(0, GAME_CONFIG.WIDTH),
        Phaser.Math.Between(0, GAME_CONFIG.HEIGHT),
        Phaser.Math.FloatBetween(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.7)
      );
    }

    // Marco táctico de transmisión
    this.add
      .rectangle(cx, GAME_CONFIG.HEIGHT / 2, 710, 480, 0x0f172a, 0.92)
      .setStrokeStyle(3, 0x00e5ff);

    this.add
      .text(cx, 95, `TRANSMISIÓN DE INTELIGENCIA • SECTOR ${levelData.level}/3`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        fontStyle: 'bold',
        color: COLORS.CYAN
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 136, levelData.title, {
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '30px',
        color: COLORS.STAR_WARS_YELLOW,
        align: 'center'
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 172, levelData.subtitle, {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        color: COLORS.NEON_GREEN
      })
      .setOrigin(0.5);

    // Vista previa del enemigo del nivel
    const enemyPreview = this.add.image(cx, 232, levelData.enemyTexture).setScale(2.1);
    this.tweens.add({
      targets: enemyPreview,
      y: 240,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add
      .text(cx, 276, `Amenaza detectada: ${levelData.enemyName}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '13px',
        color: '#fca5a5'
      })
      .setOrigin(0.5);

    const fullNarrative = levelData.storyLines.join('\n\n');
    const storyTextObj = this.add
      .text(90, 308, '', {
        fontFamily: '"Courier New", monospace',
        fontSize: '17px',
        color: COLORS.WHITE,
        lineSpacing: 6,
        wordWrap: { width: 620 }
      })
      .setOrigin(0, 0);

    // Efecto máquina de escribir
    let charIndex = 0;
    this.typeTimer = this.time.addEvent({
      delay: 18,
      repeat: fullNarrative.length - 1,
      callback: () => {
        charIndex += 1;
        storyTextObj.setText(fullNarrative.slice(0, charIndex));
      }
    });

    // Botón para continuar (apto para móvil y desktop)
    const continueBtn = this.add
      .rectangle(cx, 505, 420, 48, 0xe6192e, 0.95)
      .setStrokeStyle(2, 0xffd700)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(cx, 505, '▶ DESPLEGAR EN EL CAMPUS (ESPACIO / TOCAR)', {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        fontStyle: 'bold',
        color: COLORS.WHITE
      })
      .setOrigin(0.5);

    const proceed = () => {
      if (this.isTransitioning) return;
      this.isTransitioning = true;
      if (this.typeTimer) {
        this.typeTimer.remove(false);
      }
      soundManager.ensureContext();
      soundManager.playLevelUp();
      this.scene.start('GameScene', {
        level: this.levelNumber,
        score: this.currentScore,
        lives: this.currentLives
      });
    };

    continueBtn.on('pointerdown', proceed);
    this.time.delayedCall(350, () => {
      this.input.keyboard.once('keydown-SPACE', proceed);
      this.input.keyboard.once('keydown-ENTER', proceed);
    });
  }
}
