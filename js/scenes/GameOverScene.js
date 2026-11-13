import { GAME_CONFIG, COLORS, TEAM_MEMBERS, LEVELS } from '../config/constants.js';
import { soundManager } from '../utils/SoundManager.js';
import { revealScene, transitionTo } from '../utils/Transitions.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.victory = Boolean(data?.victory);
    this.finalScore = data?.score || 0;
    this.levelReached = data?.levelReached || 1;
  }

  create() {
    this.cameras.main.setBackgroundColor('#050814');
    revealScene(this);

    const cx = GAME_CONFIG.WIDTH / 2;

    const prevHigh = Number(localStorage.getItem(GAME_CONFIG.STORAGE_KEY) || 0);
    const highScore = Math.max(prevHigh, this.finalScore);
    localStorage.setItem(GAME_CONFIG.STORAGE_KEY, String(highScore));

    const titleText = this.victory
      ? '¡PROYECTO APROBADO EN 5.0!\nVICTORIA EN MELÉNDEZ'
      : '¡REPROBASTE LA SUSTENTACIÓN!\nGAME OVER';

    const titleColor = this.victory ? COLORS.NEON_GREEN : '#ff4d6d';

    this.add
      .text(cx, 112, titleText, {
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '40px',
        color: titleColor,
        align: 'center',
        lineSpacing: 8
      })
      .setOrigin(0.5);

    const summary = this.victory
      ? 'Venciste al Profesor Murillo, esquivaste los Proyectos Finales\ny salvaste el semestre en la Universidad del Valle.'
      : `Caíste en el Nivel ${this.levelReached}/${LEVELS.length}.\n¡Tómate un tinto en Meléndez y vuelve al combate!`;

    this.add
      .text(cx, 224, summary, {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: COLORS.WHITE,
        align: 'center',
        lineSpacing: 6
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 304, `PUNTAJE FINAL: ${this.finalScore} PTS\nRÉCORD HISTÓRICO: ${highScore} PTS`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
        fontStyle: 'bold',
        color: COLORS.STAR_WARS_YELLOW,
        align: 'center',
        lineSpacing: 8
      })
      .setOrigin(0.5);

    this.createActionButton(
      cx,
      384,
      this.victory ? '🔄  JUGAR CAMPAÑA DE NUEVO' : `🔄  REINTENTAR NIVEL ${this.levelReached}`,
      0xe6192e,
      () => {
        soundManager.ensureContext();
        transitionTo(this, 'StoryScene', {
          level: this.victory ? 1 : this.levelReached,
          score: this.victory ? 0 : Math.floor(this.finalScore * 0.5),
          lives: GAME_CONFIG.INITIAL_LIVES
        });
      }
    );

    this.createActionButton(cx, 446, '🏠  VOLVER AL MENÚ PRINCIPAL', 0x1e293b, () => {
      soundManager.ensureContext();
      transitionTo(this, 'MenuScene');
    });

    this.add
      .text(cx, 548, `Capucho Invaders • Equipo MDS: ${TEAM_MEMBERS.join(', ')}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '13px',
        color: COLORS.MUTED
      })
      .setOrigin(0.5);
  }

  createActionButton(x, y, label, color, onClick) {
    const bg = this.add
      .rectangle(x, y, 330, 46, color, 0.95)
      .setStrokeStyle(2, 0xffd700)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(x, y, label, {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        fontStyle: 'bold',
        color: COLORS.WHITE
      })
      .setOrigin(0.5);

    bg.on('pointerdown', onClick);
  }
}
