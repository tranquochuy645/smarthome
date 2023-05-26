import { useEffect, useState } from "react";
import Chart, { ChartConfiguration, ChartOptions } from 'chart.js/auto';

import './Sensors.css';

interface SensorsProps {
  Sensors_data: any;
}

const Sensors: React.FC<SensorsProps> = ({ Sensors_data }) => {
  const [currentSensors, setCurrentSensors] = useState({ date: "", data: "", predict: "" });

  function predictWeather(temperature: any, humidity: any, pressure: any) {
    // Calculate indices using the Kain-Fritsch algorithm
    const deltaT = (temperature - calculateDewPoint(temperature, humidity)) / 10;
    const deltaP = pressure - 1013.25;
    const kfIndex = deltaT + (5 * (1 - ((humidity + 50) / 100))) + (deltaP / 10);

    // Weather prediction based on the K-F Index
    let weatherPrediction;
    if (kfIndex >= 16) {
      weatherPrediction = 'Good weather, low chance of rain.';
    } else if (kfIndex >= 8 && kfIndex < 16) {
      weatherPrediction = 'Unstable weather, possible rain or storm.';
    } else if (kfIndex >= 0 && kfIndex < 8) {
      weatherPrediction = 'Rainning';
    } else {
      weatherPrediction = 'Heavy rain with possible thunderstorms.';
    }

    // // Print weather prediction result
    // console.log('Weather prediction: ' + weatherPrediction);
    return weatherPrediction;
  }

  // Calculate dew point based on temperature and humidity
  function calculateDewPoint(temperature: any, humidity: any) {
    // Dew point calculation formula
    const a = 17.27;
    const b = 237.7;
    const alpha = ((a * temperature) / (b + temperature)) + Math.log(humidity / 100);
    const dewPoint = (b * alpha) / (a - alpha);

    return dewPoint;
  }

  useEffect(() => {
    if (Array.isArray(Sensors_data)) {
      let prediction = predictWeather(
        Sensors_data[Sensors_data.length - 1].temp,
        Sensors_data[Sensors_data.length - 1].humi,
        Sensors_data[Sensors_data.length - 1].press
      );
      setCurrentSensors({
        date: `${new Date(Sensors_data[Sensors_data.length - 1].timestamp)}`,
        data: `{temp: ${Sensors_data[Sensors_data.length - 1].temp} ℃ ,
        humi: ${Sensors_data[Sensors_data.length - 1].humi} % ,
        press: ${Sensors_data[Sensors_data.length - 1].press} Pa}`,
        predict: prediction
      });

      const canvas = document.getElementById('Sensors-chart') as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      const stepSize = Math.ceil(Sensors_data.length / 10); // Display 10 labels

      if (ctx) {
        let chart: Chart = (window as any).SensorsChart;

        if (chart) {
          chart.destroy();
        }

        const config: ChartConfiguration = {
          type: 'line',
          data: {
            labels: Sensors_data.filter((d: any, i: number) => i % stepSize === 0)
              .map((d: any) => new Date(d.timestamp).toLocaleString()),
            datasets: [
              {
                type: 'line',
                label: 'Temperature ( ℃ )',
                data: Sensors_data.filter((d: any, i: number) => i % stepSize === 0)
                  .map((d: any) => d.temp),
                borderColor: 'red',
                fill: false,
                yAxisID: 'temperature-axis',
              },
              {
                type: 'line',
                label: 'Pressure ( Pa )',
                data: Sensors_data.filter((d: any, i: number) => i % stepSize === 0)
                  .map((d: any) => d.press),
                borderColor: 'yellow',
                fill: false,
                yAxisID: 'pressure-axis',
              },
              {
                type: 'bar',
                label: 'Humidity ( % )',
                data: Sensors_data.filter((d: any, i: number) => i % stepSize === 0)
                  .map((d: any) => d.humi),
                backgroundColor: '#87CEEB',//sky blue
                yAxisID: 'humidity-axis',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                  display: true,
                  labels: {
                      font:{size:20},
                      color:'white'
                  }
              }
            },
            scales: {
              "x":{
                ticks:{
                  color:"white"
                }
              },
              "temperature-axis": {
                ticks:{color:"red"},
                type: 'linear',
                position: 'left',
                min: 0,
                max: 50,
                title: {
                  display: true,
                  text: '(℃) ',
                  color: 'red'
                }
              },
              "pressure-axis": {
                ticks:{color:"yellow"},
                type: 'linear',
                position: 'right',
                min: 300,
                max: 1100,
                title: {
                  display: true,
                  text: '(Pa)',
                  color: 'yellow'
                }
              },
              "humidity-axis": {
                ticks:{color:"#87CEEB"},//sky blue
                type: 'linear',
                position: 'right',
                min: 0,
                max: 100,
                title: {
                  display: true,
                  text: '(%)',
                  color: "#87CEEB"
                }
              },
            }
          },
        };

        chart = new Chart(ctx, config);

        (window as any).SensorsChart = chart;
      }
    }
  }, [Sensors_data]);

  return (
    <div id="Sensors">
      <p>{currentSensors.date}</p>
      <p>{currentSensors.data}</p>
      <h1>{currentSensors.predict}</h1>
      <div>
        <canvas id="Sensors-chart"></canvas>
      </div>
    </div>
  );
};

export default Sensors;
