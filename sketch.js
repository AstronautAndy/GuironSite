let Guiron_;
let head_set = [];
let right;
let left;
let Gyaos_head;
let Gyaos_head_width;
let width; let height;
let leftSpireWidth; let rightSpireWidth;
let leftSpireHeight; let rightSpireHeight;
let leftWidth; let rightWidth;
let foreground;
let CELL_SIZE = 150; 
let head_handler_ = new head_handler();
let floor;
let spatialHash = [];
let keySet = [];

function preload(){
  right = loadImage('./assets/GuironRight.png');
  left =  loadImage('./assets/GuironLeft.png');
  leftSpire = loadImage('./assets/Left_Spire_Small.png');
  rightSpire = loadImage('./assets/Right_Spire_Small.png');
  foreground = loadImage('./assets/VenusCropped.png');
  Gyaos_head = loadImage('./assets/Gyaos.png');

  leftSpireWidth = leftSpire.width;
  rightSpireWidth = rightSpire.width;
  leftSpireHeight = leftSpire.height;
  rightSpireHeight = rightSpire.height;
  leftWidth = left.width;
  rightWidth = right.width; 
  Gyaos_head_width = Gyaos_head.width;
}

function setup(){
  var cnv = createCanvas(windowWidth, windowHeight); //this line of code creates a canvas equal to the size of the window
  cnv.style('display', 'block');
  width = cnv.width;
  height = cnv.height;  
  head_handler_.createHeads(20);
  floor = 1200;
  //console.log("floor: ", floor);

  leftSpire.resize(width/5,height*.95);
  rightSpire.resize(width/5,height*.95);
  foreground.resize(width,height);

  Guiron_ = new Guiron(5,0,width-(width/10)-left.width,400,true, left)
}

function draw(){
  clear();
  // background(0, 0, 0);  
  noFill();
  // image(foreground,0,300)

  Guiron_.update();
  image(Guiron_.img, Guiron_.xPos, Guiron_.yPos);

  //image(leftSpire,-100,300);
  //image(rightSpire,(width-(width/5)),300);

  for(let i = 0; i < head_handler_.head_list.length; i++){
    image(head_handler_.head_list[i].img , head_handler_.head_list[i].location[0], head_handler_.head_list[i].location[1]);
    //rect(head_handler_.head_list[i].location[0] , head_handler_.head_list[i].location[1], 10, 10);
    head_handler_.head_list[i].update();
  }

  head_handler_.update();
  //draw a grid to get a visual on what out hash function will translate to on screen
  for(let i=0; i< Math.round(windowWidth/CELL_SIZE); i++){
    for (let j=0; j< Math.round(windowHeight/CELL_SIZE); j++){
      rect(i*CELL_SIZE, j*CELL_SIZE, CELL_SIZE, CELL_SIZE);
      noFill();
    }
  }
}

function Guiron(_xVel,_yVel,_xPos,_yPos,_dir_state, _img){
   this.img = _img;
   this.xVel = _xVel;
   this.yVel = _yVel;
   this.xPos = _xPos;
   this.yPos = _yPos;
   this.dir_state = _dir_state;
   
   if(this.dir_state == true){ //if 'true' load the left facing image
     this.img = left;//loadImage("../assets/rightArrow.png");
     this.xVel *= -1;
   }else if(this.dir_state == false){
     this.img = right; //loadImage("../assets/leftArrow.png");    
   }
   
   this.update = function(){     
     this.xPos += this.xVel;
     //this.yPos = this.yPos+(sin(this.xPos));
     //this.yPos = this.yPos;
     
     if(this.xPos >= (width-width/10)-this.img.width || this.xPos <= (width/10)+leftSpire.width){ //switch direction
      this.xVel*=-1; //switch directions
        if(this.dir_state == true){ //change left to right...         
           this.dir_state = false;
           this.img = right;       
        }else if(this.dir_state == false){ //... and right to left      
           this.dir_state = true; 
           this.img = left; 
        }      
     }     
   }
 }

