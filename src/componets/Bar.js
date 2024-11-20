import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { io } from 'socket.io-client'; // Import socket.io-client
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Temperature',
        data: [],
        backgroundColor: 'rgba(255, 105, 180, 0.2)',  // Light Pink Background
        borderColor: 'rgba(255, 105, 180, 1)',        // Darker Pink Border
        borderWidth: 1,
      },
    ],
  });

  const socket = io('https://myfeverapp.onrender.com/'); // Connect to the WebSocket server

  // Fetch initial temperature data
  const fetchTemperatureData = async () => {
    try {
      const response = await fetch('https://myfeverapp.onrender.com/api/temperature/recent');
      const temperatures = await response.json();
      
      const labels = temperatures.data.map((temp) =>
        new Date(temp.recordedAt).toLocaleString('en-US', {
          hour: '2-digit', minute: '2-digit', hour12: true, day: '2-digit', month: 'short'
        })
      );
      const data = temperatures.data.map((temp) => temp.temperature);

      setChartData({
        labels,
        datasets: [
          {
            label: 'Temperature',
            data,
            backgroundColor: 'rgba(255, 105, 180, 0.2)',  // Light Pink Background
            borderColor: 'rgba(255, 105, 180, 1)',        // Darker Pink Border
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching temperature data:', error);
    }
  };

  // Listen for new temperature data from the server
  useEffect(() => {
    socket.on('newTemperature', (newTemperature) => {
      // Update chart data when new temperature is received
      const newLabel = new Date(newTemperature.recordedAt).toLocaleString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true, day: '2-digit', month: 'short'
      });
      const newData = newTemperature.temperature;

      setChartData((prevData) => {
        const updatedLabels = [newLabel, ...prevData.labels];
        const updatedData = [newData, ...prevData.datasets[0].data];
        
        // Keep only the last 10 entries
        if (updatedLabels.length > 10) {
          updatedLabels.pop();
          updatedData.pop();
        }

        return {
          labels: updatedLabels,
          datasets: [
            {
              label: 'Temperature',
              data: updatedData,
              backgroundColor: 'rgba(255, 105, 180, 0.2)',  // Light Pink Background
              borderColor: 'rgba(255, 105, 180, 1)',        // Darker Pink Border
              borderWidth: 1,
            },
          ],
        };
      });
    });

    // Initial data fetch
    fetchTemperatureData();

    return () => {
      socket.off('newTemperature'); // Clean up listener on unmount
    };
  }, []);

  return <Bar data={chartData} />;
};

export default BarChart;
