// ============================================
// METROBÚS SONIDERO - CDMX EN VIVO
// ============================================

// === CONFIGURACIÓN GLOBAL ===
const CONFIG = {
    // API de Apimetro - Datos geoespaciales reales del Metrobús CDMX
    apimetroUrl: 'https://apimetro.dev/movilidad',
    // Para datos en tiempo real GTFS-RT (requiere registro):
    // Visita: https://www.metrobus.cdmx.gob.mx/portal-ciudadano/datos-abiertos
    updateInterval: 10000, // 10 segundos
    mapCenter: [19.4326, -99.1332],
    mapZoom: 12,
    busesPerLine: 8 // Número de buses simulados por línea
};

// === DATOS DE LÍNEAS DEL METROBÚS ===
const LINEAS_DATA = {
    '1': { 
        color: '#E87511', 
        nota: 'C4', 
        nombre: 'Línea 1',
        descripcion: 'Indios Verdes - El Caminero'
    },
    '2': { 
        color: '#B41166', 
        nota: 'D4', 
        nombre: 'Línea 2',
        descripcion: 'Tepalcates - Tacubaya'
    },
    '3': { 
        color: '#00853E', 
        nota: 'E4', 
        nombre: 'Línea 3',
        descripcion: 'Etiopia - Tenayuca'
    },
    '4': { 
        color: '#FFD100', 
        nota: 'G4', 
        nombre: 'Línea 4',
        descripcion: 'San Lázaro - Buenavista'
    },
    '5': { 
        color: '#FF6699', 
        nota: 'A4', 
        nombre: 'Línea 5',
        descripcion: 'San Lázaro - Río de los Remedios'
    },
    '6': { 
        color: '#DC0F27', 
        nota: 'B4', 
        nombre: 'Línea 6',
        descripcion: 'El Rosario - Villa de Aragón'
    },
    '7': { 
        color: '#0095D9', 
        nota: 'C5', 
        nombre: 'Línea 7',
        descripcion: 'Campo Marte - Indios Verdes'
    }
};

// === ESTADO GLOBAL ===
let state = {
    isPlaying: false,
    isPaused: false,
    buses: new Map(),
    notesPlayed: 0,
    lastUpdate: null,
    audioInitialized: false,
    map: null,
    markers: new Map(),
    intersections: new Map()
};

// === SISTEMA DE AUDIO (Tone.js) ===
let audio = {
    melodySynth: null,
    bassSynth: null,
    delay: null,
    reverb: null,
    bassLoop: null
};

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const btnStart = document.getElementById('btn-start');
    btnStart.addEventListener('click', iniciarApp);
});

async function iniciarApp() {
    // Ocultar splash screen
    document.getElementById('splash-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    
    // Inicializar audio
    await inicializarAudio();
    
    // Inicializar mapa
    inicializarMapa();
    
    // Crear leyenda
    crearLeyenda();
    
    // Configurar controles
    configurarControles();
    
    // Iniciar actualización de datos
    state.isPlaying = true;
    actualizarEstado('Conectado al Metrobús', true);
    
    // Comenzar a obtener datos
    obtenerDatosMetrobus();
    
    // Loop de actualización
    setInterval(() => {
        if (state.isPlaying && !state.isPaused) {
            obtenerDatosMetrobus();
        }
    }, CONFIG.updateInterval);
}

// ============================================
// SISTEMA DE AUDIO
// ============================================

async function inicializarAudio() {
    await Tone.start();
    console.log('Audio inicializado');
    
    // Crear efectos
    audio.reverb = new Tone.Reverb({
        decay: 3,
        preDelay: 0.01
    }).toDestination();
    
    audio.delay = new Tone.FeedbackDelay({
        delayTime: '8n',
        feedback: 0.5,
        wet: 0.3
    }).connect(audio.reverb);
    
    // Sintetizador de melodía (estilo requinto sonidero)
    audio.melodySynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
            type: 'sawtooth'
        },
        envelope: {
            attack: 0.05,
            decay: 0.1,
            sustain: 0.3,
            release: 0.8
        },
        filter: {
            frequency: 2000,
            Q: 5,
            type: 'lowpass'
        }
    }).connect(audio.delay);
    
    // Sintetizador de bajo (bomba sonidera)
    audio.bassSynth = new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 4,
        oscillator: { type: 'sine' },
        envelope: {
            attack: 0.01,
            decay: 0.5,
            sustain: 0.01,
            release: 1.4
        }
    }).toDestination();
    
    // Patrón de bajo (ritmo sonidero)
    audio.bassLoop = new Tone.Loop((time) => {
        audio.bassSynth.triggerAttackRelease('C2', '8n', time);
        audio.bassSynth.triggerAttackRelease('C2', '8n', time + Tone.Time('4n').toSeconds());
    }, '2n').start(0);
    
    // Configurar tempo
    Tone.Transport.bpm.value = 100; // Tempo sonidero típico
    Tone.Transport.start();
    
    state.audioInitialized = true;
}

