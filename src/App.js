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
      console.log("api data", data);

      if (data.cod !== '200') {
        setCityNotFound(true);
        setWeather(null);
        console.log('City not found:', data.message);
      } else {
        setCityNotFound(false);
        setWeather(data);
      }
    } catch (error) {
      console.log('Error:', error);
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
    const times = weather.list.slice(0, 8).map(item =>
      new Date(item.dt * 1000).getHours() + ':00'
    );

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: times,
        datasets: [{
          label: 'Temperature °C',
          data: temps,
          borderColor: 'blue',
          fill: false
        }]
      }
    });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Weather</h1>

      <div>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ padding: '5px', marginRight: '10px' }}
        />
        <button onClick={fetchWeather}>Get Weather</button>
      </div>

      {cityNotFound && (
        <p style={{ color: 'red', marginTop: '10px' }}>
          City not found. Please try again.
        </p>
      )}

      {weather && weather.city && (
        <div style={{ marginTop: '20px' }}>
          <h2>{weather.city.name}</h2>
          <p>Current: {Math.round(weather.list[0].main.temp)}°C</p>
          <canvas ref={chartRef} width="400" height="200"></canvas>
        </div>
      )}
    </div>
  );
};

export default WeatherApp;
