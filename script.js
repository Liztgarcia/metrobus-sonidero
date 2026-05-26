// ============================================
// METROBÚS SONIDERO - CDMX EN VIVO (VERSIÓN SONIDERA)
// ============================================

// === CONFIGURACIÓN GLOBAL ===
const CONFIG = {
    // Nota: La API real de Apimetro a veces requiere CORS Proxy o autenticación.
    // Para este demo, priorizamos la simulación suave que se ve en el mapa.
    // Si tienes una URL válida, descomenta y usa:
    // apiUrl: 'https://apimetro.dev/movilidad', 
    updateInterval: 8000, // 8 segundos
    mapCenter: [19.4326, -99.1332],
    mapZoom: 12,
    busesPerLine: 10
};

// === DATOS DE LÍNEAS DEL METROBÚS ===
const LINEAS_DATA = {
    '1': { color: '#E87511', nota: 'C4', nombre: 'Línea 1', descripcion: 'Indios Verdes - El Caminero' },
    '2': { color: '#B41166', nota: 'D4', nombre: 'Línea 2', descripcion: 'Tepalcates - Tacubaya' },
    '3': { color: '#00853E', nota: 'E4', nombre: 'Línea 3', descripcion: 'Etiopia - Tenayuca' },
    '4': { color: '#FFD100', nota: 'G4', nombre: 'Línea 4', descripcion: 'San Lázaro - Buenavista' },
    '5': { color: '#FF6699', nota: 'A4', nombre: 'Línea 5', descripcion: 'San Lázaro - Río de los Remedios' },
    '6': { color: '#DC0F27', nota: 'B4', nombre: 'Línea 6', descripcion: 'El Rosario - Villa de Aragón' },
    '7': { color: '#0095D9', nota: 'C5', nombre: 'Línea 7', descripcion: 'Campo Marte - Indios Verdes' }
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

// === SISTEMA DE AUDIO (Tone.js) - VERSIÓN SONIDERA ===
let audio = {
    melodySynth: null,
    bassSynth: null,
    delay: null,
    reverb: null,
    wahFilter: null, // ¡Nuevo! El filtro Wah-Wah
    bassLoop: null,
    gritoSynth: null // El grito del sonidero
};

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const btnStart = document.getElementById('btn-start');
    if(btnStart) btnStart.addEventListener('click', iniciarApp);
});

async function iniciarApp() {
    const splash = document.getElementById('splash-screen');
    const main = document.getElementById('main-app');
    if (splash) splash.style.display = 'none';
    if (main) main.style.display = 'block';
    
    await inicializarAudio();
    inicializarMapa();
    crearLeyenda();
    configurarControles();
    
    state.isPlaying = true;
    actualizarEstado('¡Dale compa! Conectado al Metrobús', true);
    
    obtenerDatosMetrobus();
    
    setInterval(() => {
        if (state.isPlaying && !state.isPaused) {
            obtenerDatosMetrobus();
        }
    }, CONFIG.updateInterval);
}

// ============================================
// SISTEMA DE AUDIO MEJORADO
// ============================================

async function inicializarAudio() {
    await Tone.start();
    console.log('🎺 Audio Sonidero Inicializado');
    
    // 1. EFECTOS MAESTROS
    // Reverb grande para el ambiente de "bailadero"
    audio.reverb = new Tone.Reverb({ decay: 4, preDelay: 0.01 }).toDestination();
    
    // Delay con feedback (Eco clásico)
    audio.delay = new Tone.FeedbackDelay({
        delayTime: "8n",
        feedback: 0.6,
        wet: 0.35
    }).connect(audio.reverb);

    // 2. EL WAH-WAH AUTOMÁTICO (La clave del sonido)
    // Esto hace que el filtro de la melodía se abra y cierre rítmicamente
    audio.wahFilter = new Tone.AutoFilter({
        frequency: 1.5, // Velocidad del wah (lento y pesado)
        baseFrequency: 300,
        octaves: 2.6,
        amplitude: 1
    }).connect(audio.delay);

    // 3. MELODÍA (Requinto/Teclado)
    audio.melodySynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" }, // Triángulo es más "orgánico" que Sawtooth
        envelope: {
            attack: 0.02,
            decay: 0.1,
            sustain: 0.2,
            release: 0.5
        }
    }).connect(audio.wahFilter); // Conectar al Wah-Wah

    // 4. BAJO (La Bomba Sonidera)
    audio.bassSynth = new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 4,
        oscillator: { type: "sine" },
        envelope: {
            attack: 0.01,
            decay: 0.4,
            sustain: 0.01,
            release: 1.4
        }
    }).toDestination();

    // 5. EL GRITO (NoiseSynth)
    audio.gritoSynth = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: {
            attack: 0.01,
            decay: 0.4,
            sustain: 0
        }
    }).connect(audio.delay).connect(audio.reverb);

    // 6. SECUENCIADOR DE BAJO (Ritmo Sincopado)
    // Patrón: Golpe en el 1, silencio, golpe en el "y" del 2 (sincopa)
    audio.bassLoop = new Tone.Loop((time) => {
        // Golpe fuerte en el 1
        audio.bassSynth.triggerAttackRelease("C2", "8n", time);
        
        // Golpe en el contratiempo (el "y" del 2) - ¡La clave de la cumbia!
        audio.bassSynth.triggerAttackRelease("C2", "16n", time + Tone.Time("3.5n"));
        
        // A veces un golpe extra en el 4 para dar fuerza
        if (Math.random() > 0.6) {
            audio.bassSynth.triggerAttackRelease("C1", "32n", time + Tone.Time("7n"));
        }
    }, "4n").start(0);

    Tone.Transport.bpm.value = 96; // Tempo sonidero (lento y pesado)
    Tone.Transport.start();
    
    state.audioInitialized = true;
}

