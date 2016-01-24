var app = require('./app');
var ncbApp = app.ncbApp;
var THREE = require('three.js');

var exampleModel = {
    model : {
        cellGroups : {
            cellGroups: [
                {
                    name : 'Cell 1',
                    position : {x : -5, y: -5, z: -5}
                },

                {
                    name : 'Cell 2',
                    position : {x : -5, y: 5, z: -5}
                },

                {
                    name : 'Cell 3',
                    position : {x : 5, y: 5, z: -5}
                },

                {
                    name : 'Cell 4',
                    position : {x : 5, y: -5, z: -5}
                },

                {
                    name : 'Cell 5',
                    position : {x : -5, y: -5, z: 5}
                },

                {
                    name : 'Cell 6',
                    position : {x : -5, y: 5, z: 5}
                },

                {
                    name : 'Cell 7',
                    position : {x : 5, y: 5, z: 5}
                },

                {
                    name : 'Cell 8',
                    position : {x : 5, y: -5, z: 5}
                }
            ]
        },

        synapses : [
            {
                pre : 'Cell 1',
                post : 'Cell 2'
            },
            {
                pre : 'Cell 2',
                post : 'Cell 7'
            },
            {
                pre : 'Cell 3',
                post : 'Cell 5'
            },
            {
                pre : 'Cell 4',
                post : 'Cell 8'
            }

        ]
    }
}

