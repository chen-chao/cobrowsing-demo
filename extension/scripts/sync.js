document.getElementByTagName('body').appendChild("<canvas id=\"cobrowsing-canvas\" ></canvas>");

const syncServer = 'ws://localhost:8090';
const ws = new WebSocket(syncServer);

ws.onopen = () => {
    console.log("WebSocket connection opened.");
    sendJoin(ws);
}

ws.onmessage = (event) => {
    var data = JSON.parse(event.data);
    handleMessage(ws, data);
}

ws.onclose = () => {
    console.log("WebSocket connection closed.");
}

function handleMessage(ws, data) {
    console.log(`${data.method}`);
    if (data.method === 'join') {
        handleJoin(ws, data);
    } else if (data.method === 'cursor') {
        handleCursor(data);
    } else {
        handleUnknown(ws, data);
    }
}

function sendJoin(ws) {
    ws.send(JSON.stringify({
        method: 'join',
        params: {
            role: 'extension',
            name: 'Sharer',
            color: 'red',
        }
    }));
}

function handleCursor(data) {
    // TODO: draw cursor on the canvas
}

function handleJoin(data) {
    // TODO: create a new peer element
}

function createPeer(ctx) {
    // Loop through the avatar data and draw avatars
    // TODO: avatars.addPeer;
    avatars.forEach((avatar) => {
        drawAvatar(avatar.x, avatar.y, avatar.radius);
    });
}

// Define avatar data (position and radius)
const avatars = [
    { x: 50, y: 50, radius: 20 },
    { x: 100, y: 100, radius: 15 },
    { x: 200, y: 150, radius: 25 },
    { x: 300, y: 200, radius: 18 },
    // Add more avatars as needed
];

// Function to draw a circular avatar
function drawAvatar(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = getRandomColor(); // You can customize the avatar's color
    ctx.fill();
    ctx.closePath();
}

// Function to generate a random color (for demonstration purposes)
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createCanvas() {
    var canvasElement = document.createElement('canvas');
    canvasElement.id = 'cobrowsing-canvas';
    canvasElement.style.position = 'absolute';
    canvasElement.style.top = '0';
    canvasElement.style.left = '0';
    canvasElement.style.zIndex = '9999';
    canvasElement.style.width = '100%';
    canvasElement.style.height = '100%';
    canvasElement.style.pointerEvents = 'none';
    canvasElement.style.backgroundColor = 'transparent';

    window.addEventListener('resize', () => {
        canvasElement.width = window.innerWidth;
        canvasElement.height = window.innerHeight;
        draw(canvasElement.getContext('2d'));
    });

    return canvasElement;
}

function draw(ctx) {
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'; // Red color with transparency
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}