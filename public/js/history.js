document.addEventListener('DOMContentLoaded', function() {
    fetch('/getWeatherHistory')
        .then(response => response.json())
        .then(data => {
            const historyTableBody = document.querySelector('#historyTable tbody');
            data.forEach(entry => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.city}</td>
                    <td>${entry.temperature}</td>
                    <td>${entry.condition}</td>
                    <td>${entry.wind_speed}</td>
                    <td>${entry.pressure}</td>
                    <td>${entry.humidity}</td>
                    <td>${new Date(entry.timestamp).toLocaleString()}</td>
                `;
                historyTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching weather history:', error);
        });
});
