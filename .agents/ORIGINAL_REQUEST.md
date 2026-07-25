# Original User Request

## Initial Request — 2026-07-24T04:04:09Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Construir un "Hub de Demostración" web interactivo para el ecosistema NOMAD-IA. La plataforma debe servir como índice para probar un minijuego corto (AprenderIA) que capture telemetría real (latencia, errores) y la envíe a un servidor local, el cual alimentará en tiempo real el Dashboard del Docente (EducarIA). Todo el frontend debe seguir estrictamente el diseño estilo Mondrian.

Working directory: /home/laptop/Documentos/mvp-hackaton-minedu
Integrity mode: development

## Requirements

### R1. Hub de Inicio y Frontend Estilo Mondrian
Implementar una página de inicio (Hub) estática con enlaces a AprenderIA y EducarIA. Todas las interfaces web deben usar HTML/CSS/Vanilla JS y seguir la paleta visual Mondrian (Rojo, Azul, Amarillo, fondos Beige/Blanco, bordes gruesos negros).

### R2. Mini-Servidor Backend (Node.js)
Implementar un servidor ultra ligero en Node.js (con Express) que exponga una API local. Debe tener un endpoint `POST /api/telemetry` para recibir datos de juego, y un endpoint `GET /api/telemetry` para servirlos. 

### R3. Prototipo de AprenderIA (Minijuego)
Implementar una vista móvil de un minijuego corto (1 o 2 interacciones tipo quiz o puzzle simple). Al completarse, un script debe calcular el tiempo transcurrido, los errores (si los hay) y enviar silenciosamente el payload JSON al servidor Node.js.

### R4. Prototipo de EducarIA (Dashboard)
Implementar una vista desktop para el dashboard docente. Debe hacer *polling* o un simple fetch (GET) al servidor Node.js y mostrar la información del alumno que acaba de jugar en una tabla dinámica estilo semáforo (Verde, Amarillo, Rojo).

### R5. Restricciones de Red
Toda la plataforma debe operar estrictamente en `localhost`. No debe requerir acceso a internet externo ni usar bases de datos externas (guardar los datos en memoria en Node.js es suficiente para la demo).

## Acceptance Criteria

### Servidor Local Funcional
- [ ] Ejecutar `node server.js` levanta el servidor correctamente en el puerto 3000 (o similar).
- [ ] La ruta `/api/telemetry` acepta peticiones POST con JSON válido.

### Integración de Telemetría (End-to-End)
- [ ] Completar una interacción en AprenderIA envía exitosamente la telemetría al servidor (HTTP 200 OK).
- [ ] Refrescar o cargar EducarIA recupera esos mismos datos y renderiza una fila en la tabla con el tiempo y estado (semáforo) correcto.

### Verificación Programática
- [ ] Se debe incluir un archivo `verify.js` (o similar) que realice una prueba E2E simple (simulando un POST de telemetría y comprobando el GET consecutivo) para validar que la conexión backend funciona sin intervención humana.
