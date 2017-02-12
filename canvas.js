$('#myCanvas2').ready(function() {
	
	// ----------------------------------------------------------------
	// -------------------------- PHYSICS -----------------------------
	// ----------------------------------------------------------------

	var world = Physics();
	
	var gravity = Physics.behavior('constant-acceleration', {
		acc: {x: 0, y: 0.0004 }
	});
	world.add(gravity);

	var renderer = Physics.renderer('canvas', {
		el: 'myCanvas2',
		width: 900,
		height: 600,
		meta: false,
		autoResize: false,
		styles: {
			strokeStyle: 'rgba(0,0,0,1)',
			lineWidth: 1,
			fillStyle: 'rgba(0,0,0,1)',
			angleIndicator: 'rgba(0,0,0,1)'
    	}
	});
	
	//renderer.setStyle(canvas.style, ctx);
	world.add(renderer);

	world.on('step', function(){
		world.render();
	});

	var viewportBounds = Physics.aabb(0, 0, 900, 600);

   // constrain objects to these bounds
   world.add(Physics.behavior('edge-collision-detection', {
      aabb: viewportBounds,
      restitution: 0.3,
      cof: 1
   }));
	
	world.add( Physics.behavior('interactive', { el: renderer.el }) );
	world.add( Physics.behavior('body-impulse-response') );
	world.add( Physics.behavior('body-collision-detection') );
	world.add( Physics.behavior('sweep-prune') );

	Physics.util.ticker.on(function( time, dt ){
      world.step( time );
		//console.log(world.findOne(Physics.body('rectangle')));
   });

   // start the ticker
   Physics.util.ticker.start();

	// ----------------------------------------------------------------
	// -------------------------- CANVAS -----------------------------
	// ----------------------------------------------------------------


	var canvas = document.getElementById("myCanvas2");
	var ctx = canvas.getContext("2d");
	var cw =canvas.width;
	var ch =canvas.height;

	//watermark
	ctx.font = "20px Georgia";
	ctx.fillStyle = "rgba(0,0,0,0.5)";
	ctx.fillText("Sam Nayerman",250, 250);
	ctx.fillStyle = "rgba(0,0,0,1)";
	
	//currently drawn shapes on canvas
	//position at _sleepPosMean
	var squares = [];
	var circles = [];
	var triangles = [];
	var lines = [];

	var tmpPoint1;
	var tmpPoint2;
	
	var activeTool = $('#menuLeft').find('.active').attr('id');
	
	$('#myCanvas2').mousemove(function(e) {
		activeTool = $('#menuLeft').find('.active').attr('id');
		
		if(activeTool==="line" && tmpPoint1 != null && e.buttons == 1) {
			$('#myCanvas2').on('click',function(e) {
				tmpPoint2 = {x: getMousePos(canvas,e).x, y: getMousePos(canvas,e).y};
			});

			$('#myCanvas2').off('click');

			tmpPoint2 = tmpPoint2 == null ? {x: getMousePos(canvas,e).x, y: getMousePos(canvas,e).y} : tmpPoint2;

			var newLine = new Line(tmpPoint1.x, tmpPoint2.x, tmpPoint1.y, tmpPoint2.y);

			var a = newLine.x1 - newLine.x2
			var b = newLine.y1 - newLine.y2

			var c = Math.sqrt( a*a + b*b );
			
			var rect = Physics.body('rectangle', {
				x: newLine.x1,
				y: newLine.y1,
				width: c,
				height: 3
			});
			lines.push(rect);
			world.add(rect);

			return;
		}
	});
	
	$('#myCanvas2').mousedown(function(e) {
		//$('#menuLeft').find('.active').removeClass('active');

		if(activeTool==="square") {
			var newSquare = new Square(getMousePos(canvas,e).x, getMousePos(canvas,e).y, 100);
			
			var rect = Physics.body('rectangle', {
				x: newSquare.x,
				y: newSquare.y,
				width: newSquare.width,
				height: newSquare.width
			});
			squares.push(rect);
			world.add(rect);

		} else if(activeTool==="circle") {
			var newCircle = new Circle(getMousePos(canvas,e).x, getMousePos(canvas,e).y, 50);

			var circ = Physics.body('circle', {
				x: newCircle.x,
				y: newCircle.y,
				radius: newCircle.radius
			});
			circles.push(newCircle);
			world.add(circ);
			
		} else if(activeTool==="triangle") {
			var sideLen = 100;
			var newTriangle = new Triangle(getMousePos(canvas,e).x, getMousePos(canvas,e).y, sideLen);

			var triangle = Physics.body('convex-polygon', {
				x: newTriangle.x,
				y: newTriangle.y,
				restitution: 0.1,
				vertices: [
					{x: 0, y: 0},
					{x: sideLen/2, y: -(Math.sin(60*180/Math.PI)*sideLen)},
					{x: sideLen, y: 0}
				]
			});
			triangles.push(triangle);
			world.add(triangle);
		} else if(activeTool==="line") {
			var pt1 = {x: getMousePos(canvas,e).x, y: getMousePos(canvas,e).y};
			tmpPoint1 = pt1;

		}
	});

	function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	}

});