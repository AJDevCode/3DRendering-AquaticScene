//By Syed Numair Shah and Abhayjit Sodhi


var canvas;
var gl;

var program ;

var near = 1;
var far = 100;

// Size of the viewport in viewing coordinates
var left = -6.0;
var right = 6.0;
var ytop =6.0;
var bottom = -6.0;


var lightPosition2 = vec4(100.0, 100.0, 100.0, 1.0 );
var lightPosition = vec4(0.0, 0.0, 100.0, 1.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 0.4, 0.4, 0.4, 1.0 );
var materialShininess = 30.0;

var ambientColor, diffuseColor, specularColor;

var modelMatrix, viewMatrix, modelViewMatrix, projectionMatrix, normalMatrix;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var RX = 0 ;
var RY = 0 ;
var RZ = 0 ;

var MS = [] ; // The modeling matrix stack
var TIME = 0.0 ; // Realtime
var prevTime = 0.0 ;
var resetTimerFlag = true ;
var animFlag = false ;
var controller ;

function setColor(c)
{
    ambientProduct = mult(lightAmbient, c);
    diffuseProduct = mult(lightDiffuse, c);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
                                         "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
                                        "shininess"),materialShininess );
}

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.4, 0.4, 0.9, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    

    setColor(materialDiffuse) ;

    Cube.init(program);
    Cylinder.init(9,program);
    Cone.init(9,program) ;
    Sphere.init(36,program) ;

    
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    
    
    gl.uniform4fv( gl.getUniformLocation(program, 
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, 
       "specularProduct"),flatten(specularProduct) );	
    gl.uniform4fv( gl.getUniformLocation(program, 
       "lightPosition"),flatten(lightPosition) );
    gl.uniform1f( gl.getUniformLocation(program, 
       "shininess"),materialShininess );

	
	document.getElementById("sliderXi").oninput = function() {
		RX = this.value ;
		window.requestAnimFrame(render);
	}
		
    
    document.getElementById("sliderYi").oninput = function() {
        RY = this.value;
        window.requestAnimFrame(render);
    };
    document.getElementById("sliderZi").oninput = function() {
        RZ =  this.value;
        window.requestAnimFrame(render);
    };

    document.getElementById("animToggleButton").onclick = function() {
        if( animFlag ) {
            animFlag = false;
        }
        else {
            animFlag = true  ;
            resetTimerFlag = true ;
            window.requestAnimFrame(render);
        }
        console.log(animFlag) ;
		
		controller = new CameraController(canvas);
		controller.onchange = function(xRot,yRot) {
			RX = xRot ;
			RY = yRot ;
			window.requestAnimFrame(render); };
    };

    render();
}

// Sets the modelview and normal matrix in the shaders
function setMV() {
    modelViewMatrix = mult(viewMatrix,modelMatrix) ;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    normalMatrix = inverseTranspose(modelViewMatrix) ;
    gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normalMatrix) );
}

// Sets the projection, modelview and normal matrix in the shaders
function setAllMatrices() {
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    setMV() ;
    
}

// Draws a 2x2x2 cube center at the origin
// Sets the modelview matrix and the normal matrix of the global program
function drawCube() {
    setMV() ;
    Cube.draw() ;
}

// Draws a sphere centered at the origin of radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawSphere() {
    setMV() ;
    Sphere.draw() ;
}
// Draws a cylinder along z of height 1 centered at the origin
// and radius 0.5.
// Sets the modelview matrix and the normal matrix of the global program
function drawCylinder() {
    setMV() ;
    Cylinder.draw() ;
}

// Draws a cone along z of height 1 centered at the origin
// and base radius 1.0.
// Sets the modelview matrix and the normal matrix of the global program
function drawCone() {
    setMV() ;
    Cone.draw() ;
}

// Post multiples the modelview matrix with a translation matrix
// and replaces the modeling matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(modelMatrix,translate([x,y,z])) ;
}

// Post multiples the modelview matrix with a rotation matrix
// and replaces the modeling matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(modelMatrix,rotate(theta,[x,y,z])) ;
}

// Post multiples the modeling  matrix with a scaling matrix
// and replaces the modeling matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(modelMatrix,scale(sx,sy,sz)) ;
}

// Pops MS and stores the result as the current modelMatrix
function gPop() {
    modelMatrix = MS.pop() ;
}

