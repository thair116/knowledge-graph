import React, { useState } from 'react'
import { API } from 'aws-amplify';
import { ResultDisplay } from './ResultDisplay';

const API_NAME = 'graphREST'

export const QueryPage = () => {
    const [queryValue, setQueryValue] = useState('')
    const [queryTransformed, setQueryTransformed] = useState("")
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState('not')

    const handleClick = async () => {
        const transformed = await transform()
        await runQuery(transformed)
    }

    const transform = async () => {
        setLoading('Generating query...')

        const data = { query: queryValue }
        const path = '/translate/query'
        const params = {
            body: data
        }

        let response;
        try {
            response = await API.post(API_NAME, path, params)
        } catch (e) {
            console.error(e)
        }        

        const { content } = response
        const split = content.split('2--')
        if (split.length < 2) {
            console.error('error in splitting')
            setQueryTransformed(content)
            setLoading('not')
            return
        }
        const query = split[1]
        setQueryTransformed(query)
        return query
    }

    const runQuery = async (query) => {
        setLoading('Running Query...')
        const data = { query: query }
        const path = '/query'
        const params = {
            body: data
        }

        let response;
        try {
            response = await API.post(API_NAME, path, params)
        } catch (e) {
            console.error(e)
        }

        const { body } = response
        const { results, code, detailedMessage } = body
        console.log(results)

        if (code) {
            setResults([{ error: detailedMessage }])
        } else {
            setResults(results)
        }
        setLoading('not')
    }

    const sampleQueries = [
        "which employees exist and where do or did they work?",
        "which companies exist?",
        "which companies were acquired, and by what company?"
    ]

    return (
        <div className='text-white w-full text-center flex flex-col items-center'>
            <textarea className="bg-slate-800 m-2 w-96	p-2 h-[120px] rounded" type="text" value={queryValue} onChange={(e) => setQueryValue(e.target.value)} placeholder="Type your question..." />
           
            <div className='m-4'>
                <p className='text-slate-300 text-xl'>Sample queries</p>
                { sampleQueries.map((query, index) => (
                     <p className='text-blue-500 hover:text-blue-300 cursor-pointer' onClick={() => setQueryValue(query)}>{query}</p>
                ))}
               
            </div>
            {loading !== 'not' ?
                    <button className='cursor-default transition-all m-8 bg-blue-600 py-2 px-4 w-[200px] hover:w-96 h-[40px] rounded '>
                        {loading}
                    </button>
                :
                <button onClick={handleClick} className='transition-all m-8 bg-blue-600 hover:w-96 py-2 px-4 w-[200px] h-[40px] rounded '>
                    Submit
                </button>
            }
            {queryTransformed &&
                <>
                    <h1 className='text-2xl m-2'>Generated query</h1>
                    <div className='text-left bg-slate-800 m-4 p-4 rounded'>{queryTransformed}</div>
                </>
            }
            {results !== null &&
                <>
                    <h1 className='text-2xl m-2'>Results</h1>
                    <div className='bg-slate-800 m-4 p-4 rounded'>
                        { results.length !== 0 ? <ResultDisplay results={results} /> : "No results found" }
                    </div>
                </>
            }
        </div>
    )
}