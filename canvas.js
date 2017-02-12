$('#myCanvas2').ready(function() {
	
	// ----------------------------------------------------------------
	// -------------------------- PHYSICS -----------------------------
	// ----------------------------------------------------------------

	var world = Physics();
	
	var gravity = Physics.behavior('constant-acceleration', {
		acc: {x: 0, y: 0.001 }
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

	//constantly called
	world.on('step', function(){
		world.render();

		//watermark
		ctx.font = "20px Georgia";
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.fillText("Sam Nayerman",750, 585);
		ctx.fillStyle = "rgba(0,0,0,1)";

		//connect points for line
		if(pointNodes==2) {
			var newLine = new Line(tmpPoint1.x, tmpPoint2.x, tmpPoint1.y, tmpPoint2.y);

			var a = newLine.x1 - newLine.x2
			var b = newLine.y1 - newLine.y2

			var c = Math.sqrt( a*a + b*b );
			
			var rect = Physics.body('rectangle', {
				x: getMidPoint(tmpPoint1,tmpPoint2).x,
				y: getMidPoint(tmpPoint1,tmpPoint2).y,
				width: c,
				restitution: 0.1,
				mass: 10,
				height: 3
			});

			var angleDeg = Math.atan2(newLine.y2 - newLine.y1, newLine.x2 - newLine.x1);
			rect.state.angular.pos = angleDeg;

			var thing = Physics.body('compound', {
				x: getMidPoint(tmpPoint1,tmpPoint2).x,
				y: getMidPoint(tmpPoint1,tmpPoint2).y,
				restitution: 0.1,
				mass: 10,
				cof: 1,
				height: 3,
				children: [
					tmpWorldPt1,
					rect,
					tmpWorldPt2
				]
			});

			lines.push(rect);
			world.add(rect);

			world.remove(tmpWorldPt1);
			world.remove(tmpWorldPt2);

			tmpWorldPt1 = null;
			tmpWorldPt2 = null;
			tmpPoint2 = null;
			tmpPoint1 = null;
			pointNodes = 0;
		}
	});

	var viewportBounds = Physics.aabb(0, 0, 900, 600);

   // constrain objects to these bounds
   world.add(Physics.behavior('edge-collision-detection', {
      aabb: viewportBounds,
      restitution: 0.1,
      cof: 1
   }));
	
	world.add( Physics.behavior('interactive', { el: renderer.el }) );
	world.add( Physics.behavior('body-impulse-response') );
	world.add( Physics.behavior('body-collision-detection') );
	world.add(Physics.behavior('verlet-constraints'));
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
	
	//currently drawn shapes on canvas
	//position at _sleepPosMean
	var squares = [];
	var circles = [];
	var triangles = [];
	var lines = [];
	var points = [];

	var pointNodes = 0;

	var tmpPoint1, tmpPoint2;

	var tmpWorldPt1, tmpWorldPt2;
	
	var activeTool = $('#menuLeft').find('.active').attr('id');
	
	$('#myCanvas2').mousemove(function(e) {
		activeTool = $('#menuLeft').find('.active').attr('id');

	});
	
	$('#myCanvas2').mousedown(function(e) {
		//$('#menuLeft').find('.active').removeClass('active');

		if(activeTool==="square") {
			var newSquare = new Square(getMousePos(canvas,e).x, getMousePos(canvas,e).y, 100);
			
			var rect = Physics.body('rectangle', {
				x: newSquare.x,
				y: newSquare.y,
				mass: 10,
				cof: 1,
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
				mass: 10,
				cof: 1,
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
				mass: 10,
				restitution: 0.1,
				cof: 1,
				vertices: [
					{x: 0, y: 0},
					{x: sideLen/2, y: -(Math.sin(60*180/Math.PI)*sideLen)},
					{x: sideLen, y: 0}
				]
			});
			triangles.push(triangle);
			world.add(triangle);
		} else if(activeTool==="line") {
			if(pointNodes==0) {
				var pt1 = {x: getMousePos(canvas,e).x, y: getMousePos(canvas,e).y};
				
				var pt = Physics.body('circle', {
					x: pt1.x,
					y: pt1.y,
					radius: 5,
					restitution: 0,
					mass: 10,
					treatment: 'static',
					styles: {
						fillStyle: "rgba(255,0,0,1)"
					}
				});
				tmpWorldPt1 = pt;
				world.add(pt);
				tmpPoint1 = pt1;
				pointNodes++;
			} else if(pointNodes==1) {
				var pt2 = {x: getMousePos(canvas,e).x, y: getMousePos(canvas,e).y};
				
				var pt = Physics.body('circle', {
					x: pt2.x,
					y: pt2.y,
					radius: 5,
					restitution: 0,
					mass: 10,
					treatment: 'static',
					styles: {
						fillStyle: "rgba(255,0,0,1)"
					}
				});
				tmpWorldPt2 = pt;
				world.add(pt);
				tmpPoint2 = pt2;
				pointNodes++;
			}
		} else if(activeTool==="point") {
				var pt1 = {x: getMousePos(canvas,e).x, y: getMousePos(canvas,e).y};
				
				var pt = Physics.body('circle', {
					x: pt1.x,
					y: pt1.y,
					radius: 5,
					restitution: 0,
					mass: 10,
					treatment: 'static',
					styles: {
						fillStyle: "rgba(255,0,0,1)"
					}
				});
				world.add(pt);
				points.push(pt);
			}
	});

	function getMousePos(canvas, evt) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	}

	function getMidPoint(p1, p2) {
		return {x: (p1.x+p2.x)/2, y: (p1.y+p2.y)/2};
	}

});