// pushes the current modeling Matrix in the stack MS
function gPush() {
    MS.push(modelMatrix) ;
}

// puts the given matrix at the top of the stack MS
function gPut(m) {
	MS.push(m) ;
}

function render() {
    
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(0,0,20);
    MS = [] ; // Initialize modeling matrix stack
	
	// initialize the modeling matrix to identity
    modelMatrix = mat4() ;
    
    // set the camera matrix
    viewMatrix = lookAt(eye, at , up);
   
    // set the projection matrix
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
	//projectionMatrix = perspective(45, 1, near, far);
    
    // Rotations from the sliders
    gRotate(RZ,0,0,1) ;
    gRotate(RY,0,1,0) ;
    gRotate(RX,1,0,0) ;
    
    
    // set all the matrices
    setAllMatrices() ;
    
    var curTime ;
    if( animFlag )
    {
        curTime = (new Date()).getTime() /1000 ;
        if( resetTimerFlag ) {
            prevTime = curTime ;
            resetTimerFlag = false ;
        }
        TIME = TIME + curTime - prevTime ;
        prevTime = curTime ;
    }
   
    //Human Body and Bubbles
    gPush();
    {
        //Main transformations affecting all of body
        gTranslate(3.9, 0.8, 0);
        //Varible to move body up and down, and left and right
        let n = 0.5*Math.cos(0.5*TIME);
        gTranslate(0.5*n, n, 0);
        //Colour pink
        setColor(vec4(0.7, 0.0, 0.3));
        //rotates the body to side and tilted down
        gRotate(-45/3.14159, 0, 1, 0);
        gRotate(5/3.14159, 1, 0, 0);
       
        //Main Body
        gPush();
        {
        gScale(0.525, 0.9, 0.225);
        drawCube();
        }
        gPop();

        //Legs
        gPush();
        {
            //moves both legs down
            gTranslate(0, -1, 0);

            //Hip (Connection between body and legs)
            gPush();
            {
                gTranslate(0, 0.08, 0);
                gScale(0.45, 0.05, 0.23);
                drawCube();
            }
            gPop();

            //Left Leg
            gPush();
            {

                //First Part of Leg (Thighs)
                //rotated whole leg back and forth
                let d = 2*Math.sin(TIME);
                gRotate(d*65/3.14159, 1, 0, 0);
                gTranslate(-0.25, -0.32, 0);
                gScale(0.175, 0.425, 0.175);
                drawCube();

                //Joint inbetween Leg Parts
                gTranslate(0, -1.05, 0);
                gScale(0.5, 0.25, 0.5);
                drawCube();

                //Second Part of Leg
                //rotates this part of the leg just back and till its parllel with other part
                d = Math.abs(Math.sin(0.5*TIME));
                gRotate(d*265/3.14159, 1, 0, 0);
                gTranslate(0, -3.75, 0);
                gScale(2, 4, 2);
                drawCube();

                //Foot
                gTranslate(0, -1.37, 1);
                gScale(1, 0.325, 2.2);
                drawCube();
            }
            gPop();

            //Right Leg
            gPush();
            {

                //First Part of Leg (Thigh)
                //rotated whole leg back and forth
                let d = -2*Math.sin(TIME);
                gRotate(d*65/3.14159, 1, 0, 0);
                gTranslate(0.25, -0.32, 0);
                gScale(0.175, 0.425, 0.175);
                drawCube();

                //Joint inbetween Leg Parts
                gTranslate(0, -1.05, 0);
                gScale(0.5, 0.25, 0.5);
                drawCube();

                //Second Part of Leg
                //rotates this part of the leg just back and till its parllel with other part
                d = Math.abs(Math.cos(0.5*TIME));
                gRotate(d*265/3.14159, 1, 0, 0);
                gTranslate(0, -3.75, 0);
                gScale(2, 4, 2);
                drawCube();

                //Foot
                gTranslate(0, -1.37, 1);
                gScale(1, 0.325, 2.2);
                drawCube();
            }
            gPop();
        }
        gPop();

        //Neck
        gPush();
        {
            gRotate(90, 1, 0, 0);
            gTranslate(0, 0, -1);
            gScale(0.45, 0.45, 0.45);
            drawCylinder();
        }
        gPop();

        //Head
        gTranslate(0, 1.4, 0);
        gScale(0.5, 0.5, 0.5);
        drawSphere();

        //Bubbles
        gTranslate(0, 0, 1);
        //Moves all bubbles up and to the side
        let y = Math.exp(Math.tan(0.5*TIME)+2);
        let d = Math.sin(2*TIME);
        gTranslate(d, y, 0);
        gScale(0.25, 0.25, 0.25);
        //Colour blue
        setColor(vec4(0.5, 0.5, 0.5, 1.0));
        drawSphere();
        //bubble 2
        gTranslate(-d, y/2+2, d);
        drawSphere();
        //bubble 3
        gTranslate(d, y/2+2, -d);
        drawSphere();
        //bubble 4
        gTranslate(-d, y/2+2, d);
        drawSphere();

    }
    gPop();

    gTranslate(0, -5, 0);
    //ground box
    gPush();
    {
        gScale(6, 1, 6);
        setColor(vec4(0.0, 0.0, 0.0, 1.0));
        drawCube();
    }
    gPop();

    //big rock
    gPush();
    {
        gTranslate(0, 1.7, 0);
        gScale(0.7, 0.7, 0.7);
        setColor(vec4(0.2, 0.2, 0.2, 1.0));
        drawSphere();
    }
    gPop();

    //small rock
    gPush();
    {
        gTranslate(-1.1, 1.35, 0);
        gScale(0.35, 0.35, 0.35);
        setColor(vec4(0.2, 0.2, 0.2, 1.0));
        drawSphere();
    }
    gPop();

    //5 seaweeds 
    gPush();
    {
        let d = Math.sin(0.5*TIME);
        gTranslate(0, 1.3, -1.5);
        gRotate(90, 0, 0, 1);
        gRotate(90, 1, 0, 0);
        setColor(vec4(0.2, 0.5, 0.2, 1.0));

        //Seaweed #1
        gPush();
        {
            //First Strand
            gTranslate(0, 0.5, 0);
            gScale(0.5, 0.1, 0.1);
            drawSphere();

            //other 9 starnds
            for(let i =0; i<9; i++){
                d = 1.5*Math.sin((TIME+i));
                gRotate(d*45/3.14159, 0, 1, 0);
                gTranslate(0.9, 0, 0);
                drawSphere();
            }
        }
        gPop();
            
        //Seaweed #2
        gPush();
        {
            //First Strand
            gTranslate(0, 0.5, 0.7);
            gScale(0.45, 0.1, 0.1);
            drawSphere();

            //other 9 starnds
            for(let i =0; i<9; i++){
                d = 1.5*Math.sin((TIME+i));
                gRotate(d*45/3.14159, 0, 1, 0);
                gTranslate(0.9, 0, 0);
                drawSphere();
            }
        }
        gPop();

        //Seaweed #3
        gPush();
        {
            //First Strand
            gTranslate(0, 0.5, -0.9);
            gScale(0.47, 0.1, 0.1);
            drawSphere();

            //other 9 starnds
            for(let i =0; i<9; i++){
                d = 1.5*Math.sin((TIME+i));
                gRotate(d*45/3.14159, 0, 1, 0);
                gTranslate(0.9, 0, 0);
                drawSphere();
            }
        }
        gPop();

        //Seaweed #4
        gPush();
        {
            //First Strand
            gTranslate(0, 0.5, -0.5);
            gScale(0.45, 0.1, 0.1);
            drawSphere();

            //other 9 starnds
            for(let i =0; i<9; i++){
                d = 1.5*Math.sin((TIME+i));
                gRotate(d*45/3.14159, 0, 1, 0);
                gTranslate(0.9, 0, 0);
                drawSphere();
            }
        }
        gPop();

        //Seaweed #5
        gPush();
        {
            //First Strand
            gTranslate(-0.4, 0.5, 0.4);
            gScale(0.47, 0.1, 0.1);
            drawSphere();

            //other 9 starnds
            for(let i =0; i<9; i++){
                d = 1.5*Math.sin((TIME+i));
                gRotate(d*45/3.14159, 0, 1, 0);
                gTranslate(0.9, 0, 0);
                drawSphere();
            }
        }
        gPop();

    }
    gPop();

    // fish body 
    gPush();
    {
        //body
        gTranslate(0, 3.5, 0);
        //Moves fish up and down
        let d = 0.7*Math.sin(1.5*TIME);
        gTranslate(0, d, 0);
        gRotate(90, 0, 1, 0);
        //Moves fish around seaweed
        gRotate(TIME*180/3.14159, 0, 1, 0);
        gTranslate(2, 0, 0);
        gScale(0.5, 0.5, 2);
        //Colour Brown
        setColor(vec4(0.75, 0.2, 0.2, 1.0));
        drawCone();

        //head
        gTranslate(0,0,-0.60);
        gRotate(180, 0, 1, 0);
        gScale(1, 1, 0.2);
        //Colour gray
        setColor(vec4(0.5, 0.5, 0.5, 1.0));
        drawCone();

        //right eyes
        gPush();
        {
            gTranslate(0.4,.5,.01)
            gScale(0.30,0.30,0.4)
            setColor(vec4(1, 1, 1, 1.0));
            drawSphere()
            //pupil
            gTranslate(0,0,0.9)
            gScale(0.45,0.45,0.20)
            setColor(vec4(0, 0, 0, 1.0));
            drawSphere()
        }
        gPop();

        //left eyes
        gPush();
        {

            gTranslate(-.4,.5,.01)
            gScale(0.30,0.30,0.4)
            setColor(vec4(1, 1, 1, 1.0));
            drawSphere()
            //pupil
            gTranslate(0,0,0.9)
            gScale(0.45,0.45,0.20)
            setColor(vec4(0, 0, 0, 1.0));
            drawSphere()
        }
        gPop();

        // tail of body
        gPush();
        {

            gTranslate(0,0,-4.85);
            //Rotate tail back and forth
            d = 40*Math.sin(10*TIME);
            gRotate(d*2/3.14159, 0, 1, 0);

            //Colour dark orange
            setColor(vec4(.50, 0.2, 0.2, 1.0))

            //top tail
            gPush();
            {
                gTranslate(0,.6,-1.2);
                //Slants tail
                gRotate(220, 1, 0, 0);
                gScale(0.35, 0.35, 2);
                drawCone();
            }
            gPop();

            //bottom tail
            gPush();
            {
                gTranslate(0,-0.35,-0.75);
                //Slants tail
                gRotate(140, 1, 0, 0);
                gScale(0.25, 0.25, 1.0);
                drawCone();
            }
            gPop();
        }
        gPop();
    }
    gPop();
    

    if( animFlag )
        window.requestAnimFrame(render);
}

