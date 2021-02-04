var canvas;
var lines = [];
var ripples = [];

var auto_sound_loop;

var max_weight = 40;

var mouse_press_x;
var mouse_press_y;

var mouse_drag_x;
var mouse_drag_y;

var mouse_release_x;
var mouse_release_y;

var red_perc;
var green_perc;
var blue_perc;
var cur_color_prefix;

var base_freq;
var cur_freq;

var loop_pedal = false;

var auto_button;
var reload_button;
var instructions_opacity = 244;

// Pentatonic scale ratios
var pent_ratios = [5/4, 9/8, 3/2, 5/3, 2, 1];

function reset_page(){

     // pick a random 'key'
     base_freq = random() * 200 + 60;

     // pick a random color
     red_perc = random() * 100;
     green_perc = random() * 100;
     blue_perc = random() * 100;
 
     cur_color_prefix = 'rgba(' +red_perc +'%, ' +green_perc+ '%, '+ blue_perc+'%, '

     console.log(cur_color_prefix);
     let button_color = cur_color_prefix+'0.7' + ')' ;
     console.log(button_color);
     
     reload_button.style('background-color', color(button_color));
     reload_button.style('border-color', color('grey'));
     reload_button.style('border-radius', '20px');
     reload_button.style('border-width', '4px');

     auto_button.style('background-color', color(button_color));
     auto_button.style('border-color', color('grey'));
     auto_button.style('border-radius', '20px');
     auto_button.style('border-width', '4px');

     console.log(red_perc + green_perc + blue_perc);
     if (red_perc + green_perc + blue_perc < 200){
       auto_button.style('color', '#ffffff');
       reload_button.style('color', '#ffffff');
     }
     else{
      auto_button.style('color', '#000000');
      reload_button.style('color', '#000000');
     }

     auto_button.html("AutoPlay");
     auto_sound_loop.isPlaying = false;
     auto_sound_loop.interval = random() * 1.8 + 0.2;

     for (var i=0; i<lines.length; i++) {
       lines[i].synth.triggerRelease();
     }

     lines = [];
     ripples = [];
     instructions_opacity = 255;
     strokeWeight(2);

     mouse_press_x = null;
     mouse_release_x = null;

}

function setup(){
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    canvas.mousePressed(canvasPressed);
    canvas.mouseReleased(canvasReleased);

    colorMode(HSB, 255);
    frameRate(10);

    auto_sound_loop = new p5.SoundLoop(run_sound_loop, 0.8);

    textSize(24);
    auto_button = createButton('Auto Chime');
    auto_button.mouseClicked(auto_button_clicked);
    auto_button.position(20, 200);
    auto_button.size(200, 60);
    auto_button.style('font-size', 20);

    // auto_button.fontSize(20);

    reload_button = createButton('Reload for new color');
    reload_button.mouseClicked(reload_button_clicked);
    reload_button.position(20, 100);
    reload_button.size(200, 60);
    reload_button.style('font-size', 20);
    // reload_button.style('text-shadow', '1px 1px #ffffff')


    reset_page();

}

function draw_bez(x_left, y_up, mouse_press_x, mouse_press_y, x2, y2){

  let dist_fac1 = 0.6
  let dist_fac2 = 1 / 6;

  bezier(x_left, y_up,
         mouse_press_x - (mouse_press_x - x_left) * dist_fac1, mouse_press_y - (mouse_press_y - y_up) * dist_fac1,  
         x2 - (mouse_press_x - x_left) * dist_fac2, y2 - (mouse_press_y - y_up) * dist_fac2, 
         x2, y2
         );
}

