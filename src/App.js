import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import { QueryPage } from './components/QueryPage';
import { UploadPage } from './components/UploadPage';

function App() {

  const [route, setRoute] = useState('query');

  
  return (
    <div className="App">
      <button className={"bg-blue-500 mx-2 py-2 px-4 rounded text-white"} onClick={() => setRoute('query')}>Query</button>
      <button className={"bg-blue-500 mx-2 py-2 px-4 rounded text-white"} onClick={() => setRoute('upload')}>Upload</button>
      { route === 'query' ? <QueryPage /> : <UploadPage />}
    </div>
  );
}

export default App;
