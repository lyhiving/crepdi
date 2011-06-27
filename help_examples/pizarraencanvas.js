var pizarra_canvas
var pizarra_context

/*
	Inicializamos la pizarra. 
	En primer lugar comprobamos si el navegador tiene soporte para canvas utilizando la 
	librería Modernizr. 
	Después guardamos referencia al canvas y definimos el color del trazo con el que vamos a dibujar. 
	Por último, añadimos listeners para los eventos "mousedown" y "mouseup", ya que cuando salten esos
	eventos tenemos que empezar / terminar de pintar
*/

function init(){
	if(!Modernizr.canvas){
		document.getElementById("contenedor_pizarra").style.display = "none";
	}else{
		document.getElementById("no_html5").style.display = "none";
		pizarra_canvas = document.getElementById("pizarra");
		pizarra_context = pizarra_canvas.getContext("2d");
		pizarra_context.strokeStyle = "#000";
		pizarra_canvas.addEventListener("mousedown",empezarPintar,false);
		pizarra_canvas.addEventListener("mouseup",terminarPintar,false);
	}
}

/*
	empezarPintar(e)
	Al hacer mousedown sobre la pizarra, comenzamos un nuevo trazo, movemos el pincel hasta la 
	posición del ratón y añadimos un listener para el evento mousemove, para que con cada movimiento 
	del ratón se haga un nuevo trazo
*/

	
function empezarPintar(e){
	pizarra_context.beginPath();
	pizarra_context.moveTo(e.clientX-pizarra_canvas.offsetLeft,e.clientY-pizarra_canvas.offsetTop);
	pizarra_canvas.addEventListener("mousemove",pintar,false)
}

/*
	terminarPintar(e) se ejecuta al soltar el botón izquierdo, y elimina el listener para 
	mousemove
*/

function terminarPintar(e){
	pizarra_canvas.removeEventListener("mousemove",pintar,false);
}
	
/*
	pintar(e) se ejecuta cada vez que movemos el ratón con el botón izquierdo pulsado.
	Con cada movimiento dibujamos una nueva linea hasta la posición actual del ratón en pantalla.
*/

function pintar(e) {
	pizarra_context.lineTo(e.clientX-pizarra_canvas.offsetLeft,e.clientY-pizarra_canvas.offsetTop);
	pizarra_context.stroke();
}
	
/*
	borrar() vuelve a setear el ancho del canvas, lo que produce que se borren los trazos dibujados
	hasta ese momento.
*/

function borrar(){
	pizarra_canvas.width = pizarra_canvas.width;
}