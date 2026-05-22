import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="custom-tooltip bg-white p-3 border rounded shadow-sm">
                <p className="font-weight-bold mb-1 fw-bold">{data.contestName}</p>
                <p className="mb-1">{label}</p>
                <p className="mb-0">Rank: <span className="text-success fw-bold">{data.rank}</span></p>
                <p className="mb-0">Rating Change: <span className="text-success fw-bold">{data.ratingChange > 0 ? `+${data.ratingChange}` : `${data.ratingChange}`}</span></p>
                <p className="mb-1">Rating: <span className="text-primary fw-bold">{data.rating}</span></p>
            </div>
        );
    }
    return null;
};

const RatingChars = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div
                className="p-4 bg-white mt-3"
                style={{
                    height: '400px',
                    width: '90vw',
                    marginLeft: '4vw',
                    border: '1px solid #ccc',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <h4 className="text-center text-dark mb-3">Contest Rating History</h4>
                <div className="text-muted">No contest data available.</div>
            </div>
        );
    }

    const formattedData = data.map((item, index) => {
        const prevRating = index > 0 ? data[index - 1].rating : 0;
        const ratingChange = item.rating - prevRating;

        return {
            ...item,
            contestName: item.contestName || `Contest ${index + 1}`,
            rank: item.rank || 0,
            displayDate: new Date(item.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            ratingChange
        };
    });

    return (
        <div className="p-4 bg-white mt-3" style={{ height: '400px', width: '90vw', marginLeft: '4vw', border: '1px solid #ccc' }}>
            <h4 className="text-center text-dark mb-3">Contest Rating History</h4>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={formattedData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                >
                    <CartesianGrid stroke="#eee" />
                    <XAxis
                        dataKey="displayDate"
                        tick={{ fontSize: 12 }}
                        label={{ position: 'insideBottomRight', offset: -10 }}
                    />
                    <YAxis
                        domain={['dataMin - 100', 'dataMax + 100']}
                        label={{ angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                        type="monotone"
                        dataKey="rating"
                        stroke="#3a86ff"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#3a86ff' }}
                        activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    />
                    {/* Reference bands */}
                    <ReferenceArea y1={0} y2={1200} fill="#e0e0e0" fillOpacity={0.8} />
                    <ReferenceArea y1={1200} y2={1400} fill="#e0e0e0" fillOpacity={0.4} />
                    <ReferenceArea y1={1400} y2={1600} fill="#d6d6d6" fillOpacity={0.4} />
                    <ReferenceArea y1={1600} y2={1800} fill="#cccccc" fillOpacity={0.4} />
                    <ReferenceArea y1={1800} y2={2000} fill="#bfbfbf" fillOpacity={0.4} />
                    <ReferenceArea y1={2000} y2={2200} fill="#b3b3b3" fillOpacity={0.4} />
                    <ReferenceArea y1={2200} y2={2400} fill="#a6a6a6" fillOpacity={0.4} />
                    <ReferenceArea y1={2400} y2={2600} fill="#999999" fillOpacity={0.4} />
                    <ReferenceArea y1={2600} y2={2800} fill="#8c8c8c" fillOpacity={0.4} />
                    <ReferenceArea y1={2800} y2={3000} fill="#808080" fillOpacity={0.4} />
                    <ReferenceArea y1={3000} y2={3200} fill="#737373" fillOpacity={0.4} />
                    <ReferenceArea y1={3200} y2={3400} fill="#666666" fillOpacity={0.4} />
                    <ReferenceArea y1={3400} y2={3600} fill="#595959" fillOpacity={0.4} />
                    <ReferenceArea y1={3600} y2={3800} fill="#4d4d4d" fillOpacity={0.4} />
                    <ReferenceArea y1={3800} y2={4000} fill="#404040" fillOpacity={0.4} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RatingChars;