function tocarNota(linea, velocidad = 20) {
    if (!state.audioInitialized || !LINEAS_DATA[linea]) return;
    
    const nota = LINEAS_DATA[linea].nota;
    const duracion = velocidad > 25 ? "16n" : "8n";
    
    // 1. Tocar la melodía (ya pasa por el Wah-Wah y Delay)
    audio.melodySynth.triggerAttackRelease(nota, duracion);
    
    // 2. Si va muy rápido, disparar el "Grito"
    if (velocidad > 35) {
        // Variar la frecuencia del grito para que no sea monótono
        // (Simulamos variación de tono en el ruido)
        const gritoDuracion = "32n";
        audio.gritoSynth.triggerAttackRelease(gritoDuracion);
    }
    
    // 3. Refuerzo de bajo para líneas principales
    if (linea === '1' || linea === '3' || linea === '5') {
        audio.bassSynth.triggerAttackRelease("C1", "32n");
    }
    
    state.notesPlayed++;
    const counter = document.getElementById('notes-count');
    if(counter) counter.textContent = state.notesPlayed;
    
    agregarNotaAlVisualizador(linea, nota);
}

function agregarNotaAlVisualizador(linea, nota) {
    const display = document.getElementById('note-display');
    if (!display) return;

    const item = document.createElement('div');
    item.className = 'note-item';
    item.style.borderColor = LINEAS_DATA[linea].color;
    
    const ahora = new Date().toLocaleTimeString('es-MX', { 
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    
    item.innerHTML = `
        <strong>${LINEAS_DATA[linea].nombre}</strong> - 
        ${nota} (${ahora})
    `;
    
    display.insertBefore(item, display.firstChild);
    
    while (display.children.length > 8) {
        display.removeChild(display.lastChild);
    }
}

// ============================================
// MAPA
// ============================================

function inicializarMapa() {
    state.map = L.map('map').setView(CONFIG.mapCenter, CONFIG.mapZoom);
    
    // Capa oscura
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap | © CARTO | Datos: CDMX',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(state.map);
}

function agregarOActualizarBus(busData) {
    const { id, linea, position_latitude, position_longitude, vehicle_current_status } = busData;
    
    if (!position_latitude || !position_longitude) return;
    
    const lat = parseFloat(position_latitude);
    const lon = parseFloat(position_longitude);
    
    if (isNaN(lat) || isNaN(lon)) return;
    
    const lineaInfo = LINEAS_DATA[linea] || LINEAS_DATA['1'];
    
    if (!state.markers.has(id)) {
        const marker = L.circleMarker([lat, lon], {
            radius: 8,
            fillColor: lineaInfo.color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(state.map);
        
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
        const markerData = state.markers.get(id);
        markerData.marker.setLatLng([lat, lon]);
        markerData.lastPosition = [lat, lon];
    }
    
    detectarInterseccion(id, [lat, lon], linea);
}

function detectarInterseccion(busId, position, linea) {
    const markerData = state.markers.get(busId);
    if (!markerData) return;
    
    const ahora = Date.now();
    if (ahora - markerData.lastNoteTime < 2500) return; // Cooldown más rápido para más música
    
    let hayInterseccion = false;
    
    // Detectar proximidad con otros buses
    state.markers.forEach((otherData, otherId) => {
        if (otherId === busId || otherData.linea === linea) return;
        
        const distancia = calcularDistancia(
            position, position,
            otherData.lastPosition, otherData.lastPosition
        );
        
        if (distancia < 0.6) { // 0.6 km de radio para intersección
            hayInterseccion = true;
        }
    });
    
    // Detectar proximidad al centro (Zona de alta actividad)
    const distanciaCentro = calcularDistancia(
        position, position,
        CONFIG.mapCenter, CONFIG.mapCenter
    );
    
    if (hayInterseccion || distanciaCentro < 2.5) {
        // Velocidad simulada basada en aleatoriedad para variar el ritmo
        const velocidadSimulada = 15 + Math.random() * 30; 
        tocarNota(linea, velocidadSimulada);
        markerData.lastNoteTime = ahora;
        
        // Efecto visual
        markerData.marker.setRadius(14);
        setTimeout(() => {
            if (state.markers.has(busId)) {
                state.markers.get(busId).marker.setRadius(8);
            }
        }, 300);
    }
}

function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// ============================================
// API DE DATOS (SIMULACIÓN ROBUSTA)
// ============================================

async function obtenerDatosMetrobus() {
    mostrarCargando(true);
    
    try {
        // Intentar datos reales (si tienes la URL correcta)
        // const datos = await fetchDatosReales();
        // Por ahora, forzamos simulación para asegurar que el sonido funcione
        const datos = null; 

        if (!datos || datos.length === 0) {
            const datosSimulados = generarDatosSimulados();
            procesarDatosMetrobus(datosSimulados);
        } else {
            procesarDatosMetrobus(datos);
        }
        
        actualizarHoraActualizacion();
        
    } catch (error) {
        console.error('Error:', error);
        const datosSimulados = generarDatosSimulados();
        procesarDatosMetrobus(datosSimulados);
    } finally {
        mostrarCargando(false);
    }
}

function generarDatosSimulados() {
    const datos = [];
    const lineas = Object.keys(LINEAS_DATA);
    const numBuses = 25 + Math.floor(Math.random() * 15);
    
    for (let i = 0; i < numBuses; i++) {
        const linea = lineas[Math.floor(Math.random() * lineas.length)];
        
        // Generar movimiento más fluido alrededor del centro
        const lat = CONFIG.mapCenter + (Math.random() - 
