document.addEventListener('DOMContentLoaded', function() {
    const cityForm = document.getElementById('cityForm');
    const weatherTable = document.getElementById('weatherTable');

    cityForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const city = document.getElementById('cityInput').value;
        fetchWeatherData(city);
    });

    function fetchWeatherData(city) {
        fetch(`http://api.weatherapi.com/v1/current.json?key=928eae54a20a456d8fc93109242805&q=${city}`)
            .then(response => response.json())
            .then(data => {
                displayWeatherData(data);
                storeWeatherData(data);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
            });
    }

    function displayWeatherData(data) {
        const { location, current } = data;
        const { name } = location;
        const { temp_c, condition, wind_kph, pressure_mb, humidity } = current;

        const weatherHtml = `
            <h2>Weather in ${name}</h2>
            <table>
                <tr>
                    <th>Temperature (°C)</th>
                    <th>Condition</th>
                    <th>Wind Speed (km/h)</th>
                    <th>Pressure (mb)</th>
                    <th>Humidity (%)</th>
                </tr>
                <tr>
                    <td>${temp_c}</td>
                    <td>${condition.text}</td>
                    <td>${wind_kph}</td>
                    <td>${pressure_mb}</td>
                    <td>${humidity}</td>
                </tr>
            </table>
        `;
        weatherTable.innerHTML = weatherHtml;
    }

    function storeWeatherData(data) {
        const { location, current } = data;
        const { name } = location;
        const { temp_c, condition, wind_kph, pressure_mb, humidity } = current;

        fetch('/storeWeatherData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                city: name,
                temperature: temp_c,
                condition: condition.text,
                wind_speed: wind_kph,
                pressure: pressure_mb,
                humidity: humidity
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(data.success);
            } else {
                console.error(data.error);
            }
        })
        .catch(error => {
            console.error('Error storing weather data:', error);
        });
    }
});