function draw(){

    background(16);

    if ( lines.length ){
      instructions_opacity -= 4;
    }

    if (instructions_opacity > 2 ){

      textSize(32);
      fill(0, 102, 153, instructions_opacity);
      text('Two ways to create sounds.\n1. Click and hold, drag, release.\n2.  Just click', 10, 320);

    }

    // if (loop_pedal) {
    //   circle(50, 140, 80);
    // }

    if (mouse_press_x != null & mouse_release_x == null){

      let x_left, x_right, y_up, y_down, weight, dist_new;

      dist_new = dist(x1=mouse_press_x, mouse_press_y, mouseX, mouseY);
 
      // fix the line angle after the user has 'pulled' a certain distance
      if (dist_new < 30){
        mouse_drag_x = mouseX;
        mouse_drag_y = mouseY;
       }

      [x_left, y_up, x_right, y_down, weight, dist_new] = get_perp_line(x1=mouse_press_x, mouse_press_y, mouse_drag_x, mouse_drag_y, dist_new);

      noFill();
      strokeWeight(4);
      let cur_weight = 1 + dist_new * 0.1;
      stroke('rgba(' +red_perc +'%, ' +green_perc+ '%, '+ blue_perc+'%,' + Math.min(cur_weight / 70, 0.2) +')');
  
      draw_bez(x_left, y_up, mouse_press_x, mouse_press_y, mouseX, mouseY);
      draw_bez(x_right, y_down, mouse_press_x, mouse_press_y, mouseX, mouseY);

      // draw_bez(mouseX, mouseY, mouse_press_x, mouse_press_y, x_right, y_down);

      // bezier(x_left, y_up,
      //   mouse_press_x - (mouse_press_x - x_left) / 2, mouse_press_y - (mouse_press_y - y_up) / 2,  
      //   mouse_press_x - (mouse_press_x - x_left) / 4, mouse_press_y - (mouse_press_y - y_up) / 4, 
      //   mouseX, mouseY);

      // bezier(mouseX, y_up,
      //   mouse_press_x - (mouse_press_x - x_left) / 2, mouse_press_y - (mouse_press_y - y_up) / 2,  
      //   mouse_press_x - (mouse_press_x - x_left) / 4, mouse_press_y - (mouse_press_y - y_up) / 4, 
      //   mouseX, mouseY);
      // bezier(x_left, y_up, x_left, y_up, x_right, y_down, x_right + 500, y_down);

      // curve(x_left, y_up,x_left, y_up, x_right, y_down, x_right + 500, y_down);

    }

    if (lines.length){
        for (var i=0; i<lines.length; i++) {

            var cur_line = lines[i];
            // console.log(lines[i].opacity);
            stroke('rgba(' +red_perc +'%, ' +green_perc+ '%, '+ blue_perc+'%,' + lines[i].opacity+')');
            
            // reduce line width over time
            let line_width_fac = Math.min(lines[i].opacity * 1.25, 1.0);

            strokeWeight(lines[i].weight * line_width_fac);
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
        // reset_page();
        auto_sound_loop.stop();
        auto_button.html("AutoPlay OFF");
    }
    else{
        // reset_page();
        auto_sound_loop.start();
        auto_button.html("AutoPlay ON");
    }

}

function reload_button_clicked(){
  reset_page();
}


function run_sound_loop(){

    if (auto_sound_loop.isPlaying){

        let x1new = floor(random() * window.innerWidth);
    
        let y1new = floor(random() * window.innerHeight);

        let x2new;
        let y2new;

        let delta = 70;

        if (random() < 0.60) {
          x2new = x1new;
          y2new = y1new;
        }
        else{
          x2new = x1new - delta + floor(random() * delta * 2);
          y2new = y1new - delta + floor(random() * delta * 2);
        }
    
        play_line(x1=x1new, y1=y1new, x2=x2new, y2=y2new);
    
        if (random() < auto_sound_loop.interval / 4){
          auto_sound_loop.interval = random() * 5 + 0.2;
          console.log("interval: " + auto_sound_loop.interval);
       }
    
      }
}

function get_perp_line(x1, y1, x2, y2, dist_new){

  // var dist_new = dist(x1, y1, x2, y2);
  
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
  
  return [x_left, y_up, x_right, y_down, weight, dist_new];

}

function perp_line(x1, y1, x2, y2, dist_new=null){
    // get the line perpendicular to the mouse-drag
    // the slope will be the negative opposite of the original line.
    
    // var dist_new = dist(x1, y1, x2, y2);
  
    // if (dist_new == 0){
    //   weight = 0;
    // }
    // else{
    //    weight = 1 + dist_new * 0.1;
    // }
  
    // var slope = (y2 - y1) / (x2 - x1);
    // var slope_perp = - 1/slope;
  
    // if (dist_new == 0){
    //   var x_left = x1;
    //   var x_right = x1;
    //   var y_up = y1 - 1;
    //   var y_down = y1;
    // }
    // else if (slope_perp >  0){
    //   var y_left_delta = - slope_perp * x1;  
    //   var y_right_delta = slope_perp * (window.innerWidth - x1);
  
    //   var x_up_delta =  (window.innerHeight - y1) / slope_perp;
    //   var x_down_delta = (y1) / slope_perp;
  
    //   var x_left = Math.max(0, x1 - x_down_delta);
    //   var x_right = Math.min(window.innerWidth, x_up_delta + x1);
  
    //   var y_up = Math.max(y1 + y_left_delta, 0);
    //   var y_down = Math.min(window.innerHeight, y_right_delta + y1);
    // }
    // else{
    //   var y_left_delta = - slope_perp * x1;  
    //   var y_right_delta = slope_perp * (window.innerWidth - x1);
  
    //   var x_down_delta =  (window.innerHeight - y1) / slope_perp;
    //   var x_up_delta = (y1) / slope_perp;
  
    //   var x_left = Math.max(0, x1 + x_down_delta);
    //   var x_right = Math.min(window.innerWidth, x1 - x_up_delta);
  
    //   var y_down = Math.max(y1 + y_right_delta, 0);
    //   var y_up = Math.min(window.innerHeight, y_left_delta + y1);
    // }
    let x_left, x_right, y_up, y_down, weight;
  
    if (dist_new == null){
      dist_new = dist(x1, y1, x2, y2);
    }

    [x_left, y_up, x_right, y_down, weight] = get_perp_line(x1, y1, x2, y2, dist_new);

    console.log('x_left: ' + x_left);

    var new_line = new Liney(x1=x_left, y1=y_up, x2=x_right, y2=y_down, weight=weight);
  


    if (dist_new == 0){
      new_line.freq_fac = 1.0;
      new_line.vol_ratio = 0.3;
      new_ripple = new Ripple(x1, y1);
      ripples.push(new_ripple);
      new_line.ripple = new_ripple;
    }
    else{
      new_line.freq_fac = 2.0;
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
    this.freq_fac = 1.0;
    // this.synth.setADSR(attackTime=0.21, decayTime=3.0, susRatio=0.01, releaseTime=0);
  }
  
Liney.prototype.fade = function() {

    var fade_fac = 0.96;
    this.opacity = this.opacity * fade_fac;
  }
  
function play_line(x1, y1, x2, y2, cur_dist=null){

    // console.log("test")

    var new_ratio = pent_ratios[Math.floor(Math.random() * pent_ratios.length)];

    if (cur_dist == null){
      cur_dist = dist(x1, y1, x2, y2);
    }

    var new_line = perp_line(x1=x1, y1=y1, x2=x2, y2=y2, dist_new=cur_dist);
    var new_freq = new_ratio * base_freq * new_line.freq_fac;

    console.log("Base: " + base_freq + "   new: " + new_freq +"   " + new_line.freq_fac);

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


function canvasPressed() {
  
  // console.log("coords pressed: " + mouseX + "  " + mouseY);

  mouse_release_x = null;
  mouse_release_y = null;

  mouse_press_x = mouseX;
  mouse_press_y = mouseY;
    
}

function canvasReleased() {

  // if (auto_button.mouseReleased() ){
  //    return;
  // }

  mouse_release_x = mouseX;
  mouse_release_y = mouseY;

  let x2, y2;

  if (mouse_drag_x == null){
    x2 = mouseX;
    y2 = mouseY;
  }
  else{
    x2 = mouse_drag_x;
    y2 = mouse_drag_y;
    mouse_drag_x = null;
    mouse_drag_y = null;
  }

  // console.log("coords released: " + mouseX + "  " + mouseY);

  let cur_dist = dist(mouse_press_x, mouse_press_y, mouse_release_x, mouse_release_y);

  play_line(x1=mouse_press_x, y1=mouse_press_y, x2=x2, y2=y2, cur_dist=cur_dist);



}

function keyPressed() {
  if (keyCode === 32) {
    loop_pedal = true;
  }
}

function keyReleased() {
  if (keyCode === 32) {
    loop_pedal =false;
  }
}