import React, { useState } from 'react'
import { API } from 'aws-amplify';


export function UploadPage() {
    const [loadingState, setLoadingState] = useState('Waiting for file')

    const handleFileChange = (event) => {
        setLoadingState('Uploading...')

        const reader = new FileReader();

        reader.onload = function (e) {
            sendDataToServer(e.target.result);
        }

        reader.readAsText(event.target.files[0]);
    };

    const sendDataToServer = async (data) => {
        const apiName = 'graphREST'
        const path = '/upload'
        const body = { fileContents: data}
        const params = { body }
    
        let response;
        try {
            response = await API.post(apiName, path, params)
        } catch (e) {
            console.error(e)
        }
        setLoadingState('Done uploading')
    }

    return (
        <div className='flex flex-col items-center'>
            <p className='text-slate-300 text-2xl m-2'>{loadingState}</p>
            <input
                className='text-white'
                type="file"
                onChange={handleFileChange}
            />
        </div>
    );
}