ncbApp.controller('VisualizationController', ['$scope', '$http', function($scope, $http) {

    var DARK_FACTOR = 2;

    function SelectionBox(startPos) {
        this.startPos = startPos;
        this.endPos = startPos.clone();

        this.material = new THREE.MeshBasicMaterial( { color : 0xff0000, transparent : true, opacity: 0.3 } );
        this.mesh = null;
    }

    SelectionBox.prototype.update = function(endPos) {
        this.endPos = endPos;

        var startRight = this.startPos.x > this.endPos.x;
        var startHigher = this.startPos.y > this.endPos.y;

        var distanceX = startRight ? this.startPos.x - this.endPos.x : this.endPos.x - this.startPos.x;
        var distanceY = startHigher ? this.startPos.y - this.endPos.y : this.endPos.y - this.startPos.y;

        var geometry = new THREE.BoxGeometry(distanceX, distanceY, 1);

        var translate = new THREE.Matrix4();
        translate.makeTranslation(startRight ? -distanceX / 2 : distanceX / 2, startHigher ? distanceY / 2 : -distanceY / 2, 0);
        geometry.applyMatrix(translate);

        if(this.mesh != null) {
            $scope.guiScene.remove(this.mesh);
        }

        this.mesh = new THREE.Mesh(geometry, this.material);
        $scope.guiScene.add(this.mesh);

        var w = $scope.canvasWidth / 2;
        var h = $scope.canvasHeight / 2;
        this.mesh.position.set(this.startPos.x - w, -this.startPos.y + h, 0);
    }

    SelectionBox.prototype.end = function() {
        if(this.mesh != null) {
            $scope.guiScene.remove(this.mesh);
        }

        var selectionMinX = this.startPos.x < this.endPos.x ? this.startPos.x : this.endPos.x;
        var selectionMaxX = this.startPos.x > this.endPos.x ? this.startPos.x : this.endPos.x;
        var selectionMinY = this.startPos.y < this.endPos.y ? this.startPos.y : this.endPos.y;
        var selectionMaxY = this.startPos.y > this.endPos.y ? this.startPos.y : this.endPos.y;

        var selectedObjects = [];

        if($scope.renderNeurons) {
            for(var i = 0; i < $scope.objects.length; i++) {
                var obj = $scope.objects[i];
                var screenCoords = worldToScreenCoordinates(obj);

                if (screenCoords.x >= selectionMinX && screenCoords.x <= selectionMaxX &&
                            screenCoords.y >= selectionMinY && screenCoords.y <= selectionMaxY && !obj.selected) {
                    selectedObjects.push(obj);
                }
            }
        }
        return selectedObjects;
    }

    $scope.selecting = false;
    $scope.selectionBox = null;
    $scope.selectedObjects = [];
    $scope.initialObject = null;

    function handleMouseDown(event) { // begin
        event.preventDefault();

        if(event.button == THREE.MOUSE.LEFT) {
            $scope.selecting = true;

            if($scope.selectionBox != null) {
                $scope.selectionBox.end();
            }

            $scope.selectionBox = new SelectionBox(new THREE.Vector2(event.offsetX, event.offsetY));

            $scope.initialObject = raycastSingleObject(event, true).obj;
        }
    }

    $scope.raycaster = new THREE.Raycaster();
    $scope.mousePos = new THREE.Vector2();

    $scope.infoText = null;

    function handleMouseMove(event) { // during
        event.preventDefault();

        if($scope.selecting) {
            $scope.selectionBox.update(new THREE.Vector2(event.offsetX, event.offsetY));
        }

        else {
            var result = raycastSingleObject(event);
            var obj = result.obj;
            var is_connection = result.is_connection;

            if(obj != null && $scope.infoText == null) {
                var infoStr = is_connection ? connectionToString(obj.conn) : object3DToString(obj);
                $scope.infoText = createDivAtPositionWithText(new THREE.Vector2(event.offsetX, event.offsetY), infoStr, is_connection);
            }

            else if(obj == null && $scope.infoText != null) {
                $scope.infoText.remove();
                $scope.infoText = null;
            }
        }
    }

    function handleMouseUp(event) { // end
        event.preventDefault();

        if(event.button == THREE.MOUSE.LEFT) {
            $scope.selecting = false;

            if(!event.shiftKey) {
                for (var i = 0; i < $scope.selectedObjects.length; i++) {
                    var obj = $scope.selectedObjects[i];

                    if(obj.selected) {
                        obj.material.color.setHex((obj.material.color.getHex() & 0xfefefe) >> 1);
                        obj.material.color.setHex((obj.material.color.getHex() & 0xfefefe) >> 1);
                        obj.selected = false;
                    }

                    for(var j = 0; j < obj.connections.length; j++) {
                        var conn = obj.connections[j];
                        if(conn.selected) {
                            conn.material.color.setHex((conn.material.color.getHex() & 0xfefefe) >> 1);
                            conn.material.color.setHex((conn.material.color.getHex() & 0xfefefe) >> 1);
                            conn.selected = false;
                        }
                    }
                }

                $scope.selectedObjects = $scope.selectionBox.end();
            }

            else {
                Array.prototype.push.apply($scope.selectedObjects, $scope.selectionBox.end());
            }

            if($scope.initialObject != null && !$scope.initialObject.selected) {
                $scope.selectedObjects.push($scope.initialObject);
            }

            console.log("Found Items: " + $scope.selectedObjects.length);

            // for(var i = 0; i < $scope.objects.length; i++) {
            //     var obj = $scope.objects[i];
            //     obj.material.color.setHex((obj.material.color.getHex() & 0xfefefe) >> 1);//setHex(0x00ff00);
            // }

            //var center = new THREE.Vector3();
            for (var i = 0; i < $scope.selectedObjects.length; i++) {
                var obj = $scope.selectedObjects[i];
                //obj.material.color.setHex(0xff0000);
                if(!obj.selected) {
                    obj.material.color.setHex((obj.material.color.getHex() & 0xfefefe) << 1);
                    obj.material.color.setHex((obj.material.color.getHex() & 0xfefefe) << 1);
                    obj.selected = true;
                    //center.add(obj.position);
                }

                if($scope.renderConnections) {
                    for(var j = 0; j < obj.connections.length; j++) {
                        var conn = obj.connections[j];
                        if(!conn.selected) {
                            conn.material.color.setHex((conn.material.color.getHex() & 0xfefefe) << 1);
                            conn.material.color.setHex((conn.material.color.getHex() & 0xfefefe) << 1);
                            conn.selected = true;
                        }
                    }
                }
            }

            //center.divideScalar($scope.selectedObjects.length);

            //$scope.cameraControls.target.copy(center);
            //$scope.cameraControls.update();

            $scope.selectionBox = null;
        }
    }

    function raycastSingleObject(event, ignoreConnections) {
        if(ignoreConnections === undefined) {
            ignoreConnections = false;
        }

        $scope.mousePos.setX((event.offsetX / $scope.canvasWidth) * 2 - 1);
        $scope.mousePos.setY(-(event.offsetY / $scope.canvasHeight) * 2 + 1);

        $scope.raycaster.setFromCamera($scope.mousePos, $scope.camera);

        var intersects = $scope.renderNeurons ? $scope.raycaster.intersectObjects($scope.objects) : [];
        var is_connection = intersects.length == 0;
        if(is_connection && $scope.renderConnections && !ignoreConnections) {
            intersects = $scope.raycaster.intersectObjects($scope.connections);
        }

        if(intersects.length > 0) {
            return {obj: intersects[0].object, is_connection: is_connection};
        }

        return {obj: null, is_connection: false};
    }

    function worldToScreenCoordinates(object) {
        var hWidth = $scope.canvasWidth / 2;
        var hHeight = $scope.canvasHeight / 2;

        var vec = new THREE.Vector3();
        //var projector = new THREE.Projector();
        //projector.projectVector(vec.setFromMatrixPosition(object.matrixWorld), $scope.camera);
        vec.setFromMatrixPosition(object.matrixWorld);
        vec.project($scope.camera);

        vec.setX((vec.x * hWidth) + hWidth);
        vec.setY(-(vec.y * hHeight) + hHeight);

        return vec;
    }

    function createDivAtPositionWithText(pos, text, is_conn) {
        var yPos = is_conn ? pos.y - 10 : pos.y - 50;
        //$scope.camera.updateMatrixWorld();
        var div = document.createElement('div');
        div.className += 'gui-text';
        div.innerHTML = text || "Text";
        div.style.left = pos.x + 'px';
        div.style.top = yPos + 'px';
        $scope.canvas.appendChild(div);
        return div;
    }

    function object3DToString(obj) {
        var str = obj.ncs_name + '<br/>' +
                  //'Pos: [' + obj.position.x + ', ' + obj.position.y + ', ' + obj.position.z + ']';
                  'Input Current: ' + 0 + '<br/>' +
                  'Neuron Voltage: ' + 0;

        return str;
    }

    function connectionToString(conn) {
        var str = conn.pre + ' -> ' + conn.post;
        return str;
    }

    $scope.renderNeurons = true;
    $scope.renderConnections = true;

    $scope.updateRenderTargets = function(type) {
        if(type === 'neuron') {
            if($scope.renderNeurons) {
                for(var i = 0; i < $scope.objects.length; i++) {
                    $scope.scene.add($scope.objects[i]);
                }
            }
            else {
                for(var i = 0; i < $scope.objects.length; i++) {
                    $scope.scene.remove($scope.objects[i]);
                }
            }
        }

        else if(type === 'conn') {
            if($scope.renderConnections) {
                for(var i = 0; i < $scope.connections.length; i++) {
                    $scope.scene.add($scope.connections[i]);
                }
            }
            else {
                for(var i = 0; i < $scope.connections.length; i++) {
                    $scope.scene.remove($scope.connections[i]);
                }
            }
        }
    }

    $scope.render = function() {
        requestAnimationFrame($scope.render);

        //$scope.cube.rotation.x += 0.1;
        //$scope.cube.rotation.y += 0.1;

        $scope.renderer.clear();

        $scope.renderer.render($scope.scene, $scope.camera);

        $scope.renderer.clearDepth();
        $scope.renderer.render($scope.guiScene, $scope.guiCamera);
    };

    $scope.init = function() {
        var canvas = document.getElementById('renderCanvas');
        $scope.canvas = canvas;

        $scope.canvasWidth = canvas.offsetWidth;
        $scope.canvasHeight = 600;

        $scope.scene = new THREE.Scene();
        $scope.camera = new THREE.PerspectiveCamera(75, $scope.canvasWidth / $scope.canvasHeight, 0.1, 1000);
        $scope.guiCamera = new THREE.OrthographicCamera(-$scope.canvasWidth / 2, $scope.canvasWidth / 2, $scope.canvasHeight / 2,
                                                        -$scope.canvasHeight / 2, 0.1, 5);

        $scope.guiScene = new THREE.Scene();

        $scope.renderer = new THREE.WebGLRenderer( { antialias : true } );
        $scope.renderer.setSize($scope.canvasWidth, $scope.canvasHeight);
        $scope.renderer.setClearColor(0x2e2e2e, 1);
        $scope.renderer.autoClear = false;
        $scope.renderer.setPixelRatio(window.devicePixelRatio);
        canvas.appendChild($scope.renderer.domElement);

        $scope.guiCamera.position.z = 1;
        $scope.camera.position.z = 15;

        $scope.cameraControls = new THREE.OrbitControls($scope.camera, $scope.renderer.domElement);
        $scope.cameraControls.minDistance = 5;
        $scope.cameraControls.maxDistance = 75;

        // setup input
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mousemove', handleMouseMove);

        $scope.loadModel();

        $scope.render();
    };


    $scope.loadModel = function() {
        $scope.objects = [];
        $scope.connections = [];

        var conn_map = {};
        var cells = exampleModel.model.cellGroups.cellGroups;
        console.log(cells);
        for(var i = 0; i < cells.length; i++) {
            var darker_color = (0x00ff00 & 0xfefefe) >> 1;
            darker_color = (darker_color & 0xfefefe) >> 1;
            var cube = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial( { color : darker_color } ));
            cube.selected = false;
            cube.connections = [];

            var cell = cells[i];
            cube.ncs_name = cell.name;
            $scope.scene.add(cube);
            cube.position.set(cell.position.x, cell.position.y, cell.position.z);
            //cube.position.setX(positions[i].x);

            conn_map[cell.name] = cube;

            //var bbox = new THREE.BoundingBoxHelper(cube, 0x000000);
            //bbox.update();
            //var bbox = new THREE.WireframeHelper(cube, 0x000000);
            var bbox = new THREE.BoxHelper(cube);
            $scope.scene.add(bbox);

            $scope.objects.push(cube);
        }

        var connections = exampleModel.model.synapses;
        for(var i = 0; i < connections.length; i++) {
            var conn = connections[i];
            var pre = conn_map[conn.pre];
            var post = conn_map[conn.post];

            var darker_color = (0xff0000 & 0xfefefe) >> 1;
            darker_color = (darker_color & 0xfefefe) >> 1;
            var cylinder = createCylinderFromPoints(pre.position, post.position, darker_color);
            cylinder.conn = conn;
            cylinder.selected = false;

            //var wireframe = new THREE.WireframeHelper(cylinder, 0x000000);

            $scope.scene.add(cylinder);
            //$scope.scene.add(wireframe);

            $scope.connections.push(cylinder);
            pre.connections.push(cylinder);
            post.connections.push(cylinder);
        }
    };

    function createCylinderFromPoints(p1, p2, color) {
        if(color === undefined) {
            color = 0xff0000;
        }

        var direction = new THREE.Vector3().subVectors(p2, p1).normalize();
        var length = p1.distanceTo(p2);

        var mat = new THREE.MeshBasicMaterial({color : color});
        var geo = new THREE.CylinderGeometry(0.1, 0.1, length, 8);
        var cylinder = new THREE.Mesh(geo, mat);

        var pos = new THREE.Vector3().addVectors(p1,p2).divideScalar(2);
        cylinder.position.copy(pos);

        var q = new THREE.Quaternion();
        if(direction.y > 0.99999) {
            q.set(0,0,0,1);
        }
        else if(direction.y < -0.99999) {
            q.set(1,0,0,0);
        }
        else {
            var axis = new THREE.Vector3(direction.z, 0, -direction.x).normalize();
            var angle = Math.acos(direction.y);
            q.setFromAxisAngle(axis, angle);
        }

        cylinder.quaternion.copy(q);
        return cylinder;
    }
}]);







