// A simple camera controller which uses an HTML element as the event
// source for constructing a view matrix. Assign an "onchange"
// function to the controller as follows to receive the updated X and
// Y angles for the camera:
//
//   var controller = new CameraController(canvas);
//   controller.onchange = function(xRot, yRot) { ... };
//
// The view matrix is computed elsewhere.
function CameraController(element) {
	var controller = this;
	this.onchange = null;
	this.xRot = 0;
	this.yRot = 0;
	this.scaleFactor = 3.0;
	this.dragging = false;
	this.curX = 0;
	this.curY = 0;
	
	// Assign a mouse down handler to the HTML element.
	element.onmousedown = function(ev) {
		controller.dragging = true;
		controller.curX = ev.clientX;
		controller.curY = ev.clientY;
	};
	
	// Assign a mouse up handler to the HTML element.
	element.onmouseup = function(ev) {
		controller.dragging = false;
	};
	
	// Assign a mouse move handler to the HTML element.
	element.onmousemove = function(ev) {
		if (controller.dragging) {
			// Determine how far we have moved since the last mouse move
			// event.
			var curX = ev.clientX;
			var curY = ev.clientY;
			var deltaX = (controller.curX - curX) / controller.scaleFactor;
			var deltaY = (controller.curY - curY) / controller.scaleFactor;
			controller.curX = curX;
			controller.curY = curY;
			// Update the X and Y rotation angles based on the mouse motion.
			controller.yRot = (controller.yRot + deltaX) % 360;
			controller.xRot = (controller.xRot + deltaY);
			// Clamp the X rotation to prevent the camera from going upside
			// down.
			if (controller.xRot < -90) {
				controller.xRot = -90;
			} else if (controller.xRot > 90) {
				controller.xRot = 90;
			}
			// Send the onchange event to any listener.
			if (controller.onchange != null) {
				controller.onchange(controller.xRot, controller.yRot);
			}
		}
	};
}
