# 📋 INSTRUCCIONES PASO A PASO PARA EL EQUIPO

Enlace oficial del juego: https://leitonsantiago-eng.github.io/capucho-invaders/
**Nota de Exposición:** Santiago y Alan exponen presencial. David y Garcés exponen ONLINE (virtual).

---

### 🛠️ PARA LUIS (JIRA - GESTIÓN DE TAREAS)
**Paso 1:** Entra a Jira Software y dale al botón azul "Crear Proyecto". Selecciona la plantilla "Scrum".
**Paso 2:** En la barra izquierda, haz clic en "Backlog".
**Paso 3:** Busca el icono del rayo morado y crea una **ÉPICA**.
*   **Nombre de la Épica:** `Desarrollo de Capucho Invaders MVP`.
**Paso 4:** Debajo de la Épica, dale a "Crear incidencia" para añadir 3 Historias de Usuario.
*   **Historia 1:**
    *   *Nombre de la tarea:* `Implementar Movimiento y Disparo Multiplataforma`
    *   *Descripción:* `Como jugador, quiero controles táctiles y de teclado para jugar en PC y celular.`
    *   *Criterios de Aceptación:* `El personaje se mueve con flechas. Funciona en móviles con toque.`
*   **Historia 2:**
    *   *Nombre de la tarea:* `Implementar Jefe Final (Rector Murillo) y Tutorial (Durango)`
    *   *Descripción:* `Como jugador, quiero un tutorial inicial y un jefe final con animaciones de enojo y sonido de golpe.`
    *   *Criterios de Aceptación:* `Durango mueve las manos. Murillo se enoja al 50% de vida y suena un golpe.`
*   **Historia 3:**
    *   *Nombre de la tarea:* `Despliegue Automático en GitHub Pages`
    *   *Descripción:* `Como usuario, quiero acceder al juego mediante un enlace online público.`
    *   *Criterios de Aceptación:* `El link de GitHub carga sin error 404.`
**Paso 5:** Mueve las 3 historias a la columna "En curso" o inicia el Sprint. Tómale un pantallazo y mándaselo a Alan por WhatsApp.

---

### 📝 PARA DAVID (CONFLUENCE - DOCUMENTACIÓN)
*(Atención: Tú expones ONLINE, asegúrate de tener micrófono listo para leer tu parte).*
**Paso 1:** Entra a Confluence y dale a "Crear página".
**Paso 2:** Ponle de Título a la página: `Arquitectura de Capucho Invaders`.
**Paso 3:** Copia y pega exactamente este texto en el cuerpo de la página:
> **1. Arquitectura Técnica:** El proyecto usa HTML5, CSS y JavaScript (ES6). El motor gráfico es Phaser 3, que permite físicas Arcade y 60 FPS.
> **2. Despliegue:** Usamos GitHub Pages para tener el juego en la nube sin costo y actualización automática (CI/CD).
> **3. Recursos (Assets):** El audio (efectos de daño de Murillo) se genera matemáticamente con Web Audio API. Las imágenes se procesaron en PNG transparente.
**Paso 4:** Dale al botón "Publicar" o guarda como PDF y envíalo al grupo.
**Tu guion para la clase virtual:** *"Buenos días, desde la parte de arquitectura definimos el uso de Phaser 3 y HTML5 para garantizar compatibilidad, y GitHub Pages para el despliegue automático..."*

---

### 🐞 PARA GARCÉS (QA - PRUEBAS)
*(Atención: Tú expones ONLINE. Solo debes hablar de los errores que encontraste).*
**Paso 1:** Abre Microsoft Excel o Google Sheets.
**Paso 2:** Crea 3 columnas: `Nombre de la Prueba`, `Pasos`, `Resultado`.
**Paso 3:** Llena 3 filas con esta información exacta:
*   *Prueba 1:* `Verificar Tutorial` | `Iniciar juego y leer a Durango` | `Éxito. Durango anima las manos.`
*   *Prueba 2:* `Sonido Jefe Final` | `Disparar al Rector Murillo` | `Éxito. Reproduce sonido de Ouch.`
*   *Prueba 3:* `Animación Enojo` | `Bajar vida de Murillo al 50%` | `Éxito. Aparecen cejas rojas y aumenta velocidad.`
**Paso 4:** Exporta la tabla como PDF. Tómale captura al juego en tu celular y envíale todo a Alan.
**Tu guion para la clase virtual:** *"Buenos días, en la fase de QA realizamos pruebas de caja negra, validando que el tutorial de Durango y las mecánicas de audio y físicas del jefe final funcionen sin bugs en dispositivos móviles."*

---

### 🎨 PARA ALAN Y SANTIAGO (PRESENTACIÓN PRESENCIAL)
**Paso 1:** Alan, abre Canva y crea una presentación.
**Paso 2:** Crea estas 5 diapositivas tal cual:
*   **Diapositiva 1 (Intro):** "Capucho Invaders" - Nombres del equipo. (Hablan Alan y Santiago).
*   **Diapositiva 2 (Metodología Ágil):** Pega aquí el pantallazo que te mande Luis del Jira. (Habla Alan).
*   **Diapositiva 3 (Arquitectura Técnica):** Pega los textos de Confluence. (En este punto, le dan la palabra a David por videollamada).
*   **Diapositiva 4 (Control de Calidad):** Pega la tabla de Excel. (En este punto, le dan la palabra a Garcés por videollamada).
*   **Diapositiva 5 (Demostración en vivo):** Deja la diapositiva casi vacía. Santiago proyectará el juego directamente desde el navegador y lo jugará en vivo frente al profesor.
