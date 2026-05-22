import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProblemContext from '../myContext/problem/ProblemContext';

const ProblemCard = (props) => {
    const navigate = useNavigate();
    const context = useContext(ProblemContext);
    const { getProblemByTitle, subList } = context;
    const [isHovered, setIsHovered] = useState(false);

    const getSolvingStatus = (problemId) => {
        if (!subList || subList.length === 0) return "Unsolved";
        const submissions = subList.filter(sub => sub.problemId === problemId);
        if (submissions.length === 0) return "Unsolved";
        const hasAccepted = submissions.some(sub => sub.status === "Accepted");
        if (hasAccepted) return "Accepted";
        return "Wrong";
    };

    const solvingStatus = getSolvingStatus(props.data._id);
    let bgColor = 'white';
    if (solvingStatus === "Accepted") bgColor = 'rgba(6, 155, 6, 0.15)';
    else if (solvingStatus === "Wrong") bgColor = 'rgba(255, 0, 0, 0.15)';

    let statusIcon = '';
    if (solvingStatus === "Accepted")
        statusIcon = <span style={{ color: 'green', marginLeft: '8px', fontSize: '18px' }}><i className="fa-solid fa-check"></i></span>;
    else if (solvingStatus === "Wrong")
        statusIcon = <span style={{ color: 'red', marginLeft: '8px', fontSize: '18px' }}><i className="fa-solid fa-xmark"></i></span>;

    const handleClick = async () => {
        getProblemByTitle(props.data.title);
        const formattedTitle = props.data.title.toLowerCase().split(' ').join('-');
        navigate(`/problems/get-problem/${formattedTitle}`, { state: { problem: props.data } });
    };

    return (
        <div className="container w-4">
            <div
                className="card mt-2 d-flex justify-content-between align-items-center flex-row px-3 py-2"
                onClick={handleClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    backgroundColor: bgColor,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
            >
                <div className="d-flex align-items-center">
                    <h6 className="card-title mb-0 fw-semibold" style={{ fontSize: '16px' }}>
                        {props.idx+1} . {props.data.title}
                    </h6>
                    {statusIcon}
                </div>

                {isHovered ? (
                    <p className="fst-italic fw-medium mb-0" style={{ fontSize: '14px', color: '#555' }}>
                        {props.data.topics.join(", ")}
                    </p>
                ) : (
                    <p className={`fw-bold mb-0 text-${
                        props.data.difficulty === "Hard" ? "danger" :
                        props.data.difficulty === "Medium" ? "warning" : "success"
                    }`} style={{ fontSize: '14px' }}>
                        {props.data.difficulty}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProblemCard;
