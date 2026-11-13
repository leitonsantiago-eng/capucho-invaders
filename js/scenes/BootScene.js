export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.createPlayerTexture();
    this.createCalcEnemyTexture();
    this.createIguanaEnemyTexture();
    this.createAdminEnemyTexture();
    this.createBossTexture();
    this.createProjectilesAndItems();

    this.scene.start('IntroScene');
  }

  drawPixelMatrix(matrix, palette, key, pixelSize = 3) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const ch = matrix[r][c];
        if (ch !== '.' && palette[ch]) {
          gfx.fillStyle(palette[ch], 1);
          gfx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    gfx.generateTexture(key, cols * pixelSize, rows * pixelSize);
    gfx.destroy();
  }

  createPlayerTexture() {
    // Defensor Estudiantil de Meléndez (rojo Univalle + visor cian)
    const matrix = [
      '......WW......',
      '.....WRRW.....',
      '.....WCCW.....',
      '....WRRRRW....',
      '..WWRRRRRRWW..',
      '.WRRRRRRRRRRW.',
      'WRRWWWRRWWWRRW',
      'WRRRRRRRRRRRRW',
      'WR..RRRRRR..RW',
      '....YY..YY....'
    ];
    this.drawPixelMatrix(
      matrix,
      {
        R: 0xe6192e,
        W: 0xf4f6fc,
        C: 0x00e5ff,
        Y: 0xffd700
      },
      'player_ship',
      3
    );
  }

  createCalcEnemyTexture() {
    // Nivel 1: Parcial / Integral mutante
    const matrix = [
      '..CCCCCCCC..',
      '.CCWWWWWWCC.',
      'CCWCCWWCCWCC',
      'CCWWWWWWWWCC',
      'CC.CCCCCC.CC',
      '.CC..CC..CC.',
      '..CC.CC.CC..',
      '.CC......CC.'
    ];
    this.drawPixelMatrix(
      matrix,
      {
        C: 0x00e5ff,
        W: 0xffffff
      },
      'enemy_calc',
      3
    );
  }

  createIguanaEnemyTexture() {
    // Nivel 2: Iguana táctica de Meléndez
    const matrix = [
      '..O..OO..O..',
      '.GGGGGGGGGG.',
      'GGYYGGGGYYGG',
      'GGGGGGGGGGGG',
      '.GGGLLLLGGG.',
      'GG..GGGG..GG',
      'G...G..G...G',
      '....G..G....'
    ];
    this.drawPixelMatrix(
      matrix,
      {
        G: 0x39ff14,
        L: 0x16a34a,
        O: 0xff7b00,
        Y: 0xffd700
      },
      'enemy_iguana',
      3
    );
  }

  createAdminEnemyTexture() {
    // Nivel 3: Dron burocrático de Registro Académico
    const matrix = [
      '...PPPPPP...',
      '.PPPPPPPPPP.',
      'PPWWPPPPWWPP',
      'PPRRPPPPRRPP',
      'PPPPPPPPPPPP',
      '.PP.PPPP.PP.',
      'PP...PP...PP',
      '.P........P.'
    ];
    this.drawPixelMatrix(
      matrix,
      {
        P: 0xc026d3,
        R: 0xff1e56,
        W: 0xf8fafc
      },
      'enemy_admin',
      3
    );
  }

  createBossTexture() {
    // Nave nodriza "Acta de Cancelación"
    const matrix = [
      '....YYYYYY....',
      '..YYRRRRRRYY..',
      '.YRRRRRRRRRRY.',
      'YRRWWRRRRWWRRY',
      'RRRRRRRRRRRRRR',
      '.RRRRYYYYRRRR.',
      '..RR..RR..RR..'
    ];
    this.drawPixelMatrix(
      matrix,
      {
        Y: 0xffd700,
        R: 0xff0055,
        W: 0xffffff
      },
      'enemy_boss',
      4
    );
  }

  createProjectilesAndItems() {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });

    // Bala jugador
    gfx.fillStyle(0x00e5ff, 1);
    gfx.fillRect(0, 0, 4, 14);
    gfx.fillStyle(0xffffff, 1);
    gfx.fillRect(1, 0, 2, 6);
    gfx.generateTexture('bullet_player', 4, 14);
    gfx.clear();

    // Bala enemigo
    gfx.fillStyle(0xff5252, 1);
    gfx.fillRect(0, 0, 5, 14);
    gfx.fillStyle(0xffd700, 1);
    gfx.fillRect(1, 4, 3, 6);
    gfx.generateTexture('bullet_enemy', 5, 14);
    gfx.clear();

    // Bloque de búnker Biblioteca Mario Carvajal
    gfx.fillStyle(0x22c55e, 1);
    gfx.fillRect(0, 0, 10, 8);
    gfx.fillStyle(0x86efac, 0.45);
    gfx.fillRect(0, 0, 10, 2);
    gfx.generateTexture('shield_block', 10, 8);
    gfx.clear();

    // Power-up Tinto de Meléndez
    const tinto = [
      '..WWWW..',
      '.WBBBBW.',
      '.WBBBBW.',
      '.WTTTTW.',
      '..TTTT..',
      '..TTTT..'
    ];
    gfx.destroy();
    this.drawPixelMatrix(
      tinto,
      {
        W: 0xf8fafc,
        B: 0x451a03,
        T: 0xf59e0b
      },
      'powerup_tinto',
      3
    );
  }
}
