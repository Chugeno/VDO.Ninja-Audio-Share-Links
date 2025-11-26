# VDO.Ninja Control Interface 🎛️

Interfaz web minimalista para generar sesiones de audio HQ seguras en VDO.Ninja. Diseñada para profesionales de audio.

## 🚀 Características
- **Privacidad Total:** Genera contraseñas aleatorias localmente.
- **Aislamiento de Clientes:** Usa `Room Name` fijo + `Password` único por sesión.
- **Audio HQ:** Configurado para Opus 510kbps, Stereo, Baja Latencia.
- **Modo Talkback:** El cliente recibe HQ pero envía audio ligero (32kbps) para no saturar la red.
- **Persistencia:** Recuerda tus ajustes (Nombre de Sala, Bitrate, etc.) en tu navegador.

## 🛠️ Cómo Usar
1. Abres `index.html` en tu navegador.
2. Configura tu **Nombre de Sala** (ej: `EstudioEugenio`).
3. Copia el **Link HOST** para ti (Audio HQ, Video Off).
4. Copia el **Link CLIENTE** para tu invitado (Audio Talkback, escucha HQ).

---
*Todo el procesamiento es local (Client-Side). Ningún dato sensible sale de tu navegador.*
