import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const WeatherApp = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('Hyderabad');
  const [cityNotFound, setCityNotFound] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const API_KEY = 'f9d41476c492e6698a92f77eedf750b8';

  const fetchWeather = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();

      if (data.cod !== '200') {
        setCityNotFound(true);
        setWeather(null);
      } else {
        setCityNotFound(false);
        setWeather(data);
      }
    } catch (error) {
      setCityNotFound(true);
      setWeather(null);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  useEffect(() => {
    if (weather && weather.list) {
      createChart();
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [weather]);

  const createChart = () => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const temps = weather.list.slice(0, 8).map(item => item.main.temp);
    const humidity = weather.list.slice(0, 8).map(item => item.main.humidity);
    const times = weather.list.slice(0, 8).map(item =>
      new Date(item.dt * 1000).getHours() + ':00'
    );

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: times,
        datasets: [
          {
            label: 'Temperature (°C)',
            data: temps,
            borderColor: '#007bff',
            backgroundColor: 'rgba(0,123,255,0.1)',
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Humidity (%)',
            data: humidity,
            borderColor: '#28a745',
            backgroundColor: 'rgba(40,167,69,0.1)',
            tension: 0.4,
            fill: true,
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: '#333',
              font: {
                size: 14
              }
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            ticks: { color: '#555' },
            grid: { display: false }
          },
          y: {
            ticks: { color: '#555' },
            grid: {
              color: 'rgba(200, 200, 200, 0.2)'
            }
          }
        }
      }
    });
  };

  return (
    <div style={{
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Segoe UI, sans-serif',
      background: '#f9f9f9',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>🌤️ Weather Forecast</h1>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <input required
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginRight: '10px',
            width: '200px'
          }}
        />
        <button
          onClick={fetchWeather}
          style={{
            padding: '10px 20px',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Get Weather
        </button>
      </div>

      {cityNotFound && (
        <p style={{ color: 'red', textAlign: 'center' }}>
          ❌ City not found. Please try again.
        </p>
      )}

      {weather && weather.city && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <h2>{weather.city.name}</h2>
          <p style={{ fontSize: '18px' }}>
            Current: <strong>{Math.round(weather.list[0].main.temp)}°C</strong>
          </p>
          <canvas ref={chartRef} width="600" height="250"></canvas>
        </div>
      )}
    </div>
  );
};

export default WeatherApp;
