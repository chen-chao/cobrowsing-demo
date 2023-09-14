(function () {
  "use strict";

  console.log("happy sharing!");

  const syncServer = "ws://localhost:8090";
  const ws = new WebSocket(syncServer);
  console.log(`ws: ${ws}`);

  const canvas = createCanvas();
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');

  canvas.addEventListener('click', (event) => {
    createFirework(event.clientX, event.clientY);
  });

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
      handleCursor(data);
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

  function handleCursor(data) {
    // TODO: draw cursor on the canvas
  }

  function handleJoin(data) {
    // TODO: create a new peer element
  }

function handleClick(data) {
  var x = data.params.x;
  var y = data.params.y;

  createFirework(x, y);
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
