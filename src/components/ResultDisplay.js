import React from 'react';

export const ResultDisplay = ({ results }) => {
    return (
        <div>
            {results.map((result, index) => (
                <div key={index} className="result-item">
                    {Object.entries(result).map(([key, value]) => (
                        <div key={key} className="property">
                            <strong>{key}:</strong> {value}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};