import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2'; // Use Line if needed
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register the necessary components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Temperature',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Light teal
        borderColor: 'rgba(75, 192, 192, 1)',       // Darker teal
        borderWidth: 1,
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
            backgroundColor: 'rgba(75, 192, 192, 0.2)', // Light teal
            borderColor: 'rgba(75, 192, 192, 1)',       // Darker teal
            borderWidth: 1,
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
        const updatedLabels = [...prevData.labels, newLabel]; // Append to the end
        const updatedData = [...prevData.datasets[0].data, newData]; // Append to the end

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

  return <Bar data={chartData} />;
};

export default BarChart;
