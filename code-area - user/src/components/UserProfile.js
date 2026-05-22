import React, { useEffect, useState } from 'react';
import RatingChars from './RatingChars';
import SubmissionChars from './SubmissionChars';
import { useParams } from 'react-router-dom';
// require('dotenv').config();
// import dotenv from "dotenv";

const UserProfile = () => {
    const { username } = useParams();
    const [user, setUser] = useState(null);

    const fetchProfile = async () => {
        try {
            const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";
            const url = `${BACKEND_URL}/user/user-profile/${username}`;
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const data = await res.json();
            console.log("Fetched data:", data);
            if (data.success) {
                setUser(data.user);
            } else {
                console.log("Error Fetching User");
                setUser(null);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setUser(null);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [username]);

    if (!user) {
        return <div className="text-center mt-4">Loading profile...</div>;
    }

    const ratingHistory = Array.isArray(user.contestHistory)
        ? user.contestHistory.map((entry) => ({
            contestName: entry.contestName,
            date: new Date(entry.date).toISOString().slice(0, 10),
            rating: entry.newRating,
            rank: entry.rank
        }))
        : [];

    const solvedTimelineArray = user.solvedTimeLine
        ? Object.entries(user.solvedTimeLine).map(([date, count]) => ({
            date,
            count
        }))
        : [];

    return (
        <>
            <div className="d-flex align-items-center p-4 mt-3" style={{ backgroundColor: '#f9f9f9', width: '90vw', marginLeft: '4vw', border: '1px solid #ccc' }}>
                <div>
                    <h2 className="fw-bold text-primary mb-2">{user.username}</h2>
                    <p className="mb-0 fs-5 text-secondary">
                        Contest Rating:&nbsp;
                        {user.currentRating === -1 || user.currentRating === undefined ? (
                            <span className="text-muted">Unrated</span>
                        ) : (
                            <span className="text-success fw-semibold">{user.currentRating}</span>
                        )}
                    </p>
                </div>
            </div>
            <RatingChars data={ratingHistory} />
            <SubmissionChars timeline={solvedTimelineArray} />

        </>
    );
};

export default UserProfile;
