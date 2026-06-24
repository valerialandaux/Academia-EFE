// --- 1. MENÚ INTERACTIVO (HAMBURGUESA) ---
    const btnMenu = document.getElementById('btn-menu');
    const menuEnlaces = document.getElementById('menu-enlaces');

    // Si el botón hamburguesa existe en la página, le damos funcionalidad
    if (btnMenu) {
        btnMenu.addEventListener('click', () => {
            // "toggle" agrega la clase 'activo' si no la tiene, y la quita si ya la tiene
            menuEnlaces.classList.toggle('activo');
        });
    }// Esperar a que todo el HTML cargue antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {
    console.log("JavaScript de la Academia EFE cargado correctamente.");

    // Seleccionamos el formulario de la página
    const formulario = document.querySelector('form');

    // Si existe un formulario en la página actual, le agregamos interactividad
    if (formulario) {
        formulario.addEventListener('submit', function(event) {
            // Evitar que la página se recargue de golpe al enviar
            event.preventDefault();

            // Seleccionamos el botón de enviar
            const boton = document.querySelector('.btn-enviar');
            const textoOriginal = boton.textContent;
            
            // Efecto dinámico de carga (Mejora de UX)
            boton.textContent = "Procesando...";
            boton.style.backgroundColor = "var(--gris)"; // Se pone gris
            boton.style.cursor = "wait";

            // Simulamos que los datos están viajando por internet (1.5 segundos)
            setTimeout(() => {
                // Mensaje de éxito interactivo
                alert("¡Inscripción exitosa! Hemos recibido tu solicitud.");
                
                // Restauramos el botón a su estado normal (Cian)
                boton.textContent = textoOriginal;
                boton.style.backgroundColor = "var(--cian)";
                boton.style.cursor = "pointer";
                
                // Limpiamos los campos del formulario automáticamente
                formulario.reset(); 
            }, 1500);
        });
    }
});