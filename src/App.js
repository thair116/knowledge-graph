import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import { QueryPage } from './components/QueryPage';
import { UploadPage } from './components/UploadPage';

function App() {

  const [route, setRoute] = useState('query');

  
  return (
    <>
      <div className='flex items-center m-auto justify-center'>
          <h1 className='text-white text-2xl m-8'>Company Query</h1>
          { route === 'query' ?
            <a className='text-blue-500 hover:text-blue-200 cursor-pointer' onClick={() => setRoute('upload')}>Upload</a>
          :
          <a className='text-blue-500 hover:text-blue-200 cursor-pointer' onClick={() => setRoute('query')}>Back to query</a>
          }
      </div>
      { route === 'query' ? 
        <QueryPage/> 
      : 
        <UploadPage/>
      }
    </>
  );
}

export default App;
