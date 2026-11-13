import { GAME_CONFIG } from '../config/constants.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
    this.murilloLoaded = false;
  }

  preload() {
    this.load.json('spritesData', './assets/data/sprites.json');

    // Si el usuario coloca su propio murillo.png en la raíz o en assets/murillo.png, se cargará automáticamente.
    this.load.on('filecomplete-image-murillo_custom', () => {
      this.murilloLoaded = true;
    });
    this.load.on('loaderror', (file) => {
      if (file.key === 'murillo_custom') {
        this.murilloLoaded = false;
      }
    });

    this.load.image('murillo_custom', `./${GAME_CONFIG.MURILLO_IMAGE}`);
  }

  create() {
    const spritesData = this.cache.json.get('spritesData') || {};

    Object.entries(spritesData).forEach(([key, def]) => {
      this.createSpriteFramesFromDef(key, def);
    });

    this.createBulletAndShieldTextures();
    this.createMurilloPlaceholderTexture();

    // Guardar bandera global para saber si existe imagen personalizada de Murillo
    this.registry.set('murilloTextureKey', this.murilloLoaded ? 'murillo_custom' : 'boss_murillo_placeholder');

    this.scene.start('IntroScene');
  }

  createSpriteFramesFromDef(baseKey, def) {
    const { frames, palette, pixel = 3 } = def;
    if (!frames || !frames.length) return;

    const hexPalette = {};
    Object.entries(palette || {}).forEach(([ch, hex]) => {
      hexPalette[ch] = Number.parseInt(hex.replace('#', ''), 16);
    });

    frames.forEach((matrix, idx) => {
      const textureKey = idx === 0 ? baseKey : `${baseKey}_${idx}`;
      this.drawPixelMatrix(matrix, hexPalette, textureKey, pixel);
    });

    if (frames.length > 1) {
      this.anims.create({
        key: `${baseKey}_anim`,
        frames: frames.map((_, idx) => ({ key: idx === 0 ? baseKey : `${baseKey}_${idx}` })),
        frameRate: 4,
        repeat: -1
      });
    }
  }

  drawPixelMatrix(matrix, palette, key, pixelSize = 3) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const ch = matrix[r][c];
        if (ch !== '.' && palette[ch] !== undefined) {
          gfx.fillStyle(palette[ch], 1);
          gfx.fillRect(c * pixelSize, r * pixelSize, pixelSize, pixelSize);
        }
      }
    }

    gfx.generateTexture(key, cols * pixelSize, rows * pixelSize);
    gfx.destroy();
  }

  createBulletAndShieldTextures() {
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });

    // Bala jugador
    gfx.fillStyle(0x00e5ff, 1);
    gfx.fillRect(0, 0, 4, 15);
    gfx.fillStyle(0xffffff, 1);
    gfx.fillRect(1, 0, 2, 7);
    gfx.generateTexture('bullet_player', 4, 15);
    gfx.clear();

    // Bloque de búnker Biblioteca Mario Carvajal
    gfx.fillStyle(0x22c55e, 1);
    gfx.fillRect(0, 0, 10, 8);
    gfx.fillStyle(0x86efac, 0.45);
    gfx.fillRect(0, 0, 10, 2);
    gfx.generateTexture('shield_block', 10, 8);
    gfx.destroy();
  }

  createMurilloPlaceholderTexture() {
    // Rectángulo/círculo distintivo para el Jefe Final "Profesor Murillo"
    const w = 136;
    const h = 112;
    const gfx = this.make.graphics({ x: 0, y: 0, add: false });

    // Marco rectangular oscuro con borde dorado y acento rojo Univalle
    gfx.fillStyle(0x1e1b4b, 1);
    gfx.fillRoundedRect(4, 4, w - 8, h - 8, 16);
    gfx.lineStyle(4, 0xffd700, 1);
    gfx.strokeRoundedRect(4, 4, w - 8, h - 8, 16);

    // Aura circular distintiva
    gfx.fillStyle(0xe6192e, 0.92);
    gfx.fillCircle(w / 2, 46, 32);
    gfx.lineStyle(3, 0xffffff, 0.9);
    gfx.strokeCircle(w / 2, 46, 32);

    // Gafas académicas estilizadas
    gfx.fillStyle(0x0f172a, 1);
    gfx.fillRect(w / 2 - 22, 38, 18, 11);
    gfx.fillRect(w / 2 + 4, 38, 18, 11);
    gfx.fillRect(w / 2 - 4, 42, 8, 3);
    gfx.lineStyle(2, 0x00e5ff, 1);
    gfx.strokeRect(w / 2 - 22, 38, 18, 11);
    gfx.strokeRect(w / 2 + 4, 38, 18, 11);

    // Bigote / gesto serio
    gfx.fillStyle(0xf8fafc, 1);
    gfx.fillRect(w / 2 - 12, 57, 24, 4);

    // Banda inferior de identificación
    gfx.fillStyle(0xffd700, 1);
    gfx.fillRoundedRect(14, 82, w - 28, 22, 6);

    gfx.generateTexture('boss_murillo_placeholder', w, h);
    gfx.destroy();
  }
}
