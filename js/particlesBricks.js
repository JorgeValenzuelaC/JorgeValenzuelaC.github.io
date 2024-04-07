/*
el bug de la bola pasando en vertical cerca de las esquinas y rompiendo varios bloques a la vez
es una consecuencia del problema de la mala deteccion de si la colision es en vertical o horizontal
ya que la bola tiene muy poca componente x de dirección, entonces al invertir esta pareciera que
no está cambiando nada en su movimiento, pero realmente es que lo está detectando como una colisión
horizontal, cuando debería ser vertical e invertir su direccion y
*/
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

var audioElement = document.getElementById("theAudio");

window.addEventListener('load',function(){
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.style.width ='100%';
    canvas.style.height='94%';
    canvas.width = canvas.offsetWidth;  
    canvas.height = canvas.offsetHeight;
    ctx.font = "45px Montserrat";
    const points = 0
    var fps, fpsInterval, startTime, now, then, elapsed;

    class Powerup {
        constructor(handler,posGenX,posGenY){
            this.type = getRandomInt(3);
            this.x=posGenX;
            this.y=posGenY;
            this.sizeX=25;
            this.sizeY=12;
            this.enlarger=20;
            this.delarger=20;
        }
        draw(context){
            context.font = "10px Montserrat";
            switch(this.type){
                case 0:
                    context.fillStyle = 'rgb(50,50,255)';
                    context.fillRect(this.x,this.y,this.sizeX,this.sizeY);
                    context.fillStyle = 'rgb(0,0,0)'
                    context.fillText("E", this.x+this.sizeX/3, this.y+this.sizeY-2);
                    break;
                case 1:
                    context.fillStyle = 'rgb(255,50,50)';
                    context.fillRect(this.x,this.y,this.sizeX,this.sizeY);
                    context.fillStyle = 'rgb(0,0,0)'
                    context.fillText("D", this.x+this.sizeX/3, this.y+this.sizeY-2);
                    break;
                case 2:
                    context.fillStyle = 'rgb(50,255,50)'
                    context.fillRect(this.x,this.y,this.sizeX,this.sizeY);                  
                    context.fillStyle = 'rgb(0,0,0)'
                    context.fillText("M", this.x+this.sizeX/3, this.y+this.sizeY-2);
                    break;
            }

        }
        update(context){
            this.y+=2
        }
    }

    class Ball {
        constructor(handler,posGenX,posGenY,index){
            this.ballIndex = index;
            this.handler = handler;
            this.powerup_prob = 0.05
            this.x = posGenX;
            this.y = posGenY;
            this.radius = 8;
            this.bornCooldown = 0;
            this.angle = Math.PI + (Math.PI/4 + (Math.PI/2*Math.random())) * Math.sign((1-2*Math.random()))
            this.direction = {
                x: Math.cos(this.angle),
                y: Math.sin(this.angle),
                vx: 6,
                vy: 6,
            }
            
            this.onCooldown = false
            this.timeOnCooldown = 0
        }
        draw(context){
            context.fillStyle = 'rgb(255,255,255)';
            context.fillRect(this.x,this.y,this.radius,this.radius);
        }
        update(context){
            if (this.timeOnCooldown>10){
                this.timeOnCooldown = 0;
                this.onCooldown = false
            }
            //colisión con el arkanoid
            if(Math.abs(this.x + this.radius/2 - this.handler.arkanoidArray[0].x - this.handler.arkanoidArray[0].sizeX/2) < this.handler.arkanoidArray[0].sizeX/2 && Math.abs(this.y+ this.radius/2 -this.handler.arkanoidArray[0].y - this.handler.arkanoidArray[0].sizeY/2) < this.handler.arkanoidArray[0].sizeY/2 && this.onCooldown == false){
                
                this.direction.y *= -1;
                this.direction.x = (this.x + this.radius/2 - this.handler.arkanoidArray[0].x - this.handler.arkanoidArray[0].sizeX/2) / (this.handler.arkanoidArray[0].sizeX/2);
                this.onCooldown = true;
                //reproducir sonido
                audioElement.play()
            }
            for(let i=0; i<this.handler.particleArray.length; i++){

                if(Math.floor(Math.abs(this.x + this.radius/2 - (this.handler.particleArray[i].x + this.handler.gapx/2))) < this.radius/2 + this.handler.gapx/2 && Math.floor(Math.abs(this.y + this.radius/2 - (this.handler.particleArray[i].y + this.handler.gapy/2))) < this.radius/2 + this.handler.gapy/2){
                    //colision en vertical:
                    if(Math.floor(Math.abs(this.x + this.radius/2 - (this.handler.particleArray[i].x + this.handler.gapx/2))) < this.handler.gapx/2){
                        //revisar si se puede generar otra bola
                        if(this.bornCooldown>15){
                            if(this.handler.ballArray.length < this.handler.maxBalls){
                                //this.handler.ballArray.push(new Ball(this.handler,this.x,this.y,this.handler.ballArray.length));
                            }
                            this.handler.particleArray.splice(i,1);
                            if(Math.random()>1-this.powerup_prob){
                                this.handler.PowerupArray.push(new Powerup(this.handler,this.x,this.y))
                            }
                            this.handler.points++;
                        }
                        //reproducir sonido
                        audioElement.play()
                        this.direction.y *= -1;
                        break;
                    }
                    //colision en horizontal:
                    if(Math.floor(Math.abs(this.y + this.radius/2 - (this.handler.particleArray[i].y + this.handler.gapy/2))) < this.handler.gapy/2){
                        //revisar si se puede generar otra bola
                        if(this.bornCooldown>15){
                            if(this.handler.ballArray.length < this.handler.maxBalls){
                                //this.handler.ballArray.push(new Ball(this.handler,this.x,this.y,this.handler.ballArray.length));
                            }
                            this.handler.particleArray.splice(i,1);
                            if(Math.random()>1-this.powerup_prob){
                                this.handler.PowerupArray.push(new Powerup(this.handler,this.x,this.y))
                            }
                            this.handler.points++;
                        }
                        //reproducir sonido
                        audioElement.play()
                        this.direction.x *= -1;
                        break;
                    }    
                }
            }
            if(this.x<1 || this.x < this.handler.leftLimit + 10 || this.x>handler.width-1 || this.x + this.radius/2 > this.handler.rightLimit){
                this.direction.x *= -1;
            }
            if(this.y<1){
                this.direction.y *= -1;
            }
            if(this.y > this.handler.height-1){
                if (this.handler.ballArray.length <= 1){
                    window.location.href = window.location.href.split('#')[0];
            }
            else{
                this.handler.ballsToDelete.push(this.ballIndex)
                       
            }
            }
            this.x += this.direction.x * this.direction.vx;
            this.y += this.direction.y * this.direction.vy;
            this.timeOnCooldown++;
            this.bornCooldown++;
        }
    }

    class Arkanoid {
        constructor(handler){
            this.handler = handler
            this.sizeX = 100;
            this.sizeY = 10;
            this.x = this.handler.centerX - (this.sizeX/2);
            this.y = this.handler.centerY + 3*this.handler.centerY/4
            this.vx = 8;
            this.inertia = 0;
            this.lastfacing = 0
        }
        draw(context){
            context.fillStyle = 'rgb(230,230,230)';
            context.fillRect(this.x,this.y,this.sizeX,this.sizeY);
            
        }
        update(){
            for(let i = 0; i<this.handler.PowerupArray.length; i++){
                if(this.handler.PowerupArray[i].y + this.handler.PowerupArray[i].sizeY > this.y && this.handler.PowerupArray[i].y < this.y+this.sizeY && this.handler.PowerupArray[i].x + this.handler.PowerupArray[i].sizeX>this.x && this.handler.PowerupArray[i].x < this.x+this.sizeX){
                    switch(this.handler.PowerupArray[i].type){
                        case 0:
                            this.sizeX+=this.handler.PowerupArray[i].enlarger
                            this.x-=this.handler.PowerupArray[i].enlarger/2
                            this.handler.PowerupArray.splice(i,1)
                            i--;
                            break;
                        case 1:
                            this.sizeX-=this.handler.PowerupArray[i].delarger
                            this.x+=this.handler.PowerupArray[i].delarger/2
                            this.handler.PowerupArray.splice(i,1)
                            i--;
                            break;
                        case 2:
                            this.handler.ballArray.forEach((ball) => {
                                if(this.handler.ballArray.length < this.handler.maxBalls){
                                    this.handler.ballArray.push(new Ball(this.handler,ball.x,ball.y,this.handler.ballArray.length));
                                    this.handler.ballArray.push(new Ball(this.handler,ball.x,ball.y,this.handler.ballArray.length));
                                }
                            })
                            this.handler.PowerupArray.splice(i,1)
                            i--;
                            break;
                        }
                }
            }
            if (this.handler.keypressed.key == 'd' || this.handler.keypressed.key == 'ArrowRight'){
                if (this.x + this.sizeX >= this.handler.width || this.x + this.sizeX >= this.handler.rightLimit){
                    if(this.handler.rightLimit>this.handler.width){
                        this.x = this.handler.width - this.sizeX;
                    }
                    else{
                        this.x = this.handler.rightLimit - this.sizeX;
                    }
                    this.inertia = 0;
                }
                else{
                    this.x += this.vx ;
                    this.lastfacing = 1
                    this.inertia = this.vx;   
                }
            }
            if (this.handler.keypressed.key == 'a' || this.handler.keypressed.key == 'ArrowLeft' ){
                if (this.x <= 0 || this.x <= this.handler.leftLimit+10){
                    if(this.handler.leftLimit < 0){
                        this.x = 0;
                    }
                    else{
                        this.x = this.handler.leftLimit+10
                    }
                    this.inertia = 0; 
                }
                else{ 
                    this.x -= this.vx ;
                    this.lastfacing = -1;
                    this.inertia = this.vx;
                }
                }  
            
            if (this.handler.keypressed.keyup == true){
                if (this.x < 0 || this.x < this.handler.leftLimit + 10 || this.x + this.sizeX > this.handler.width || this.x + this.sizeX > this.handler.rightLimit){
                    this.inertia = 0; 
                }
                else{
                    this.inertia -= 1.5

                    if(this.inertia < 0 ) {this.inertia = 0}
                    if(this.inertia > this.vx) {this.inertia = this.vx}

                    this.x += this.inertia * this.lastfacing
                
                    this.handler.keypressed.key = 'none'
                } 
            }
        }
        }

    class Particle {
        constructor(handler, x, y, color){
            this.handler = handler;
            this.x = Math.random() * this.handler.width;
            this.y = Math.random() * this.handler.height;
            //this.x = 0;
            //this.y = 0;
            this.originX = Math.floor(x);
            this.originY = Math.floor(y);
            this.color = color;
            this.size = this.handler.gap-1;
            this.sizeX = this.handler.gapx-1; 
            this.sizeY = this.handler.gapy-1;
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
            
            this.dx = this.handler.mouse.x - this.x;
            this.dy = (this.handler.mouse.y-56) - this.y;
            this.distance = this.dx * this.dx + this.dy * this.dy;
            this.force = -this.handler.mouse.radius / this.distance;

            if( this.distance < this.handler.mouse.radius){
                this.angle = Math.atan2(this.dy,this.dx);
                this.vx += this.force * Math.cos(this.angle);
                this.vy += this.force * Math.sin(this.angle);
            }

            this.x += (this.vx *= this.friction) + (this.originX - this.x) * this.ease
            this.y += (this.vy *= this.friction) + (this.originY - this.y) * this.ease
        }
    }

    class Handler {
        constructor(width,height){
            this.width = width
            this.height = height
            this.maxBalls = 500;
            this.particleArray = []
            this.arkanoidArray = []
            this.ballArray = []
            this.PowerupArray=[]
            this.total_images = 6
            this.imageNumber= Math.floor(Math.random()*this.total_images)+1
            this.image = document.getElementById('image'+this.imageNumber.toString());
            this.centerX = this.width * 0.5;
            this.centerY = this.height * 0.5;
            this.x = this.centerX - this.image.width * 0.5;
            this.y = this.centerY/2 - this.image.height * 0.35;
            this.rightLimit = this.centerX + 350;
            this.leftLimit = this.centerX - 350;
            this.gap = 10;
            this.gapy = 10;
            this.gapx = 20;
            this.points = points
            this.ballsToDelete=[]
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
                this.mouse.x = event.x;
                this.mouse.y = event.y;
            
            });
            window.addEventListener('keydown', event => {
                this.keypressed.key = event.key;
                this.keypressed.keyup = false;

            });
            window.addEventListener('keyup', event => {
                this.keypressed.keyup = true;
            });
            window.addEventListener('touchstart', event => {
                if(event.touches[0].clientX > this.width / 2 ){
                    this.keypressed.key = 'd';
                    this.keypressed.keyup = false;
                }
                else{
                    this.keypressed.key = 'a';
                    this.keypressed.keyup = false;
                }
            });
            window.addEventListener('touchend', event => {
                this.keypressed.keyup = true;
            });
        }
        init(context){
            context.drawImage(this.image, this.x, this.y);
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
            this.arkanoidArray.push(new Arkanoid(this));
            this.ballArray.push(new Ball(this,this.centerX,13*this.height/16,0));
        }
        draw(context){
            this.particleArray.forEach(particle => particle.draw(context));
            this.arkanoidArray.forEach(arkanoid => arkanoid.draw(context));
            this.ballArray.forEach(ball => ball.draw(context));
            this.PowerupArray.forEach(powerup => powerup.draw(context));
            context.fillStyle = 'rgb(255,255,255)';
            context.fillRect(this.rightLimit,0,10,this.height);
            context.fillRect(this.leftLimit,0,10,this.height);
            ctx.font = "45px Montserrat";
            context.fillText(this.points.toString(), 35, 60,)
            if (this.particleArray.length==0){
                ctx.font = "70px Montserrat";
                context.fillText("Well Done!", this.centerX - context.measureText("Well Done!").width / 2, this.centerY-50,)
                ctx.font = "50px Montserrat";
                context.fillText("press F5", this.centerX - context.measureText("press F5").width / 2, this.centerY + 50,)
            }
        }
        update(){
            this.particleArray.forEach(particle => particle.update());
            this.arkanoidArray.forEach(arkanoid => arkanoid.update());
            this.ballArray.forEach(ball => ball.update());
            this.PowerupArray.forEach(powerup => powerup.update());
            this.ballsToDelete.forEach(index => this.ballArray.splice(index,1));
            this.ballsToDelete = []
            this.ballArray.forEach(ball => ball.ballIndex = this.ballArray.indexOf(ball))
        }
    }

    const handler = new Handler(canvas.width, canvas.height, points);
    handler.init(ctx);
    
    
    function animate(){
        requestAnimationFrame(animate);

        now = Date.now();
        elapsed = now - then;

        if (elapsed > fpsInterval) {
            ctx.clearRect(0,0,canvas.width,canvas.height)
            handler.draw(ctx);
            handler.update();
            then = now - (elapsed % fpsInterval);
        }   
    }
    fps=60;
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
});