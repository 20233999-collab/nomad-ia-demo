# Plan de Implementación: Prototipo Funcional y Maquetas Visuales

Este documento traza la ruta técnica para ejecutar tu visión adaptada para la Hackathon. Se ha separado claramente la **construcción de la ilusión (maquetas)** de la **funcionalidad real (MVP del Minijuego)**.

---

## 1. Alcance de la Ejecución (Scope)

Para garantizar un impacto masivo frente al jurado en la Categoría A (Opción 1), nos concentraremos en desarrollar dos entregables principales:

1.  **Las Maquetas Visuales (Frontend Ilusorio):** Diseños de alta fidelidad estáticos que muestren cómo se vería el sistema NOMAD completo (El Portal Cautivo Wi-Fi, el Dashboard de Alertas Tempranas del docente y la integración de Khan Academy/Kiwix). 
2.  **El MVP Funcional (El Minijuego Evaluador):** Una aplicación web interactiva y jugable. Será la *única* pieza de software funcional, diseñada para demostrar cómo un juego aparentemente inofensivo captura telemetría cognitiva en tiempo real.

---

## 2. Propuestas de Desarrollo: El MVP Funcional

El "Caballo de Troya" de la evaluación. Será un minijuego jugable desde el navegador (simulando que corre en un celular conectado al Wi-Fi offline).

### Arquitectura Técnica del Minijuego
*   **Motor Gráfico:** `HTML5 + Vanilla JavaScript` o `Phaser.io`.
    *   *Justificación:* Extremadamente ligero, no requiere instalación, ideal para demostrar viabilidad en hardware precario y zonas rurales.
*   **Dinámica del Juego:** Un puzzle isométrico o de plataformas 2D (ej. reparar una tubería de agua uniendo piezas lógicas).
*   **El Núcleo (Telemetría en Tiempo Real):** 
    *   Mientras el usuario juega, un script en segundo plano estará midiendo métricas ocultas:
        *   **Latencia Cognitiva:** Tiempo exacto entre que aparece el problema y se da el primer clic.
        *   **Rage Clicks:** Cantidad de veces que el usuario hace clic repetidamente en la pantalla por frustración.
        *   **Árbol Lógico:** Qué opciones descartó antes de llegar a la solución.
    *   El juego terminará arrojando un "Diagnóstico de Rendimiento" que será lo que supuestamente vería el profesor en su Dashboard.

---

## 3. Propuestas de Desarrollo: Maquetas Visuales (Mockups)

El resto de la plataforma será visual, enfocado en un diseño moderno, intuitivo y estéticamente premium.

### Vistas a Maquetar (HTML/CSS Estático)
1.  **Portal Cautivo (Landing Page Offline):** La pantalla que verían los alumnos al conectarse al Wi-Fi del servidor NOMAD. Debe tener íconos grandes hacia "Juegos", "Khan Academy Offline" y "Biblioteca WikiMed".
2.  **Dashboard del Docente (Sistema de Alerta Temprana):**
    *   Una vista limpia con un diseño de "Semáforo" (Alumnos en riesgo rojo, en progreso amarillo, dominando verde).
    *   Gráficos circulares que simulan la data extraída de los juegos.
    *   Un botón destacado de "Exportar a Formato SIAGIE (Excel)".

---

## 4. Fases de Trabajo (Nuestra Ruta)

*   **Fase 1 (Documentación):** Generación de los archivos de registro histórico, enfoque, estructura y síntesis de NotebookLM mediante el equipo de agentes. *(Actualmente en progreso)*.
*   **Fase 2 (El MVP Funcional):** Programaremos el Minijuego Evaluador con captura de telemetría por consola o interfaz sencilla.
*   **Fase 3 (Maquetado Visual):** Desarrollaremos los mockups web del Dashboard Docente y Portal Cautivo.
*   **Fase 4 (Integración y Pulido):** Unir los mockups con el minijuego para tener el flujo de presentación (Demo) listo para el pitch final de la Hackathon.

---

## User Review Required / Open Questions

> [!CAUTION]
> 1. **Mecánica del Minijuego:** Para el MVP funcional, ¿qué tipo de juego prefieres que construyamos? (ej. Un puzzle matemático de reparar circuitos/tuberías, un quiz de decisiones de historia, o un minijuego de plataformas).
> 2. **Tecnología del MVP:** ¿Deseas que construya el juego con Vanilla JS/CSS (más rápido y nativo web) o prefieres usar Phaser.io?
> 3. **Maquetas:** ¿Las maquetas visuales (Dashboard) prefieres que las codifiquemos en HTML/CSS/React para que sean interactivas, o solo generamos las imágenes base (UI Designs)?

Presiona **"Proceed"** si apruebas este plan enfocado y responde a las preguntas en el chat para que el equipo comience la etapa de código y diseño visual.
