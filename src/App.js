import BarChart from './componets/Bar';
import SubmitTemperature from './componets/Submit';
import './App.css';


function App() {
  return (
      <div className='appContainer'>
      <h1>🥵MyFeverApp🥵</h1>   
    <div className='main'>
      <div className='bar'><BarChart/>
      <SubmitTemperature/></div>
    </div>
    </div>
  );
}

export default App;
