const calendario = document.getElementById("calendar");
const mesSelector = document.getElementById("month-selector");


const diasSemana = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

async function generarCalendario(año, mes) {
  calendario.innerHTML = "";

  const fecha = new Date(año, mes - 1, 1);
  const primerDiaSemana = (fecha.getDay() + 6) % 7;
  const ultimoDia = new Date(año, mes, 0).getDate();

  // Obtener datos del backend
  const res = await fetch(`../api/ventas-heatmap/por-mes/${año}/${mes}`);
  const ventas = await res.json();
  console.log("Datos recibidos del backend:");
  console.log(ventas);

  // Crear un mapa rápido: { "2025-05-20": { cantidad_ventas: 3, total_recaudado: 200 } }
  const mapaVentas = {};
  ventas.forEach(v => {
    const fecha = new Date(v.fecha);
    const fechaStr = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
    mapaVentas[fechaStr] = v;
  });

  console.log("Mapa de ventas por fecha (objeto usado para pintar):");
  console.log(mapaVentas);

  for (let i = 0; i < primerDiaSemana; i++) {
    const vacio = document.createElement("div");
    vacio.className = "empty-day";
    calendario.appendChild(vacio);
  }

  for (let dia = 1; dia <= ultimoDia; dia++) {
    const celda = document.createElement("div");
    celda.className = "day";

    const fechaStr = `${año}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    const data = mapaVentas[fechaStr];

    celda.innerHTML = data
  ? `
    <div class="amount-tag"><p>$${Number(data.total_recaudado).toFixed(2)}</p></div>
    <div class="sales">${data.cantidad_ventas}</div>`
  : `<span class="number-day">${dia}</span>`;

    if (data) {
      celda.style.backgroundColor = calcularColor(data.cantidad_ventas);
    }

    console.log(`Día ${dia} (${fechaStr}) - ${data ? `${data.cantidad_ventas}` : 'sin datos'}`);

    calendario.appendChild(celda);
  }
}

async function cargarOpcionesMeses() {
  try {
    const res = await fetch("../api/ventas-heatmap/meses-disponibles");
    const meses = await res.json();

    mesSelector.innerHTML = "";

    meses.forEach(({ mes }) => {
      const [año, numMes] = mes.split("-");
      const nombreMes = new Date(año, numMes - 1).toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      });

      const option = document.createElement("option");
      option.value = mes;
      option.textContent = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1);
      mesSelector.appendChild(option);
    });

    if (meses.length > 0) {
      const [año, mes] = meses[0].mes.split("-").map(Number);
      generarCalendario(año, mes);
    }

  } catch (error) {
    console.error("Error al cargar meses disponibles:", error);
  }
}

function manejarCambio() {
  const [año, mes] = mesSelector.value.split("-").map(Number);
  generarCalendario(año, mes);
}

function calcularColor(cantidad) {
  if (cantidad >= 7) return '#f3850d'; // más fuerte
  if (cantidad >= 5) return '#f9a825';
  if (cantidad >= 3) return '#fac04f';
  if (cantidad >= 2) return '#fcd98b';
  return '#fdeec8';
}

function mostrarPromedioSemanal() {
  fetch('../api/analisis/promedio-semanal')
    .then(res => res.json())
    .then(data => {
      const variacionNum = Number(data.variacion);
      const actualNum = Number(data.promedio_actual);

      const variacionText = document.getElementById('variacion-text');
      const iconUp = document.getElementById('icon-up');
      const iconDown = document.getElementById('icon-down');
      const promedioText = document.getElementById('promedio-actual');

      const variacion = !isNaN(variacionNum) ? Math.abs(variacionNum).toFixed(2) : '0.00';
      const promedioActual = !isNaN(actualNum) ? actualNum.toFixed(2) : '0.00';

      promedioText.textContent = `$${promedioActual}`;
      variacionText.textContent = `${variacionNum >= 0 ? '+' : '-'}${variacion}%`;

      if (variacionNum > 0) {
        iconUp.style.display = 'inline';
        iconDown.style.display = 'none';
        variacionText.style.color = '#29BE44'; // verde
      } else if (variacionNum < 0) {
        iconUp.style.display = 'none';
        iconDown.style.display = 'inline';
        variacionText.style.color = '#F62C2C'; // rojo
      } else {
        iconUp.style.display = 'none';
        iconDown.style.display = 'none';
        variacionText.style.color = 'gray'; // neutro
      }
    })
    .catch(err => console.error('Error al obtener el promedio:', err));
}

function mostrarPromedioMensual() {
  fetch('../api/analisis/promedio-mensual')
    .then(res => res.json())
    .then(data => {
      const variacionNum = Number(data.variacion);
      const actualNum = Number(data.promedio_actual);

      const variacionText = document.getElementById('variacion-mensual');
      const iconUp = document.getElementById('icon-up-mensual');
      const iconDown = document.getElementById('icon-down-mensual');
      const promedioText = document.getElementById('promedio-mensual');

      const variacion = !isNaN(variacionNum) ? Math.abs(variacionNum).toFixed(2) : '0.00';
      const promedioActual = !isNaN(actualNum) ? actualNum.toFixed(2) : '0.00';

      promedioText.textContent = `$${promedioActual}`;
      variacionText.textContent = `${variacionNum >= 0 ? '+' : '-'}${variacion}%`;

      if (variacionNum > 0) {
        iconUp.style.display = 'inline';
        iconDown.style.display = 'none';
        variacionText.style.color = '#29BE44'; // verde
      } else if (variacionNum < 0) {
        iconUp.style.display = 'none';
        iconDown.style.display = 'inline';
        variacionText.style.color = '#F62C2C'; // rojo
      } else {
        iconUp.style.display = 'none';
        iconDown.style.display = 'none';
        variacionText.style.color = 'gray'; // neutro
      }
    })
    .catch(err => console.error('Error al obtener el promedio mensual:', err));
}

function mostrarPromedioAnual() {
  fetch('../api/analisis/promedio-anual')
    .then(res => res.json())
    .then(data => {
      const variacionNum = Number(data.variacion);
      const actualNum = Number(data.promedio_actual);

      const variacionText = document.getElementById('variacion-anual');
      const iconUp = document.getElementById('icon-up-anual');
      const iconDown = document.getElementById('icon-down-anual');
      const promedioText = document.getElementById('promedio-anual');

      const variacion = !isNaN(variacionNum) ? Math.abs(variacionNum).toFixed(2) : '0.00';
      const promedioActual = !isNaN(actualNum) ? actualNum.toFixed(2) : '0.00';

      promedioText.textContent = `$${promedioActual}`;
      variacionText.textContent = `${variacionNum >= 0 ? '+' : '-'}${variacion}%`;

      if (variacionNum > 0) {
        iconUp.style.display = 'inline';
        iconDown.style.display = 'none';
        variacionText.style.color = '#29BE44'; // verde
      } else if (variacionNum < 0) {
        iconUp.style.display = 'none';
        iconDown.style.display = 'inline';
        variacionText.style.color = '#F62C2C'; // rojo
      } else {
        iconUp.style.display = 'none';
        iconDown.style.display = 'none';
        variacionText.style.color = 'gray'; // neutro
      }
    })
    .catch(err => console.error('Error al obtener el promedio mensual:', err));
}

document.addEventListener('DOMContentLoaded', () => {
  mostrarPromedioSemanal();
  mostrarPromedioMensual();
  mostrarPromedioAnual();
});

mesSelector.addEventListener("change", manejarCambio);

// Inicial: mes actual
manejarCambio();
cargarOpcionesMeses();