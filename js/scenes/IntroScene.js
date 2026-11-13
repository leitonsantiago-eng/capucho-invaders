import { GAME_CONFIG, COLORS, INTRO_CRAWL } from '../config/constants.js';
import { soundManager } from '../utils/SoundManager.js';
import { transitionTo } from '../utils/Transitions.js';

export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: 'IntroScene' });
    this.crawlFinished = false;
  }

  create() {
    this.crawlFinished = false;
    this.__transitioning = false;
    this.cameras.main.setBackgroundColor('#020308');

    this.createParallaxStarfield();
    soundManager.playIntroTheme();

    const cx = GAME_CONFIG.WIDTH / 2;

    // 1. Texto azul cian introductorio clásico
    this.preText = this.add
      .text(cx, GAME_CONFIG.HEIGHT / 2, `${INTRO_CRAWL.PRE_TEXT}\n\nUNIVERSIDAD DEL VALLE • SEDE MELÉNDEZ`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '21px',
        color: COLORS.CYAN,
        align: 'center',
        lineSpacing: 8,
        wordWrap: { width: 680 }
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(10);

    // 2. Logotipo épico con zoom hacia el infinito
    this.epicTitle = this.add
      .text(cx, GAME_CONFIG.HEIGHT / 2 - 18, 'CAPUCHO\nINVADERS', {
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '68px',
        color: COLORS.STAR_WARS_YELLOW,
        align: 'center',
        stroke: '#6b4f00',
        strokeThickness: 6
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(1.7)
      .setDepth(10);

    this.epicSub = this.add
      .text(cx, GAME_CONFIG.HEIGHT / 2 + 76, INTRO_CRAWL.SUBTITLE, {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
        fontStyle: 'bold',
        color: COLORS.UNIVALLE_RED,
        align: 'center'
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setScale(1.4)
      .setDepth(10);

    // 3. Crawl amarillo Star Wars desplazándose hacia arriba
    const fullCrawl = [
      INTRO_CRAWL.EPISODE,
      INTRO_CRAWL.SUBTITLE,
      '',
      ...INTRO_CRAWL.PARAGRAPHS,
      '',
      'EQUIPO DE DESARROLLO:\nSANTIAGO  •  LUIS  •  DAVID  •  GARCÉS  •  ALAN'
    ].join('\n\n');

    this.crawlText = this.add
      .text(cx, GAME_CONFIG.HEIGHT + 40, fullCrawl, {
        fontFamily: '"Arial", sans-serif',
        fontStyle: 'bold',
        fontSize: '23px',
        color: COLORS.STAR_WARS_YELLOW,
        align: 'center',
        lineSpacing: 11,
        wordWrap: { width: 640 }
      })
      .setOrigin(0.5, 0)
      .setAlpha(0)
      .setDepth(4);

    // Degradado superior para simular profundidad en el horizonte espacial
    const topFade = this.add.graphics().setDepth(8);
    topFade.fillGradientStyle(0x020308, 0x020308, 0x020308, 0x020308, 1, 1, 0, 0);
    topFade.fillRect(0, 0, GAME_CONFIG.WIDTH, 145);

    this.createSkipButton();
    this.bindInputs();
    this.runCinematicTimeline();
  }

  createParallaxStarfield() {
    this.stars = [];
    this.warpMode = false;
    for (let i = 0; i < 120; i += 1) {
      const layer = Phaser.Math.Between(1, 3);
      const star = this.add
        .circle(
          Phaser.Math.Between(0, GAME_CONFIG.WIDTH),
          Phaser.Math.Between(0, GAME_CONFIG.HEIGHT),
          layer * 0.75,
          layer === 3 ? 0xbae6fd : 0xffffff,
          Phaser.Math.FloatBetween(0.25, 0.95)
        )
        .setDepth(1);
      star.speed = layer * 14;
      this.stars.push(star);
    }
  }

  createSkipButton() {
    const btnBg = this.add
      .rectangle(GAME_CONFIG.WIDTH - 115, GAME_CONFIG.HEIGHT - 34, 196, 40, 0x111827, 0.85)
      .setStrokeStyle(2, 0xffd700)
      .setDepth(20)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(GAME_CONFIG.WIDTH - 115, GAME_CONFIG.HEIGHT - 34, 'SALTAR INTRO ⏭', {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        fontStyle: 'bold',
        color: COLORS.STAR_WARS_YELLOW
      })
      .setOrigin(0.5)
      .setDepth(21);

    this.add
      .text(20, GAME_CONFIG.HEIGHT - 34, 'ESPACIO / ENTER / TOCAR PARA SALTAR', {
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        color: COLORS.MUTED
      })
      .setOrigin(0, 0.5)
      .setDepth(20);

    btnBg.on('pointerdown', () => {
      soundManager.ensureContext();
      this.finishIntro(false);
    });
  }

  bindInputs() {
    this.input.keyboard.once('keydown-SPACE', () => this.finishIntro(false));
    this.input.keyboard.once('keydown-ENTER', () => this.finishIntro(false));
    this.input.keyboard.once('keydown-ESC', () => this.finishIntro(false));
  }

  runCinematicTimeline() {
    this.tweens.add({
      targets: this.preText,
      alpha: 1,
      duration: 850,
      hold: 1700,
      yoyo: true,
      onComplete: () => {
        if (this.crawlFinished) return;
        this.epicTitle.setAlpha(1);
        this.epicSub.setAlpha(1);
        this.tweens.add({
          targets: [this.epicTitle, this.epicSub],
          scale: 0.22,
          alpha: 0,
          duration: 2400,
          ease: 'Quad.easeOut',
          onComplete: () => {
            if (this.crawlFinished) return;
            this.crawlText.setAlpha(1);
            this.tweens.add({
              targets: this.crawlText,
              y: -this.crawlText.height - 80,
              scaleX: 0.68,
              scaleY: 0.68,
              duration: 18500,
              ease: 'Linear',
              onComplete: () => this.finishIntro(true)
            });
          }
        });
      }
    });
  }

  finishIntro(withWarp = false) {
    if (this.crawlFinished) return;
    this.crawlFinished = true;
    soundManager.stopIntroTheme();

    if (withWarp) {
      this.warpMode = true;
      soundManager.playWarp();
      this.time.delayedCall(520, () => {
        transitionTo(this, 'MenuScene');
      });
    } else {
      transitionTo(this, 'MenuScene');
    }
  }

  update(_, delta) {
    const dt = delta / 1000;
    const mult = this.warpMode ? 18 : 1;
    for (let i = 0; i < this.stars.length; i += 1) {
      const s = this.stars[i];
      s.y += s.speed * mult * dt;
      if (this.warpMode) s.setScale(1, 4.5);
      if (s.y > GAME_CONFIG.HEIGHT + 12) {
        s.y = -6;
        s.x = Phaser.Math.Between(0, GAME_CONFIG.WIDTH);
      }
    }
  }

  shutdown() {
    soundManager.stopIntroTheme();
  }
}
