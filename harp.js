var lines = [];
var ripples = [];

var auto_sound_loop;

var max_weight = 40;

var mouse_press_x;
var mouse_press_y;

var mouse_release_x;
var mouse_release_y;

var red_perc;
var green_perc;
var blue_perc;

var base_freq;
var cur_freq;

// Pentatonic scale ratios
var pent_ratios = [5/4, 9/8, 3/2, 5/3, 2, 1];

function setup(){
    createCanvas(window.innerWidth, window.innerHeight);
    colorMode(HSB, 255);
    frameRate(10);

    // pick a random 'key'
    base_freq = random() * 200 + 60;

    // pick a random color
    red_perc = random() * 100;
    green_perc = random() * 100;
    blue_perc = random() * 100;

    auto_sound_loop = new p5.SoundLoop(run_sound_loop, 2.3);

    auto_button = createButton('Auto');
    auto_button.mouseClicked(auto_button_clicked);
    auto_button.position(20, 200);
}

function draw(){

    background(10);

    if (lines.length){
        for (var i=0; i<lines.length; i++) {

            var cur_line = lines[i];
            // console.log(lines[i].opacity);
            stroke('rgba(' +red_perc +'%, ' +green_perc+ '%, '+ blue_perc+'%,' + lines[i].opacity+')');
            strokeWeight(lines[i].weight);
            line(x1=lines[i].x1, y1=lines[i].y1, x2=lines[i].x2, y2=lines[i].y2);
            
            if (lines[i].ripple){
              
              var cur_ripple = lines[i].ripple;

              // width of ripple line
              strokeWeight(cur_ripple.radius / 24 );
              noFill();
              ellipse(cur_ripple.x, cur_ripple.y, cur_ripple.radius);
              // fill();

              // speed of ripple expansion
              cur_ripple.radius += 20;
            }
            
            lines[i].fade();

            // TODO: slow down the volume changes
            var new_vol = lines[i].opacity * lines[i].vol_ratio;
            lines[i].synth.amp(vol=new_vol, rampTime=0.05);
            
          } 
          for (var i=0; i<lines.length; i++) {
              if (lines[i].opacity < 0.01) {
                  console.log('removing ' + i + ' from ' + lines.length);
                  lines[i].synth.triggerRelease();
                  var old_line = lines[i];
                  
                  lines.splice(i, 1);

                  var old_ripple_index = ripples.indexOf(old_line.ripple);
                  ripples.splice(old_ripple_index, 1);

              }
          }
    }
}

function auto_button_clicked(){

    if (auto_sound_loop.isPlaying){
        auto_sound_loop.stop();
    }
    else{
        auto_sound_loop.start();
    }

}

function run_sound_loop(){

    if (auto_sound_loop.isPlaying){

        var x1new = floor(random() * window.innerWidth);
        var x2new = floor(random() * window.innerWidth);
    
        var y1new = floor(random() * window.innerHeight);
        var y2new = floor(random() * window.innerHeight);
    
        play_line(x1=x1new, y1=y1new, x2=x2new, y2=y2new);
    
        if (random() < 0.34){
          sloop.interval = random() * 2 + 0.2;
       }
    
      }
}

function perp_line(x1, y1, x2, y2){
    // get the line perpendicular to the mouse-drag
    // the slope will be the negative opposite of the original line.
    
    var dist_new = dist(x1, y1, x2, y2);
  
    if (dist_new == 0){
      weight = 0;
    }
    else{
       weight = 1 + dist_new * 0.1;
    }
  
    var slope = (y2 - y1) / (x2 - x1);
    var slope_perp = - 1/slope;
  
    if (dist_new == 0){
      var x_left = x1;
      var x_right = x1;
      var y_up = y1 - 1;
      var y_down = y1;
    }
    else if (slope_perp >  0){
      var y_left_delta = - slope_perp * x1;  
      var y_right_delta = slope_perp * (window.innerWidth - x1);
  
      var x_up_delta =  (window.innerHeight - y1) / slope_perp;
      var x_down_delta = (y1) / slope_perp;
  
      var x_left = Math.max(0, x1 - x_down_delta);
      var x_right = Math.min(window.innerWidth, x_up_delta + x1);
  
      var y_up = Math.max(y1 + y_left_delta, 0);
      var y_down = Math.min(window.innerHeight, y_right_delta + y1);
    }
    else{
      var y_left_delta = - slope_perp * x1;  
      var y_right_delta = slope_perp * (window.innerWidth - x1);
  
      var x_down_delta =  (window.innerHeight - y1) / slope_perp;
      var x_up_delta = (y1) / slope_perp;
  
      var x_left = Math.max(0, x1 + x_down_delta);
      var x_right = Math.min(window.innerWidth, x1 - x_up_delta);
  
      var y_down = Math.max(y1 + y_right_delta, 0);
      var y_up = Math.min(window.innerHeight, y_left_delta + y1);
    }
    
    var new_line = new Liney(x1=x_left, y1=y_up, x2=x_right, y2=y_down, weight=weight);
  
    if (dist_new == 0){
      new_line.vol_ratio = 0.3;
      new_ripple = new Ripple(x1, y1);
      ripples.push(new_ripple);
      new_line.ripple = new_ripple;
    }
  
    lines.push(new_line);
    return new_line; 
  }
  
  function Liney(x1, y1, x2, y2, weight) {
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    this.weight = weight;
    this.vol_ratio = Math.min(weight / max_weight, 1.0);
    this.opacity = 1;
    this.synth = new p5.MonoSynth();
    this.ripple = null;
    // this.synth.setADSR(attackTime=0.21, decayTime=3.0, susRatio=0.01, releaseTime=0);
  }
  
Liney.prototype.fade = function() {

    var fade_fac = 0.96;
    this.opacity = this.opacity * fade_fac;
  }
  
function play_line(x1, y1, x2, y2){
    var new_ratio = pent_ratios[Math.floor(Math.random() * pent_ratios.length)];
    var new_freq = new_ratio * base_freq;
    var new_line = perp_line(x1=x1, y1=y1, x2=x2, y2=y2);
    // amp controls volume in this case, not the velocity
    new_line.synth.amp(new_line.vol_ratio);
    new_line.synth.triggerAttack(note=new_freq, velocity=1);
}

function Ripple(x, y, weight=20) {
  this.x = x;
  this.y = y;
  this.radius = 50;
  this.weight = weight;
}

function play_line(x1, y1, x2, y2){
  var new_ratio = pent_ratios[Math.floor(Math.random() * pent_ratios.length)];
  var new_freq = new_ratio * base_freq;
  var new_line = perp_line(x1=x1, y1=y1, x2=x2, y2=y2);
  // amp controls volume in this case, not the velocity
  new_line.synth.amp(new_line.vol_ratio);
  new_line.synth.triggerAttack(note=new_freq, velocity=1);
}

function mousePressed() {
  
  // console.log("coords pressed: " + mouseX + "  " + mouseY);

  mouse_release_x = null;
  mouse_release_y = null;

  mouse_press_x = mouseX;
  mouse_press_y = mouseY;
    
}

function mouseReleased() {

  mouse_release_x = mouseX;
  mouse_release_y = mouseY;

  // console.log("coords released: " + mouseX + "  " + mouseY);

  play_line(x1=mouse_press_x, y1=mouse_press_y, x2=mouse_release_x, y2=mouse_release_y);

}
