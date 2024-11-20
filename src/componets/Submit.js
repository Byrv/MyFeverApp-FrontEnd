import React, { useState } from 'react';
import axios from 'axios';
import './submit.css';

const SubmitTemperature = () => {
  // State to hold temperature input
  const [temperature, setTemperature] = useState('');
  const [message, setMessage] = useState('');

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on form submit

    try {
      const response = await axios.post('https://myfeverapp.onrender.com/api/temperature', {
        temperature: parseFloat(temperature), // Send the temperature value
      });
      setMessage('Temperature recorded successfully!');
      setTemperature(''); // Clear input after submit
    } catch (error) {
      setMessage('Error recording temperature.');
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h2>Submit Temperature</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="temperature">Temperature: </label>
          <input
            type="number"
            id="temperature"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            required
          />
        </div>
        <div className='button'>
  <button type="submit">
     Submit
  </button>
</div>

      </form>
      {message && <p>{message}</p>} {/* Display success or error message */}
    </div>
  );
};

export default SubmitTemperature;
