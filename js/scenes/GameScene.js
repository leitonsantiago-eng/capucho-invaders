import { GAME_CONFIG, COLORS, LEVELS, PROJECTILES, BOSS_TAUNTS } from '../config/constants.js';
import { soundManager } from '../utils/SoundManager.js';
import { createLevelBackground } from '../utils/Backgrounds.js';
import { revealScene, transitionTo } from '../utils/Transitions.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.levelNumber = data?.level || 1;
    this.score = data?.score || 0;
    this.levelConfig = LEVELS.find((lvl) => lvl.level === this.levelNumber) || LEVELS[0];

    const incomingLives = data?.lives ?? GAME_CONFIG.INITIAL_LIVES;
    this.lives = this.levelConfig.refillLivesTo
      ? Math.max(incomingLives, this.levelConfig.refillLivesTo)
      : incomingLives;

    this.isPaused = false;
    this.isLevelEnding = false;
    this.invulnerableUntil = 0;
    this.doubleShotUntil = 0;
    this.lastFiredAt = 0;
    this.enemyDirection = 1;
    this.stepCounter = 0;
    this.nextStepSoundAt = 0;
    this.touchControlsVisible = true;
    this.touchState = { left: false, right: false, shoot: false };

    this.boss = null;
    this.bossHp = 0;
    this.bossMaxHp = 0;
    this.bossDir = 1;
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG);
    revealScene(this);
    this.input.addPointer(3);

    this.bg = createLevelBackground(this, this.levelConfig.theme);
    this.createHUD();
    this.createPlayer();
    this.createBunkers();
    this.createGroups();

    if (this.levelConfig.type === 'boss') {
      this.spawnFinalBoss();
    } else {
      this.spawnEnemies();
      this.enemyFireTimer = this.time.addEvent({
        delay: this.levelConfig.fireRateMs,
        loop: true,
        callback: () => this.fireEnemyBullet()
      });
    }

    if (this.levelConfig.diveEveryMs) {
      this.diveTimer = this.time.addEvent({
        delay: this.levelConfig.diveEveryMs,
        loop: true,
        callback: () => this.launchKamikazeEnemy()
      });
    }

    if (this.levelConfig.mangos) {
      this.mangoTimer = this.time.addEvent({
        delay: this.levelConfig.mangos.rateMs,
        loop: true,
        callback: () => this.spawnFallingMango()
      });
    }

    if (this.levelConfig.spawnUfo) {
      this.ufoTimer = this.time.addEvent({
        delay: 8000,
        loop: true,
        callback: () => this.spawnUfoShip()
      });
    }

    this.setupInputs();
    this.createTouchControls();
    this.setupCollisions();
  }

  createHUD() {
    const hudBg = this.add
      .rectangle(GAME_CONFIG.WIDTH / 2, 24, GAME_CONFIG.WIDTH, 48, 0x0f172a, 0.92)
      .setDepth(30);
    hudBg.setStrokeStyle(1, 0x1e293b);

    this.scoreText = this.add
      .text(14, 24, `PTS: ${this.score}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        fontStyle: 'bold',
        color: COLORS.STAR_WARS_YELLOW
      })
      .setOrigin(0, 0.5)
      .setDepth(31);

    const highScore = Math.max(this.score, Number(localStorage.getItem(GAME_CONFIG.STORAGE_KEY) || 0));
    this.highScoreText = this.add
      .text(160, 24, `MAX: ${highScore}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: COLORS.CYAN
      })
      .setOrigin(0, 0.5)
      .setDepth(31);

    this.levelText = this.add
      .text(GAME_CONFIG.WIDTH / 2, 24, `NIVEL ${this.levelConfig.level}/${LEVELS.length}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        fontStyle: 'bold',
        color: COLORS.WHITE
      })
      .setOrigin(0.5)
      .setDepth(31);

    this.livesText = this.add
      .text(552, 24, this.formatLives(), {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        fontStyle: 'bold',
        color: '#fb7185'
      })
      .setOrigin(0.5)
      .setDepth(31);

    this.touchToggleBtn = this.createHudButton(666, 24, '📱', () => {
      this.touchControlsVisible = !this.touchControlsVisible;
      this.updateTouchVisibility();
    });

    this.muteBtn = this.createHudButton(716, 24, soundManager.muted ? '🔇' : '🔊', () => {
      const muted = soundManager.toggleMute();
      this.muteBtn.setText(muted ? '🔇' : '🔊');
    });

    this.pauseBtn = this.createHudButton(766, 24, '⏸', () => this.togglePause());

    this.pauseBanner = this.add
      .text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 'PAUSA\n(Presiona P o ⏸ para continuar)', {
        fontFamily: '"Courier New", monospace',
        fontSize: '24px',
        fontStyle: 'bold',
        color: COLORS.STAR_WARS_YELLOW,
        backgroundColor: '#0f172aee',
        padding: { x: 24, y: 18 },
        align: 'center'
      })
      .setOrigin(0.5)
      .setDepth(50)
      .setVisible(false);
  }

  createHudButton(x, y, label, onClick) {
    const bg = this.add
      .rectangle(x, y, 40, 32, 0x1e293b, 0.9)
      .setStrokeStyle(1, 0x475569)
      .setDepth(31)
      .setInteractive({ useHandCursor: true });

    const text = this.add
      .text(x, y, label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px',
        color: COLORS.WHITE
      })
      .setOrigin(0.5)
      .setDepth(32);

    bg.on('pointerdown', () => {
      soundManager.ensureContext();
      onClick();
    });

    return text;
  }

  formatLives() {
    return `VIDAS: ${'♥'.repeat(Math.max(0, this.lives))}`;
  }

  createPlayer() {
    this.player = this.physics.add.sprite(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT - 64, 'player_ship');
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(10);
    this.player.body.setSize(34, 24);
  }

  createBunkers() {
    this.bunkers = this.physics.add.staticGroup();
    const bunkerCenters = [145, 315, 485, 655];
    const pattern = [
      '01111110',
      '11111111',
      '11111111',
      '111..111',
      '11....11'
    ];

    bunkerCenters.forEach((centerX) => {
      const startX = centerX - (pattern[0].length * 10) / 2;
      const startY = GAME_CONFIG.HEIGHT - 148;

      for (let r = 0; r < pattern.length; r += 1) {
        for (let c = 0; c < pattern[r].length; c += 1) {
          if (pattern[r][c] === '1') {
            const block = this.bunkers.create(startX + c * 10 + 5, startY + r * 8 + 4, 'shield_block');
            block.refreshBody();
          }
        }
      }
    });
  }

  createGroups() {
    this.playerBullets = this.physics.add.group({ maxSize: 32 });
    this.enemyBullets = this.physics.add.group({ maxSize: 55 });
    this.enemies = this.physics.add.group();
    this.powerUps = this.physics.add.group();
    this.mangos = this.physics.add.group();
    this.ufoGroup = this.physics.add.group();
    this.bossGroup = this.physics.add.group();
  }

  spawnEnemies() {
    const { cols, enemyTypes, rowTypes } = this.levelConfig;
    const rows = rowTypes.length;
    const spacingX = 58;
    const spacingY = 44;
    const totalWidth = (cols - 1) * spacingX;
    const startX = (GAME_CONFIG.WIDTH - totalWidth) / 2;
    const startY = 86;

    this.initialEnemyCount = rows * cols;

    for (let r = 0; r < rows; r += 1) {
      const def = enemyTypes[rowTypes[r]] || enemyTypes[0];
      for (let c = 0; c < cols; c += 1) {
        const x = startX + c * spacingX;
        const y = startY + r * spacingY;
        const enemy = this.enemies.create(x, y, def.texture);
        if (this.anims.exists(`${def.texture}_anim`)) {
          enemy.play(`${def.texture}_anim`);
        }
        enemy.setData('points', def.points + (rows - r) * 10);
        enemy.setData('projectile', def.projectile);
        enemy.setData('diving', false);
        enemy.body.setAllowGravity(false);
        enemy.setDepth(8);
      }
    }
  }

  spawnUfoShip() {
    if (this.isPaused || this.isLevelEnding || this.ufoGroup.countActive(true) > 0) return;

    const fromLeft = Math.random() < 0.5;
    const startX = fromLeft ? -35 : GAME_CONFIG.WIDTH + 35;
    const speedX = fromLeft ? 155 : -155;

    const ufo = this.ufoGroup.create(startX, 68, 'enemy_ufo');
    ufo.setVelocityX(speedX);
    ufo.setData('hp', 3);
    ufo.setData('points', 500);
    ufo.setDepth(12);
  }

  spawnFinalBoss() {
    this.bossMaxHp = this.levelConfig.boss?.hp || 90;
    this.bossHp = this.bossMaxHp;
    this.bossDir = 1;

    const murilloKey = this.registry.get('murilloTextureKey') || 'boss_murillo_placeholder';
    this.boss = this.bossGroup.create(GAME_CONFIG.WIDTH / 2, 134, murilloKey);
    this.boss.setDisplaySize(136, 112);
    this.boss.body.setSize(this.boss.width * 0.88, this.boss.height * 0.88);
    this.boss.setDepth(14);
    this.boss.body.setAllowGravity(false);

    if (murilloKey === 'boss_murillo_placeholder') {
      this.bossLabel = this.add
        .text(this.boss.x, this.boss.y + 38, 'PROF. MURILLO', {
          fontFamily: '"Courier New", monospace',
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#0f172a'
        })
        .setOrigin(0.5)
        .setDepth(15);
    }

    // Barra de vida superior del Profesor Murillo
    this.add
      .text(GAME_CONFIG.WIDTH / 2, 57, 'JEFE FINAL: PROFESOR MURILLO', {
        fontFamily: '"Courier New", monospace',
        fontSize: '13px',
        fontStyle: 'bold',
        color: COLORS.STAR_WARS_YELLOW
      })
      .setOrigin(0.5)
      .setDepth(32);

    this.bossBarBg = this.add.rectangle(GAME_CONFIG.WIDTH / 2, 74, 420, 12, 0x1e293b, 0.95).setDepth(31);
    this.bossBarBg.setStrokeStyle(1, 0xffd700);
    this.bossBarFill = this.add
      .rectangle(GAME_CONFIG.WIDTH / 2 - 208, 74, 416, 8, 0xe6192e, 1)
      .setOrigin(0, 0.5)
      .setDepth(32);

    this.bossTauntText = this.add
      .text(this.boss.x, this.boss.y - 66, '', {
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#fef08a',
        backgroundColor: '#0f172ae0',
        padding: { x: 8, y: 4 }
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setVisible(false);

    soundManager.playBossRoar();
    this.showBossTaunt('¡Es hora de sustentar el Proyecto Final!');

    // Ataque principal: Proyectos Finales masivos + abanico de parciales
    this.bossAttackTimer = this.time.addEvent({
      delay: 1350,
      loop: true,
      callback: () => this.fireBossAttack()
    });

    this.bossTauntTimer = this.time.addEvent({
      delay: 4600,
      loop: true,
      callback: () => this.showBossTaunt(Phaser.Utils.Array.GetRandom(BOSS_TAUNTS))
    });
  }

  showBossTaunt(msg) {
    if (!this.bossTauntText || !this.boss || !this.boss.active) return;
    this.bossTauntText.setText(msg).setVisible(true);
    this.time.delayedCall(2600, () => {
      if (this.bossTauntText) this.bossTauntText.setVisible(false);
    });
  }

  fireBossAttack() {
    if (this.isPaused || this.isLevelEnding || !this.boss || !this.boss.active) return;

    const hpRatio = this.bossHp / this.bossMaxHp;
    const roll = Math.random();

    if (roll < 0.52) {
      // Disparo masivo: "PROYECTO FINAL"
      this.spawnEnemyProjectile(this.boss.x, this.boss.y + 46, 'proyecto', 235);
      if (hpRatio < 0.45) {
        this.spawnEnemyProjectile(this.boss.x - 42, this.boss.y + 40, 'parcial', 260);
        this.spawnEnemyProjectile(this.boss.x + 42, this.boss.y + 40, 'parcial', 260);
      }
    } else {
      // Ráfaga en abanico de parciales con notas rojas
      [-90, 0, 90].forEach((vx) => {
        const b = this.spawnEnemyProjectile(this.boss.x, this.boss.y + 44, 'parcial', 270);
        if (b) b.setVelocityX(vx);
      });
    }
  }

  launchKamikazeEnemy() {
    if (this.isPaused || this.isLevelEnding) return;
    const candidates = this.enemies
      .getChildren()
      .filter((e) => e.active && !e.getData('diving') && e.texture.key === 'enemy_zancudo');

    if (candidates.length === 0) return;
    const zancudo = Phaser.Utils.Array.GetRandom(candidates);
    zancudo.setData('diving', true);

    const dx = this.player.x - zancudo.x;
    const dy = Math.max(120, this.player.y - zancudo.y);
    const len = Math.hypot(dx, dy);
    zancudo.setVelocity((dx / len) * 210, (dy / len) * 210);
    soundManager.playEnemyShoot('picadura');
  }

  spawnFallingMango() {
    if (this.isPaused || this.isLevelEnding) return;
    const isRipe = Math.random() < (this.levelConfig.mangos?.ripeChance ?? 0.3);
    const key = isRipe ? 'mango_maduro' : 'mango_verde';
    const x = Phaser.Math.Between(40, GAME_CONFIG.WIDTH - 40);

    const mango = this.mangos.create(x, 54, key);
    mango.setData('ripe', isRipe);
    mango.setVelocityY(isRipe ? 135 : 175);
    mango.setAngularVelocity(isRipe ? 60 : -110);
    mango.setDepth(11);
  }

  setupInputs() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

    this.keyP.on('down', () => this.togglePause());
  }

  createTouchControls() {
    const btnY = GAME_CONFIG.HEIGHT - 64;
    const radius = 44;

    this.touchButtons = {
      left: { x: 74, y: btnY, r: radius },
      right: { x: 184, y: btnY, r: radius },
      shoot: { x: GAME_CONFIG.WIDTH - 84, y: btnY, r: 52 }
    };

    const makePad = (cfg, label, fillColor) => {
      const circle = this.add
        .circle(cfg.x, cfg.y, cfg.r, fillColor, 0.32)
        .setStrokeStyle(2, 0xffffff, 0.5)
        .setDepth(40);

      const text = this.add
        .text(cfg.x, cfg.y, label, {
          fontFamily: '"Courier New", monospace',
          fontSize: label.length > 2 ? '16px' : '28px',
          fontStyle: 'bold',
          color: '#ffffff'
        })
        .setOrigin(0.5)
        .setAlpha(0.72)
        .setDepth(41);

      return { circle, text };
    };

    this.padLeft = makePad(this.touchButtons.left, '◄', 0x0ea5e9);
    this.padRight = makePad(this.touchButtons.right, '►', 0x0ea5e9);
    this.padShoot = makePad(this.touchButtons.shoot, 'FUEGO', 0xe6192e);

    this.updateTouchVisibility();
  }

  updateTouchVisibility() {
    const visible = this.touchControlsVisible;
    [this.padLeft, this.padRight, this.padShoot].forEach((pad) => {
      pad.circle.setVisible(visible);
      pad.text.setVisible(visible);
    });
  }

  updateTouchState() {
    let left = false;
    let right = false;
    let shoot = false;

    if (this.touchControlsVisible) {
      const pointers = [
        this.input.pointer1,
        this.input.pointer2,
        this.input.pointer3,
        this.input.pointer4,
        this.input.activePointer
      ];

      for (let i = 0; i < pointers.length; i += 1) {
        const ptr = pointers[i];
        if (!ptr || !ptr.isDown) continue;

        const px = ptr.x;
        const py = ptr.y;

        if (Phaser.Math.Distance.Between(px, py, this.touchButtons.left.x, this.touchButtons.left.y) <= this.touchButtons.left.r + 14) {
          left = true;
        }
        if (Phaser.Math.Distance.Between(px, py, this.touchButtons.right.x, this.touchButtons.right.y) <= this.touchButtons.right.r + 14) {
          right = true;
        }
        if (Phaser.Math.Distance.Between(px, py, this.touchButtons.shoot.x, this.touchButtons.shoot.y) <= this.touchButtons.shoot.r + 16) {
          shoot = true;
        }
      }
    }

    this.touchState.left = left;
    this.touchState.right = right;
    this.touchState.shoot = shoot;

    this.padLeft.circle.setFillStyle(0x0ea5e9, left ? 0.65 : 0.32);
    this.padRight.circle.setFillStyle(0x0ea5e9, right ? 0.65 : 0.32);
    this.padShoot.circle.setFillStyle(0xe6192e, shoot ? 0.72 : 0.34);
  }

  setupCollisions() {
    // Bala jugador vs enemigos comunes
    this.physics.add.overlap(this.playerBullets, this.enemies, (bullet, enemy) => {
      bullet.destroy();
      this.handleEnemyHit(enemy);
    });

    // Bala jugador vs UFO
    this.physics.add.overlap(this.playerBullets, this.ufoGroup, (bullet, ufo) => {
      bullet.destroy();
      const hp = (ufo.getData('hp') || 1) - 1;
      ufo.setData('hp', hp);
      ufo.setTintFill(0xffffff);
      this.time.delayedCall(60, () => { if (ufo.active) ufo.clearTint(); });
      if (hp <= 0) {
        this.addScore(ufo.getData('points') || 500);
        this.spawnExplosionParticles(ufo.x, ufo.y, 0xffd700);
        soundManager.playExplosion();
        ufo.destroy();
      }
    });

    // Bala jugador vs Jefe Profesor Murillo
    this.physics.add.overlap(this.playerBullets, this.bossGroup, (bullet, boss) => {
      bullet.destroy();
      this.handleBossHit(boss);
    });

    // Bala jugador vs Proyectiles destructibles ("Proyectos Finales")
    this.physics.add.overlap(this.playerBullets, this.enemyBullets, (pBullet, eBullet) => {
      if (!eBullet.getData('destructible')) return;
      pBullet.destroy();
      const hp = (eBullet.getData('hp') || 1) - 1;
      eBullet.setData('hp', hp);
      eBullet.setTintFill(0xffffff);
      this.time.delayedCall(60, () => { if (eBullet.active) eBullet.clearTint(); });
      soundManager.playBossHit();

      if (hp <= 0) {
        this.addScore(80);
        this.spawnExplosionParticles(eBullet.x, eBullet.y, 0xfacc15);
        soundManager.playExplosion();
        eBullet.destroy();
      }
    });

    // Balas jugador vs Mangos (puedes destruir mangos verdes; si disparas a uno maduro también explota sin curar)
    this.physics.add.overlap(this.playerBullets, this.mangos, (bullet, mango) => {
      bullet.destroy();
      const isRipe = mango.getData('ripe');
      this.spawnExplosionParticles(mango.x, mango.y, isRipe ? 0xf59e0b : 0x65a30d);
      soundManager.playSplat();
      if (!isRipe) this.addScore(25);
      mango.destroy();
    });

    // Balas vs Búnkeres
    this.physics.add.overlap(this.playerBullets, this.bunkers, (bullet, block) => {
      bullet.destroy();
      block.destroy();
    });
    this.physics.add.overlap(this.enemyBullets, this.bunkers, (bullet, block) => {
      if (!bullet.getData('massive')) bullet.destroy();
      block.destroy();
    });
    this.physics.add.overlap(this.enemies, this.bunkers, (_, block) => {
      block.destroy();
    });

    // Bala enemiga vs Jugador
    this.physics.add.overlap(this.enemyBullets, this.player, (_, bullet) => {
      bullet.destroy();
      this.handlePlayerHit();
    });

    // Mango vs Jugador (Maduro = +1 vida, Verde = daño)
    this.physics.add.overlap(this.player, this.mangos, (_, mango) => {
      const isRipe = mango.getData('ripe');
      mango.destroy();
      if (isRipe) {
        soundManager.playHeal();
        if (this.lives < GAME_CONFIG.MAX_LIVES) {
          this.lives += 1;
          this.livesText.setText(this.formatLives());
        }
        this.addScore(120);
        this.showFloatingBanner('🥭 MANGO MADURO: +1 VIDA y +120 PTS');
      } else {
        soundManager.playSplat();
        this.showFloatingBanner('🥭 ¡MANGO VERDE EN LA CABEZA!');
        this.handlePlayerHit();
      }
    });

    // Enemigo choca contra Jugador
    this.physics.add.overlap(this.enemies, this.player, (_, enemy) => {
      if (enemy.getData('diving')) {
        enemy.destroy();
        this.handlePlayerHit();
        if (this.enemies.countActive(true) === 0 && !this.isLevelEnding) {
          this.completeLevel();
        }
      } else {
        this.lives = 0;
        this.handlePlayerHit();
      }
    });

    // Power-up Tinto vs Jugador
    this.physics.add.overlap(this.player, this.powerUps, (_, item) => {
      item.destroy();
      soundManager.playPowerUp();
      this.doubleShotUntil = this.time.now + 7000;
      this.addScore(50);
      this.showFloatingBanner('☕ TINTO DE MELÉNDEZ: ¡DISPARO DOBLE!');
    });
  }

  handleEnemyHit(enemy) {
    const points = enemy.getData('points') || 100;
    this.addScore(points);
    this.spawnExplosionParticles(enemy.x, enemy.y, 0x00e5ff);
    soundManager.playExplosion();

    if (Math.random() < 0.11) {
      const item = this.powerUps.create(enemy.x, enemy.y, 'powerup_tinto');
      item.setVelocityY(125);
      item.setDepth(9);
    }

    enemy.destroy();

    if (this.enemies.countActive(true) === 0 && !this.isLevelEnding) {
      this.completeLevel();
    }
  }

  handleBossHit(boss) {
    if (this.isLevelEnding) return;
    this.bossHp = Math.max(0, this.bossHp - 1);
    this.addScore(25);
    soundManager.playBossHit();

    boss.setTintFill(0xffffff);
    this.time.delayedCall(55, () => {
      if (boss.active) boss.clearTint();
    });

    const ratio = this.bossHp / this.bossMaxHp;
    if (this.bossBarFill) {
      this.bossBarFill.width = Math.max(0, 416 * ratio);
    }

    if (this.bossHp <= 0) {
      this.isLevelEnding = true;
      this.physics.pause();
      if (this.bossAttackTimer) this.bossAttackTimer.remove(false);
      if (this.bossTauntTimer) this.bossTauntTimer.remove(false);
      this.addScore(2500);

      for (let i = 0; i < 6; i += 1) {
        this.time.delayedCall(i * 180, () => {
          if (!boss.active) return;
          this.spawnExplosionParticles(
            boss.x + Phaser.Math.Between(-50, 50),
            boss.y + Phaser.Math.Between(-35, 35),
            i % 2 === 0 ? 0xffd700 : 0xe6192e
          );
          soundManager.playExplosion();
        });
      }

      this.time.delayedCall(1250, () => {
        if (this.bossLabel) this.bossLabel.destroy();
        if (this.bossTauntText) this.bossTauntText.destroy();
        boss.destroy();
        soundManager.playGameOver(true);
        transitionTo(this, 'GameOverScene', {
          victory: true,
          score: this.score,
          levelReached: this.levelNumber
        });
      });
    }
  }

  handlePlayerHit() {
    const now = this.time.now;
    if (now < this.invulnerableUntil || this.isLevelEnding) return;

    soundManager.playExplosion();
    this.spawnExplosionParticles(this.player.x, this.player.y, 0xe6192e);
    this.cameras.main.shake(180, 0.012);

    this.lives -= 1;
    this.livesText.setText(this.formatLives());

    if (this.lives <= 0) {
      this.isLevelEnding = true;
      this.physics.pause();
      soundManager.playGameOver(false);
      this.time.delayedCall(850, () => {
        transitionTo(this, 'GameOverScene', {
          victory: false,
          score: this.score,
          levelReached: this.levelNumber
        });
      });
      return;
    }

    this.invulnerableUntil = now + 1800;
    this.tweens.add({
      targets: this.player,
      alpha: 0.25,
      duration: 120,
      yoyo: true,
      repeat: 6,
      onComplete: () => {
        if (this.player && this.player.active) this.player.setAlpha(1);
      }
    });
  }

  completeLevel() {
    this.isLevelEnding = true;
    soundManager.playLevelUp();

    const bonus = 250 * this.levelNumber;
    this.addScore(bonus);
    this.showFloatingBanner(`¡SECTOR ${this.levelNumber} DESPEJADO! +${bonus} PTS`);

    this.time.delayedCall(1400, () => {
      if (this.levelNumber < LEVELS.length) {
        transitionTo(this, 'StoryScene', {
          level: this.levelNumber + 1,
          score: this.score,
          lives: this.lives
        });
      } else {
        soundManager.playGameOver(true);
        transitionTo(this, 'GameOverScene', {
          victory: true,
          score: this.score,
          levelReached: this.levelNumber
        });
      }
    });
  }

  addScore(amount) {
    this.score += amount;
    this.scoreText.setText(`PTS: ${this.score}`);

    const savedHigh = Number(localStorage.getItem(GAME_CONFIG.STORAGE_KEY) || 0);
    if (this.score > savedHigh) {
      localStorage.setItem(GAME_CONFIG.STORAGE_KEY, String(this.score));
      this.highScoreText.setText(`MAX: ${this.score}`);
    }
  }

  spawnExplosionParticles(x, y, color) {
    for (let i = 0; i < 9; i += 1) {
      const p = this.add.rectangle(x, y, 4, 4, color).setDepth(25);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.Between(14, 38);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 270,
        onComplete: () => p.destroy()
      });
    }
  }

  showFloatingBanner(msg) {
    const banner = this.add
      .text(GAME_CONFIG.WIDTH / 2, 110, msg, {
        fontFamily: '"Courier New", monospace',
        fontSize: '17px',
        fontStyle: 'bold',
        color: COLORS.STAR_WARS_YELLOW,
        backgroundColor: '#0f172ad9',
        padding: { x: 14, y: 8 }
      })
      .setOrigin(0.5)
      .setDepth(45);

    this.tweens.add({
      targets: banner,
      y: 84,
      alpha: 0,
      duration: 1500,
      ease: 'Quad.easeOut',
      onComplete: () => banner.destroy()
    });
  }

  firePlayerBullet() {
    const now = this.time.now;
    const isDouble = now < this.doubleShotUntil;
    const cooldown = isDouble ? 185 : 270;

    if (now - this.lastFiredAt < cooldown) return;
    this.lastFiredAt = now;
    soundManager.ensureContext();
    soundManager.playShoot();

    if (isDouble) {
      this.spawnSinglePlayerBullet(this.player.x - 10, this.player.y - 16);
      this.spawnSinglePlayerBullet(this.player.x + 10, this.player.y - 16);
    } else {
      this.spawnSinglePlayerBullet(this.player.x, this.player.y - 18);
    }
  }

  spawnSinglePlayerBullet(x, y) {
    const bullet = this.playerBullets.create(x, y, 'bullet_player');
    if (!bullet) return;
    bullet.setVelocityY(-GAME_CONFIG.BULLET_SPEED);
    bullet.setDepth(9);
  }

  fireEnemyBullet() {
    if (this.isPaused || this.isLevelEnding) return;
    const activeEnemies = this.enemies.getChildren().filter((e) => e.active);
    if (activeEnemies.length === 0) return;

    const shooter = Phaser.Utils.Array.GetRandom(activeEnemies);
    const projType = shooter.getData('projectile') || 'parcial';
    this.spawnEnemyProjectile(shooter.x, shooter.y + 16, projType, this.levelConfig.enemyBulletSpeed);
  }

  spawnEnemyProjectile(x, y, typeName, baseSpeed) {
    const def = PROJECTILES[typeName] || PROJECTILES.parcial;
    const bullet = this.enemyBullets.create(x, y, def.texture);
    if (!bullet) return null;

    const speed = baseSpeed * (def.speedMul || 1);
    bullet.setData('behavior', def.behavior);
    bullet.setData('baseX', x);
    bullet.setData('spawnTime', this.time.now);
    bullet.setData('massive', Boolean(def.massive));
    bullet.setData('destructible', Boolean(def.destructible));
    bullet.setData('hp', def.hp || 1);
    bullet.setDepth(11);

    if (def.behavior === 'spin') {
      bullet.setVelocityY(speed);
      bullet.setAngularVelocity(260);
    } else if (def.behavior === 'aimed') {
      const dx = this.player.x - x;
      const dy = Math.max(80, this.player.y - y);
      const len = Math.hypot(dx, dy);
      bullet.setVelocity((dx / len) * speed, (dy / len) * speed);
    } else {
      bullet.setVelocityY(speed);
    }

    if (def.bodyScale) {
      bullet.body.setSize(bullet.width * def.bodyScale, bullet.height * def.bodyScale);
    }

    soundManager.playEnemyShoot(typeName);
    return bullet;
  }

  togglePause() {
    if (this.isLevelEnding) return;
    this.isPaused = !this.isPaused;
    this.pauseBanner.setVisible(this.isPaused);
    const timers = [this.enemyFireTimer, this.diveTimer, this.mangoTimer, this.ufoTimer, this.bossAttackTimer, this.bossTauntTimer];
    if (this.isPaused) {
      this.physics.pause();
      timers.forEach((t) => { if (t) t.paused = true; });
    } else {
      this.physics.resume();
      timers.forEach((t) => { if (t) t.paused = false; });
    }
  }

  update(time, delta) {
    const dt = delta / 1000;
    if (this.bg) this.bg.update(time, dt);

    if (this.isPaused || this.isLevelEnding) return;

    this.updateTouchState();

    const moveLeft = this.cursors.left.isDown || this.keyA.isDown || this.touchState.left;
    const moveRight = this.cursors.right.isDown || this.keyD.isDown || this.touchState.right;

    if (moveLeft && !moveRight) {
      this.player.setVelocityX(-GAME_CONFIG.PLAYER_SPEED);
    } else if (moveRight && !moveLeft) {
      this.player.setVelocityX(GAME_CONFIG.PLAYER_SPEED);
    } else {
      this.player.setVelocityX(0);
    }

    const wantShoot =
      this.keySpace.isDown ||
      this.cursors.up.isDown ||
      this.keyW.isDown ||
      this.touchState.shoot;

    if (wantShoot) this.firePlayerBullet();

    if (this.levelConfig.type === 'boss') {
      this.updateBossMovement(time, dt);
    } else {
      this.updateEnemyFormation(time, dt);
    }

    this.updateWaveProjectiles(time);
    this.cleanupOffscreenObjects();
  }

  updateBossMovement(time, dt) {
    if (!this.boss || !this.boss.active) return;
    const hpRatio = this.bossHp / this.bossMaxHp;
    const speed = hpRatio < 0.3 ? 340 : hpRatio < 0.65 ? 275 : 220;

    this.boss.x += this.bossDir * speed * dt;
    this.boss.y = 132 + Math.sin(time / 380) * 18;

    if (this.boss.x >= GAME_CONFIG.WIDTH - 86 && this.bossDir > 0) this.bossDir = -1;
    else if (this.boss.x <= 86 && this.bossDir < 0) this.bossDir = 1;

    if (this.bossLabel) {
      this.bossLabel.setPosition(this.boss.x, this.boss.y + 38);
    }
    if (this.bossTauntText && this.bossTauntText.visible) {
      this.bossTauntText.setPosition(
        Phaser.Math.Clamp(this.boss.x, 150, GAME_CONFIG.WIDTH - 150),
        this.boss.y - 68
      );
    }
  }

  updateEnemyFormation(time, dt) {
    const formationEnemies = this.enemies
      .getChildren()
      .filter((e) => e.active && !e.getData('diving'));

    if (formationEnemies.length === 0) return;

    const remainingRatio = formationEnemies.length / Math.max(1, this.initialEnemyCount);
    const speedMultiplier = 1 + (1 - remainingRatio) * 1.45;
    const currentSpeed = this.levelConfig.enemySpeedX * speedMultiplier;

    let hitEdge = false;
    let reachedBottom = false;

    for (let i = 0; i < formationEnemies.length; i += 1) {
      const enemy = formationEnemies[i];
      enemy.x += this.enemyDirection * currentSpeed * dt;
      if (enemy.x >= GAME_CONFIG.WIDTH - 34 && this.enemyDirection > 0) hitEdge = true;
      else if (enemy.x <= 34 && this.enemyDirection < 0) hitEdge = true;
      if (enemy.y >= GAME_CONFIG.HEIGHT - 90) reachedBottom = true;
    }

    if (hitEdge) {
      this.enemyDirection *= -1;
      for (let i = 0; i < formationEnemies.length; i += 1) {
        formationEnemies[i].y += this.levelConfig.enemyDropY;
      }
    }

    if (reachedBottom) {
      this.lives = 0;
      this.handlePlayerHit();
      return;
    }

    const stepDelay = Math.max(160, 620 * remainingRatio);
    if (time >= this.nextStepSoundAt) {
      soundManager.playStep(this.stepCounter);
      this.stepCounter += 1;
      this.nextStepSoundAt = time + stepDelay;
    }
  }

  updateWaveProjectiles(time) {
    this.enemyBullets.getChildren().forEach((b) => {
      if (b.active && b.getData('behavior') === 'wave') {
        const age = (time - b.getData('spawnTime')) / 1000;
        b.x = b.getData('baseX') + Math.sin(age * 9) * 28;
      }
    });
  }

  cleanupOffscreenObjects() {
    this.playerBullets.getChildren().forEach((b) => {
      if (b.active && b.y < 40) b.destroy();
    });
    this.enemyBullets.getChildren().forEach((b) => {
      if (b.active && (b.y > GAME_CONFIG.HEIGHT + 24 || b.x < -30 || b.x > GAME_CONFIG.WIDTH + 30)) {
        b.destroy();
      }
    });
    this.powerUps.getChildren().forEach((p) => {
      if (p.active && p.y > GAME_CONFIG.HEIGHT + 16) p.destroy();
    });
    this.mangos.getChildren().forEach((m) => {
      if (m.active && m.y > GAME_CONFIG.HEIGHT + 20) m.destroy();
    });
    this.enemies.getChildren().forEach((e) => {
      if (e.active && e.getData('diving') && e.y > GAME_CONFIG.HEIGHT + 24) {
        e.destroy();
        if (this.enemies.countActive(true) === 0 && !this.isLevelEnding) {
          this.completeLevel();
        }
      }
    });
    this.ufoGroup.getChildren().forEach((ufo) => {
      if (ufo.active && (ufo.x < -70 || ufo.x > GAME_CONFIG.WIDTH + 70)) ufo.destroy();
    });
  }
}
