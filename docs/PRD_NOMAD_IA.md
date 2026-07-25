# Product Requirements Document (PRD): Ecosistema NOMAD-IA

## 1. Introducción y Visión General
Este documento detalla los requerimientos de producto para el ecosistema **NOMAD-IA**, una solución EdTech diseñada para entornos rurales y con brecha digital en Perú. El sistema se compone de una arquitectura offline impulsada por un servidor local (NOMAD), una aplicación móvil gamificada para estudiantes (AprenderIA) que incluye un Tutor Virtual y minijuegos STEAM, y un panel de control avanzado para docentes (EducarIA) basado en telemetría de alerta temprana.

---

## 2. Plataforma 'AprenderIA' (App Estudiante Rural)

### 2.1. Visión General del Producto
**AprenderIA** es una plataforma móvil gamificada orientada a estudiantes con baja conectividad. Brinda educación interactiva y adaptativa mediante Inteligencia Artificial procesada localmente (*On-Device AI*) y sincronización P2P. Su diseño adopta estrictamente el **estilo artístico Mondrian** (retículas geométricas, bordes gruesos oscuros, colores rojo, azul, amarillo, blanco y negro), lo que optimiza el espacio, maximiza el contraste bajo el sol rural y facilita la interacción en celulares de gama baja.

### 2.2. Funcionalidades Principales
1. **Arquitectura 100% Offline (Off-Grid Ready):** Base de datos vectorial ligera (SQLite/IndexedDB local) y sincronización P2P (Wi-Fi Direct) con el docente para reportar notas al volver a tener cobertura.
2. **Gamificación Adaptativa:** Cuadrículas de conocimiento donde los alumnos ganan "Semillas de Conocimiento" (puntos) e insignias. La dificultad se ajusta localmente según el desempeño.
3. **Diseño UI/UX Accesible:** Botones táctiles amplios (bordes de 4-6px), alto contraste y soporte multilingüe (Español, Quechua, Aymara) con lectura de voz (TTS) offline.

### 2.3. Flujo de Pantallas
*   **P1. Onboarding y Perfil:** Selección de idioma, avatar animal y nombre local. Sin necesidad de correos o contraseñas. Bloque superior rojo, bloque central blanco y bloque inferior amarillo.
*   **P2. Dashboard / Mapa de Conocimiento:** Grid asimétrico. Muestra racha, acceso al Tutor IA, árbol de competencias en bloques de colores (Rojo = bloqueado, Azul = en curso, Amarillo = completado).
*   **P3. Lección Gamificada:** Barra de progreso negra que se llena de verde/azul. Enunciado con TTS y área de 4 respuestas en bloques primarios.
*   **P4. Insignias y Sincronización:** Canvas tipo Mondrian donde los rectángulos grises se pintan de color primario al lograr hitos. Botón "Compartir con el Profesor" vía red local.

---

## 3. Tutor Virtual Adaptativo (Integrado en AprenderIA)

### 3.1. Experiencia de Usuario (Mascota Virtual)
Integrado como una **mascota virtual antropomórfica**, aplica el *Andamiaje Educativo (Scaffolding)* sin estresar al alumno.
*   **Presencia No Intrusiva:** Reside en la esquina inferior derecha, fuera del área de interacción principal. Se puede minimizar a un ícono discreto.
*   **Protocolo Anti-Estrés:** Cero contadores regresivos estresantes ni sonidos punitivos. Uso de micro-expresiones positivas (estado de reposo tranquilo, postura pensativa para invitar a la metacognición, celebración serena al acertar).
*   **Descomposición de Pistas:** No da la respuesta directa. Nivel 1: Señala visualmente. Nivel 2: Pista conceptual en diálogo. Nivel 3: Simplifica las opciones.

### 3.2. Ajuste Dinámico de Dificultad (DDA)
El tutor utiliza telemetría oculta (ej. *Hover Time, Latencia de Acción, Tasa de Errores*) para calcular la **Carga Cognitiva Estimada (ECL)**.
*   **Modo Apoyo (ECL Alta):** La mascota interviene empatizando (*"Tomemos un respiro"*), oculta distractores y baja la dificultad.
*   **Modo Flujo (Equilibrado):** Mantiene ritmo y alterna formatos.
*   **Modo Desafío (ECL Baja, respuestas rápidas):** Aumenta complejidad con problemas de pensamiento crítico.

---

## 4. Minijuegos Gamificados (Módulo STEAM)

### 4.1. Juego Tipo 'Duolingo' (Micro-Aprendizaje Progresivo)
Juego formativo de ritmo pausado con lecciones "bite-sized" (3-5 min), progresión en mapa de nodos y ganancia de "Baterías de Intento" (en lugar de vidas punitivas).

**Desafíos STEAM (10-13 años):**
1.  **Ciencias (Biología):** *Drag & Drop de Cadena Trófica.* Arrastrar (Sol ➔ Planta ➔ Conejito ➔ Águila).
2.  **Tecnología (Programación):** *Ordenar Algoritmo.* Secuenciar bloques de código para que el Rover Mars-1 esquive una grieta.
3.  **Física (Materia):** *Selección Visual.* Identificar qué pasa con moléculas de hielo al alcanzar 100°C (animación de partículas separándose).
4.  **Electrónica:** *Completar el Circuito.* Seleccionar el componente que falta (Resistencia) entre una batería y un LED para evitar que se queme.

