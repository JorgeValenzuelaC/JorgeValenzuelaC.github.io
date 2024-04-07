window.addEventListener('load',function(){
    const canvas = document.getElementById('canvas2');
    canvas.style.width ='100%';
    canvas.style.height='100%';
    canvas.width = canvas.offsetWidth;  
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');

    var stop = false;
    var frameCount = 0;
    var $results = $("#results");
    var fps, fpsInterval, startTime, now, then, elapsed;

    ctx.font = "45px Montserrat";

    class Particle {
        constructor(effect, x, y, color){
            this.effect = effect;
            this.x = Math.random() * this.effect.width;
            this.y = Math.random() * this.effect.height;
            //this.x = 0;
            //this.y = 0;
            this.originX = Math.floor(x);
            this.originY = Math.floor(y)+50;
            this.color = color;
            this.size = this.effect.gap-1;
            this.sizeX = this.effect.gapx-1; 
            this.sizeY = this.effect.gapy-1;
            this.vx = 0;
            this.vy = 0;
            this.ease = 0.1;
            this.dx = 0;
            this.dy = 0;
            this.distance = 0;
            this.force = 0;
            this.angle = 0;
            this.friction = 0.8;
            this.timeSinceUnpressed = 0;
        }
        draw(context){
            context.fillStyle = this.color;
            context.fillRect(this.x,this.y,this.sizeX,this.sizeY);
            
        }
        update(){
            
            this.dx = (this.effect.mouse.x) - this.x;
            this.dy = (this.effect.mouse.y) - this.y;
            this.distance = this.dx * this.dx + this.dy * this.dy;
            this.force = -this.effect.mouse.radius / this.distance;

            if( this.distance < this.effect.mouse.radius){
                this.angle = Math.atan2(this.dy,this.dx);
                this.vx += this.force * Math.cos(this.angle);
                this.vy += this.force * Math.sin(this.angle);
            }
            else{
                if(this.effect.onRepulse == 1){
                    this.dx = (canvas.width/2) - this.x
                    this.dy = (canvas.height/2) - this.y
                    this.distance = this.dx*this.dx + this.dy * this.dy
                    switch(this.effect.repulseType){
                        case 0:
                            this.force = -this.distance/50000;
                            break;
                        case 1:
                            this.force = -5*Math.cos(this.distance);
                            break;
                        case 2:
                            this.force = -0.5*(Math.log(this.distance%2));
                            break;
                    }


                    this.angle = Math.atan2(this.dy, this.dx);
                    this.vx += this.force * Math.cos(this.angle);
                    this.vy += this.force * Math.sin(this.angle);
                }
            }
            this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease
            this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease
        }
    }

    class Effect {
        constructor(width,height){
            this.width = width
            this.height = height
            this.particleArray = []
            this.arkanoidArray = []
            this.ballArray = []
            this.onRepulse = 0;
            this.repulseTimer = 0;
            this.repulseType = 0;
            this.image = document.getElementById('image1');
            this.centerX = this.width * 0.5;
            this.centerY = this.height * 0.5;
            this.x = this.centerX - this.image.width * 0.5;
            this.y = this.centerY/2 - this.image.height * 0.35;
            this.gap = 5;
            this.gapy = 7;
            this.gapx = 7;
            this.mouse = {
                radius: 3000,
                x: undefined,
                y: undefined
            }
            this.keypressed = {
                key: 'none',
                keyup: false
            }
            window.addEventListener('mousemove', event =>{
                this.mouse.x = event.x-this.width-30;
                this.mouse.y = event.y-50;
            
            });
            
        }
        init(context){
            context.drawImage(this.image, this.x, this.y+50);
            const pixels = context.getImageData(0,0,this.width,this.height).data;
            for (let y = 0; y<this.height; y+=this.gapy){
                for(let x=0; x<this.width; x+=this.gapx){
                    const index = (y * this.width + x) * 4;
                    const red = pixels[index];
                    const blue = pixels[index+1];
                    const green = pixels[index+2];
                    const alpha = pixels[index+3];
                    const color = 'rgb('+ red + ',' + blue + ',' + green + ')'
                    
                    if(alpha > 0){
                        this.particleArray.push(new Particle(this, x, y, color));
                    }
                }
            }
        }
        draw(context){
            this.particleArray.forEach(particle => particle.draw(context));
        }
        update(){
            this.particleArray.forEach(particle => particle.update());
            
            this.repulseTimer += 1;

            if (this.repulseTimer>=600 & this.onRepulse == 0){
                this.repulseTimer = 0;
                this.onRepulse = 1;
                this.repulseType = Math.floor(Math.random() * 3)
            }
            else if (this.repulseTimer>=50 & this.onRepulse == 1){
                this.repulseTimer = 0;
                this.onRepulse = 0;
            }

        }
    }

    const effect = new Effect(canvas.width, canvas.height);
    effect.init(ctx);
    
    
    function animate(time){
        requestAnimationFrame(animate);

        now = Date.now();
        elapsed = now - then;

        if (elapsed > fpsInterval) {
            ctx.clearRect(0,0,canvas.width,canvas.height)
            effect.draw(ctx);
            effect.update();
            then = now - (elapsed % fpsInterval);
        }
    }

    fps=60;
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
});