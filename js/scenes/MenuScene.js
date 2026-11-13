import { GAME_CONFIG, COLORS, TEAM_MEMBERS } from '../config/constants.js';
import { soundManager } from '../utils/SoundManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG);
    this.createAnimatedStars();

    const cx = GAME_CONFIG.WIDTH / 2;
    const highScore = Number(localStorage.getItem(GAME_CONFIG.STORAGE_KEY) || 0);

    this.add
      .text(cx, 56, 'UNIVERSIDAD DEL VALLE • SEDE MELÉNDEZ', {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        fontStyle: 'bold',
        color: COLORS.CYAN
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 120, 'CAPUCHO INVADERS', {
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '56px',
        color: COLORS.STAR_WARS_YELLOW,
        stroke: COLORS.UNIVALLE_RED,
        strokeThickness: 6
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 168, 'RESISTENCIA EN MELÉNDEZ', {
        fontFamily: '"Courier New", monospace',
        fontSize: '22px',
        fontStyle: 'bold',
        color: COLORS.WHITE
      })
      .setOrigin(0.5);

    // Muestra decorativa de naves y enemigos
    this.add.image(cx - 120, 226, 'enemy_calc').setScale(1.3);
    this.add.image(cx, 226, 'enemy_iguana').setScale(1.3);
    this.add.image(cx + 120, 226, 'enemy_admin').setScale(1.3);

    this.add
      .text(cx, 272, `RÉCORD DEL CAMPUS: ${highScore} PTS`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        fontStyle: 'bold',
        color: COLORS.NEON_GREEN
      })
      .setOrigin(0.5);

    this.createMenuButton(cx, 342, 330, 54, '▶  INICIAR CAMPAÑA', 0xe6192e, () => {
      soundManager.ensureContext();
      soundManager.playPowerUp();
      this.scene.start('StoryScene', {
        level: 1,
        score: 0,
        lives: GAME_CONFIG.INITIAL_LIVES
      });
    });

    this.createMenuButton(cx, 412, 330, 46, '🎬  VER CINEMÁTICA STAR WARS', 0x1e293b, () => {
      soundManager.ensureContext();
      this.scene.start('IntroScene');
    });

    this.add
      .text(
        cx,
        482,
        'CONTROLES PC: Flechas / A-D para mover  •  ESPACIO para disparar\nMÓVIL / TABLET: Botones táctiles transparentes en pantalla',
        {
          fontFamily: '"Courier New", monospace',
          fontSize: '13px',
          color: COLORS.MUTED,
          align: 'center',
          lineSpacing: 6
        }
      )
      .setOrigin(0.5);

    this.add
      .text(cx, 558, `Equipo MDS: ${TEAM_MEMBERS.join('  •  ')}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        fontStyle: 'bold',
        color: COLORS.STAR_WARS_YELLOW
      })
      .setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => {
      soundManager.ensureContext();
      this.scene.start('StoryScene', {
        level: 1,
        score: 0,
        lives: GAME_CONFIG.INITIAL_LIVES
      });
    });
  }

  createAnimatedStars() {
    this.starGroup = [];
    for (let i = 0; i < 65; i += 1) {
      const star = this.add.circle(
        Phaser.Math.Between(0, GAME_CONFIG.WIDTH),
        Phaser.Math.Between(0, GAME_CONFIG.HEIGHT),
        Phaser.Math.FloatBetween(1, 2.2),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.85)
      );
      star.speed = Phaser.Math.FloatBetween(12, 42);
      this.starGroup.push(star);
    }
  }

  createMenuButton(x, y, width, height, label, fillColor, onClick) {
    const bg = this.add
      .rectangle(x, y, width, height, fillColor, 0.95)
      .setStrokeStyle(2, 0xffd700)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(x, y, label, {
        fontFamily: '"Courier New", monospace',
        fontSize: '17px',
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

  update(_, delta) {
    const dt = delta / 1000;
    for (let i = 0; i < this.starGroup.length; i += 1) {
      const s = this.starGroup[i];
      s.y += s.speed * dt;
      if (s.y > GAME_CONFIG.HEIGHT) {
        s.y = -4;
        s.x = Phaser.Math.Between(0, GAME_CONFIG.WIDTH);
      }
    }
  }
}