### 4.2. Juego Tipo 'Dumb Ways to Die' (Pruebas Cognitivas de Reacción)
Minijuegos ultrarrápidos (3-5 segundos) para entrenar velocidad, memoria e inhibición, midiendo frustración pura y latencia. Sistema acelerativo (BPM sube por cada 5 aciertos).

**Micro-Juegos Cómicos:**
1.  **"Química Volátil" (Test tipo Stroop):** 3 tubos de ensayo. El alumno debe tocar el tubo donde el *color de la tinta* coincide con la palabra escrita antes de que explote el laboratorio (3s).
2.  **"Semicolón Mortífero" (Búsqueda Visual):** 4 líneas de código. Pulsar la única que no tiene errores de sintaxis antes de que el bot borre la base de datos (3.5s).
3.  **"Torque de Pánico" (Memoria Corsi):** Una válvula central ilumina una secuencia rápida de 3 a 5 tuercas. El alumno debe repetir el patrón de memoria antes de que la presión de agua lo haga volar (3s).
4.  **"Puente de Vectores" (Cálculo Rápido):** El puente dice `Carga=15`, y muestra `8 + ?`. Seleccionar el número `7` antes de que el rover caiga al vacío marciano (2.5s).

### 4.3. Telemetría Oculta en Juegos
Ambos juegos recopilan silenciosamente el `time_to_first_interaction_ms`, tiempo total, tasa de clics erróneos (Rage Clicking) y solicitud de pistas. Los datos se agrupan en un JSON `telemetry_data` y se envían asíncronamente.

---

## 5. Plataforma 'EducarIA' (Dashboard de Alerta Temprana)

### 5.1. Visión General del Módulo
Un panel de control web para el docente que centraliza el rendimiento mediante Inteligencia Artificial, reduciendo drásticamente la carga administrativa (calificando por el profesor) y emitiendo alertas inmediatas.

### 5.2. Funcionalidades Principales
1.  **Semáforo de Riesgo Predictivo:** Categoriza a los alumnos en 🟢 Verde (Riesgo bajo), 🟡 Amarillo (Riesgo medio - requiere monitoreo), 🔴 Rojo (Riesgo alto - intervención inmediata).
2.  **Calificación Automática (IA Evaluadora):** Corrige basada en la telemetría y reglas del currículo (AD, A, B, C), pre-generando un feedback pedagógico que el docente puede aceptar o editar.
3.  **Analítica en Tiempo Real:** Visualización gráfica del progreso por competencias y detección grupal de vacíos de conocimiento.

### 5.3. Flujo de Pantallas
*   **P1. Vista General del Aula:** Resumen ejecutivo de la clase, distribución de colores del semáforo y tarjetas de "Alertas Prioritarias".
*   **P2. Perfil 360° del Estudiante:** Ficha profunda con el gráfico radar de competencias, línea de tiempo de interacciones y desglose del semáforo.
*   **P3. Centro de Calificación:** Visor de la actividad del estudiante junto a la propuesta de nota y comentario redactado por la IA.
*   **P4. Analítica y Reportes:** Mapas de calor y botón para exportar PDF/Excel oficiales.

---

## 6. Arquitectura Técnica: Servidor Local 'NOMAD'

### 6.1. Visión General de la Infraestructura 100% Offline (Edge Computing)
NOMAD es un orquestador local en hardware de bajo costo (ej. Raspberry Pi o Mini-PC Intel) que genera una red de área local (WLAN) en el aula mediante la emisión de Wi-Fi (`hostapd`).

### 6.2. Portal Cautivo y Redirección DNS
*   Al conectarse a la red "NOMAD_AULA", el servidor DNS (`dnsmasq`) redirige cualquier solicitud web hacia la IP local (DNS Hijacking).
*   El Firewall (`iptables`) intercepta las pruebas de conexión del celular y forza la apertura automática de un Portal Cautivo donde carga la web-app PWA del estudiante y el dashboard.

### 6.3. Orquestación Ligera (Docker)
Para máxima eficiencia en recursos limitados (~150MB de RAM total), NOMAD levanta micro-contenedores:
1.  **Nginx (Reverse Proxy):** Maneja el servidor web y guarda en caché (RAM) las páginas estáticas.
2.  **FastAPI / Node.js (API Backend):** Recibe la telemetría de los celulares y alimenta el Dashboard en tiempo real.
3.  **SQLite (Base de Datos):** Opera en modo ligero (WAL) para soportar escrituras concurrentes sin corrupción ante cortes de luz.

> [!IMPORTANT]
> Todos los recursos multimedia, librerías, IA y juegos están empaquetados en este servidor. No se realiza **ninguna petición** hacia la nube, logrando escalabilidad y equidad real para el entorno rural peruano.
