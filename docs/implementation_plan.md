# Plan de Implementación: Rediseño Integral de AprenderIA 🎮📚🤖

## 🎯 Objetivo
Transformar `AprenderIA` en un portal educativo multi-módulo enfocado en estudiantes de 10 a 13 años. El sistema se dividirá en 3 módulos principales desde un Hub de bienvenida, manteniendo la estética **Futurista Glassmorphism**.

---

## 🏛️ Arquitectura de Módulos Propuesta

```
                        [ HUB APRENDER-IA ]
                                |
      +-------------------------+-------------------------+
      |                         |                         |
[ 1. MINIJUEGOS & LIBROS ]  [ 2. YACHAY (DUOLINGO) ]  [ 3. CHAT CON CHANCAY ]
      |                         |                         |
  - Carrusel de Libros      - Selector de Cursos      - Chat estilo ChatGPT
  - Grilla tipo Friv         - Ruta de Islas (Camino)  - Mascota animada
  - Minijuego Circuito      - Nodo 1: Circuito        - Simulación Audio/Texto
```

---

## 📄 Detalle de Módulos

### 1. Hub de Entrada (`aprender-ia/index.html`)
- Presenta las **3 opciones principales** en tarjetas flotantes tipo cristal con animación hover:
  1. **🎮 Minijuegos y Biblioteca Digital:** "Aprende leyendo y jugando a tu ritmo".
  2. **🗺️ YACHAY (Ruta STEAM):** "Completa tu mapa de aprendizaje tipo Duolingo".
  3. **🐶 Hablar con Chancay:** "Tu tutor IA personal para resolver dudas".

### 2. Módulo 1: Minijuegos & Biblioteca Digital (`aprender-ia/biblioteca.html`)
- **Pestaña 1: Biblioteca Tradicional Digitalizada:**
  - Carrusel interactivo 3D/horizontal de libros escolares (Ciencias, Mates, Robótica).
  - Al hacer clic en un libro, se abre una vista previa tipo visor de lectura.
- **Pestaña 2: Aprender Jugando (Portal Friv):**
  - Grilla de tarjetas de minijuegos con ilustraciones lúdicas (Física, Química, Lógica, Programación).
  - La tarjeta "Circuito Eléctrico" es jugable y dirige al minijuego interactivo.

### 3. Módulo 2: YACHAY - Ruta STEAM Tipo Duolingo (`aprender-ia/yachay.html`)
- **Barra Superior:** Selección de curso (Matemáticas, Ciencias, Tecnología) + contador de semillas/rachas 🔥.
- **Ruta Visual de Aprendizaje:**
  - Camino serpenteante trazado visualmente con estaciones o "Islas" flotantes.
  - Isla 1 (Desbloqueada/Activa): "Física y Circuitos".
  - Islas 2, 3 y 4 (Bloqueadas con candados ilustrativos): "Energías Renovables", "Lógica de Programación", "Robótica Básica".
  - Al hacer clic en Isla 1, inicia el desafío.

### 4. Módulo 3: Chat Interactivo con Chancay (`aprender-ia/chancay.html`)
- **Interfaz ChatGPT Amigable:**
  - Avatar grande de Chancay con estados visuales (Feliz, Pensativo, Explicando).
  - Burbujas de diálogo dinámicas.
  - Entrada dual: Cuadro de texto + **Boton de Micrófono (Grabación simulada)**.
  - Respuestas enriquecidas: Chancay responde con texto, gráficos ilustrativos y voz sintetizada offline (`window.speechSynthesis`).

---

## ⚖️ Análisis Técnico: Pros, Contras y Sugerencias

### ✅ PROS (Impacto en la Hackathon):
1. **Impresión "WOW" Inmediata:** Mostrar 3 productos integrados (Biblioteca, Duolingo y Chatbot IA) hace que la propuesta parezca de nivel producción y no un proyecto escolar básico.
2. **Cobertura de Diferentes Estilos de Aprendizaje:** Atiende al alumno visual (Libros), kinestésico (Minijuegos), estructurado (YACHAY) y conversacional (Chancay).
3. **Grabación de Demos Variadas:** Tendrás 4 pantallas espectaculares para grabar el video final de presentación.

### ⚠️ CONTRAS Y RIESGOS:
1. **Scope Creep (Exceso de alcance):** Desarrollar lógica completa para los 3 módulos tomaría semanas. 
2. **Rendimiento:** Mantener 3 maquetas pesadas puede ralentizar la carga si no estructuramos bien los archivos HTML.

### 💡 MIS SUGERENCIAS Y SOLUCIONES DE ARQUITECTURA:
1. **Reutilización del Minijuego Existente:** No crearemos juegos nuevos desde cero. El minijuego de circuitos ya desarrollado se vinculará como el primer nodo de YACHAY y como una de las tarjetas del Portal de Juegos.
2. **Síntesis de Voz Offline:** Utilizar la Web Speech API nativa del navegador para que Chancay **hable con voz real** sin necesitar conexión a internet ni librerías externas.
3. **Estructura Modular:** Crear archivos HTML separados para cada módulo (`index.html`, `yachay.html`, `biblioteca.html`, `chancay.html`) compartiendo la misma hoja de estilos `mondrian-new.css`.

---

## 🛠️ Plan de Verificación
- **Prueba de Navegación E2E:** Verificar el flujo continuo desde el Hub -> Módulos -> Minijuego -> Envío de Telemetría al Dashboard de EducarIA.
- **Verificación Responsiva Mobile:** Asegurar que las 3 maquetas mantengan la simulación móvil fluida en pantallas pequeñas.
