import React from 'react';

export const ResultDisplay = ({ results }) => {
    return (
        <div>
            {results.map((result, index) => (
                <div key={index} className="bg-slate-700 m-4 p-2 result-item">
                    {Object.entries(result).map(([key, value]) => (
                        <div key={key} className="property flex justify-between min-w-[300px]">
                            <span className='text-slate-400'>{key.split('.')[1]}</span> <span>{value}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};