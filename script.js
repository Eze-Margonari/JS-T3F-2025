//Esperando la carga del DOM
document.addEventListener('DOMContentLoaded', () => {

    /*
    ===================================================================
                        VARIABLES GLOBALES
    ===================================================================
    */
    
    // Sección API
    const priceContainer = document.getElementById('btc-price-container');
    const updateButton = document.getElementById('update-btn');

    // Sección Formulario
    const formulario = document.getElementById('miFormulario');
    const inputNombre = document.getElementById('nombre');
    const inputEmail = document.getElementById('email');
    const errorNombre = document.getElementById('error-nombre');
    const errorEmail = document.getElementById('error-email');

    // Sección Calculadora
    const inputUSD = document.getElementById('calc-usd');
    const inputBTC = document.getElementById('calc-btc');
    const inputARS = document.getElementById('calc-ars');

    // Variables para guardar las tasas de conversión
    let btcToUsdRate = 0;
    let btcToArsRate = 0;

    /*
    ===================================================================
                        SECCIÓN DE API + EVENTOS
    ===================================================================
    */

    //Acá voy a usar la API de CoinGekko que te tira los precios en usd y ars
    const API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,ars';

    function fetchBitcoinPrice() {

        priceContainer.innerHTML = '<p>Actualizando precios...</p>';

        //Acá voy a usar fetch para consultar la API
        fetch(API_URL)
            .then(Response => {
                //Si la respuesta es negativa (ej: error 404, 500, etc.) tira error
                if (!Response.ok) {
                    throw new Error('La respuesta de la red no fue exitosa');
                }
                //Convierto la respuesta en JSON
                return Response.json();
            })
            .then(data => {
                //'data' va a contener la respuesta
                
                //Los precios están DENTRO de data.bitcoin
                const btc = data.bitcoin;
                
                //Verifico que los datos existan antes de usarlos
                if (btc && btc.usd && btc.ars) {
                    
                    //Guardo las tasas en las variables globales
                    btcToUsdRate = btc.usd;
                    btcToArsRate = btc.ars;

                    //Uso las mismas variables para el panel de precios
                    const formatUSD = btcToUsdRate.toLocaleString('en-US', { style: 'currency', currency: 'USD'});
                    const formatARS = btcToArsRate.toLocaleString('es-AR', { style: 'currency', currency: 'ARS'});
                    
                    //Muestro los datos en el HTML
                    priceContainer.innerHTML = `
                        <p class="price-usd">Precio USD: <strong>${formatUSD}</strong></p>
                        <p class="price-ars">Precio ARS: <strong>${formatARS}</strong></p>`;
                
                } else {
                    throw new Error('La API no devolvió los datos de moneda esperados.');
                }
            })
            .catch(error => {
                //Manejo cualquier error que pase en el fetch
                console.error('Error al fetching el precio', error);
                priceContainer.innerHTML = '<p>No se pudo cargar el precio. Intenta de nuevo</p>';
            });
    }

    //Llamo a la función cuando carga la página
    fetchBitcoinPrice();

    //Uso el evento 'click' en el botón para poder actualizar
    updateButton.addEventListener('click', fetchBitcoinPrice);

    /*
    ===================================================================
                        SECCIÓN DE FORMULARIO
    ===================================================================
    */

    //Valido el email usando (RegEx)
    function validarEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    //Agrego un evento 'submit'
    formulario.addEventListener('submit', (evento) => {

        //Me aseguro que el formulario no se envíe vacío
        evento.preventDefault();

        let esValido = true; //Variable para control

        //Acá oculto errores anteriores
        errorNombre.textContent = '';
        errorNombre.style.display = 'none';
        errorEmail.textContent = '';
        errorEmail.style.display = 'none';

        //Valido el Nombre
        if (inputNombre.value.trim() === '') {
            errorNombre.textContent = 'El Nombre es obligatorio.';
            errorNombre.style.display = 'block'; //Muestro el error
            esValido = false;
        } 
        
        //Valido el Email
        if (inputEmail.value.trim() === '') {
            errorEmail.textContent = 'El Email es obligatorio.';
            errorEmail.style.display = 'block'; //Muestro el error
            esValido = false;
        } else if (!validarEmail(inputEmail.value.trim())) {
            errorEmail.textContent = 'El formato del email no es válido (ej: tu@correo.com).';
            errorEmail.style.display = 'block'; //Muestro el error
            esValido = false;
        }

        //Si todo es válido...
        if (esValido) {
            alert('¡Formulario enviado con éxito!');
            formulario.reset();
        }
    });

    /*
    ===================================================================
                        LÓGICA DE LA CALCULADORA
    ===================================================================
    */
    
    //Agrego un listener para cuando se escribe en el campo USD
    inputUSD.addEventListener('input', () => {
        //Saco el valor y lo convierto a número
        const usdValue = parseFloat(inputUSD.value);

        //Si el campo está vacío o no es un número, limpio los otros
        if (isNaN(usdValue) || btcToUsdRate === 0) {
            inputBTC.value = '';
            inputARS.value = '';
            return;
        }

        //Cambio USD a BTC
        const btcValue = usdValue / btcToUsdRate;
        //Cambio BTC a ARS
        const arsValue = btcValue * btcToArsRate;

        //Muestro los valores con decimales apropiados
        inputBTC.value = btcValue.toFixed(8); //Bitcoin usa 8 decimales
        inputARS.value = arsValue.toFixed(2); //Pesos usa 2 decimales
    });

    //Agrego un listener para cuando se escribe en el campo BTC
    inputBTC.addEventListener('input', () => {
        const btcValue = parseFloat(inputBTC.value);

        if (isNaN(btcValue) || btcToUsdRate === 0) {
            inputUSD.value = '';
            inputARS.value = '';
            return;
        }

        //Cambio BTC a USD
        const usdValue = btcValue * btcToUsdRate;
        //Cambio BTC a ARS
        const arsValue = btcValue * btcToArsRate;

        inputUSD.value = usdValue.toFixed(2);
        inputARS.value = arsValue.toFixed(2);
    });

    //Agrego un listener para cuando se escribe en el campo ARS
    inputARS.addEventListener('input', () => {
        const arsValue = parseFloat(inputARS.value);

        if (isNaN(arsValue) || btcToArsRate === 0) {
            inputUSD.value = '';
            inputBTC.value = '';
            return;
        }

        //Cambio ARS a BTC
        const btcValue = arsValue / btcToArsRate;
        //Cambio BTC a USD
        const usdValue = btcValue * btcToUsdRate;

        inputUSD.value = usdValue.toFixed(2);
        inputBTC.value = btcValue.toFixed(8);
    });

    /*
    ===================================================================
                        MENÚ HAMBURGUESA
    ===================================================================
    */

    const menuBtn = document.getElementById('menu-btn');
    const mainNav = document.getElementById('main-nav');

    menuBtn.addEventListener('click', () => {

        mainNav.classList.toggle('nav-open');
    });

    const navLinks = document.querySelectorAll('#main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mainNav.classList.remove('nav-open');
        });
    });
});