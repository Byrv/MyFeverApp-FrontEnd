import { io } from 'socket.io-client';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2'; // Use Line component for line chart
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary components for Line chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Temperature',
        data: [],
        borderColor: 'rgba(75, 192, 192, 1)', // Line color (teal)
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Light teal for the area under the line
        borderWidth: 2,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)', // Point color
        fill: true, // Fill under the line
        tension: 0.4, // Smooth the line (smooth curve)
      },
    ],
  });

  const fetchTemperatureData = async () => {
    try {
      const response = await fetch('https://myfeverapp.onrender.com/api/temperature/recent');
      const temperatures = await response.json();

      const labels = temperatures.data.map((temp) =>
        new Date(temp.recordedAt).toLocaleString('en-US', {
          hour: '2-digit', minute: '2-digit', hour12: true, day: '2-digit', month: 'short',
        })
      );
      const data = temperatures.data.map((temp) => temp.temperature);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Temperature',
            data,
            borderColor: 'rgba(75, 192, 192, 1)', // Line color
            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Light teal fill
            borderWidth: 2,
            pointBackgroundColor: 'rgba(75, 192, 192, 1)', // Point color
            fill: true, // Fill area under the line
            tension: 0.4, // Smooth line
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching temperature data:', error);
    }
  };

  useEffect(() => {
    const socket = io('https://myfeverapp.onrender.com/');

    // Listen for new data
    socket.on('newTemperature', (newTemperature) => {
      const newLabel = new Date(newTemperature.recordedAt).toLocaleString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true, day: '2-digit', month: 'short',
      });
      const newData = newTemperature.temperature;

      setChartData((prevData) => {
        const updatedLabels = [...prevData.labels, newLabel]; // Append new label to the end
        const updatedData = [...prevData.datasets[0].data, newData]; // Append new data to the end

        // Keep only the last 10 entries
        if (updatedLabels.length > 10) {
          updatedLabels.shift();
          updatedData.shift();
        }

        return {
          labels: updatedLabels,
          datasets: [
            {
              ...prevData.datasets[0],
              data: updatedData,
            },
          ],
        };
      });
    });

    // Fetch initial data
    fetchTemperatureData();

    return () => {
      socket.off('newTemperature'); // Cleanup socket listener on unmount
    };
  }, []);

  return <Line data={chartData} />;
};

export default LineChart;