/**
* Function used to represent a 'head' object 
*/
function Gyaos(_xPos, _yPos, _id){
  this.x = _xPos;
  this.y = _yPos;
  this.topspeed = 5;
  this.img = Gyaos_head;
  this.ID = _id;  
  this.location = [_xPos,_yPos];
  this.velocity = [(Math.random()*10)+1,(Math.random()*5)+1]; //initialize with 0 velocity

  this.curr_cell = [];
  this.prev_cell = [Math.round(this.location[0] / CELL_SIZE) * CELL_SIZE, Math.round(this.location[1] / CELL_SIZE) * CELL_SIZE]; //initialize "previous cell"

  this.update = function(){    
    this.location = [this.location[0]+this.velocity[0] , this.location[1]+this.velocity[1] ];

    X_ = Math.round(this.location[0] / CELL_SIZE) * CELL_SIZE;
    Y_ = Math.round(this.location[1] / CELL_SIZE) * CELL_SIZE;
    this.curr_cell = [X_,Y_];
    //update the "current cell"
    if(this.prev_cell[0]*this.prev_cell[1] != this.curr_cell[0]*this.curr_cell[1]){ //AKA, if the previous cell is different from the new cell, update it
      // console.log("Updating cell. ID: " + this.ID + " Old cell: " + this.prev_cell[0] + " " + this.prev_cell[1] + " New cell: " + this.curr_cell[0] + " " + this.curr_cell[1]);
      spatialHash.remove(this);
      this.prev_cell[0] = this.curr_cell[0];
      this.prev_cell[1] = this.curr_cell[1];
      spatialHash.add(this);
    }

    //Case where the object hits the ground 
    if(this.location[1] >= windowHeight || this.location[1] <= 0 ){
      this.velocity[0] *= 1;
      this.velocity[1] *= -1;      
    } //case where the object hits either the left or the right sides
    else if(this.location[0] <= 0 || this.location[0] >= windowWidth){
      this.velocity[0] *= -1;
      this.velocity[1] *= 1;
    } 
  }
 }

/**

*/
function head_handler(){
  this.head_list = [];
  
  this.createHeads = function(x){
    for(let i=0; i<x; i++){
      let random_x = Math.floor(Math.random() * (windowWidth-100) );
      let random_y = Math.floor(Math.random() * (windowHeight-100) );  
      this.head_list[i] = new Gyaos(random_x,random_y, i);
      spatialHash.add(this.head_list[i]);
    }
  }

  this.update = function(){
    // console.log("Spatial Hash size: " + spatialHash.length);
    for(let i=0; i<keySet.length; i++){
      if(spatialHash[keySet[i]].length > 1){
        for(let j=0; j < spatialHash[keySet[i]].length; j++){
          spatialHash[keySet[i]][j].velocity[0] *= -1;
          spatialHash[keySet[i]][j].velocity[1] *= -1;
        }
        //console.log(spatialHash[keySet[i]]);
      }
    }
  }  
}

spatialHash.add = function(obj){
  // console.log("Adding head object with id: " + obj.ID);
    var X = Math.round(obj.location[0] / CELL_SIZE) * CELL_SIZE;
    var Y = Math.round(obj.location[1] / CELL_SIZE) * CELL_SIZE;
    var key = X + "," + Y;
    if(spatialHash[key] == undefined){
      spatialHash[key] = [];
      keySet.push(key);        
      //console.log("Added " + spatialHash[key] + " at " + key);
    } 
    spatialHash[key].push(obj);
    //for visualization purposes
    //fill(255, 225, 31);
    // rect(X, Y, CELL_SIZE, CELL_SIZE);   
    //console.log("Added " + obj + " at " + key);
    //console.log(spatialHash[key]);
  }

  //Given the object, remove it from the list
spatialHash.remove = function(obj){
  let key = obj.prev_cell[0] + "," + obj.prev_cell[1];
  // console.log("[Remove] - obj.ID: " + obj.ID);
  // console.log("[Remove] - key: " + key);
  // console.log("[Remove] - spatialHash[key]: " + spatialHash[key]);
    if(spatialHash[key].length > 1){ //if there's more than one head located at that cell... 
      // console.log("[Remove] - spatialHash[key].length: " + spatialHash[key].length);
      // console.log("[Remove] - spatialHash[key][0]: " + spatialHash[key][0]);
      // console.log("[Remove] - spatialHash[key][1]: " + spatialHash[key][1]);
      for(let i=0; i<spatialHash[key].length; i++){
        if(spatialHash[key][i].ID == obj.ID){ 
            spatialHash[key].splice(i,1);
            // console.log("[Remove] - after shifting position " + i + " " + spatialHash[key]);
          } //if there's an object with that very ID, delete it       
      }
    }
    else if(spatialHash[key][0].ID = obj.ID){
      spatialHash[key].pop();
    }
    //for visualization purposes
    //fill(255, 0, 34);
    //rect(obj.prev_cell[0], obj.prev_cell[1], CELL_SIZE, CELL_SIZE);  
  }