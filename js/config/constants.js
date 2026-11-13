export const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  PLAYER_SPEED: 380,
  BULLET_SPEED: 580,
  STORAGE_KEY: 'capucho_invaders_highscore_v1',
  INITIAL_LIVES: 3,
  MAX_LIVES: 5,
  // Coloca tu imagen en esta ruta para reemplazar el placeholder del jefe final.
  MURILLO_IMAGE: 'assets/murillo.png',
  PAGES_URL: 'https://leitonsantiago-eng.github.io/capucho-invaders/'
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
  PRE_TEXT: 'Hace poco tiempo, en un campus muy, muy cercano....',
  EPISODE: 'EPISODIO III-B',
  SUBTITLE: 'RESISTENCIA EN MELÉNDEZ',
  PARAGRAPHS: [
    'Son tiempos turbulentos en la sede Meléndez de la Universidad del Valle. El temido Filtro de Cálculo ha diezmado las filas estudiantiles, las iguanas del campus se han rebelado y enjambres de zancudos emergen de El Lago.',
    'Detrás de todo, una figura legendaria aguarda en el Auditorio Principal: el implacable PROFESOR MURILLO, guardián de los Proyectos Finales, cuya nota nadie ha logrado superar....',
    'Desde la Escuela de Ingeniería Eléctrica y Electrónica, un escuadrón ágil formado por SANTIAGO, LUIS, DAVID, GARCÉS y ALAN ha construido en secreto un interceptor HTML5 impulsado por Phaser 3.',
    'Armados con metodologías ágiles, tintos de Meléndez y mangos maduros, deben atravesar cinco sectores del campus para salvar el semestre y restaurar la paz en la universidad....'
  ]
};

/**
 * Tipos de proyectil enemigo.
 * behavior: straight | spin | wave | aimed
 */
export const PROJECTILES = {
  parcial: { texture: 'proj_parcial', speedMul: 1.0, behavior: 'straight', label: 'Parcial con nota roja' },
  mango: { texture: 'proj_mango', speedMul: 0.9, behavior: 'spin', label: 'Mango lanzado' },
  picadura: { texture: 'proj_picadura', speedMul: 1.25, behavior: 'wave', label: 'Picadura de zancudo' },
  error: { texture: 'proj_error', speedMul: 1.1, behavior: 'aimed', label: 'Error 503 de matrícula' },
  proyecto: {
    texture: 'proj_proyecto',
    speedMul: 1.0,
    behavior: 'aimed',
    label: 'Proyecto Final',
    massive: true,
    destructible: true,
    hp: 4,
    bodyScale: 0.8
  }
};

export const BOSS_TAUNTS = [
  '¡La entrega era ayer a las 11:59 PM!',
  '¡Esto vale el 40% de la nota!',
  '¡Sin documentación no hay nota!',
  '¿Y las pruebas unitarias, jóvenes?',
  '¡Ese commit no tiene mensaje!',
  '¡Nos vemos en el habilitable!',
  '¡Eso no cumple el formato IEEE!'
];

