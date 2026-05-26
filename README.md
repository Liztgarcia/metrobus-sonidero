# 🎺 Metrobús Sonidero - CDMX en Vivo

![Sonidero](https://img.shields.io/badge/Género-Sonidero-ff00ff?style=for-the-badge)
![CDMX](https://img.shields.io/badge/Ciudad-CDMX-00ffff?style=for-the-badge)
![Datos Abiertos](https://img.shields.io/badge/API-Datos%20Abiertos%20CDMX-green?style=for-the-badge)

## 🎵 ¿Qué es esto?

Un proyecto de arte generativo que convierte el movimiento en tiempo real del Metrobús de la Ciudad de México en **música sonidero**. Cada línea del Metrobús toca una nota musical diferente, y cuando los autobuses se cruzan en las intersecciones, se crea una cumbia única y orgánica.

**La ciudad hace música. Literalmente.**

## ✨ Características

- 🚌 **Datos en tiempo real** del Metrobús CDMX vía API de Datos Abiertos
- 🎼 **Música sonidero generativa** con Tone.js
- 🗺️ **Visualización en mapa** con Leaflet.js
- 🎨 **Diseño cyberpunk/neon** inspirado en la cultura sonidero
- 📊 **Estadísticas en vivo** de autobuses y notas tocadas
- 🌐 **Funciona 100% en el navegador** (no requiere backend)

## 🎹 Mapeo de Líneas a Notas

| Línea | Color | Nota | Ruta |
|-------|-------|------|------|
| **Línea 1** | 🟠 Naranja | Do (C4) | Indios Verdes - El Caminero |
| **Línea 2** | 🟣 Morado | Re (D4) | Tepalcates - Tacubaya |
| **Línea 3** | 🟢 Verde | Mi (E4) | Etiopía - Tenayuca |
| **Línea 4** | 🟡 Amarillo | Sol (G4) | San Lázaro - Buenavista |
| **Línea 5** | 🌸 Rosa | La (A4) | San Lázaro - Río de los Remedios |
| **Línea 6** | 🔴 Rojo | Si (B4) | El Rosario - Villa de Aragón |
| **Línea 7** | 🔵 Azul | Do Alto (C5) | Campo Marte - Indios Verdes |

## 🚀 Cómo subirlo a GitHub Pages (HOY)

### Paso 1: Crear el repositorio en GitHub

1. Ve a [GitHub.com](https://github.com)
2. Haz clic en el botón **"+"** arriba a la derecha → **"New repository"**
3. Configura tu repositorio:
   - **Repository name:** `metrobus-sonidero` (o el nombre que prefieras)
   - **Description:** "Música sonidero generativa usando datos en tiempo real del Metrobús CDMX"
   - Marca **"Public"** (para que funcione GitHub Pages gratis)
   - ✅ Marca **"Add a README file"**
   - Click en **"Create repository"**

### Paso 2: Subir los archivos

**Opción A: Desde la interfaz web (la más rápida)**

1. En tu nuevo repositorio, haz clic en **"Add file"** → **"Upload files"**
2. Arrastra estos 3 archivos:
   - `index.html`
   - `style.css`
   - `script.js`
3. Escribe un mensaje de commit: "Primera versión del proyecto sonidero"
4. Click en **"Commit changes"**

**Opción B: Con Git desde la terminal**

```bash
# 1. Clona tu repositorio
git clone https://github.com/TU-USUARIO/metrobus-sonidero.git
cd metrobus-sonidero

# 2. Copia los archivos del proyecto a esta carpeta

# 3. Agrega y sube los archivos
git add index.html style.css script.js
git commit -m "Primera versión del proyecto sonidero"
git push origin main
```

### Paso 3: Activar GitHub Pages

1. En tu repositorio, ve a **Settings** (Configuración)
2. En el menú izquierdo, busca **"Pages"**
3. En **"Build and deployment"**:
   - **Source:** Selecciona "Deploy from a branch"
   - **Branch:** Selecciona `main` y carpeta `/ (root)`
4. Click en **"Save"**
5. ⏳ Espera 1-2 minutos

### Paso 4: ¡Accede a tu proyecto!

Tu sitio estará disponible en:

```
https://TU-USUARIO.github.io/metrobus-sonidero/
```

(Reemplaza `TU-USUARIO` con tu nombre de usuario de GitHub)

## 🎮 Cómo usar la aplicación

1. **Abre el enlace** de GitHub Pages en tu navegador
2. Haz clic en **"¡DALE! Iniciar"**
3. Acepta los permisos de audio del navegador
4. **¡Escucha!** La música se generará automáticamente
5. Observa el mapa - los círculos de colores son autobuses
6. Cuando los autobuses se cruzan, tocan notas

### Controles

- **⏸ Pausar:** Pausa la música y actualización de datos
- **Panel izquierdo:** Muestra estadísticas y últimas notas tocadas
- **Leyenda:** Identifica cada línea por color y nota

## 🛠️ Tecnologías

- **HTML5 + CSS3**: Interfaz y diseño
- **JavaScript (ES6+)**: Lógica de la aplicación
- **[Leaflet.js](https://leafletjs.com/)**: Visualización de mapas
- **[Tone.js](https://tonejs.github.io/)**: Síntesis de audio y música
- **API de Datos Abiertos CDMX**: Datos en tiempo real del Metrobús

## 📊 Fuente de Datos

Este proyecto usa la [API de Datos Abiertos de la Ciudad de México](https://datos.cdmx.gob.mx/):

- **Dataset:** Ubicación de las unidades del Metrobús
- **Actualización:** Cada 10 segundos
- **Formato:** JSON a través de CKAN API

### ⚠️ Nota sobre la API

La API de Datos Abiertos CDMX puede tener restricciones CORS o estar temporalmente no disponible. El proyecto incluye:

- ✅ **Intentos con proxy CORS** (AllOrigins)
- ✅ **Datos simulados como fallback** para que siempre funcione
- ✅ **Manejo de errores robusto**

Si quieres usar **solo datos reales**, edita `script.js` y comenta la sección de datos simulados.

## 🎨 Personalización

### Cambiar colores del diseño

Edita `style.css` y modifica las variables de color:

```css
/* Colores principales */
#splash-screen {
    background: linear-gradient(135deg, #1a0033 0%, #000000 50%, #330011 100%);
}

.neon-title {
    color: #fff;
    text-shadow: 0 0 10px #ff00ff; /* Color neón principal */
}
```

### Cambiar tempo de la música

En `script.js`, línea ~199:

```javascript
Tone.Transport.bpm.value = 100; // Cambia este número (60-140)
```

### Agregar más líneas

Si el Metrobús añade nuevas líneas, edita el objeto `LINEAS_DATA` en `script.js`:

```javascript
const LINEAS_DATA = {
    '8': { 
        color: '#NUEVO_COLOR', 
        nota: 'D5', 
        nombre: 'Línea 8',
        descripcion: 'Ruta nueva'
    }
};
```

## 🐛 Troubleshooting

### "No se escucha música"

- Verifica que tu navegador permita autoplay de audio
- Haz clic en **"Iniciar"** - el audio requiere interacción del usuario
- Sube el volumen de tu dispositivo

### "No veo autobuses en el mapa"

- La API puede estar caída - el proyecto usará datos simulados
- Espera 10-20 segundos para la primera carga
- Recarga la página (F5)

### "El mapa no carga"

- Verifica tu conexión a internet
- Revisa la consola del navegador (F12) para errores
- Prueba en otro navegador (Chrome, Firefox, Safari)

## 📜 Licencia

Este proyecto es **código abierto** y está disponible bajo la licencia MIT.

Siéntete libre de:
- ✅ Usarlo para aprender
- ✅ Modificarlo y mejorarlo
- ✅ Compartirlo
- ✅ Crear tu propia versión

## 🙏 Créditos

- **Datos:** [Portal de Datos Abiertos CDMX](https://datos.cdmx.gob.mx/)
- **Música:** Sistema generativo con Tone.js
- **Mapas:** OpenStreetMap + CartoDB
- **Inspiración:** La cultura sonidero de la Ciudad de México 🎺

## 🌟 ¿Te gustó?

Si usas este proyecto:
- Dale una ⭐ en GitHub
- Comparte el enlace con tus amigos
- Crea tu propia versión y compártela

---

**Hecho con 💜 para la Ciudad de México**

*"La ciudad que nunca duerme, ahora también hace música"*
