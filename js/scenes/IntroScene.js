import { GAME_CONFIG, COLORS, INTRO_CRAWL } from '../config/constants.js';
import { soundManager } from '../utils/SoundManager.js';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
    this.crawlFinished = false;
  }

  create() {
    this.crawlFinished = false;
    this.cameras.main.setBackgroundColor('#03040a');

    this.createStarfield();
    soundManager.playIntroTheme();

    const cx = GAME_CONFIG.WIDTH / 2;

    // 1. Texto introductorio azul cian estilo clásico
    this.preText = this.add
      .text(cx, GAME_CONFIG.HEIGHT / 2, INTRO_CRAWL.PRE_TEXT, {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
        color: COLORS.CYAN,
        align: 'center',
        wordWrap: { width: 680 }
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // 2. Título épico amarillo que se aleja
    this.epicTitle = this.add
      .text(cx, GAME_CONFIG.HEIGHT / 2, INTRO_CRAWL.TITLE, {
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '46px',
        color: COLORS.STAR_WARS_YELLOW,
        align: 'center',
        stroke: '#5a4300',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(1.3);

    // 3. Texto amarillo Star Wars desplazándose hacia arriba
    const fullCrawl = [
      INTRO_CRAWL.EPISODE,
      '',
      ...INTRO_CRAWL.PARAGRAPHS
    ].join('\n\n');

    this.crawlText = this.add
      .text(cx, GAME_CONFIG.HEIGHT + 40, fullCrawl, {
        fontFamily: '"Arial", sans-serif',
        fontStyle: 'bold',
        fontSize: '24px',
        color: COLORS.STAR_WARS_YELLOW,
        align: 'center',
        lineSpacing: 10,
        wordWrap: { width: 620 }
      })
      .setOrigin(0.5, 0)
      .setAlpha(0);

    // Degradado superior sutil para efecto de profundidad en el horizonte
    const topFade = this.add.graphics();
    topFade.fillGradientStyle(0x03040a, 0x03040a, 0x03040a, 0x03040a, 1, 1, 0, 0);
    topFade.fillRect(0, 0, GAME_CONFIG.WIDTH, 130);
    topFade.setDepth(5);

    this.createSkipButton();
    this.bindInputs();
    this.runCinematicTimeline();
  }

  createStarfield() {
    this.stars = [];
    for (let i = 0; i < 95; i += 1) {
      const x = Phaser.Math.Between(0, GAME_CONFIG.WIDTH);
      const y = Phaser.Math.Between(0, GAME_CONFIG.HEIGHT);
      const radius = Phaser.Math.FloatBetween(0.8, 2.2);
      const star = this.add.circle(x, y, radius, 0xffffff, Phaser.Math.FloatBetween(0.3, 0.95));
      this.stars.push(star);
    }
  }

  createSkipButton() {
    const btnBg = this.add
      .rectangle(GAME_CONFIG.WIDTH - 115, GAME_CONFIG.HEIGHT - 36, 195, 40, 0x111827, 0.8)
      .setStrokeStyle(2, 0xffd700)
      .setDepth(20)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(GAME_CONFIG.WIDTH - 115, GAME_CONFIG.HEIGHT - 36, 'SALTAR INTRO ⏭', {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        fontStyle: 'bold',
        color: COLORS.STAR_WARS_YELLOW
      })
      .setOrigin(0.5)
      .setDepth(21);

    this.add
      .text(20, GAME_CONFIG.HEIGHT - 36, 'ESPACIO / TOCAR PARA SALTAR', {
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        color: COLORS.MUTED
      })
      .setOrigin(0, 0.5)
      .setDepth(20);

    btnBg.on('pointerdown', () => {
      soundManager.ensureContext();
      this.finishIntro();
    });
  }

  bindInputs() {
    this.input.keyboard.once('keydown-SPACE', () => this.finishIntro());
    this.input.keyboard.once('keydown-ENTER', () => this.finishIntro());
    this.input.keyboard.once('keydown-ESC', () => this.finishIntro());
  }

  runCinematicTimeline() {
    // Fase 1: Pre-texto azul
    this.tweens.add({
      targets: this.preText,
      alpha: 1,
      duration: 900,
      hold: 1800,
      yoyo: true,
      onComplete: () => {
        if (this.crawlFinished) return;
        // Fase 2: Título gigante que retrocede hacia el infinito
        this.epicTitle.setAlpha(1);
        this.tweens.add({
          targets: this.epicTitle,
          scale: 0.25,
          alpha: 0,
          duration: 2400,
          ease: 'Quad.easeOut',
          onComplete: () => {
            if (this.crawlFinished) return;
            // Fase 3: Crawl amarillo subiendo
            this.crawlText.setAlpha(1);
            this.tweens.add({
              targets: this.crawlText,
              y: -this.crawlText.height - 60,
              scaleX: 0.72,
              scaleY: 0.72,
              duration: 16500,
              ease: 'Linear',
              onComplete: () => this.finishIntro()
            });
          }
        });
      }
    });
  }

  finishIntro() {
    if (this.crawlFinished) return;
    this.crawlFinished = true;
    soundManager.stopIntroTheme();
    this.scene.start('MenuScene');
  }

  shutdown() {
    soundManager.stopIntroTheme();
  }
}
