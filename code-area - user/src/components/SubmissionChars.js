import React from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import './custom-heatmap.css';
import { Tooltip as ReactTooltip } from 'react-tooltip';

const SubmissionChars = ({ timeline }) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setFullYear(today.getFullYear() - 1);
    const values = timeline.map(item => ({
        date: item.date,
        count: Number(item.count || 0)
    }));

    const getTooltip = (value) => {
        if (!value || !value.date) return 'No submissions';
        const date = new Date(value.date);
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        const formatted = date.toLocaleDateString('en-GB');
        return `${day}, ${formatted}: ${value.count || 0} submission(s)`;
    };

    return (
        <div className="p-4 bg-white mt-4" style={{ width: '90vw', marginLeft:'4vw',border: '1px solid #ccc'
 }}>
            <h4 className="text-center text-dark mb-3">Submission Activity</h4>
            <CalendarHeatmap
                startDate={startDate}
                endDate={today}
                values={values}
                classForValue={(value) => {
                    const count = Number(value?.count || 0);
                    if (!value || count <= 0) return "color-empty";
                    const level = Math.min(13, Math.ceil(count / 5));
                    return `color-scale-${level}`;
                }}
                tooltipDataAttrs={(value) => ({
                    'data-tooltip-id': 'tooltip',
                    'data-tooltip-content': getTooltip(value)
                })}
                showWeekdayLabels={true}
            />
            <ReactTooltip id="tooltip" />
        </div>
    );
};

export default SubmissionChars;
