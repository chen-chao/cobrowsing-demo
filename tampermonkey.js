(function () {
  "use strict";

  console.log("happy sharing!");

  let peers = [];

  const syncServer = "ws://localhost:8090";
  const ws = new WebSocket(syncServer);
  console.log(`ws: ${ws}`);

  // const canvas = createCanvas();
  // canvas.id = "canvas";
  // document.body.appendChild(canvas);
  // ctx = canvas.getContext('2d');

  // canvas.addEventListener('click', (event) => {
  //   createFirework(event.clientX, event.clientY);
  // });

  // let board = document.createElement('span');
  // board.id = 'board'
  // board.style.position = "absulute";
  // board.style.left = "0px";
  // board.style.right = "0px";
  // board.style.width = "100%";
  // board.style.height = "100%";
  // document.body.appendChild(board);

  ws.onopen = () => {
    console.log("WebSocket connection opened.");
    sendJoin(ws);
  };

  ws.onmessage = (event) => {
    console.log(`received event data: ${event.data}`);
    var data = JSON.parse(event.data);
    handleMessage(ws, data);
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed.");
  };

  function handleMessage(ws, data) {
    console.log(`${data.method}`);
    if (data.method === "join") {
      handleJoin(ws, data);
    } else if (data.method === "cursor") {
      handleCursor(ws, data);
    } else if (data.method === "click") {
      handleClick(data);
    }
    else {
      handleUnknown(ws, data);
    }
  }

  function sendJoin(ws) {
    ws.send(
      JSON.stringify({
        method: "join",
        params: {
          role: "extension",
          name: "Sharer",
          color: "red",
        },
      })
    );
  }

  function handleCursor(ws, payload) {
    let data = payload.params;
    console.log(data)
    // TODO: draw cursor on the canvas
    peers.forEach(peer => {
      if (peer.name != data.name) { return; }

      const cursor = document.getElementById('cursor' + data.name);
      if (!cursor) {
        console.log('cursor not found');
        return;
      }

      cursor.style.left = data.clientX + "px";
      console.log(data.clientX + "px")
      cursor.style.top = data.clientY + "px";
      console.log('cursor moved')
    })
  }

  function handleJoin(ws, payload) {
    let data = payload.params
    // TODO: create a new peer element
    peers.push({ 'name': data.name, 'color': data.color })

    let cursor = document.createElement('svg');
    cursor.setAttribute('height', '24')
    cursor.setAttribute('width', '24')
    cursor.setAttribute('viewBox', '0 0 24 24')
    cursor.setAttribute('fill', 'none')
    cursor.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
    let inner = document.createElement('path');
    inner.setAttribute('d', 'M5.5 3.48325C5.5 2.23498 6.93571 1.53286 7.92098 2.29927L21.4353 12.8116C22.5626 13.6885 21.9425 15.4956 20.5143 15.4956H13.6619C13.1574 15.4956 12.6806 15.7264 12.3676 16.1222L8.17661 21.4224C7.2945 22.538 5.5 21.9142 5.5 20.492L5.5 3.48325ZM20.5143 13.9956L7 3.48325L7 20.492L11.191 15.1918C11.7884 14.4363 12.6987 13.9956 13.6619 13.9956H20.5143Z');
    inner.setAttribute('fill', 'red');
    cursor.appendChild(inner);
    let wrapper = document.createElement('div');
    wrapper.style.width = "24px";
    wrapper.style.height = "24px";
    wrapper.style.position = "absolute";
    wrapper.style.left = "100px";
    wrapper.style.top = "50px";
    wrapper.style.zIndex = "999";
    wrapper.style.backgroundColor = data.color;
    wrapper.id = "cursor" + data.name;
    wrapper.appendChild(cursor);
    document.body.appendChild(wrapper);
  }

  function handleClick(data) {
    var x = data.params.x;
    var y = data.params.y;
  }

  function handleUnknown(ws, data) {
    // TODO
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

    return canvasElement;
  }

  function createFirework(x, y) {
    const firework = {
      x,
      y,
      particles: [],
    };

    for (let i = 0; i < 50; i++) {
      firework.particles.push({
        x,
        y,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 5 + 1,
        radius: Math.random() * 2 + 1,
        opacity: 1,
        fadeOut: Math.random() * 0.03 + 0.02,
      });
    }

    fireworks.push(firework);
  }

  function drawFirework(firework) {
    firework.particles.forEach((particle, index) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${index * 5}, 100%, 50%, ${particle.opacity})`;
      ctx.fill();
      ctx.closePath();

      particle.x += Math.cos(particle.angle) * particle.speed;
      particle.y += Math.sin(particle.angle) * particle.speed;
      particle.opacity -= particle.fadeOut;
    });
  }

  const fireworks = [];

  canvas.addEventListener('click', (event) => {
    const x = event.clientX;
    const y = event.clientY;

    createFirework(x, y);
  });

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    fireworks.forEach((firework, index) => {
      drawFirework(firework);

      if (firework.particles[0].opacity <= 0) {
        fireworks.splice(index, 1);
      }
    });
  }

  animate();
})();
