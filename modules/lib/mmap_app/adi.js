
$(function(){

  window.ADI = function(container) {
    var theADI = this;

    this.pitch = -90.0 * Math.PI / 180.0;
    this.roll = 90.0 * Math.PI / 180.0;
    this.targetPitch = 0.0;
    this.targetRoll = 0.0;

    var containerElement = document.getElementById(container);
    this.stage = new Kinetic.Stage({
        container: container,
        height: containerElement.offsetHeight,
        width: containerElement.offsetWidth
    });
    this.stage.setScale(containerElement.offsetWidth / 100.0,
                        containerElement.offsetHeight / 100.0);
    this.layer = new Kinetic.Layer();
    this.plane = new Kinetic.Path({
        x: 50,
        y: 50,
        data: 'm -26,0 15,0 3,3 M -1,0 l 2,0 M 26,0 l -15,0 -3,3',
        stroke: 'black',
        lineJoin: 'round',
        strokeWidth: 2.5,
        shadow: {
            color: 'black',
            blur: 5,
            offset: [1, 1],
            alpha: 0.5
        },
        scale: 1.2
    });
    // add the shape to the layer
    this.layer.add(this.plane);
    this.horizon = new Kinetic.Path({
        x: 50,
        y: 50,
        data: 'm -100,0 200,0',
        stroke: 'black',
        lineJoin: 'round',
        strokeWidth: 1.7,
        scale: 1
    });
    this.layer.add(this.horizon);
    // add the layer to the stage
    this.stage.add(this.layer);

    this.drawFromAttitude = function(pitch, roll) {
        var horizon_y = 50.0 + 50.0 * Math.sin(pitch);
        theADI.horizon.setY(horizon_y);
        theADI.horizon.setRotation(-roll);
        theADI.layer.draw();
    };

    this.drawFromAttitude(this.pitch, this.roll);
    
    this.animateToAttitude = function() {
        var need_more_animation = false;
        
        var curPitch = theADI.pitch;
        var nextPitch = curPitch + (theADI.targetPitch - curPitch) * 0.05;
        if (Math.abs(nextPitch - curPitch) < 0.001) {
            nextPitch = theADI.targetPitch;
        } else {
            need_more_animation = true;
        }
        
        var curRoll = theADI.roll;
        var nextRoll = curRoll + (theADI.targetRoll - curRoll) * 0.05;
        if (Math.abs(nextRoll - curRoll) < 0.001) {
            nextRoll = theADI.targetRoll;
        } else {
            need_more_animation = true;
        }
        
        theADI.drawFromAttitude(nextPitch, nextRoll);
        
        theADI.pitch = nextPitch;
        theADI.roll = nextRoll;
        if (need_more_animation) {
            MM.getFrame(theADI.animateToAttitude);
        }
    };
    
    this.setAttitude = function(pitch, roll) {
        theADI.targetPitch = pitch;
        theADI.targetRoll = roll;
        MM.getFrame(theADI.animateTvoAttitude);
    };
  };

});
