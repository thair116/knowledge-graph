import React, { useEffect, useState } from 'react'
import { API } from 'aws-amplify';
import { ResultDisplay } from './ResultDisplay';


export const UploadPage = () => {

    return (
        <div>
            <h1>Upload Page</h1>
            <FileUpload />
        </div>
    )
}


const sendDataToServer = async (data) => {
    const apiName = 'graphREST'

    const body = { fileContents: data}
    let path = '/upload'
    let params = { body }

    let response;
    try {
        response = await API.post(apiName, path, params)
    } catch (e) {
        console.error(e)
    }

}


function FileUpload() {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);

        const reader = new FileReader();

        reader.onload = function (e) {
            sendDataToServer(e.target.result);
        }

        reader.readAsText(event.target.files[0]);
        console.log(event.target.files[0]); // You can handle the file object here
    };

    return (
        <div>
            <input
                type="file"
                onChange={handleFileChange}
            />
            {selectedFile && <p>Selected File: {selectedFile.name}</p>}
        </div>
    );
}
