import { GAME_CONFIG, COLORS, TEAM_MEMBERS } from '../config/constants.js';
import { soundManager } from '../utils/SoundManager.js';

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
    const cx = GAME_CONFIG.WIDTH / 2;

    const prevHigh = Number(localStorage.getItem(GAME_CONFIG.STORAGE_KEY) || 0);
    const highScore = Math.max(prevHigh, this.finalScore);
    localStorage.setItem(GAME_CONFIG.STORAGE_KEY, String(highScore));

    const titleText = this.victory
      ? '¡SEMESTRE SALVADO!\nVICTORIA EN MELÉNDEZ'
      : '¡CAÍSTE EN EL FILTRO!\nGAME OVER';

    const titleColor = this.victory ? COLORS.NEON_GREEN : '#ff4d6d';

    this.add
      .text(cx, 120, titleText, {
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: '42px',
        color: titleColor,
        align: 'center',
        lineSpacing: 8
      })
      .setOrigin(0.5);

    const summary = this.victory
      ? 'Superaste Cálculo, conteniste la Rebelión de las Iguanas\ny lograste el Despliegue Continuo en Registro Académico.'
      : `Resististe hasta el Nivel ${this.levelReached}/3.\n¡Recarga un tinto y vuelve a defender la sede Meléndez!`;

    this.add
      .text(cx, 232, summary, {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: COLORS.WHITE,
        align: 'center',
        lineSpacing: 6
      })
      .setOrigin(0.5);

    this.add
      .text(cx, 314, `PUNTAJE FINAL: ${this.finalScore} PTS\nRÉCORD HISTÓRICO: ${highScore} PTS`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
        fontStyle: 'bold',
        color: COLORS.STAR_WARS_YELLOW,
        align: 'center',
        lineSpacing: 8
      })
      .setOrigin(0.5);

    this.createActionButton(cx, 405, '🔄  JUGAR DE NUEVO', 0xe6192e, () => {
      soundManager.ensureContext();
      this.scene.start('StoryScene', {
        level: 1,
        score: 0,
        lives: GAME_CONFIG.INITIAL_LIVES
      });
    });

    this.createActionButton(cx, 468, '🏠  VOLVER AL MENÚ', 0x1e293b, () => {
      soundManager.ensureContext();
      this.scene.start('MenuScene');
    });

    this.add
      .text(cx, 550, `Capucho Invaders • Equipo MDS: ${TEAM_MEMBERS.join(', ')}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '13px',
        color: COLORS.MUTED
      })
      .setOrigin(0.5);
  }

  createActionButton(x, y, label, color, onClick) {
    const bg = this.add
      .rectangle(x, y, 300, 46, color, 0.95)
      .setStrokeStyle(2, 0xffd700)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(x, y, label, {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        fontStyle: 'bold',
        color: COLORS.WHITE
      })
      .setOrigin(0.5);

    bg.on('pointerdown', onClick);
  }
}
