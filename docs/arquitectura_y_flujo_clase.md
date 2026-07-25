# Arquitectura y Flujo de Clase: NOMAD-IA 🏫⚡

Este documento explica cómo funciona el ecosistema offline de NOMAD-IA en el aula, cómo los alumnos acceden a los juegos y cómo funciona la magia detrás de la telemetría y nuestra IA local (Chancay).

---

## 1. El Servidor Local (El "Corazón" del Aula)
En zonas sin internet, **NOMAD-IA no depende de la nube**. Funciona gracias a un **Servidor Edge** local. 

- **¿Qué es?** Físicamente puede ser la propia laptop del docente o una mini-computadora de bajo costo (como una Raspberry Pi) equipada con paneles solares si no hay electricidad constante.
- **¿Cómo conecta a todos?** Este servidor emite su propia señal Wi-Fi (una Intranet). Esta señal *no tiene salida a internet*, pero sirve como puente para que todos los dispositivos del salón se conecten al sistema.

---

## 2. Acceso de los Estudiantes (Tablets vs. Computadora Central)
Una de las grandes ventajas de NOMAD-IA es su **accesibilidad universal** mediante navegadores web.

### Si el colegio tiene Tablets/Laptops:
1. El docente enciende el Servidor NOMAD.
2. Los alumnos conectan sus tablets a la red Wi-Fi `Red-Educativa-NOMAD`.
3. Abren el navegador (Chrome, Firefox) y escriben `http://aprender.ia`.
4. ¡Listo! El juego (AprenderIA) carga instantáneamente desde el servidor local a las pantallas de los estudiantes.

### Si NO hay Tablets (Uso de la Computadora Central):
Si los chicos no tienen dispositivos personales, el sistema funciona como un centro de actividades rotativo:
- La computadora central se vuelve la "estación de evaluación".
- El docente puede llamar a los estudiantes de 2 en 2 para resolver un "reto STEAM" en la computadora.
- El estudiante interactúa con el juego en la pantalla principal mientras el sistema evalúa sus habilidades cognitivas sin estrés.

---

## 3. ¿Cómo interactúan con Chancay (Nuestra Mascota IA)? 🐶
Chancay es un Tutor de Inteligencia Artificial que guía al estudiante cuando se queda atascado. 

- **¿Dónde vive Chancay?** Chancay no necesita internet. Es impulsado por un modelo de lenguaje pequeño y eficiente (como *Phi-3* u *Ollama*) que corre **directamente dentro del servidor local**.
- **¿Cómo se usa?** 
  - Desde sus tablets, los estudiantes pueden hacer clic en el botón de Chancay. 
  - Su tablet envía un mensaje por la red Wi-Fi local hacia el servidor del profesor.
  - El servidor procesa la pregunta usando IA y devuelve una pista amigable (no la respuesta) directamente a la pantalla del alumno en milisegundos.
- **Ventaja:** Todos los estudiantes pueden consultar a Chancay desde su propio asiento de manera simultánea.

---

## 4. Telemetría Oculta y en Tiempo Real 📡
Mientras los estudiantes juegan, el sistema recopila **Telemetría Oculta**. Esto significa que evalúa el pensamiento del alumno *por cómo juega*, no solo por si gana o pierde.

### Ejemplo de Flujo de Telemetría:
1. **El Reto:** Mateo (estudiante) está jugando y tiene que conectar cables virtuales para encender un foco.
2. **El Error:** Conecta mal el cable y se queda mirando la pantalla sin hacer clic durante 45 segundos (Duda/Frustración).
3. **La Captura:** La tablet detecta que Mateo falló en el intento #1 y se ha detenido por 45s.
4. **Envío de Datos (POST):** La tablet envía un paquete de datos oculto al servidor local (`{ alumno: "Mateo", error: "Circuito B", tiempo_duda: "45s" }`).
5. **El Semáforo de Alerta:** En el panel de **EducarIA**, la fila de Mateo se ilumina instantáneamente en **Amarillo** (Riesgo). 
6. **Recomendación al Docente:** El dashboard del profesor sugiere de inmediato: *"Mateo está atascado en lógica de circuitos. Sugerimos intervenir y explicar conductividad."*

> [!TIP]
> **Sin Calificaciones Estresantes:** El alumno nunca siente que está dando un examen. Simplemente juega, pero el docente obtiene un perfil cognitivo mucho más profundo y preciso.

---

## 5. Descargas Locales e Instalación Offline (PWA) 📲
Para garantizar que el aprendizaje continúe fuera del aula, NOMAD-IA no requiere la instalación de aplicaciones tradicionales desde tiendas en línea.

### Descarga de Recursos y Manuales:
- La Mega Laptop central funciona como un servidor de archivos en la intranet.
- Los alumnos o el docente pueden descargar PDFs, guías de mantenimiento, videos educativos y planes curriculares directamente desde el portal web en milisegundos gracias al ancho de banda del Wi-Fi local.

### Instalación de los Juegos (Progressive Web Apps - PWA):
- Al acceder al juego (`AprenderIA`) mediante el Wi-Fi local, el navegador del dispositivo detecta que es una PWA y ofrece la opción "Instalar en la pantalla de inicio".
- Una vez aceptado, **todo el código, lógica del juego e interfaces gráficas se descargan al almacenamiento interno de la tablet/celular**.
- El estudiante puede llevarse la tablet a su casa y **jugar completamente sin conexión**. Los datos de su sesión y telemetría se guardan de manera segura en el almacenamiento del navegador (`LocalStorage` / `IndexedDB`).
- Al día siguiente, en cuanto la tablet se acerca al salón y detecta la red de la Mega Laptop, **sincroniza en background todos los datos acumulados** con el servidor local del docente.
