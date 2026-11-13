import { GAME_CONFIG } from '../config/constants.js';

const BAR_COUNT = 10;
const BAR_COLOR = 0x05070f;
const EDGE_COLOR = 0xe6192e;

/**
 * Cierra la escena con persianas horizontales alternadas y luego inicia la escena destino.
 */
export function transitionTo(scene, key, data = {}, { duration = 300 } = {}) {
  if (scene.__transitioning) return false;
  scene.__transitioning = true;

  const W = GAME_CONFIG.WIDTH;
  const H = GAME_CONFIG.HEIGHT;
  const barH = Math.ceil(H / BAR_COUNT);

  for (let i = 0; i < BAR_COUNT; i += 1) {
    const fromLeft = i % 2 === 0;
    const bar = scene.add
      .rectangle(fromLeft ? 0 : W, i * barH, W, barH + 1, BAR_COLOR)
      .setOrigin(fromLeft ? 0 : 1, 0)
      .setDepth(5000);
    const edge = scene.add
      .rectangle(fromLeft ? 0 : W, i * barH, 4, barH + 1, EDGE_COLOR)
      .setOrigin(fromLeft ? 0 : 1, 0)
      .setDepth(5001);
    bar.scaleX = 0;

    scene.tweens.add({
      targets: bar,
      scaleX: 1,
      duration,
      delay: i * 32,
      ease: 'Cubic.easeIn',
      onUpdate: () => {
        edge.x = fromLeft ? bar.displayWidth - 4 : W - bar.displayWidth + 4;
      },
      onComplete: () => {
        edge.destroy();
        if (i === BAR_COUNT - 1) {
          scene.time.delayedCall(60, () => scene.scene.start(key, data));
        }
      }
    });
  }
  return true;
}

/**
 * Abre la escena retirando las persianas (llamar al inicio de create()).
 */
export function revealScene(scene, { duration = 340 } = {}) {
  scene.__transitioning = false;
  const W = GAME_CONFIG.WIDTH;
  const H = GAME_CONFIG.HEIGHT;
  const barH = Math.ceil(H / BAR_COUNT);

  for (let i = 0; i < BAR_COUNT; i += 1) {
    const toLeft = i % 2 === 0;
    const bar = scene.add
      .rectangle(toLeft ? 0 : W, i * barH, W, barH + 1, BAR_COLOR)
      .setOrigin(toLeft ? 0 : 1, 0)
      .setDepth(5000);
    scene.tweens.add({
      targets: bar,
      scaleX: 0,
      duration,
      delay: 80 + i * 32,
      ease: 'Cubic.easeOut',
      onComplete: () => bar.destroy()
    });
  }
}