function tocarNota(linea, velocidad = 20) {
    if (!state.audioInitialized || !LINEAS_DATA[linea]) return;
    
    const nota = LINEAS_DATA[linea].nota;
    const duracion = velocidad > 25 ? '16n' : '8n';
    
    // Tocar nota principal
    audio.melodySynth.triggerAttackRelease(nota, duracion);
    
    // Si va muy rápido, agregar efecto extra (grito sonidero)
    if (velocidad > 40) {
        const grito = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: {
                attack: 0.01,
                decay: 0.3,
                sustain: 0
            }
        }).connect(audio.delay);
        
        grito.triggerAttackRelease('16n');
        grito.dispose();
    }
    
    // Actualizar contador
    state.notesPlayed++;
    document.getElementById('notes-count').textContent = state.notesPlayed;
    
    // Agregar a visualizador
    agregarNotaAlVisualizador(linea, nota);
}

function agregarNotaAlVisualizador(linea, nota) {
    const display = document.getElementById('note-display');
    const item = document.createElement('div');
    item.className = 'note-item';
    item.style.borderColor = LINEAS_DATA[linea].color;
    
    const ahora = new Date().toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    item.innerHTML = `
        <strong>${LINEAS_DATA[linea].nombre}</strong> - 
        ${nota} (${ahora})
    `;
    
    // Insertar al principio
    display.insertBefore(item, display.firstChild);
    
    // Mantener solo las últimas 10 notas
    while (display.children.length > 10) {
        display.removeChild(display.lastChild);
    }
}

// ============================================
// MAPA
// ============================================

function inicializarMapa() {
    // Crear mapa con estilo oscuro
    state.map = L.map('map').setView(CONFIG.mapCenter, CONFIG.mapZoom);
    
    // Tile layer oscuro (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap | © CARTO | Datos: CDMX',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(state.map);
    
    console.log('Mapa inicializado');
}

function agregarOActualizarBus(busData) {
    const { id, linea, position_latitude, position_longitude, vehicle_current_status } = busData;
    
    // Validar coordenadas
    if (!position_latitude || !position_longitude) return;
    
    const lat = parseFloat(position_latitude);
    const lon = parseFloat(position_longitude);
    
    if (isNaN(lat) || isNaN(lon)) return;
    
    const lineaInfo = LINEAS_DATA[linea] || LINEAS_DATA['1'];
    
    // Si el marcador no existe, crearlo
    if (!state.markers.has(id)) {
        const marker = L.circleMarker([lat, lon], {
            radius: 8,
            fillColor: lineaInfo.color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
            className: 'bus-marker'
        }).addTo(state.map);
        
        // Popup con info
        marker.bindPopup(`
            <strong>${lineaInfo.nombre}</strong><br>
            Unidad: ${id}<br>
            Estado: ${vehicle_current_status || 'En tránsito'}
        `);
        
        state.markers.set(id, {
            marker: marker,
            linea: linea,
            lastPosition: [lat, lon],
            lastNoteTime: 0
        });
    } else {
        // Actualizar posición
        const markerData = state.markers.get(id);
        markerData.marker.setLatLng([lat, lon]);
        markerData.lastPosition = [lat, lon];
    }
    
    // Detectar si está cerca del centro o intersecciones
    detectarInterseccion(id, [lat, lon], linea);
}

function detectarInterseccion(busId, position, linea) {
    const markerData = state.markers.get(busId);
    if (!markerData) return;
    
    const ahora = Date.now();
    
    // Evitar tocar la misma nota muy seguido (cooldown de 3 segundos)
    if (ahora - markerData.lastNoteTime < 3000) return;
    
    // Detectar proximidad con otros buses (intersección simulada)
    let hayInterseccion = false;
    
    state.markers.forEach((otherData, otherId) => {
        if (otherId === busId || otherData.linea === linea) return;
        
        const distancia = calcularDistancia(
            position[0], position[1],
            otherData.lastPosition[0], otherData.lastPosition[1]
        );
        
        // Si están a menos de 500 metros, consideramos intersección
        if (distancia < 0.5) {
            hayInterseccion = true;
        }
    });
    
    // También tocar nota en puntos de alto tráfico (centro de la ciudad)
    const distanciaCentro = calcularDistancia(
        position[0], position[1],
        CONFIG.mapCenter[0], CONFIG.mapCenter[1]
    );
    
    if (hayInterseccion || distanciaCentro < 2) {
        tocarNota(linea, 25);
        markerData.lastNoteTime = ahora;
        
        // Efecto visual
        markerData.marker.setRadius(12);
        setTimeout(() => {
            if (state.markers.has(busId)) {
                state.markers.get(busId).marker.setRadius(8);
            }
        }, 200);
    }
}

// Función para calcular distancia entre dos puntos (Haversine simplificado)
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// ============================================
// API DE DATOS ABIERTOS CDMX
// ============================================

