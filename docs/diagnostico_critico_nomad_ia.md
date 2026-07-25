# Diagnóstico Crítico e Hiperrealista: NOMAD-IA ⚠️

Este documento es un análisis "Red Team" (abogado del diablo) del proyecto NOMAD-IA. Su objetivo es exponer las fallas arquitectónicas, cuellos de botella tecnológicos y desafíos logísticos reales que los jurados de la Hackathon podrían cuestionar. 

---

## 1. El Cuello de Botella de la IA Local (Chancay)
La idea de correr un modelo LLM offline (como Ollama/Phi-3) suena innovadora, pero en hardware de bajo costo es un riesgo crítico.
- **Concurrencia (El colapso del CPU):** Un modelo pequeño (Phi-3 de 3.8B parámetros) requiere al menos 4GB de RAM y un procesador decente. Si 15 alumnos le preguntan a Chancay al mismo tiempo, una Raspberry Pi o una laptop de gama de entrada **colapsará por completo**. El tiempo de respuesta pasará de 1 segundo a varios minutos, arruinando la experiencia.
- **Alternativa necesaria:** Para un MVP real, "Chancay" no puede ser un LLM generativo; tendría que ser un sistema basado en árboles de decisión (respuestas pre-programadas) o usar aceleradores de hardware caros (Nvidia Jetson), lo que rompe la promesa de "bajo costo".

## 2. Limitaciones de Red (Wi-Fi Local)
- **Saturación del Access Point:** Una antena Wi-Fi integrada de una laptop o Raspberry Pi soporta de forma estable unos 10-15 dispositivos simultáneos. En un salón rural con 30-40 alumnos enviando datos de telemetría por segundo, el Access Point perderá paquetes, causando desconexiones constantes.
- **Solución requerida:** Se necesita un router externo dedicado (hardware adicional) solo para gestionar las conexiones, aumentando el costo del kit NOMAD.

## 3. El Espejismo de la Integración con SIAGIE
- **Burocracia y APIs inexistentes:** Prometer "calificaciones automáticas al SIAGIE" es una red flag tecnológica. El MINEDU no expone APIs abiertas para que sistemas de terceros escriban notas directamente. 
- **La realidad:** La integración real solo podría hacerse mediante la descarga de un Excel desde EducarIA para que el profesor lo suba manualmente al SIAGIE, o usando *Web Scraping* (bots), lo cual es frágil y bloqueable por el Estado.

## 4. UI/UX: Glassmorphism vs. Hardware Obsoleto
- **Rendimiento Gráfico:** Hemos diseñado una interfaz preciosa con "Glassmorphism", animaciones CSS y `backdrop-filter: blur`. Esto es genial para el video de la Hackathon, pero en la vida real, las tablets donadas a escuelas rurales suelen ser dispositivos de gama muy baja (Android 6.0/7.0).
- **El resultado:** Estas tablets no tienen aceleración gráfica moderna. El diseño actual las hará sobrecalentarse y la interfaz se verá extremadamente lenta (lag). 

## 5. Mantenimiento y "Hardware Survival"
- **Corrupción de Datos:** Los servidores locales baratos (Raspberry Pi) usan tarjetas MicroSD para almacenar el sistema operativo y la base de datos de telemetría. Con los cortes de luz frecuentes en zonas rurales, las MicroSD se corrompen fácilmente. Si la base de datos se borra, el docente pierde todas las notas de la semana.
- **Soporte Técnico Inexistente:** Si el nodo NOMAD falla (polvo, calor, humedad), en una escuela rural no hay un departamento de TI para repararlo.

## 6. Escalabilidad del Contenido (El verdadero costo)
- **Desarrollo de Minijuegos:** Crear la plataforma es fácil; el problema es el contenido. Mapear toda la Currícula Nacional a minijuegos interactivos requiere un equipo gigante de pedagogos y desarrolladores Unity/Web. Un MVP con 1 minijuego no demuestra que escalar el modelo para 6 años de primaria sea financieramente viable.

---

> [!WARNING]
> **Consejo para la Hackathon:** 
> Conocer estos puntos débiles te da ventaja. Si el jurado te ataca, debes decir: *"Estamos conscientes de que un LLM local concurrente es pesado, por eso en la fase 1 Chancay usa árboles de decisión determinísticos, y la integración a SIAGIE se hará mediante exportación estandarizada en CSV. El Glassmorphism se desactiva automáticamente si detectamos que el dispositivo tiene bajos recursos (Degradación Elegante)."*
