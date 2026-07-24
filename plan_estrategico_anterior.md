# Plan Estratégico Anterior (Visión Teórica)

## Visión Total
El plan estratégico inicial proponía una solución integral y altamente ambiciosa para transformar la educación rural, basada en tres pilares fundamentales:

1. **Hardware (NOMAD):**
   Implementación de dispositivos robustos, autónomos y portátiles diseñados para entornos carentes de conectividad. Estos equipos contarían con servidores locales, almacenamiento masivo de contenidos educativos y autonomía energética (paneles solares y baterías).

2. **IA Adaptativa:**
   Despliegue de modelos de Inteligencia Artificial que operan de manera local (offline). Esta IA tendría la capacidad de adaptar las rutas de aprendizaje en tiempo real, generar material didáctico hiper-personalizado y evaluar el progreso de cada estudiante según su contexto y ritmo.

3. **Integración con SIAGIE:**
   Sincronización automatizada de registros académicos (asistencia, calificaciones, matrículas) con el Sistema de Información de Apoyo a la Gestión de la Institución Educativa (SIAGIE) del Ministerio de Educación (MINEDU), aliviando la carga administrativa de los docentes rurales.

## Críticas de Viabilidad
Durante la evaluación del proyecto, se concluyó que esta visión total es inviable para una etapa inicial (MVP) o en el contexto de una hackatón, debido a las siguientes razones críticas:

1. **Scope Creep (Corrupción del Alcance):**
   Abarcar simultáneamente el desarrollo de hardware especializado, una plataforma de software con IA generativa local y la compleja integración con sistemas gubernamentales excede con creces los límites de tiempo, presupuesto y capacidad técnica de un equipo en un MVP. Intentar construir todo al mismo tiempo resulta en una dispersión de esfuerzos que eleva exponencialmente el riesgo de fracaso.

2. **Problemas de Integración con SIAGIE:**
   SIAGIE es un sistema cerrado, con infraestructura heredada (legacy) y sin APIs públicas o modernas de fácil acceso. Obtener los permisos del MINEDU es un proceso burocrático y extremadamente lento. Además, sincronizar datos desde entornos offline (conexión intermitente) genera conflictos técnicos severos en la validación y concurrencia de datos, lo que requeriría una ingeniería de sincronización demasiado compleja para un primer prototipo.
