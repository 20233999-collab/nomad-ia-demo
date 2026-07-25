# 🛠️ Guía Paso a Paso: Tu Laptop como Servidor Local Offline (NOMAD-IA)

Este documento detalla el procedimiento para convertir tu laptop en un nodo servidor sin conexión a internet y permitir que tablets, celulares u otros equipos se conecten para realizar pruebas en vivo.

---

## 1. Conectar todos los dispositivos a la misma red local
Tienes dos opciones para crear tu red sin internet:
- **Opción A (Recomendada):** Activa la función **"Zona Wi-Fi" / "Hotspot"** de tu celular o laptop. Conecta tus tablets o el otro celular a esa red Wi-Fi.
- **Opción B:** Conecta tu laptop y tus dispositivos al mismo router de tu casa/oficina (no importa si no tiene crédito ni salida a internet, solo necesitamos la señal de red local).

---

## 2. Encender el Servidor NOMAD en tu Laptop
Abre la terminal dentro de la carpeta del proyecto (`mvp-hackaton-minedu`) y ejecuta:

```bash
npm start
```

Verás un mensaje confirmando que el servidor Node.js está corriendo localmente en el puerto `3000`.

---

## 3. Obtener la IP de tu Laptop en la Red
Necesitas conocer la dirección IP que la red le asignó a tu laptop.

- **En Linux / Mac:** Abre otra pestaña de la terminal y ejecuta:
  ```bash
  hostname -I
  ```
  *(Verás una serie de números como `192.168.1.15` o `192.168.18.5`)*.

- **En Windows:** Abre la consola `cmd` y ejecuta:
  ```bash
  ipconfig
  ```
  *(Busca donde diga "Dirección IPv4")*.

---

## 4. Entrar al Minijuego desde las Tablets / Celulares
Abre cualquier navegador (Chrome, Safari, etc.) en las tablets o celulares conectados a la red local y escribe la dirección IP de tu laptop seguida del puerto `:3000`:

👉 **Para el Minijuego (AprenderIA):**  
`http://TU_IP_LOCAL:3000/aprender-ia/`  
*(Ejemplo real: `http://192.168.1.15:3000/aprender-ia/`)*

👉 **Para el Hub Principal:**  
`http://TU_IP_LOCAL:3000/`

---

## 5. Monitorear en Tiempo Real desde el Panel del Profesor
En tu propia laptop (o en otra pantalla), abre el panel docente:  
`http://localhost:3000/educar-ia/login.html`

1. Haz clic en **Ingresar al Panel**.
2. Dile a la persona con la tablet que juegue el minijuego de circuitos o le haga preguntas a Chancay.
3. Al terminar el juego o responder las preguntas, verás cómo los datos de telemetría y el **Semáforo de Alerta Temprana** se actualizan en vivo en tu pantalla de profesor.

---

> [!TIP]
> **Consejo para la prueba:** Si tus dispositivos no pueden conectar a la IP de la laptop, asegúrate de que el cortafuegos (Firewall) de tu laptop no esté bloqueando las conexiones entrantes en el puerto 3000.
