import { GAME_CONFIG, COLORS, TEAM_MEMBERS } from '../config/constants.js';
import { soundManager } from '../utils/SoundManager.js';
import { createLevelBackground } from '../utils/Backgrounds.js';
import { revealScene, transitionTo } from '../utils/Transitions.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG);
    revealScene(this);

    this.bg = createLevelBackground(this, 'menu');

    const cx = GAME_CONFIG.WIDTH / 2;
    const highScore = Number(localStorage.getItem(GAME_CONFIG.STORAGE_KEY) || 0);

    this.add
      .text(cx, 44, 'UNIVERSIDAD DEL VALLE • SEDE MELÉNDEZ', {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        fontStyle: 'bold',
        color: COLORS.CYAN
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 102, 'CAPUCHO INVADERS', {
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '56px',
        color: COLORS.STAR_WARS_YELLOW,
        stroke: COLORS.UNIVALLE_RED,
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 150, 'RESISTENCIA EN MELÉNDEZ', {
        fontFamily: '"Courier New", monospace',
        fontSize: '21px',
        fontStyle: 'bold',
        color: COLORS.WHITE
      })
      .setOrigin(0.5);

    // Galería de enemigos del campus
    const murilloKey = this.registry.get('murilloTextureKey') || 'boss_murillo_placeholder';
    this.add.image(cx - 180, 210, 'enemy_calc').setScale(1.15);
    this.add.image(cx - 90, 210, 'enemy_iguana').setScale(1.15);
    this.add.image(cx, 210, 'enemy_zancudo').setScale(1.15);
    this.add.image(cx + 90, 210, 'enemy_admin').setScale(1.15);
    const bossIcon = this.add.image(cx + 185, 210, murilloKey);
    bossIcon.setDisplaySize(54, 44);

    this.add
      .text(cx, 258, `RÉCORD DEL CAMPUS: ${highScore} PTS`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        fontStyle: 'bold',
        color: COLORS.NEON_GREEN
      })
      .setOrigin(0.5);

    this.createMenuButton(cx, 318, 355, 50, '▶  INICIAR CAMPAÑA (5 NIVELES)', 0xe6192e, () => {
      soundManager.ensureContext();
      soundManager.playPowerUp();
      transitionTo(this, 'StoryScene', {
        level: 1,
        score: 0,
        lives: GAME_CONFIG.INITIAL_LIVES
      });
    });

    this.createMenuButton(cx, 380, 355, 44, '💀  RETO DIRECTO: PROF. MURILLO', 0x7c2d12, () => {
      soundManager.ensureContext();
      soundManager.playPowerUp();
      transitionTo(this, 'StoryScene', {
        level: 5,
        score: 0,
        lives: GAME_CONFIG.INITIAL_LIVES
      });
    });

    this.createMenuButton(cx, 438, 355, 42, '🎬  VER CINEMÁTICA STAR WARS', 0x1e293b, () => {
      soundManager.ensureContext();
      transitionTo(this, 'IntroScene');
    });

    this.add
      .text(
        cx,
        500,
        'PC: Flechas / A-D para mover • ESPACIO para disparar • P para pausa\nMÓVIL / TABLET: Botones táctiles transparentes multitouch',
        {
          fontFamily: '"Courier New", monospace',
          fontSize: '12px',
          color: COLORS.MUTED,
          align: 'center',
          lineSpacing: 5
        }
      )
      .setOrigin(0.5);

    this.add
      .text(cx, 562, `Equipo MDS: ${TEAM_MEMBERS.join('  •  ')}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        fontStyle: 'bold',
        color: COLORS.STAR_WARS_YELLOW
      })
      .setOrigin(0.5);

    this.time.delayedCall(250, () => {
      this.input.keyboard.once('keydown-SPACE', () => {
        soundManager.ensureContext();
        transitionTo(this, 'StoryScene', {
          level: 1,
          score: 0,
          lives: GAME_CONFIG.INITIAL_LIVES
        });
      });
    });
  }

  createMenuButton(x, y, width, height, label, fillColor, onClick) {
    const bg = this.add
      .rectangle(x, y, width, height, fillColor, 0.95)
      .setStrokeStyle(2, 0xffd700)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(x, y, label, {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        fontStyle: 'bold',
        color: COLORS.WHITE
      })
      .setOrigin(0.5);

    bg.on('pointerover', () => bg.setScale(1.03));
    bg.on('pointerout', () => bg.setScale(1));
    bg.on('pointerdown', () => {
      bg.setScale(0.97);
      onClick();
    });

    return { bg, text };
  }

  update(time, delta) {
    if (this.bg) this.bg.update(time, delta / 1000);
  }
}
