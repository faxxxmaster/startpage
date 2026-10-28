    const canvas = document.getElementById('matrix');
    const ctx = canvas.getContext('2d');
    let W, H, cols, drops;
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF';

    function init() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      cols = Math.floor(W / 16);
      drops = Array(cols).fill(1);
    }

    function draw() {
      ctx.fillStyle = 'rgba(2,12,4,0.05)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#00ff41';
      ctx.font = '14px Share Tech Mono, monospace';
      drops.forEach((y, i) => {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * 16, y * 16);
        if (y * 16 > H && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }

    init();
    setInterval(draw, 55);
    window.addEventListener('resize', init);
