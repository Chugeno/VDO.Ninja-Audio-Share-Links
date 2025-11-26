// DOM Elements
const els = {
    roomName: document.getElementById('roomName'),
    sessionPassword: document.getElementById('sessionPassword'),
    clientLabel: document.getElementById('clientLabel'),
    btnNewSession: document.getElementById('btnNewSession'),
    audioBitrate: document.getElementById('audioBitrate'),
    buffer: document.getElementById('buffer'),
    sampleRate: document.getElementById('sampleRate'),
    stereo: document.getElementById('stereo'),
    videoEnabled: document.getElementById('videoEnabled'),

    hostLink: document.getElementById('hostLink'),
    guestLink: document.getElementById('guestLink'),
    copyButtons: document.querySelectorAll('.btn-copy')
};

// State
const STATE_KEY = 'vdo_ninja_config';
const SALT = 'vdo.ninja'; // Required by VDO.Ninja for hashing

// --- Core Logic ---

function generatePassword(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'; // No ambiguous chars
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// VDO.Ninja compatible hashing (SHA-256 -> Hex -> Truncate)
async function generateHash(password) {
    if (!password) return '';

    // Logic reversed from VDO.Ninja's changepass.html
    const str = encodeURIComponent(password.trim()) + SALT;
    const buffer = new TextEncoder("utf-8").encode(str);

    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // VDO.Ninja typically uses the first 4 characters (2 bytes) for short hashes,
    // but supports longer. We'll use 8 characters for a good balance of security/shortness.
    return hashHex.substring(0, 8);
}

// --- URL Construction ---

async function updateLinks() {
    const room = els.roomName.value.trim() || 'MyStudio';
    const password = els.sessionPassword.value.trim();

    if (!password) {
        els.hostLink.value = 'Generando...';
        els.guestLink.value = 'Generando...';
        return;
    }

    // 1. Build Host URL
    // Base parameters
    let hostParams = new URLSearchParams();
    hostParams.append('room', room);
    hostParams.append('password', password); // Host uses the real password
    hostParams.append('push', room + '_Host'); // Explicit Push ID to identify as Host

    // Audio Settings
    hostParams.append('audiobitrate', els.audioBitrate.value);
    // hostParams.append('audiolatency', els.audioLatency.value);
    hostParams.append('micsamplerate', els.sampleRate.value); // Host mic sample rate
    if (els.stereo.checked) hostParams.append('stereo', '1');
    // Codec: VDO.Ninja uses Opus for live audio. PCM is only for recordings (&pcm).
    // We remove the codec parameter to avoid confusion as 'pcm' won't work for live transport.

    // Video Settings
    if (!els.videoEnabled.checked) {
        hostParams.append('videodevice', '0'); // Correctly disables camera source
    }

    // UX
    hostParams.append('label', room); // Host Label = Room Name (User Request)
    hostParams.append('autostart', '1'); // Skip "Click to Start"

    // 2. Build Guest URL
    // const hash = await generateHash(password); // Hash replaced by direct password per user request

    let guestParams = new URLSearchParams();
    guestParams.append('room', room);
    guestParams.append('password', password); // Guest uses the password directly for easy access
    guestParams.append('label', els.clientLabel.value.trim() || 'CLIENTE'); // Custom Guest Label
    guestParams.append('autostart', '1');
    // Guest sends low quality audio (talkback), but receives high quality from Host.
    guestParams.append('audiobitrate', '32'); // Restrict Guest mic to 32kbps (Talkback quality)
    guestParams.append('buffer', els.buffer.value); // Add buffer to Guest URL
    guestParams.append('samplerate', els.sampleRate.value); // Guest playback sample rate

    // Construct final URLs
    const baseUrl = 'https://vdo.ninja/';
    els.hostLink.value = `${baseUrl}?${hostParams.toString()}`;
    els.guestLink.value = `${baseUrl}?${guestParams.toString()}`;

    saveConfig();
}

// --- Persistence ---

function saveConfig() {
    const config = {
        roomName: els.roomName.value,
        clientLabel: els.clientLabel.value,
        audioBitrate: els.audioBitrate.value,
        buffer: els.buffer.value,
        sampleRate: els.sampleRate.value,
        stereo: els.stereo.checked,
        videoEnabled: els.videoEnabled.checked,

    };
    localStorage.setItem(STATE_KEY, JSON.stringify(config));
}

function loadConfig() {
    const saved = localStorage.getItem(STATE_KEY);
    if (saved) {
        const config = JSON.parse(saved);
        if (config.roomName) els.roomName.value = config.roomName;
        if (config.clientLabel) els.clientLabel.value = config.clientLabel;
        if (config.audioBitrate) els.audioBitrate.value = config.audioBitrate;
        if (config.buffer) els.buffer.value = config.buffer;
        if (config.sampleRate) els.sampleRate.value = config.sampleRate;
        if (config.stereo !== undefined) els.stereo.checked = config.stereo;
        if (config.videoEnabled !== undefined) els.videoEnabled.checked = config.videoEnabled;

    }
}

// --- Initialization ---

function init() {
    loadConfig();

    // Generate initial password if empty
    if (!els.sessionPassword.value) {
        els.sessionPassword.value = generatePassword();
    }

    updateLinks();

    // Event Listeners
    const inputs = [els.roomName, els.clientLabel, els.audioBitrate, els.buffer, els.sampleRate, els.stereo, els.videoEnabled];
    inputs.forEach(input => input.addEventListener('input', updateLinks));
    inputs.forEach(input => input.addEventListener('change', updateLinks));

    els.btnNewSession.addEventListener('click', () => {
        els.sessionPassword.value = generatePassword();
        updateLinks();
    });

    // Copy Buttons
    els.copyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);

            input.select();
            input.setSelectionRange(0, 99999); // Mobile
            navigator.clipboard.writeText(input.value).then(() => {
                const originalText = btn.innerText;
                btn.innerText = '¡Copiado!';
                setTimeout(() => btn.innerText = originalText, 2000);
            });
        });
    });
}

// Start
init();
