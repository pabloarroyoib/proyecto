// Cargar los datos de inflación
let inflationData;

console.log('Iniciando carga de datos...');

fetch('inflation-data.json')
    .then(response => response.json())
    .then(data => {
        console.log('Datos cargados exitosamente');
        inflationData = data.inflationData;
        console.log(`Número de entradas de inflación: ${inflationData.length}`);
        populateSelectOptions();
        calculateInflation(); // Calcula inicialmente con los valores por defecto
    })
    .catch(error => {
        console.error('Error al cargar los datos:', error);
        displayError('Error al cargar los datos de inflación. Por favor, recargue la página.');
    });

function populateSelectOptions() {
    console.log('Poblando opciones de selección...');
    const yearSelects = document.querySelectorAll('select[id$="Year"]');
    const monthSelects = document.querySelectorAll('select[id$="Month"]');

    const years = [...new Set(inflationData.map(item => item.year))].sort((a, b) => a - b);
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    console.log(`Años disponibles: ${years.join(', ')}`);

    yearSelects.forEach(select => {
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        });
        // Seleccionar el año más reciente por defecto
        select.value = years[years.length - 1];
    });

    monthSelects.forEach(select => {
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index + 1;
            option.textContent = month;
            select.appendChild(option);
        });
        // Seleccionar el mes más reciente por defecto
        select.value = 12;
    });

    console.log('Opciones de selección pobladas');
}

function calculateInflation() {
    console.log('Iniciando cálculo de inflación...');
    const startYear = parseInt(document.getElementById('startYear').value);
    const startMonth = parseInt(document.getElementById('startMonth').value);
    const endYear = parseInt(document.getElementById('endYear').value);
    const endMonth = parseInt(document.getElementById('endMonth').value);
    const startAmount = parseFloat(document.getElementById('startAmount').value) || 0;

    console.log(`Parámetros: startYear=${startYear}, startMonth=${startMonth}, endYear=${endYear}, endMonth=${endMonth}, startAmount=${startAmount}`);

    const startDate = new Date(startYear, startMonth - 1);
    const endDate = new Date(endYear, endMonth - 1);

    if (startDate > endDate) {
        displayError('La fecha de inicio debe ser anterior a la fecha final');
        return;
    }

    let accumulatedInflation = 1;
    let monthCount = 0;

    // Ajustamos la fecha final para excluir el último mes
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setMonth(adjustedEndDate.getMonth() - 1);

    for (let d = new Date(startDate); d <= adjustedEndDate; d.setMonth(d.getMonth() + 1)) {
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const inflationEntry = inflationData.find(item => item.year === year && item.month === month);
        
        if (inflationEntry) {
            accumulatedInflation *= (1 + inflationEntry.inflation / 100);
            monthCount++;
            console.log(`Inflación para ${year}-${month}: ${inflationEntry.inflation}%`);
        } else {
            console.log(`No se encontraron datos para ${year}-${month}`);
        }
    }

    if (monthCount === 0) {
        // Si no hay meses contados (mismo mes o meses consecutivos), establecemos la inflación a 0
        accumulatedInflation = 1;
    }

    const endAmount = startAmount * accumulatedInflation;
    const totalInflation = (accumulatedInflation - 1) * 100;
    const averageMonthlyInflation = monthCount > 0 ? Math.pow(accumulatedInflation, 1/monthCount) - 1 : 0;
    const averageYearlyInflation = Math.pow(1 + averageMonthlyInflation, 12) - 1;

    console.log(`Resultados: endAmount=${endAmount.toFixed(2)}, totalInflation=${totalInflation.toFixed(2)}%, averageMonthlyInflation=${(averageMonthlyInflation * 100).toFixed(2)}%, averageYearlyInflation=${(averageYearlyInflation * 100).toFixed(2)}%`);

    document.getElementById('endAmount').value = endAmount.toFixed(2);
    document.getElementById('accumulatedInflation').textContent = totalInflation.toFixed(2) + '%';
    document.getElementById('averageMonthlyInflation').textContent = (averageMonthlyInflation * 100).toFixed(2) + '%';
    document.getElementById('averageYearlyInflation').textContent = (averageYearlyInflation * 100).toFixed(2) + '%';
}

function displayError(message) {
    console.error('Error:', message);
    document.getElementById('endAmount').value = '';
    document.getElementById('accumulatedInflation').textContent = message;
    document.getElementById('averageMonthlyInflation').textContent = '';
    document.getElementById('averageYearlyInflation').textContent = '';
}

// Agregar event listeners
document.getElementById('startYear').addEventListener('change', calculateInflation);
document.getElementById('startMonth').addEventListener('change', calculateInflation);
document.getElementById('endYear').addEventListener('change', calculateInflation);
document.getElementById('endMonth').addEventListener('change', calculateInflation);
document.getElementById('startAmount').addEventListener('input', calculateInflation);

// Calcular inflación cuando se carga la página
window.addEventListener('load', () => {
    console.log('Página cargada. Iniciando cálculo inicial...');
    calculateInflation();
});