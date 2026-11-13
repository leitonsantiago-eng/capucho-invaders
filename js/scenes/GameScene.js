import { GAME_CONFIG, COLORS, LEVELS } from '../config/constants.js';
import { soundManager } from '../utils/SoundManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.levelNumber = data?.level || 1;
    this.score = data?.score || 0;
    this.lives = data?.lives ?? GAME_CONFIG.INITIAL_LIVES;
    this.levelConfig = LEVELS.find((lvl) => lvl.level === this.levelNumber) || LEVELS[0];

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
  }

  create() {
    this.cameras.main.setBackgroundColor(COLORS.BG);
    this.input.addPointer(3);

    this.createStarfield();
    this.createHUD();
    this.createPlayer();
    this.createBunkers();
    this.createGroups();
    this.spawnEnemies();
    this.setupInputs();
    this.createTouchControls();
    this.setupCollisions();

    // Temporizador de disparos enemigos
    this.enemyFireTimer = this.time.addEvent({
      delay: this.levelConfig.fireRateMs,
      loop: true,
      callback: () => this.fireEnemyBullet()
    });

    // Nave nodriza en Nivel 3
    if (this.levelConfig.spawnBoss) {
      this.bossTimer = this.time.addEvent({
        delay: 7500,
        loop: true,
        callback: () => this.spawnBossShip()
      });
    }
  }

  createStarfield() {
    this.stars = [];
    for (let i = 0; i < 60; i += 1) {
      const star = this.add.circle(
        Phaser.Math.Between(0, GAME_CONFIG.WIDTH),
        Phaser.Math.Between(48, GAME_CONFIG.HEIGHT - 20),
        Phaser.Math.FloatBetween(0.9, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.18, 0.75)
      );
      star.speed = Phaser.Math.FloatBetween(18, 52);
      this.stars.push(star);
    }
  }

  createHUD() {
    const hudBg = this.add
      .rectangle(GAME_CONFIG.WIDTH / 2, 24, GAME_CONFIG.WIDTH, 48, 0x0f172a, 0.92)
      .setDepth(30);
    hudBg.setStrokeStyle(1, 0x1e293b);

    this.scoreText = this.add
      .text(16, 24, `PTS: ${this.score}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        fontStyle: 'bold',
        color: COLORS.STAR_WARS_YELLOW
      })
      .setOrigin(0, 0.5)
      .setDepth(31);

    const highScore = Math.max(this.score, Number(localStorage.getItem(GAME_CONFIG.STORAGE_KEY) || 0));
    this.highScoreText = this.add
      .text(175, 24, `MAX: ${highScore}`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        color: COLORS.CYAN
      })
      .setOrigin(0, 0.5)
      .setDepth(31);

    this.levelText = this.add
      .text(GAME_CONFIG.WIDTH / 2, 24, `NIVEL ${this.levelConfig.level}/3`, {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        fontStyle: 'bold',
        color: COLORS.WHITE
      })
      .setOrigin(0.5)
      .setDepth(31);

    this.livesText = this.add
      .text(565, 24, this.formatLives(), {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#fb7185'
      })
      .setOrigin(0.5)
      .setDepth(31);

    // Botón alternar controles táctiles
    this.touchToggleBtn = this.createHudButton(666, 24, '📱', () => {
      this.touchControlsVisible = !this.touchControlsVisible;
      this.updateTouchVisibility();
    });

    // Botón sonido
    this.muteBtn = this.createHudButton(716, 24, soundManager.muted ? '🔇' : '🔊', () => {
      const muted = soundManager.toggleMute();
      this.muteBtn.setText(muted ? '🔇' : '🔊');
    });

    // Botón pausa
    this.pauseBtn = this.createHudButton(766, 24, '⏸', () => this.togglePause());

    this.pauseBanner = this.add
      .text(GAME_CONFIG.WIDTH / 2, GAME_CONFIG.HEIGHT / 2, 'PAUSA\n(Presiona P o ⏸ para continuar)', {
        fontFamily: '"Courier New", monospace',
        fontSize: '26px',
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
    this.playerBullets = this.physics.add.group({ maxSize: 24 });
    this.enemyBullets = this.physics.add.group({ maxSize: 40 });
    this.enemies = this.physics.add.group();
    this.powerUps = this.physics.add.group();
    this.bossGroup = this.physics.add.group();
  }

  spawnEnemies() {
    const { rows, cols, enemyTexture } = this.levelConfig;
    const spacingX = 58;
    const spacingY = 44;
    const totalWidth = (cols - 1) * spacingX;
    const startX = (GAME_CONFIG.WIDTH - totalWidth) / 2;
    const startY = 84;

    this.initialEnemyCount = rows * cols;

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const x = startX + c * spacingX;
        const y = startY + r * spacingY;
        const enemy = this.enemies.create(x, y, enemyTexture);
        enemy.setData('points', this.levelConfig.pointsPerEnemy + (rows - r) * 10);
        enemy.body.setAllowGravity(false);
        enemy.setDepth(8);
      }
    }
  }

  spawnBossShip() {
    if (this.isPaused || this.isLevelEnding || this.bossGroup.countActive(true) > 0) return;

    const fromLeft = Math.random() < 0.5;
    const startX = fromLeft ? -35 : GAME_CONFIG.WIDTH + 35;
    const speedX = fromLeft ? 150 : -150;

    const boss = this.bossGroup.create(startX, 66, 'enemy_boss');
    boss.setVelocityX(speedX);
    boss.setData('hp', 3);
    boss.setData('points', 500);
    boss.setDepth(12);
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
    // Bala del jugador vs enemigos
    this.physics.add.overlap(this.playerBullets, this.enemies, (bullet, enemy) => {
      bullet.destroy();
      this.handleEnemyHit(enemy);
    });

    // Bala del jugador vs Boss
    this.physics.add.overlap(this.playerBullets, this.bossGroup, (bullet, boss) => {
      bullet.destroy();
      const hp = (boss.getData('hp') || 1) - 1;
      boss.setData('hp', hp);
      boss.setTintFill(0xffffff);
      this.time.delayedCall(70, () => {
        if (boss.active) boss.clearTint();
      });

      if (hp <= 0) {
        this.addScore(boss.getData('points') || 500);
        this.spawnExplosionParticles(boss.x, boss.y, 0xffd700);
        soundManager.playExplosion();
        boss.destroy();
      }
    });

    // Balas vs Búnkeres
    this.physics.add.overlap(this.playerBullets, this.bunkers, (bullet, block) => {
      bullet.destroy();
      block.destroy();
    });

    this.physics.add.overlap(this.enemyBullets, this.bunkers, (bullet, block) => {
      bullet.destroy();
      block.destroy();
    });

    // Enemigos vs Búnkeres
    this.physics.add.overlap(this.enemies, this.bunkers, (_, block) => {
      block.destroy();
    });

    // Bala enemiga vs Jugador
    this.physics.add.overlap(this.enemyBullets, this.player, (_, bullet) => {
      bullet.destroy();
      this.handlePlayerHit();
    });

    // Enemigo choca directamente contra Jugador
    this.physics.add.overlap(this.enemies, this.player, () => {
      this.lives = 0;
      this.handlePlayerHit();
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

    // 10% de probabilidad de soltar Tinto de Meléndez
    if (Math.random() < 0.1) {
      const item = this.powerUps.create(enemy.x, enemy.y, 'powerup_tinto');
      item.setVelocityY(125);
      item.setDepth(9);
    }

    enemy.destroy();

    if (this.enemies.countActive(true) === 0 && !this.isLevelEnding) {
      this.completeLevel();
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
      this.time.delayedCall(900, () => {
        this.scene.start('GameOverScene', {
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
        if (this.player && this.player.active) {
          this.player.setAlpha(1);
        }
      }
    });
  }

  completeLevel() {
    this.isLevelEnding = true;
    soundManager.playLevelUp();

    const bonus = 250 * this.levelNumber;
    this.addScore(bonus);
    this.showFloatingBanner(`¡SECTOR ${this.levelNumber} DESPEJADO! +${bonus} PTS`);

    this.time.delayedCall(1500, () => {
      if (this.levelNumber < LEVELS.length) {
        this.scene.start('StoryScene', {
          level: this.levelNumber + 1,
          score: this.score,
          lives: this.lives
        });
      } else {
        soundManager.playGameOver(true);
        this.scene.start('GameOverScene', {
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
    for (let i = 0; i < 8; i += 1) {
      const p = this.add.rectangle(x, y, 4, 4, color);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const dist = Phaser.Math.Between(14, 34);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * dist,
        y: y + Math.sin(angle) * dist,
        alpha: 0,
        duration: 260,
        onComplete: () => p.destroy()
      });
    }
  }

  showFloatingBanner(msg) {
    const banner = this.add
      .text(GAME_CONFIG.WIDTH / 2, 110, msg, {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        fontStyle: 'bold',
        color: COLORS.STAR_WARS_YELLOW,
        backgroundColor: '#0f172ad9',
        padding: { x: 14, y: 8 }
      })
      .setOrigin(0.5)
      .setDepth(45);

    this.tweens.add({
      targets: banner,
      y: 86,
      alpha: 0,
      duration: 1600,
      ease: 'Quad.easeOut',
      onComplete: () => banner.destroy()
    });
  }

  firePlayerBullet() {
    const now = this.time.now;
    const isDouble = now < this.doubleShotUntil;
    const cooldown = isDouble ? 190 : 280;

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
    const bullet = this.enemyBullets.create(shooter.x, shooter.y + 14, 'bullet_enemy');
    if (!bullet) return;

    bullet.setVelocityY(this.levelConfig.enemyBulletSpeed);
    bullet.setDepth(9);
    soundManager.playEnemyShoot();
  }

  togglePause() {
    if (this.isLevelEnding) return;
    this.isPaused = !this.isPaused;
    this.pauseBanner.setVisible(this.isPaused);
    if (this.isPaused) {
      this.physics.pause();
      if (this.enemyFireTimer) this.enemyFireTimer.paused = true;
      if (this.bossTimer) this.bossTimer.paused = true;
    } else {
      this.physics.resume();
      if (this.enemyFireTimer) this.enemyFireTimer.paused = false;
      if (this.bossTimer) this.bossTimer.paused = false;
    }
  }

  update(time, delta) {
    const dt = delta / 1000;

    // Fondo estelar continuo
    for (let i = 0; i < this.stars.length; i += 1) {
      const s = this.stars[i];
      s.y += s.speed * dt;
      if (s.y > GAME_CONFIG.HEIGHT) {
        s.y = 48;
        s.x = Phaser.Math.Between(0, GAME_CONFIG.WIDTH);
      }
    }

    if (this.isPaused || this.isLevelEnding) return;

    this.updateTouchState();

    // Movimiento jugador (Teclado + Táctil)
    const moveLeft = this.cursors.left.isDown || this.keyA.isDown || this.touchState.left;
    const moveRight = this.cursors.right.isDown || this.keyD.isDown || this.touchState.right;

    if (moveLeft && !moveRight) {
      this.player.setVelocityX(-GAME_CONFIG.PLAYER_SPEED);
    } else if (moveRight && !moveLeft) {
      this.player.setVelocityX(GAME_CONFIG.PLAYER_SPEED);
    } else {
      this.player.setVelocityX(0);
    }

    // Disparo (Teclado + Táctil)
    const wantShoot =
      this.keySpace.isDown ||
      this.cursors.up.isDown ||
      this.keyW.isDown ||
      this.touchState.shoot;

    if (wantShoot) {
      this.firePlayerBullet();
    }

    // Movimiento sincronizado de la formación enemiga
    this.updateEnemyFormation(time, dt);
    this.cleanupOffscreenObjects();
  }

  updateEnemyFormation(time, dt) {
    const activeEnemies = this.enemies.getChildren().filter((e) => e.active);
    if (activeEnemies.length === 0) return;

    const remainingRatio = activeEnemies.length / Math.max(1, this.initialEnemyCount);
    const speedMultiplier = 1 + (1 - remainingRatio) * 1.45;
    const currentSpeed = this.levelConfig.enemySpeedX * speedMultiplier;

    let hitEdge = false;
    let reachedBottom = false;

    for (let i = 0; i < activeEnemies.length; i += 1) {
      const enemy = activeEnemies[i];
      enemy.x += this.enemyDirection * currentSpeed * dt;
      if (enemy.x >= GAME_CONFIG.WIDTH - 34 && this.enemyDirection > 0) {
        hitEdge = true;
      } else if (enemy.x <= 34 && this.enemyDirection < 0) {
        hitEdge = true;
      }
      if (enemy.y >= GAME_CONFIG.HEIGHT - 90) {
        reachedBottom = true;
      }
    }

    if (hitEdge) {
      this.enemyDirection *= -1;
      for (let i = 0; i < activeEnemies.length; i += 1) {
        activeEnemies[i].y += this.levelConfig.enemyDropY;
      }
    }

    if (reachedBottom) {
      this.lives = 0;
      this.handlePlayerHit();
      return;
    }

    // Sonido clásico de marcha proporcional a la velocidad
    const stepDelay = Math.max(160, 620 * remainingRatio);
    if (time >= this.nextStepSoundAt) {
      soundManager.playStep(this.stepCounter);
      this.stepCounter += 1;
      this.nextStepSoundAt = time + stepDelay;
    }
  }

  cleanupOffscreenObjects() {
    this.playerBullets.getChildren().forEach((b) => {
      if (b.active && b.y < 40) b.destroy();
    });
    this.enemyBullets.getChildren().forEach((b) => {
      if (b.active && b.y > GAME_CONFIG.HEIGHT + 16) b.destroy();
    });
    this.powerUps.getChildren().forEach((p) => {
      if (p.active && p.y > GAME_CONFIG.HEIGHT + 16) p.destroy();
    });
    this.bossGroup.getChildren().forEach((boss) => {
      if (boss.active && (boss.x < -70 || boss.x > GAME_CONFIG.WIDTH + 70)) {
        boss.destroy();
      }
    });
  }
}
