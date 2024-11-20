import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2'; // Import Line chart component
import { io } from 'socket.io-client'; // Import socket.io-client
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

// Register necessary Chart.js modules for Line chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Temperature',
        data: [],
        borderColor: 'rgba(255, 105, 180, 1)', // Pink Line Color
        backgroundColor: 'rgba(255, 105, 180, 0.2)', // Light Pink Fill under Line
        borderWidth: 2,
        tension: 0.4, // Smooth curve
        pointBackgroundColor: 'rgba(255, 105, 180, 1)', // Point color
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
            borderColor: 'rgba(255, 105, 180, 1)', // Pink Line Color
            backgroundColor: 'rgba(255, 105, 180, 0.2)', // Light Pink Fill under Line
            borderWidth: 2,
            tension: 0.4, // Smooth curve
            pointBackgroundColor: 'rgba(255, 105, 180, 1)', // Point color
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
        hour: '2-digit', minute: '2-digit', hour12: true, day: '2-digit', month: 'short',
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
              borderColor: 'rgba(255, 105, 180, 1)', // Pink Line Color
              backgroundColor: 'rgba(255, 105, 180, 0.2)', // Light Pink Fill under Line
              borderWidth: 2,
              tension: 0.4, // Smooth curve
              pointBackgroundColor: 'rgba(255, 105, 180, 1)', // Point color
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

  return (
    <Line
      data={chartData}
      options={{
        scales: {
          y: {
            beginAtZero: true, // Set Y axis to start at zero
            ticks: {
              // Customize Y-axis ticks if needed
            },
          },
          x: {
            type: 'category', // Use category scale for X-axis (labels are categorical)
          },
        },
      }}
    />
  );
};

export default LineChart;
