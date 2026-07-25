# 🤖 Manual de Coordinación para el Agente Colaborador (NOMAD-IA)

Este documento sirve como guía directa de arquitectura y protocolo para el segundo agente de IA que trabajará de forma paralela en las funcionalidades del proyecto.

---

## 📌 1. Estado Actual y Arquitectura del Proyecto

- **Repositorio Git:** `https://github.com/20233999-collab/nomad-ia-demo`
- **Rama Principal:** `master`
- **Servidor Backend:** Node.js Express (`server.js`) escuchando en el puerto `3000`.
- **Estructura de Carpetas:**
  - `public/`: Contiene la web estática (HTML, CSS, JS).
  - `public/styles/mondrian-new.css`: Hoja de estilos compartida (Design System Glassmorphism + Mondrian).
  - `public/images/`: Assets e imágenes ilustrativas.
  - `public/aprender-ia/`: Módulos del estudiante (`index.html`, `biblioteca.html`, `yachay.html`, `chancay.html`).
  - `public/educar-ia/`: Panel del docente (`login.html`, `index.html`).
  - `docs/`: Documentación técnica, PRD, arquitectura y guías.

---

## 🌿 2. Estrategia de Ramas Git (Branching)

Para evitar conflictos de fusión (merge conflicts) mientras ambos agentes trabajan simultáneamente:

1. **Crear rama dedicada por funcionalidad:**
   ```bash
   git checkout -b feature/nombre-funcionalidad
   ```
   *Ejemplo para el diseño de Chancay:* `git checkout -b feature/chancay-mascot-design`

2. **Regla de Commits Explicita:**
   - **IMPORTANTE:** No realizar `git commit` ni `git push` automáticos a menos que el usuario lo solicite explícitamente.

3. **Fusión a `master`:**
   Al terminar la funcionalidad y recibir aprobación del usuario:
   ```bash
   git checkout master
   git merge feature/nombre-funcionalidad
   git push origin master
   ```

---

## 🔒 3. Delimitación de Archivos por Agente

Para trabajar de manera independiente sin sobreescribir el trabajo del otro:

| Agente / Desarrollador | Archivos bajo su responsabilidad |
| :--- | :--- |
| **Agente A (Este Agente)** | `public/aprender-ia/index.html`, `public/aprender-ia/biblioteca.html`, `public/aprender-ia/yachay.html`, `server.js` |
| **Agente B (Agente Compañera)** | `public/aprender-ia/chancay.html`, assets gráficos de Chancay en `public/images/chancay/`, componentes del avatar del cuy |

---

## 📡 4. Contrato de API y Datos Compartidos

### Endpoint de Telemetría:
- **Ruta:** `POST /api/telemetry`
- **Formato JSON Payload:**
  ```json
  {
    "studentName": "Mateo Rossi",
    "gameId": "circuito-1",
    "timeSpentSec": 14.5,
    "errorsCount": 0,
    "rageClicks": 0,
    "score": 100,
    "statusBadge": "VERDE"
  }
  ```

### Tokens de Estilo CSS Compartidos (`mondrian-new.css`):
- `--mondrian-red`: `#E52521`
- `--mondrian-blue`: `#004586`
- `--mondrian-yellow`: `#F7D000`
- `--glass-bg-light`: `rgba(255, 255, 255, 0.7)`
- `--glass-blur`: `blur(20px)`
