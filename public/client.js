(function() {
  var faye, keymap, speed;
  faye = new Faye.Client("/faye", {
    timeout: 120
  });
  faye.subscribe("/drone/navdata", function(data) {
    ["batteryPercentage", "clockwiseDegrees", "altitudeMeters", "frontBackDegrees", "leftRightDegrees", "xVelocity", "yVelocity", "zVelocity"].forEach(function(type) {
      return $("#" + type).html(Math.round(data.demo[type], 4));
    });
    return showBatteryStatus(data.demo.batteryPercentage);
  });
  window.showBatteryStatus = function(batteryPercentage) {
    if (batteryPercentage < 30) {
      $("#batterybar").removeClass("progress-bar-success").addClass("progress-bar-warning");
    }
    if (batteryPercentage < 15) {
      $("#batterybar").removeClass("progress-bar-warning").addClass("progress-bar-danger");
    }
    $("#batterybar").width("" + batteryPercentage + "%");
    document.getElementById("batterybar").innerHTML = batteryPercentage + "%";
  };
  faye.subscribe("/drone/image", function(src) {
    return $("#cam").attr({
      src: src
    });
  });
  keymap = {
    87: {
      ev: 'move',
      action: 'front'
    },
    83: {
      ev: 'move',
      action: 'back'
    },
    65: {
      ev: 'move',
      action: 'left'
    },
    68: {
      ev: 'move',
      action: 'right'
    },
    38: {
      ev: 'move',
      action: 'up'
    },
    40: {
      ev: 'move',
      action: 'down'
    },
    37: {
      ev: 'move',
      action: 'counterClockwise'
    },
    39: {
      ev: 'move',
      action: 'clockwise'
    },
    32: {
      ev: 'drone',
      action: 'takeoff'
    },
    27: {
      ev: 'drone',
      action: 'land'
    },
    49: {
      ev: 'animate',
      action: 'flipAhead',
      duration: 15
    },
    50: {
      ev: 'animate',
      action: 'flipLeft',
      duration: 15
    },
    51: {
      ev: 'animate',
      action: 'yawShake',
      duration: 15
    },
    52: {
      ev: 'animate',
      action: 'doublePhiThetaMixed',
      duration: 15
    },
    53: {
      ev: 'animate',
      action: 'wave',
      duration: 15
    },
    69: {
      ev: 'drone',
      action: 'disableEmergency'
    }
  };
  speed = 0;
  $(document).keydown(function(ev) {
    var evData;
    if (keymap[ev.keyCode] == null) {
      return;
    }
    ev.preventDefault();
    speed = speed >= 1 ? 1 : speed + 0.08 / (1 - speed);
    evData = keymap[ev.keyCode];
    return faye.publish("/drone/" + evData.ev, {
      action: evData.action,
      speed: speed,
      duration: evData.duration
    });
  });
  $(document).keyup(function(ev) {
    speed = 0;
    return faye.publish("/drone/drone", {
      action: 'stop'
    });
  });
  $("*[data-action]").on("mousedown", function(ev) {
    return faye.publish("/drone/" + $(this).attr("data-action"), {
      action: $(this).attr("data-param"),
      speed: 0.3,
      duration: 1000 * parseInt($("#duration").val())
    });
  });
  $("*[data-action]").on("mouseup", function(ev) {
    return faye.publish("/drone/move", {
      action: $(this).attr("data-param"),
      speed: $(this).attr("data-action") === "move" ? 0 : void 0
    });
  });
  $("*[rel=tooltip]").tooltip();


  window.onload = function() {
    console.log('Aqui')
    
    function startTime() {
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        var s = today.getSeconds();
        m = checkTime(m);
        s = checkTime(s);
        document.getElementById('txt').innerHTML = 
        h + ":" + m + ":" + s;
        var t = setTimeout(startTime, 500);
    }
    startTime();
    function checkTime(i) {
        if (i < 10) { i = "0" + i };  // add zero in front of numbers < 10
        return i;
    }
    if (annyang) {
      // Let's define a command.
       var commands = {
      //   'takeoff': function(){
      //     console.log('takeofff')
      //   },
      //   'land': function(){
      //     console.log('land')
      //   }
        'takeoff': function() { //alert('Hello world!');
        console.log('Takeoff')
        return faye.publish("/drone/move", {
          action: 'takeoff',
          speed: 0.3,
          duration: null
        }); },
        'land': function() { //alert('Hello world!');
        console.log('Land')
        return faye.publish("/drone/move", {
          action: 'land',
          speed: 0.3,
          duration: null
        }); },
        'Turn *direction' :  function(direction){
          console.log('Turn')
          mov = null;
          if(direction == 'right'){
            mov = 'clockwise'
            console.log('right')
          }
          if(direction == 'left')
          {
            console.log('left')
            mov= 'counterClockwise'
          }
        return faye.publish("/drone/move", {
          action: mov,
          speed: 0.3,
          duration: 1
        })

        }

      };
    
      // Add our commands to annyang
      annyang.addCommands(commands);
    
      // Start listening.
      annyang.start();
    }
  }

}).call(this);
