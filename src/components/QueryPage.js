import React, { useEffect, useState } from 'react'
import { API } from 'aws-amplify';


export const QueryPage = () => {

    const [queryValue, setQueryValue] = useState('')

    const handleClick = () => {
        makeQueryPost()
    }


    const makeQueryPost = async () => {
        const apiName = 'graphREST'

        const data2 = { query: queryValue}
        let path2 = '/translate/query'
        let params2 = {
            body: data2
        }

        let response2;
        try {
            response2 = await API.post(apiName, path2, params2)
        } catch (e) {
            console.error(e)
        }

        console.log(response2)

        
        const data = { query: queryValue}
        let path = '/query'
        let params = {
            body: data
        }

        let response;
        try {
            response = await API.post(apiName, path, params)
        } catch (e) {
            console.error(e)
        }

        console.log(response)
        // const results = response.body
        // console.log(results)

        // return response.data
    }

    return (
        <div className='text-white w-96 text-center'>
                <h1 className='text-2xl mb-12'>What do you wish to know</h1>
                <div className='bg-slate-800 rounded p-2 flex justify-between'>
                    <input className="bg-slate-800 mx-2 w-full px-1" type="text" value={queryValue} onChange={(e) => setQueryValue(e.target.value)} placeholder="Search..." />
                    <button onClick={handleClick} className='bg-blue-500 hover:bg-blue-600 transition py-2 px-4 rounded'>Search</button>
                </div>
        </div>

    )
}