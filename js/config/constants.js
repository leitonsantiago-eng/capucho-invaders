export const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  PLAYER_SPEED: 370,
  BULLET_SPEED: 560,
  ENEMY_BULLET_SPEED: 260,
  STORAGE_KEY: 'capucho_invaders_highscore_v1',
  INITIAL_LIVES: 3
};

export const COLORS = {
  BG: '#070913',
  UNIVALLE_RED: '#e6192e',
  STAR_WARS_YELLOW: '#ffd700',
  CYAN: '#00e5ff',
  NEON_GREEN: '#39ff14',
  WHITE: '#f4f6fc',
  MUTED: '#94a3b8'
};

export const TEAM_MEMBERS = ['Santiago', 'Luis', 'David', 'Garcés', 'Alan'];

export const INTRO_CRAWL = {
  PRE_TEXT: 'Hace poco tiempo, en un campus muy, muy cercano...\n\nUNIVERSIDAD DEL VALLE - SEDE MELÉNDEZ',
  EPISODE: 'EPISODIO III-B',
  TITLE: 'CAPUCHO INVADERS:\nRESISTENCIA EN MELÉNDEZ',
  PARAGRAPHS: [
    'Son tiempos turbulentos en el semestre académico. El temido Filtro de Cálculo y una rebelión inesperada en el campus amenazan la supervivencia estudiantil.',
    'Desde la Escuela de Ingeniería Eléctrica y Electrónica, un escuadrón ágil ha jurado defender la Facultad utilizando Metodologías de Desarrollo de Software.',
    'Liderados por:\n\nSANTIAGO  •  LUIS  •  DAVID  •  GARCÉS  •  ALAN\n\nla resistencia ha construido el interceptor HTML5-Phaser para restaurar el equilibrio en Meléndez...',
    '¡Prepara tus flechas, tu barra espaciadora o tus controles táctiles! El futuro del semestre está en tus manos.'
  ]
};

export const LEVELS = [
  {
    level: 1,
    title: 'Nivel 1: Pasando el filtro de Cálculo',
    subtitle: 'Edificio de Ciencias • Calle de los Estudiantes',
    enemyTexture: 'enemy_calc',
    enemyName: 'Integrales Triples & Parciales Sorpresa',
    storyLines: [
      '07:00 AM — Las puertas del Edificio de Ciencias se cierran.',
      'Oleadas de integrales impropias, límites indeterminados y parciales sorpresa descienden sobre la Calle de los Estudiantes.',
      '¡Esquiva los teoremas enemigos, usa los búnkeres de la Biblioteca y supera el primer filtro del semestre!'
    ],
    rows: 4,
    cols: 8,
    enemySpeedX: 70,
    enemyDropY: 22,
    fireRateMs: 1350,
    enemyBulletSpeed: 235,
    pointsPerEnemy: 100,
    spawnBoss: false
  },
  {
    level: 2,
    title: 'Nivel 2: La rebelión de las Iguanas',
    subtitle: 'Bosque de la Biblioteca Mario Carvajal',
    enemyTexture: 'enemy_iguana',
    enemyName: 'Escuadrón de Iguanas Tácticas de Meléndez',
    storyLines: [
      '¡Alerta en los guaduales! Tras sobrevivir a Cálculo, algo extraño ocurre cerca de la Biblioteca Mario Carvajal.',
      'Las iguanas del campus han formado una alianza con los guatines y bombardean el sector con mangos maduros desde las copas.',
      '¡Mantente en movimiento, recoge tintos de Meléndez para disparo doble y contiene la rebelión!'
    ],
    rows: 5,
    cols: 9,
    enemySpeedX: 98,
    enemyDropY: 24,
    fireRateMs: 1020,
    enemyBulletSpeed: 280,
    pointsPerEnemy: 150,
    spawnBoss: false
  },
  {
    level: 3,
    title: 'Nivel 3: El Asedio de Registro Académico',
    subtitle: 'Plazoleta Central • Batalla Final de Despliegue',
    enemyTexture: 'enemy_admin',
    enemyName: 'Drones de Caída de Sistema & Acta Final',
    storyLines: [
      'Último Sprint en la Plazoleta Central. El servidor de matrículas colapsó y los bugs de fin de semestre atacan en formación cerrada.',
      'Además, la Nave Nodriza "Cancelar Materia" sobrevuela la zona con escudos reforzados.',
      '¡Santiago, Luis, David, Garcés y Alan confían en tu puntería para lograr el Despliegue Continuo!'
    ],
    rows: 5,
    cols: 10,
    enemySpeedX: 122,
    enemyDropY: 26,
    fireRateMs: 780,
    enemyBulletSpeed: 320,
    pointsPerEnemy: 200,
    spawnBoss: true
  }
];
