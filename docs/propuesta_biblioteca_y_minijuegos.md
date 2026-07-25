# 📚 Propuesta Pedagógica y Visual: Biblioteca & Minijuegos NOMAD-IA

## 🎯 Visión y Propósito
El módulo de **Biblioteca & Minijuegos** busca equilibrar la **rigurosidad institucional y académica del MINEDU** con una **experiencia de lectura aventurera y lúdica** para estudiantes de 10 a 13 años en zonas rurales del Perú.

No se busca crear simplemente cómics de entretenimiento, sino **libros y guías educativas de alto nivel pedagógico** presentados con un lenguaje visual de cuento de aventuras (estilo editorial ilustrado).

---

## 🎨 Pilares del Diseño Visual (Estilo Editorial / Storybook)

1. **Paleta Orgánica y Sobria (Low-Key / Adventurous):**
   - Tonos verdes bosque, terracota, azuledos profundos, cremas y madera.
   - Alejado de colores neón saturados; enfocado en una atmósfera de exploración de la naturaleza andina.

2. **Tipografía y Maquetación Académica-Lúdica:**
   - Títulos estilizados con aire de leyenda o cuaderno de campo.
   - Portadas que combinan el rigor de una publicación escolar oficial con ilustraciones de aventuras.

3. **Estructura del Módulo:**
   - **Pestaña 1: Biblioteca de Recursos Pedagógicos (Libros & Cómics Educativos):** Textos descargables en PDF para lectura offline.
   - **Pestaña 2: Misiones Arcade STEAM (Aprender Jugando):** Minijuegos de lógica y ciencias donde 1 es totalmente jugable con telemetría y los demás son maquetas de la plataforma.

---

## 📄 Catálogo de Libros del Prototipo

1. **Ciencias & Física:** *El Secreto de la Energía y Circuitos*
2. **Matemáticas:** *Geometría de los Andes*
3. **Robótica & Agronomía:** *El Huerto Tecnológico del Cuy*
4. **Pensamiento Computacional:** *Algoritmos en la Naturaleza*
5. **Ciencias de la Tierra:** *Fenómenos Naturales del Perú*

---

## 📡 Integración con el Sistema de Telemetría (EducarIA)
Cuando el estudiante completa una lectura o supera el minijuego de circuitos en esta sección:
- Se registra el tiempo de permanencia y las respuestas.
- El cliente envía un paquete JSON a la API `/api/telemetry`.
- El Dashboard del docente (`EducarIA`) recibe el estado del alumno y actualiza el Semáforo de Alerta Temprana.
