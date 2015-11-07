/* global THREE */
var escena;
var camara;
var render;

function iniciarEscena(){
    //Render
    render = new THREE.WebGLRenderer();
    
    //Fondo
    render.setClearColorHex(0x050505, 1);
    
    //Espacio de trabajo
    var canvasWidth = 600;
    var canvasHeight = 600;
    render.setSize(canvasWidth, canvasHeight);

    document.getElementById("canvas").appendChild(render.domElement);

    //Escena
    escena = new THREE.Scene();

    //Camara
    camara = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 100);
    camara.position.set(0, 0, 0);
    camara.lookAt(escena.position);
    escena.add(camara);
    
		escena.fog = new THREE.Fog( 0x111111, 150, 200 );
    //Material Piel
    var material = new THREE.MeshBasicMaterial({
        color:0x21BA45,
        side:THREE.DoubleSide
    });


    //Triángulo
    var circuloGeometria = new THREE.Geometry();
    circuloGeometria.vertices.push([
      new THREE.Vector3( 0.0, 1.0, 0.0),
      new THREE.Vector3( 0.5, 0.0, 0.0),
      new THREE.Vector3( 1.0, 0.0, 0.0)
    ]);
    
    circuloGeometria.faces.push(new THREE.Face3(0,1,2));

    //var circulo = new THREE.Mesh(circuloGeometria, material);
    var circulo = new THREE.Mesh(circuloGeometria);
    circulo.position.set(0.0, 0.0, -7.0);
    escena.add(circulo);
    

/*
    //Triángulo
    var trianguloGeometria = new THREE.Geometry();
    trianguloGeometria.vertices.push(new THREE.Vector3( 0.0,  1.0, 0.0));
    trianguloGeometria.vertices.push(new THREE.Vector3(-1.0, -1.0, 0.0));
    trianguloGeometria.vertices.push(new THREE.Vector3( 1.0, -1.0, 0.0));
    trianguloGeometria.faces.push(new THREE.Face3(0, 1, 2));

    var triangulo = new THREE.Mesh(trianguloGeometria, material);
    triangulo.position.set(-1.5, 0.0, -7.0);
    escena.add(triangulo);

    //Cuadrado
    var cuadradoGeometria = new THREE.Geometry();
    cuadradoGeometria.vertices.push(new THREE.Vector3(-1.0,  1.0, 0.0));
    cuadradoGeometria.vertices.push(new THREE.Vector3( 1.0,  1.0, 0.0));
    cuadradoGeometria.vertices.push(new THREE.Vector3( 1.0, -1.0, 0.0));
    cuadradoGeometria.vertices.push(new THREE.Vector3(-1.0, -1.0, 0.0));
    cuadradoGeometria.faces.push(new THREE.Face4(0, 1, 2, 3));

    var cuadrado = new THREE.Mesh(cuadradoGeometria, material);
    cuadrado.position.set(1.5, 0.0, -7.0);
    escena.add(cuadrado);
*/
}
function renderEscena(){
    render.render(escena, camara);
}

function webGLStart() {
    iniciarEscena();
    renderEscena();
}