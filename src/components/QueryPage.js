import React, { useEffect } from 'react'
import { API } from 'aws-amplify';


export const QueryPage = () => {

    useEffect(() => {
        makeQueryPost()
    }, [])


    const makeQueryPost = async () => {
        const apiName = 'graphREST'
        let path = '/query'
        let params = {}

        let response;
        try {
            response = await API.post(apiName, path, params)
        } catch (e) {
            console.error(e)
        }

        const results = response.body
        console.log(results)

        return response.data
    }

    return (
        <div>
            Put search box here
        </div>

    )
}