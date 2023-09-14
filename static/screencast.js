// const imageElement = document.getElementById('screencast');
const host = window.location.hostname;
const port = window.location.port;
const syncServer = `ws://${host}:${port}`;
const socket = new WebSocket(syncServer);

document.addEventListener('click', (event) => {
    var imageElement = document.getElementById("screencast");
    var imageRect = imageElement.getBoundingClientRect();

    socket.send(JSON.stringify({
        method: 'click',
        params: {
            x: event.clientX,
            y: event.clientY,
            width: imageRect.width,
            height: imageRect.height,
        }}));
});

document.addEventListener('mousemove', (event) => {
    var imageElement = document.getElementById("screencast");
    var imageRect = imageElement.getBoundingClientRect();
    socket.send(JSON.stringify({
        method: 'cursor',
        params: {
            clientX: event.clientX,
            clientY: event.clientY,
            screenX: event.screenX,
            screenY: event.screenY,
            movementX: event.movementX,
            movementY: event.movementY,
            width: imageRect.width,
            height: imageRect.height,
        }}));
});

socket.onopen = () => {
    console.log('WebSocket connection opened.');
    sendJoin();
};

socket.onmessage = (event) => {
    // console.log(`Received: ${event.data}`);
    var data = JSON.parse(event.data);
    console.log(`${data.method}`);
    if (data.method === 'Page.screencastFrame') {
        document.getElementById('screencast').src = `data:image/jpeg;base64,${data.params.data}`;
    }
    // outputDiv.innerHTML = `Received: ${event.data}`;
};

socket.onclose = () => {
    console.log('WebSocket connection closed.');
    // outputDiv.innerHTML = 'WebSocket connection closed.';
};

// Send a message to the server
function sendJoin() {
    socket.send(JSON.stringify({
        method: 'join',
        params: {
            role: 'peer',
            name: 'peer1',
            color: 'red',
        }
    }));
}

function sendCursor() {
    socket.send(JSON.stringify({
        method: 'cursor',
        params: {
            x: 10,
            y: 10,
        }
    }));
}

function sendClick() {
    socket.send(JSON.stringify({
        method: 'click',
        params: {
            x: 10,
            y: 10,
        }
    }));
}