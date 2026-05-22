import React, { useState, useEffect } from 'react';
import SplitPane from 'react-split-pane';
import PutSubmissionData from './PutSubmissionData';
import CodeArea from '../CodeArea';
import QuestionNavbar from '../QuestionNavbar';

const YourSubmissions = () => {
    const [windowDimensions, setWindowDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ height: '100vh', overflow: 'hidden' }}>
            <style>{`
                ::-webkit-scrollbar {
                    display: none;
                }
                html {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .Resizer {
                    background: rgba(128,128,128,0.3);
                    opacity: 1;
                    z-index: 1000;
                    box-sizing: border-box;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .Resizer.vertical {
                    width: 10px;
                    cursor: col-resize;
                }
                .Resizer:hover {
                    background: rgba(128,128,128,0.5);
                }
                .Resizer:active {
                    background: rgba(128,128,128,0.7);
                }
                .Resizer::before {
                    content: '';
                    width: 4px;
                    height: 24px;
                    background-image: radial-gradient(circle, #666 2px, transparent 2px);
                    background-size: 4px 4px;
                    background-repeat: repeat-y;
                    background-position: center;
                    position: absolute;
                    top: 40%;
                    transform: translateY(-50%);
                }
            `}</style>

            <SplitPane
                split="vertical"
                minSize={300}
                maxSize={windowDimensions.width - 300}
                defaultSize="45%"
                paneStyle={{ overflow: 'auto' }}
                pane2Style={{ overflow: 'auto' }}
                resizerClassName="Resizer"
            >
                <div style={{ height: '100%', overflowY: 'auto', padding: '0 10px' }}>
                    <QuestionNavbar />
                    <PutSubmissionData />
                </div>
                <div style={{ height: '100%', overflowY: 'auto', padding: '0 10px' }}>
                    <CodeArea />
                </div>
            </SplitPane>
        </div>
    );
};

export default YourSubmissions;
