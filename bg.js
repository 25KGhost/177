document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.createElement('canvas');
    document.body.prepend(canvas);
    canvas.classList.add('luxury-grid');
    const ctx = canvas.getContext('2d');

    const config = {
        gridSize: 120,
        lineThickness: 1,
        baseColor: 'rgba(230,143,172,0.1)', // Light pink
        highlightColor: 'rgba(230,143,172,0.15)', 
        perspective: 0.4,
        tiltAngle: 30,
        scrollFactor: 0.2,
        parallaxFactor: 0.5,
        animationSpeed: 0.03,
        glowIntensity: 0.3,
        fadeRadius: 0.7,
        dynamicOpacity: true,
        highDPI: true,
        pulseCount: 4,
        pulseSizeBase: 450,
        pulseSizeVariation: 250,
        pulseSpeed: 0.01,
        pulseColorChangeSpeed: 0.004,
        pulseBlurAmount: 41
    };

    let offsetX = 0, offsetY = 0, scrollY = 0, time = 0;
    let dpr = 1, width = window.innerWidth, height = window.innerHeight;

    // Offscreen canvas for pulses
    let pulseCanvas, pulseCtx;
    function initPulses() {
        pulseCanvas = document.createElement('canvas');
        pulseCtx = pulseCanvas.getContext('2d');
        pulseCanvas.width = width;
        pulseCanvas.height = height;
    }

    function initCanvas() {
        dpr = config.highDPI ? window.devicePixelRatio || 1 : 1;
        width = window.innerWidth;
        height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.setTransform(1,0,0,1,0,0);
        ctx.scale(dpr,dpr);
        ctx.lineWidth = config.lineThickness;

        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';

        initPulses();
    }

    function toRad(deg) { return deg * Math.PI / 180; }

    function getPerspectivePoint(x, y, z) {
        const scale = config.perspective / (config.perspective + z);
        const tiltRad = toRad(config.tiltAngle);
        const px = x * scale;
        const py = (y * Math.cos(tiltRad) + z * Math.sin(tiltRad)) * scale;
        return {x:px, y:py, scale};
    }

    function getPulseColor(progress) {
        // Pink and purple color variants
        const colors = [
            'hsla(330, 70%, 70%, 0.3)',  // Soft pink
            'hsla(310, 80%, 65%, 0.28)', // Pink-purple
            'hsla(290, 70%, 60%, 0.25)', // Light purple
            'hsla(270, 60%, 50%, 0.22)'  // Darker purple
        ];
        return colors[Math.floor(progress*colors.length)%colors.length];
    }

    function renderPulses() {
        pulseCtx.clearRect(0,0,width,height);
        const centerX = width/2, centerY = height/2;
        
        const timeFactor = time * config.pulseSpeed * 1.5;
        
        for(let i=0;i<config.pulseCount;i++){
            const angle = timeFactor + (i*2*Math.PI/config.pulseCount);
            const dist = Math.min(width,height)*0.35;
            
            const x = centerX + Math.cos(angle)*dist + Math.sin(time*0.003)*50;
            const y = centerY + Math.sin(angle*0.8)*dist*0.9 + Math.cos(time*0.002)*40;
            
            const size = config.pulseSizeBase + 
                         Math.sin(time*0.007+i)*config.pulseSizeVariation +
                         Math.cos(time*0.005+i*2)*50;

            const gradient = pulseCtx.createRadialGradient(x,y,size*0.2,x,y,size);
            gradient.addColorStop(0,getPulseColor((time*0.0015+i*0.2)%1));
            gradient.addColorStop(0.7,'rgba(230,143,172,0.15)'); // Midpoint color
            gradient.addColorStop(1,'transparent');

            pulseCtx.save();
            pulseCtx.translate(x,y);
            const scale = 0.6 + Math.sin(time*0.004+i)*0.1;
            pulseCtx.scale(scale,scale);
            pulseCtx.translate(-x,-y);

            pulseCtx.beginPath();
            pulseCtx.arc(x,y,size/scale,0,Math.PI*2);
            pulseCtx.fillStyle = gradient;
            pulseCtx.globalCompositeOperation='lighter';
            pulseCtx.filter = `blur(${config.pulseBlurAmount}px)`;
            pulseCtx.fill();
            pulseCtx.restore();
        }
    }

    function drawGrid() {
        const centerX = width/2, centerY = height/2;
        const maxDist = Math.max(width,height)*0.7;

        // Light pink background
        const bgGrad = ctx.createRadialGradient(centerX,centerY,0,centerX,centerY,maxDist);
        bgGrad.addColorStop(0,'rgba(255,240,245,0.98)');
        bgGrad.addColorStop(1,'rgba(255,230,240,0.95)');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0,0,width,height);

        ctx.drawImage(pulseCanvas,0,0);
    }

    let lastTime = 0;
    const fps = 60;
    const frameDuration = 1000/fps;

    function animate(timestamp) {
        if(!lastTime) lastTime = timestamp;
        const delta = timestamp - lastTime;

        if(delta > frameDuration){
            lastTime = timestamp - (delta % frameDuration);
            time++;
            renderPulses();
            drawGrid();
        }

        requestAnimationFrame(animate);
    }

    function handleScroll(){scrollY=window.scrollY||window.pageYOffset;}
    function handleMouseMove(e){offsetX=(e.clientX-width/2)*0.05;offsetY=(e.clientY-height/2)*0.02;}

    initCanvas();
    animate();

    window.addEventListener('resize',initCanvas);
    window.addEventListener('scroll',handleScroll);
    window.addEventListener('mousemove',handleMouseMove);
});