async function obtenerDatosMetrobus() {
    mostrarCargando(true);
    
    try {
        // Intentar obtener datos reales primero
        const datos = await fetchDatosReales();
        
        if (datos && datos.length > 0) {
            procesarDatosMetrobus(datos);
        } else {
            // Si falla, usar datos simulados
            console.warn('API no disponible, usando datos simulados');
            const datosSimulados = generarDatosSimulados();
            procesarDatosMetrobus(datosSimulados);
        }
        
        actualizarHoraActualizacion();
        
    } catch (error) {
        console.error('Error obteniendo datos:', error);
        // Fallback a datos simulados
        const datosSimulados = generarDatosSimulados();
        procesarDatosMetrobus(datosSimulados);
    } finally {
        mostrarCargando(false);
    }
}

async function fetchDatosReales() {
    try {
        // Intentar con el endpoint directo primero
        const url = `${CONFIG.apiUrl}?resource_id=${CONFIG.resourceId}&limit=100`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('API response not OK');
        }
        
        const data = await response.json();
        
        if (data.result && data.result.records) {
            return data.result.records;
        }
        
        return null;
        
    } catch (error) {
        console.error('Error con API directa, intentando con proxy:', error);
        
        // Intentar con proxy CORS
        try {
            const proxyUrl = CONFIG.corsProxy + encodeURIComponent(
                `${CONFIG.apiUrl}?resource_id=${CONFIG.resourceId}&limit=100`
            );
            
            const response = await fetch(proxyUrl);
            const data = await response.json();
            
            if (data.result && data.result.records) {
                return data.result.records;
            }
        } catch (proxyError) {
            console.error('Error con proxy:', proxyError);
        }
        
        return null;
    }
}

function procesarDatosMetrobus(datos) {
    // Limpiar marcadores antiguos (más de 5 minutos sin actualizar)
    const ahora = Date.now();
    const marcadoresAEliminar = [];
    
    state.markers.forEach((data, id) => {
        if (ahora - data.lastNoteTime > 300000) {
            marcadoresAEliminar.push(id);
        }
    });
    
    marcadoresAEliminar.forEach(id => {
        const data = state.markers.get(id);
        state.map.removeLayer(data.marker);
        state.markers.delete(id);
    });
    
    // Procesar cada bus
    datos.forEach(bus => {
        agregarOActualizarBus(bus);
    });
    
    // Actualizar contador
    document.getElementById('buses-count').textContent = state.markers.size;
}

// Generar datos simulados para cuando la API no está disponible
function generarDatosSimulados() {
    const datos = [];
    const lineas = Object.keys(LINEAS_DATA);
    
    // Generar 30-50 buses aleatorios
    const numBuses = 30 + Math.floor(Math.random() * 20);
    
    for (let i = 0; i < numBuses; i++) {
        const linea = lineas[Math.floor(Math.random() * lineas.length)];
        
        // Generar posición aleatoria dentro de CDMX
        const lat = 19.35 + (Math.random() * 0.2);
        const lon = -99.20 + (Math.random() * 0.2);
        
        datos.push({
            id: `SIM-${linea}-${i}`,
            linea: linea,
            position_latitude: lat,
            position_longitude: lon,
            vehicle_current_status: Math.random() > 0.5 ? 'En tránsito' : 'En estación'
        });
    }
    
    return datos;
}

// ============================================
// UI Y CONTROLES
// ============================================

function crearLeyenda() {
    const container = document.getElementById('legend-container');
    
    Object.entries(LINEAS_DATA).forEach(([id, info]) => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        item.innerHTML = `
            <div class="legend-color" style="background-color: ${info.color}"></div>
            <div class="legend-info">
                <div class="legend-name">${info.nombre}</div>
                <div class="legend-note">Nota: ${info.nota}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

function configurarControles() {
    const btnPause = document.getElementById('btn-pause');
    
    btnPause.addEventListener('click', () => {
        state.isPaused = !state.isPaused;
        
        if (state.isPaused) {
            btnPause.textContent = '▶ Reanudar';
            Tone.Transport.pause();
            actualizarEstado('Pausado', false);
        } else {
            btnPause.textContent = '⏸ Pausar';
            Tone.Transport.start();
            actualizarEstado('Conectado al Metrobús', true);
        }
    });
}

function actualizarEstado(texto, activo) {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    
    statusText.textContent = texto;
    
    if (activo) {
        statusDot.classList.add('active');
    } else {
        statusDot.classList.remove('active');
    }
}

function actualizarHoraActualizacion() {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('last-update').textContent = hora;
}

function mostrarCargando(mostrar) {
    const overlay = document.getElementById('loading-overlay');
    overlay.style.display = mostrar ? 'flex' : 'none';
}

// ============================================
// UTILIDADES
// ============================================

console.log('🎺 Metrobús Sonidero - Sistema cargado');
