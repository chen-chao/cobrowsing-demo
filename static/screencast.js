// const imageElement = document.getElementById('screencast');
const host = window.location.hostname;
const port = window.location.port;
const syncServer = `ws://${host}:${port}`;
const socket = new WebSocket(syncServer);

socket.onopen = () => {
    console.log('WebSocket connection opened.');
    sendJoin();

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
        var {x, y} = getAbsolutePosition(imageElement);

        // if (event.clientX < x || event.clientX > x + imageElement.width || event.clientY < y || event.clientY > y + imageElement.height) {
        //     return;
        // }

        socket.send(JSON.stringify({
            method: 'cursor',
            params: {
                clientX: event.clientX - x,
                clientY: event.clientY - y,
                screenX: event.screenX,
                screenY: event.screenY,
                movementX: event.movementX,
                movementY: event.movementY,
            }}));
    });    
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

function getAbsolutePosition(element) {
    let x = 0;
    let y = 0;

    while (element) {
        x += element.offsetLeft - element.scrollLeft + element.clientLeft;
        y += element.offsetTop - element.scrollTop + element.clientTop;
        element = element.offsetParent;
    }

    return { x, y };
}