/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */
/*global THREE, console */

( function () {

    function OrbitConstraint ( object ) {

        this.object = object;

        // "target" sets the location of focus, where the object orbits around
        // and where it pans with respect to.
        this.target = new THREE.Vector3();

        // Limits to how far you can dolly in and out ( PerspectiveCamera only )
        this.minDistance = 0;
        this.maxDistance = Infinity;

        // Limits to how far you can zoom in and out ( OrthographicCamera only )
        this.minZoom = 0;
        this.maxZoom = Infinity;

        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians

        // How far you can orbit horizontally, upper and lower limits.
        // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
        this.minAzimuthAngle = - Infinity; // radians
        this.maxAzimuthAngle = Infinity; // radians

        // Set to true to enable damping (inertia)
        // If damping is enabled, you must call controls.update() in your animation loop
        this.enableDamping = false;
        this.dampingFactor = 0.25;

        ////////////
        // internals

        var scope = this;

        var EPS = 0.000001;

        // Current position in spherical coordinate system.
        var theta;
        var phi;

        // Pending changes
        var phiDelta = 0;
        var thetaDelta = 0;
        var scale = 1;
        var panOffset = new THREE.Vector3();
        var zoomChanged = false;

        // API

        this.getPolarAngle = function () {

            return phi;

        };

        this.getAzimuthalAngle = function () {

            return theta;

        };

        this.rotateLeft = function ( angle ) {

            thetaDelta -= angle;

        };

        this.rotateUp = function ( angle ) {

            phiDelta -= angle;

        };

        // pass in distance in world space to move left
        this.panLeft = function() {

            var v = new THREE.Vector3();

            return function panLeft ( distance ) {

                var te = this.object.matrix.elements;

                // get X column of matrix
                v.set( te[ 0 ], te[ 1 ], te[ 2 ] );
                v.multiplyScalar( - distance );

                panOffset.add( v );

            };

        }();

        // pass in distance in world space to move up
        this.panUp = function() {

            var v = new THREE.Vector3();

            return function panUp ( distance ) {

                var te = this.object.matrix.elements;

                // get Y column of matrix
                v.set( te[ 4 ], te[ 5 ], te[ 6 ] );
                v.multiplyScalar( distance );

                panOffset.add( v );

            };

        }();

        // pass in x,y of change desired in pixel space,
        // right and down are positive
        this.pan = function ( deltaX, deltaY, screenWidth, screenHeight ) {

            if ( scope.object instanceof THREE.PerspectiveCamera ) {

                // perspective
                var position = scope.object.position;
                var offset = position.clone().sub( scope.target );
                var targetDistance = offset.length();

                // half of the fov is center to top of screen
                targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

                // we actually don't use screenWidth, since perspective camera is fixed to screen height
                scope.panLeft( 2 * deltaX * targetDistance / screenHeight );
                scope.panUp( 2 * deltaY * targetDistance / screenHeight );

            } else if ( scope.object instanceof THREE.OrthographicCamera ) {

                // orthographic
                scope.panLeft( deltaX * ( scope.object.right - scope.object.left ) / screenWidth );
                scope.panUp( deltaY * ( scope.object.top - scope.object.bottom ) / screenHeight );

            } else {

                // camera neither orthographic or perspective
                console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );

            }

        };

        this.dollyIn = function ( dollyScale ) {

            if ( scope.object instanceof THREE.PerspectiveCamera ) {

                scale /= dollyScale;

            } else if ( scope.object instanceof THREE.OrthographicCamera ) {

                scope.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom * dollyScale ) );
                scope.object.updateProjectionMatrix();
                zoomChanged = true;

            } else {

                console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );

            }

        };

        this.dollyOut = function ( dollyScale ) {

            if ( scope.object instanceof THREE.PerspectiveCamera ) {

                scale *= dollyScale;

            } else if ( scope.object instanceof THREE.OrthographicCamera ) {

                scope.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom / dollyScale ) );
                scope.object.updateProjectionMatrix();
                zoomChanged = true;

            } else {

                console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );

            }

        };

        this.update = function() {

            var offset = new THREE.Vector3();

            // so camera.up is the orbit axis
            var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
            var quatInverse = quat.clone().inverse();

            var lastPosition = new THREE.Vector3();
            var lastQuaternion = new THREE.Quaternion();

            return function () {

                var position = this.object.position;

                offset.copy( position ).sub( this.target );

                // rotate offset to "y-axis-is-up" space
                offset.applyQuaternion( quat );

                // angle from z-axis around y-axis

                theta = Math.atan2( offset.x, offset.z );

                // angle from y-axis

                phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

                theta += thetaDelta;
                phi += phiDelta;

                // restrict theta to be between desired limits
                theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, theta ) );

                // restrict phi to be between desired limits
                phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

                // restrict phi to be betwee EPS and PI-EPS
                phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

                var radius = offset.length() * scale;

                // restrict radius to be between desired limits
                radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

                // move target to panned location
                this.target.add( panOffset );

                offset.x = radius * Math.sin( phi ) * Math.sin( theta );
                offset.y = radius * Math.cos( phi );
                offset.z = radius * Math.sin( phi ) * Math.cos( theta );

                // rotate offset back to "camera-up-vector-is-up" space
                offset.applyQuaternion( quatInverse );

                position.copy( this.target ).add( offset );

                this.object.lookAt( this.target );

                if ( this.enableDamping === true ) {

                    thetaDelta *= ( 1 - this.dampingFactor );
                    phiDelta *= ( 1 - this.dampingFactor );

                } else {

                    thetaDelta = 0;
                    phiDelta = 0;

                }

                scale = 1;
                panOffset.set( 0, 0, 0 );

                // update condition is:
                // min(camera displacement, camera rotation in radians)^2 > EPS
                // using small-angle approximation cos(x/2) = 1 - x^2 / 8

                if ( zoomChanged ||
                     lastPosition.distanceToSquared( this.object.position ) > EPS ||
                    8 * ( 1 - lastQuaternion.dot( this.object.quaternion ) ) > EPS ) {

                    lastPosition.copy( this.object.position );
                    lastQuaternion.copy( this.object.quaternion );
                    zoomChanged = false;

                    return true;

                }

                return false;

            };

        }();

    };


    // This set of controls performs orbiting, dollying (zooming), and panning. It maintains
    // the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
    // supported.
    //
    //    Orbit - left mouse / touch: one finger move
    //    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
    //    Pan - right mouse, or arrow keys / touch: three finter swipe

    THREE.OrbitControls = function ( object, domElement ) {

        var constraint = new OrbitConstraint( object );

        this.domElement = ( domElement !== undefined ) ? domElement : document;

        // API

        Object.defineProperty( this, 'constraint', {

            get: function() {

                return constraint;

            }

        } );

        this.getPolarAngle = function () {

            return constraint.getPolarAngle();

        };

        this.getAzimuthalAngle = function () {

            return constraint.getAzimuthalAngle();

        };

        // Set to false to disable this control
        this.enabled = true;

        // center is old, deprecated; use "target" instead
        this.center = this.target;

        // This option actually enables dollying in and out; left as "zoom" for
        // backwards compatibility.
        // Set to false to disable zooming
        this.enableZoom = true;
        this.zoomSpeed = 1.0;

        // Set to false to disable rotating
        this.enableRotate = true;
        this.rotateSpeed = 1.0;

        // Set to false to disable panning
        this.enablePan = true;
        this.keyPanSpeed = 7.0; // pixels moved per arrow key push

        // Set to true to automatically rotate around the target
        // If auto-rotate is enabled, you must call controls.update() in your animation loop
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

        // Set to false to disable use of the keys
        this.enableKeys = true;

        // The four arrow keys
        this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

        // Mouse buttons
        this.mouseButtons = { ORBIT: THREE.MOUSE.RIGHT, ZOOM: THREE.MOUSE.MIDDLE, PAN: -1 };

        ////////////
        // internals

        var scope = this;

        var rotateStart = new THREE.Vector2();
        var rotateEnd = new THREE.Vector2();
        var rotateDelta = new THREE.Vector2();

        var panStart = new THREE.Vector2();
        var panEnd = new THREE.Vector2();
        var panDelta = new THREE.Vector2();

        var dollyStart = new THREE.Vector2();
        var dollyEnd = new THREE.Vector2();
        var dollyDelta = new THREE.Vector2();

        var STATE = { NONE : - 1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

        var state = STATE.NONE;

        // for reset

        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        this.zoom0 = this.object.zoom;

        // events

        var changeEvent = { type: 'change' };
        var startEvent = { type: 'start' };
        var endEvent = { type: 'end' };

        // pass in x,y of change desired in pixel space,
        // right and down are positive
        function pan( deltaX, deltaY ) {

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            constraint.pan( deltaX, deltaY, element.clientWidth, element.clientHeight );

        }

        this.update = function () {

            if ( this.autoRotate && state === STATE.NONE ) {

                constraint.rotateLeft( getAutoRotationAngle() );

            }

            if ( constraint.update() === true ) {

                this.dispatchEvent( changeEvent );

            }

        };

        this.reset = function () {

            state = STATE.NONE;

            this.target.copy( this.target0 );
            this.object.position.copy( this.position0 );
            this.object.zoom = this.zoom0;

            this.object.updateProjectionMatrix();
            this.dispatchEvent( changeEvent );

            this.update();

        };

        function getAutoRotationAngle() {

            return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

        }

        function getZoomScale() {

            return Math.pow( 0.95, scope.zoomSpeed );

        }

        function onMouseDown( event ) {

            if ( scope.enabled === false ) return;

            event.preventDefault();

            if ( event.button === scope.mouseButtons.ORBIT ) {

                if ( scope.enableRotate === false ) return;

                state = STATE.ROTATE;

                rotateStart.set( event.clientX, event.clientY );

            } else if ( event.button === scope.mouseButtons.ZOOM ) {

                if ( scope.enableZoom === false ) return;

                state = STATE.DOLLY;

                dollyStart.set( event.clientX, event.clientY );

            } else if ( event.button === scope.mouseButtons.PAN ) {

                if ( scope.enablePan === false ) return;

                state = STATE.PAN;

                panStart.set( event.clientX, event.clientY );

            }

            if ( state !== STATE.NONE ) {

                document.addEventListener( 'mousemove', onMouseMove, false );
                document.addEventListener( 'mouseup', onMouseUp, false );
                scope.dispatchEvent( startEvent );

            }

        }

        function onMouseMove( event ) {

            if ( scope.enabled === false ) return;

            event.preventDefault();

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            if ( state === STATE.ROTATE ) {

                if ( scope.enableRotate === false ) return;

                rotateEnd.set( event.clientX, event.clientY );
                rotateDelta.subVectors( rotateEnd, rotateStart );

                // rotating across whole screen goes 360 degrees around
                constraint.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

                // rotating up and down along whole screen attempts to go 360, but limited to 180
                constraint.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

                rotateStart.copy( rotateEnd );

            } else if ( state === STATE.DOLLY ) {

                if ( scope.enableZoom === false ) return;

                dollyEnd.set( event.clientX, event.clientY );
                dollyDelta.subVectors( dollyEnd, dollyStart );

                if ( dollyDelta.y > 0 ) {

                    constraint.dollyIn( getZoomScale() );

                } else if ( dollyDelta.y < 0 ) {

                    constraint.dollyOut( getZoomScale() );

                }

                dollyStart.copy( dollyEnd );

            } else if ( state === STATE.PAN ) {

                if ( scope.enablePan === false ) return;

                panEnd.set( event.clientX, event.clientY );
                panDelta.subVectors( panEnd, panStart );

                pan( panDelta.x, panDelta.y );

                panStart.copy( panEnd );

            }

            if ( state !== STATE.NONE ) scope.update();

        }

        function onMouseUp( /* event */ ) {

            if ( scope.enabled === false ) return;

            document.removeEventListener( 'mousemove', onMouseMove, false );
            document.removeEventListener( 'mouseup', onMouseUp, false );
            scope.dispatchEvent( endEvent );
            state = STATE.NONE;

        }

        function onMouseWheel( event ) {

            if ( scope.enabled === false || scope.enableZoom === false || state !== STATE.NONE ) return;

            event.preventDefault();
            event.stopPropagation();

            var delta = 0;

            if ( event.wheelDelta !== undefined ) {

                // WebKit / Opera / Explorer 9

                delta = event.wheelDelta;

            } else if ( event.detail !== undefined ) {

                // Firefox

                delta = - event.detail;

            }

            if ( delta > 0 ) {

                constraint.dollyOut( getZoomScale() );

            } else if ( delta < 0 ) {

                constraint.dollyIn( getZoomScale() );

            }

            scope.update();
            scope.dispatchEvent( startEvent );
            scope.dispatchEvent( endEvent );

        }

        function onKeyDown( event ) {

            if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;

            switch ( event.keyCode ) {

                case scope.keys.UP:
                    pan( 0, scope.keyPanSpeed );
                    scope.update();
                    break;

                case scope.keys.BOTTOM:
                    pan( 0, - scope.keyPanSpeed );
                    scope.update();
                    break;

                case scope.keys.LEFT:
                    pan( scope.keyPanSpeed, 0 );
                    scope.update();
                    break;

                case scope.keys.RIGHT:
                    pan( - scope.keyPanSpeed, 0 );
                    scope.update();
                    break;

            }

        }

        function touchstart( event ) {

            if ( scope.enabled === false ) return;

            switch ( event.touches.length ) {

                case 1: // one-fingered touch: rotate

                    if ( scope.enableRotate === false ) return;

                    state = STATE.TOUCH_ROTATE;

                    rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                    break;

                case 2: // two-fingered touch: dolly

                    if ( scope.enableZoom === false ) return;

                    state = STATE.TOUCH_DOLLY;

                    var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                    var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                    var distance = Math.sqrt( dx * dx + dy * dy );
                    dollyStart.set( 0, distance );
                    break;

                case 3: // three-fingered touch: pan

                    if ( scope.enablePan === false ) return;

                    state = STATE.TOUCH_PAN;

                    panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                    break;

                default:

                    state = STATE.NONE;

            }

            if ( state !== STATE.NONE ) scope.dispatchEvent( startEvent );

        }

        function touchmove( event ) {

            if ( scope.enabled === false ) return;

            event.preventDefault();
            event.stopPropagation();

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            switch ( event.touches.length ) {

                case 1: // one-fingered touch: rotate

                    if ( scope.enableRotate === false ) return;
                    if ( state !== STATE.TOUCH_ROTATE ) return;

                    rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                    rotateDelta.subVectors( rotateEnd, rotateStart );

                    // rotating across whole screen goes 360 degrees around
                    constraint.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
                    // rotating up and down along whole screen attempts to go 360, but limited to 180
                    constraint.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

                    rotateStart.copy( rotateEnd );

                    scope.update();
                    break;

                case 2: // two-fingered touch: dolly

                    if ( scope.enableZoom === false ) return;
                    if ( state !== STATE.TOUCH_DOLLY ) return;

                    var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                    var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                    var distance = Math.sqrt( dx * dx + dy * dy );

                    dollyEnd.set( 0, distance );
                    dollyDelta.subVectors( dollyEnd, dollyStart );

                    if ( dollyDelta.y > 0 ) {

                        constraint.dollyOut( getZoomScale() );

                    } else if ( dollyDelta.y < 0 ) {

                        constraint.dollyIn( getZoomScale() );

                    }

                    dollyStart.copy( dollyEnd );

                    scope.update();
                    break;

                case 3: // three-fingered touch: pan

                    if ( scope.enablePan === false ) return;
                    if ( state !== STATE.TOUCH_PAN ) return;

                    panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                    panDelta.subVectors( panEnd, panStart );

                    pan( panDelta.x, panDelta.y );

                    panStart.copy( panEnd );

                    scope.update();
                    break;

                default:

                    state = STATE.NONE;

            }

        }

        function touchend( /* event */ ) {

            if ( scope.enabled === false ) return;

            scope.dispatchEvent( endEvent );
            state = STATE.NONE;

        }

        function contextmenu( event ) {

            event.preventDefault();

        }

        this.dispose = function() {

            this.domElement.removeEventListener( 'contextmenu', contextmenu, false );
            this.domElement.removeEventListener( 'mousedown', onMouseDown, false );
            this.domElement.removeEventListener( 'mousewheel', onMouseWheel, false );
            this.domElement.removeEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox

            this.domElement.removeEventListener( 'touchstart', touchstart, false );
            this.domElement.removeEventListener( 'touchend', touchend, false );
            this.domElement.removeEventListener( 'touchmove', touchmove, false );

            document.removeEventListener( 'mousemove', onMouseMove, false );
            document.removeEventListener( 'mouseup', onMouseUp, false );

            window.removeEventListener( 'keydown', onKeyDown, false );

        }

        this.domElement.addEventListener( 'contextmenu', contextmenu, false );

        this.domElement.addEventListener( 'mousedown', onMouseDown, false );
        this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
        this.domElement.addEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox

        this.domElement.addEventListener( 'touchstart', touchstart, false );
        this.domElement.addEventListener( 'touchend', touchend, false );
        this.domElement.addEventListener( 'touchmove', touchmove, false );

        window.addEventListener( 'keydown', onKeyDown, false );

        // force an update at start
        this.update();

    };

    THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
    THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

    Object.defineProperties( THREE.OrbitControls.prototype, {

        object: {

            get: function () {

                return this.constraint.object;

            }

        },

        target: {

            get: function () {

                return this.constraint.target;

            },

            set: function ( value ) {

                console.warn( 'THREE.OrbitControls: target is now immutable. Use target.set() instead.' );
                this.constraint.target.copy( value );

            }

        },

        minDistance : {

            get: function () {

                return this.constraint.minDistance;

            },

            set: function ( value ) {

                this.constraint.minDistance = value;

            }

        },

        maxDistance : {

            get: function () {

                return this.constraint.maxDistance;

            },

            set: function ( value ) {

                this.constraint.maxDistance = value;

            }

        },

        minZoom : {

            get: function () {

                return this.constraint.minZoom;

            },

            set: function ( value ) {

                this.constraint.minZoom = value;

            }

        },

        maxZoom : {

            get: function () {

                return this.constraint.maxZoom;

            },

            set: function ( value ) {

                this.constraint.maxZoom = value;

            }

        },

        minPolarAngle : {

            get: function () {

                return this.constraint.minPolarAngle;

            },

            set: function ( value ) {

                this.constraint.minPolarAngle = value;

            }

        },

        maxPolarAngle : {

            get: function () {

                return this.constraint.maxPolarAngle;

            },

            set: function ( value ) {

                this.constraint.maxPolarAngle = value;

            }

        },

        minAzimuthAngle : {

            get: function () {

                return this.constraint.minAzimuthAngle;

            },

            set: function ( value ) {

                this.constraint.minAzimuthAngle = value;

            }

        },

        maxAzimuthAngle : {

            get: function () {

                return this.constraint.maxAzimuthAngle;

            },

            set: function ( value ) {

                this.constraint.maxAzimuthAngle = value;

            }

        },

        enableDamping : {

            get: function () {

                return this.constraint.enableDamping;

            },

            set: function ( value ) {

                this.constraint.enableDamping = value;

            }

        },

        dampingFactor : {

            get: function () {

                return this.constraint.dampingFactor;

            },

            set: function ( value ) {

                this.constraint.dampingFactor = value;

            }

        },

        // backward compatibility

        noZoom: {

            get: function () {

                console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
                return ! this.enableZoom;

            },

            set: function ( value ) {

                console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
                this.enableZoom = ! value;

            }

        },

        noRotate: {

            get: function () {

                console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
                return ! this.enableRotate;

            },

            set: function ( value ) {

                console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
                this.enableRotate = ! value;

            }

        },

        noPan: {

            get: function () {

                console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
                return ! this.enablePan;

            },

            set: function ( value ) {

                console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
                this.enablePan = ! value;

            }

        },

        noKeys: {

            get: function () {

                console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
                return ! this.enableKeys;

            },

            set: function ( value ) {

                console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
                this.enableKeys = ! value;

            }

        },

        staticMoving : {

            get: function () {

                console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
                return ! this.constraint.enableDamping;

            },

            set: function ( value ) {

                console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
                this.constraint.enableDamping = ! value;

            }

        },

        dynamicDampingFactor : {

            get: function () {

                console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
                return this.constraint.dampingFactor;

            },

            set: function ( value ) {

                console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
                this.constraint.dampingFactor = value;

            }

        }

    } );

}() );
