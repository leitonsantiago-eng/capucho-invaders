# Capucho Invaders: Resistencia en Meléndez

Videojuego arcade estilo *Space Invaders* desarrollado con **HTML5, CSS3, JavaScript (ES Modules) y Phaser 3** para la asignatura **710011C Metodologías de Desarrollo de Software** (Escuela de Ingeniería Eléctrica y Electrónica — Universidad del Valle).

## Jugar Online (GitHub Pages)
- **URL Pública:** https://leitonsantiago-eng.github.io/capucho-invaders/

## Equipo Scrum
- **Santiago** — Desarrollo Principal & Integración Git/GitHub
- **Luis** — Product Owner / Gestión en Jira (Épica e Historias de Usuario)
- **David** — Arquitecto / Documentación Técnica en Confluence
- **Garcés** — QA / Pruebas Funcionales de Caja Negra y Reporte de Bugs
- **Alan** — Diseño Visual, Narrativa y Sustentación (Canva)

## Características Principales
- **Cinemática Inicial tipo Star Wars:** Crawl amarillo en perspectiva espacial mencionando a todo el equipo (**Santiago, Luis, David, Garcés y Alan**).
- **Campaña de 3 Niveles con Pantallas Narrativas Intermedias:**
  1. *Nivel 1: Pasando el filtro de Cálculo* (Edificio de Ciencias)
  2. *Nivel 2: La rebelión de las Iguanas* (Bosque de la Biblioteca Mario Carvajal)
  3. *Nivel 3: El Asedio de Registro Académico* (Plazoleta Central + Nave Nodriza)
- **100% Responsivo y Multitouch:** Escala fluida con `Phaser.Scale.FIT` para PC, tablet y celular. Controles de teclado (`←`/`→` o `A`/`D` + `Espacio`) y botones táctiles transparentes en pantalla (`◄`, `►`, `FUEGO`).
- **Audio Retro Procedural:** Efectos de sonido y fanfarria sintetizados en tiempo real con **Web Audio API** (cero dependencias de archivos de audio externos).
- **Modo Portable Offline (USB):** Incluye una copia local de `phaser.min.js` y los scripts `jugar_local.bat` / `jugar_local.py` para jugar sin conexión a internet.

## Estructura del Proyecto
```text
capucho-invaders/
├── index.html
├── css/styles.css
├── js/
│   ├── lib/phaser.min.js
│   ├── config/constants.js
│   ├── utils/SoundManager.js
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── IntroScene.js
│   │   ├── MenuScene.js
│   │   ├── StoryScene.js
│   │   ├── GameScene.js
│   │   └── GameOverScene.js
│   └── main.js
├── docs/ENTREGABLES_AGILES_MDS.md
├── jugar_local.py
└── jugar_local.bat
```

## Ejecución Local sin Internet (USB)
1. Copia la carpeta completa `capucho-invaders/` en tu memoria USB.
2. En Windows, haz doble clic en `jugar_local.bat` (o ejecuta `python jugar_local.py` en la terminal).
3. El script levantará un servidor HTTP local en `http://127.0.0.1:8000/index.html` y abrirá tu navegador automáticamente.
