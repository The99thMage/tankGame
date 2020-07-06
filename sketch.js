var tankBase, tankBase_img;
var tankTurret, tankTurret_img;
var tankShell, tankShells, tankShell_img;
var paratrooper, paratroopers, paratrooper_img;
var shells, cooldown, score, lives, hazardLevel;
var cloud, cloud_img, cloudTimer;
var medic, medics, medic_img;

function summonParatrooper(hazardReq, frequency, minSpeed, maxSpeed){
  if(hazardLevel < hazardReq && hazardLevel + 20 > hazardReq &&
    frameCount % frequency === 0){
    paratrooper = createSprite(random(50, 400), -50);
    paratrooper.addSpeed(random(minSpeed, maxSpeed), 90);
    paratrooper.addImage("paratrooper", paratrooper_img);
    paratrooper.scale = 0.2;
    paratroopers.push(paratrooper);
  }

  if(hazardLevel === "MAX" && frameCount % 100 === 0){
    paratrooper = createSprite(random(50, 400), -50);
    paratrooper.addSpeed(random(minSpeed, maxSpeed), 90);
    paratrooper.addImage("paratrooper", paratrooper_img);
    paratrooper.scale = 0.15;
    paratroopers.push(paratrooper);
  }
}

function summonMedic(hazardReq, minSpeed, maxSpeed){
  if(hazardLevel > hazardReq && frameCount % 200 === 0){
    medic = createSprite(random(50, 400), -50);
    medic.addSpeed(random(minSpeed, maxSpeed), 90);
    medic.addImage("medic", medic_img);
    medic.scale = 0.2;
    medics.push(medic);
  }
}

function preload(){
  tankBase_img = loadImage("sprites/Body.png");
  tankTurret_img = loadImage("sprites/Turret.png");
  tankShell_img = loadImage("sprites/Shell.png");
  paratrooper_img = loadImage("sprites/Paratrooper.png");
  medic_img = loadImage("sprites/Medic.png");
  cloud_img = loadImage("sprites/Cloud.png");
}

function setup() {
  //setup
  createCanvas(600, 400);

  tankShells = [];
  paratroopers = [];
  medics = [];
  shells = 5;
  cooldown = 0;
  score = 0;
  lives = 5;
  hazardLevel = 0;
  cloudTimer = 80;

  //create the 2 main sprites
  tankBase = createSprite(500, 335);
  tankBase.addImage("base", tankBase_img);
  tankBase.scale = 0.25;

  tankTurret = createSprite(450, 320);
  tankTurret.addImage("turret", tankTurret_img);
  tankTurret.scale = 0.25;
}

function draw() {
  //draw background
  background(100, 100, 255);

  //"ground"
  fill(100, 255, 100);
  rect(0, 360, 600, 40);

  //draw sprites
  drawSprites();

  //tilt the turret with arrow keys
  if(keyDown("right") && tankTurret.rotation < 50){
    tankTurret.rotation += 1;
    tankTurret.y -= 0.5;
    tankTurret.x += 0.25;
  }
  if(keyDown("left") && tankTurret.rotation > -5){
    tankTurret.rotation -= 1;
    tankTurret.y += 0.5;
    tankTurret.x -= 0.25;
  }

  //fire a shot
  if(keyDown("space") && (shells > 0 || shells === "INFINITE")&& cooldown === 0){
    tankShell = createSprite(tankTurret.x - 25, tankTurret.y - (tankTurret.rotation / 2.5) + 1, 20, 10);
    tankShell.rotation = tankTurret.rotation;
    tankShell.addImage("shell", tankShell_img);
    tankShell.scale = 0.025;

    tankShell.addSpeed(-15, tankShell.rotation);
    tankShells.push(tankShell);

    cooldown = 15;
    if(hazardLevel !== "INFINITE"){
      shells--;
    }
  }

  //add shells
  if(frameCount % 50 === 0 && shells < 5 && hazardLevel !== "INFINITE"){
    shells++;
  }

  //cooldown time
  if(cooldown > 0){
    cooldown--;
  }

  //display score/shells
  fill(0);
  textSize(17);
  textAlign(CENTER);
  text("Score: " + score + " | Shells Left: " + shells + 
  " | Lives Remaining: " + lives + " | Hazard Level: " + hazardLevel, 300, 385);

  //slow & destroy shots (and paratroopers)
  for(var x = 0; x < tankShells.length; x++){
    if(tankShells[x].y + 7 > 360 || tankShells[x].x < -50){
      tankShells[x].destroy();
    }

    tankShells[x].velocityY += 0.175;
    tankShells[x].velocityX *= 0.99;
    
    if(tankShells[x].rotation > -90){
      tankShells[x].rotation -= 1;
    }

    for(var y = 0; y < paratroopers.length; y++){
      if(tankShells[x].isTouching(paratroopers[y])){
        tankShells[x].destroy();
        paratroopers[y].destroy();

        score++;
      }
    }
  }

  //increase the haaard level
  if(lives > 0){
    if(hazardLevel <= 100){
      if(frameCount % 20 === 0){
        hazardLevel++;
      }
    }else{
      hazardLevel = "MAX";
      shells = "INFINITE";
    }
  }

  //summon paratroopers/medics
  if(lives > 0){
    summonParatrooper(20, 80, 2, 3);
    summonParatrooper(40, 70, 3, 4);
    summonParatrooper(60, 60, 4, 5);
    summonParatrooper(80, 50, 5, 6);
    summonParatrooper(100, 40, 6, 7);

    summonMedic(50, 5, 7);
  }else{
    for(var y = 0; y < paratroopers.length; y++){
      paratroopers[y].y = -100^100;
      paratroopers[y].destroy();
    }
    textSize(50);
    text("GAME OVER", 300, 200);
    textSize(30);
    text("Final Score: " + score, 300, 230);
  }

  //collide on the ground
  for(var y = 0; y < paratroopers.length; y++){
    if(paratroopers[y].y > 310){
      paratroopers[y].y = -100^100;
      paratroopers[y].destroy();
      lives--;
    }
  }


  //medic collisions
  for(var y = 0; y < medics.length; y++){
    if(medics[y].y > 300){
      medics[y].destroy();
    }


  for(var x = 0; x < tankShells.length; x++){
    if(medics[y].isTouching(tankShells[x])){
        tankShells[x].destroy();
        medics[y].destroy();
        lives--; 
      }
    }
  }

  //summon clouds
  if(frameCount % cloudTimer === 0){
    cloud = createSprite(700, random(-20, 120));
    cloud.addImage("cloud", cloud_img);
    cloud.addSpeed(random(-1, -4), cloud.rotation);
    cloud.scale = random(0.2, 0.4);
    cloud.life = 900/cloud.getSpeed();
    cloudTimer = round(random(60, 100));
  }

}