export const LEVELS = [
  {
    level: 1,
    type: 'invasion',
    theme: 'calculo',
    title: 'Nivel 1: Pasando el filtro de Cálculo',
    subtitle: 'Edificio de Ciencias • Calle de los Estudiantes',
    previewTexture: 'enemy_calc',
    threat: 'Integrales triples que lanzan PARCIALES con notas rojas',
    storyLines: [
      '07:00 AM — Las puertas del Edificio de Ciencias se cierran.',
      'Oleadas de integrales impropias descienden sobre la Calle de los Estudiantes disparando parciales calificados en rojo.',
      '¡Esquiva los 1.5, protégete en los búnkeres y supera el primer filtro del semestre!'
    ],
    enemyTypes: [{ texture: 'enemy_calc', projectile: 'parcial', points: 100 }],
    rowTypes: [0, 0, 0, 0],
    cols: 8,
    enemySpeedX: 70,
    enemyDropY: 20,
    fireRateMs: 1250,
    enemyBulletSpeed: 220
  },
  {
    level: 2,
    type: 'invasion',
    theme: 'iguanas',
    title: 'Nivel 2: La rebelión de las Iguanas',
    subtitle: 'Bosque de la Biblioteca Mario Carvajal',
    previewTexture: 'enemy_iguana',
    threat: 'Iguanas tácticas + lluvia de MANGOS desde los árboles',
    storyLines: [
      '¡Alerta en los guaduales! Tras sobrevivir a Cálculo, las iguanas de la Biblioteca Mario Carvajal se han organizado.',
      'Lanzan mangos desde las copas: los VERDES te golpean, pero los MADUROS te devuelven una vida.',
      '¡No dispares a los mangos maduros y contiene la rebelión!'
    ],
    enemyTypes: [{ texture: 'enemy_iguana', projectile: 'mango', points: 150 }],
    rowTypes: [0, 0, 0, 0, 0],
    cols: 9,
    enemySpeedX: 92,
    enemyDropY: 22,
    fireRateMs: 1050,
    enemyBulletSpeed: 250,
    mangos: { rateMs: 2300, ripeChance: 0.3 }
  },
  {
    level: 3,
    type: 'invasion',
    theme: 'lago',
    title: 'Nivel 3: El enjambre de El Lago',
    subtitle: 'El Lago de Meléndez • Atardecer húmedo',
    previewTexture: 'enemy_zancudo',
    threat: 'Zancudos kamikaze con picaduras en zigzag',
    storyLines: [
      'Cae la tarde sobre El Lago. Del agua estancada surge un zumbido ensordecedor...',
      'Los zancudos atacan en enjambre: algunos rompen la formación y se lanzan en picada contra tu nave.',
      'Sus picaduras zigzaguean. ¡Muévete sin parar y no dejes que te contagien de pereza!'
    ],
    enemyTypes: [
      { texture: 'enemy_zancudo', projectile: 'picadura', points: 130 },
      { texture: 'enemy_iguana', projectile: 'mango', points: 160 }
    ],
    rowTypes: [0, 0, 1, 0, 0],
    cols: 9,
    enemySpeedX: 105,
    enemyDropY: 22,
    fireRateMs: 950,
    enemyBulletSpeed: 260,
    diveEveryMs: 2600,
    mangos: { rateMs: 3800, ripeChance: 0.35 }
  },
  {
    level: 4,
    type: 'invasion',
    theme: 'registro',
    title: 'Nivel 4: El Asedio de Registro Académico',
    subtitle: 'Plazoleta Central • Caída del sistema de matrículas',
    previewTexture: 'enemy_admin',
    threat: 'Drones burocráticos con errores 503 teledirigidos',
    storyLines: [
      'El servidor de matrículas colapsó. Drones burocráticos disparan errores 503 directamente hacia ti.',
      'La nave "Acta de Cancelación" sobrevuela la plazoleta: derríbala para obtener 500 puntos.',
      'Más allá de la plazoleta se escucha una voz grave... "¿Y el Proyecto Final, jóvenes?"'
    ],
    enemyTypes: [
      { texture: 'enemy_admin', projectile: 'error', points: 200 },
      { texture: 'enemy_calc', projectile: 'parcial', points: 150 }
    ],
    rowTypes: [0, 1, 0, 1, 0],
    cols: 10,
    enemySpeedX: 118,
    enemyDropY: 24,
    fireRateMs: 820,
    enemyBulletSpeed: 290,
    spawnUfo: true
  },
  {
    level: 5,
    type: 'boss',
    theme: 'murillo',
    title: 'Nivel Final: El Juicio del Profesor Murillo',
    subtitle: 'Auditorio Principal • Semana de Proyectos Finales',
    previewTexture: 'MURILLO',
    threat: 'PROFESOR MURILLO — dispara PROYECTOS FINALES masivos',
    storyLines: [
      'Has llegado al Auditorio Principal. Las luces parpadean y el tablero se llena de rúbricas imposibles.',
      'El PROFESOR MURILLO se mueve rápido, resiste muchísimos impactos y lanza PROYECTOS FINALES: destrúyelos con 4 disparos o esquívalos.',
      'Santiago, Luis, David, Garcés y Alan confían en ti. ¡Es hora de sustentar!'
    ],
    refillLivesTo: 3,
    boss: { hp: 90 },
    mangos: { rateMs: 4200, ripeChance: 0.55 }
  }
];
