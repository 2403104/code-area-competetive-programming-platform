import React from 'react'

const RulesAndRegulations = () => {
    return (
        <div>
            <h1 className="mt-5 mb-3 fw-bold text-secondary">📜 Rules and Regulations</h1>
            <ul className="list-group list-group-flush mb-4">
                <li className="list-group-item py-3" style={{ backgroundColor: '#fefefe', borderLeft: '5px solid #c7e0f5' }}>
                    You must <strong>register</strong> to participate in a contest. Registration opens always and closes as soon as contest begins.
                </li>
                <li className="list-group-item py-3" style={{ backgroundColor: '#fefefe', borderLeft: '5px solid #d0ecff' }}>
                    The system supports <strong>English</strong> interface languages.
                </li>
                <li className="list-group-item py-3" style={{ backgroundColor: '#fefefe', borderLeft: '5px solid #c7e0f5' }}>
                    Each round lasts for <strong>2 hours</strong> unless stated otherwise in the contest information.
                </li>
                <li className="list-group-item py-3" style={{ backgroundColor: '#fefefe', borderLeft: '5px solid #d0ecff' }}>
                    Contestants will be given <strong>6-7 problems</strong> to solve, unless otherwise mentioned.
                </li>
                <li className="list-group-item py-3" style={{ backgroundColor: '#fefefe', borderLeft: '5px solid #c7e0f5' }}>
                    Problem statements will be available in <strong>English</strong>, released at contest start time.
                </li>
                <li className="list-group-item py-3" style={{ backgroundColor: '#fefefe', borderLeft: '5px solid #c7e0f5' }}>
                    Contest supports <strong>4</strong> Programming languages: <strong>C++</strong>, <strong>Python</strong>, <strong>Java</strong>, and <strong>JavaScript</strong>.
                </li>
            </ul>

            <h1 className="mt-5 mb-3 fw-bold text-secondary">🧾 Judgement Verdicts</h1>
            <div className="table-responsive">
                <table className="table table-bordered rounded shadow-sm" style={{ backgroundColor: '#fefefe' }}>
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: '220px' }}>Verdict</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Memory limit exceeded</strong></td>
                            <td>The program tries to consume more memory than is allowed in the problem statement.</td>
                        </tr>
                        <tr>
                            <td><strong>Time limit exceeded</strong></td>
                            <td>The program did not terminate within the time specified in the problem statement.</td>
                        </tr>
                        <tr>
                            <td><strong>Runtime error</strong></td>
                            <td>The program exited with a non-zero code. Possible causes include out-of-bounds access, division by zero, or stack overflow.</td>
                        </tr>
                        <tr>
                            <td><strong>Wrong answer</strong></td>
                            <td>The program produced incorrect output for at least one test case.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <h2 className="mt-5 fw-bold text-secondary">✅ Can-do's and ❌ Can't-do's</h2>
            <div className="p-4 rounded mb-4" style={{ backgroundColor: '#f9f9fc', borderLeft: '5px solid #0d6efd' }}>
                <ul className="list-unstyled text-dark fs-6">
                    <li className="mb-2">✅ You may use <strong>books, personal notes</strong>, and <strong>self-written code</strong>.</li>
                    <li className="mb-2">❌ Do not use <strong>someone else's code</strong> or share solutions.</li>
                    <li className="mb-2">✅ Internet use is allowed, but <strong>copy-pasting is not</strong>.</li>
                    <li className="mb-2">❌ Obfuscating or disguising code is forbidden.</li>
                    <li className="mb-2">❌ Do not discuss problems during the contest.</li>
                    <li className="mb-2">❌ Trying to destabilize the system leads to disqualification.</li>
                    <li className="mb-2">❌ Using digital tools to extract code from others is cheating.</li>
                    <li className="mb-2">⚠️ Violating any rule may lead to <strong>disqualification</strong>.</li>
                </ul>
            </div>

            <h2 className="mt-5 fw-bold text-secondary">📊 Standings</h2>
            <div className="p-4 rounded mb-4" style={{ backgroundColor: '#f9f9fc', borderLeft: '5px solid #6f42c1' }}>
                <ul className="list-unstyled text-dark fs-6 mb-0">
                    <li className="mb-2">📌 A <strong>live standings table</strong> will be available during the contest.</li>
                    <li className="mb-2">🏅 It will display <strong>current rankings and performance</strong>.</li>
                    <li className="mb-2">🔍 Also includes <strong>submission history</strong>.</li>
                    <li className="mb-2">⚠️ These standings are <strong>unofficial</strong> until the contest ends.</li>
                </ul>
            </div>

            <h2 className="mt-5 fw-bold text-secondary">⚠️ Penalty Rules</h2>
            <div className="p-4 rounded mb-4" style={{ backgroundColor: '#fff3cd', borderLeft: '5px solid #ffc107' }}>
                <ul className="list-unstyled text-dark fs-6 mb-0">
                    <li className="mb-2">❌ Each <strong>wrong submission</strong> deducts <strong>50 points</strong>.</li>
                    <li className="mb-2">📉 Final score will <strong>never fall below 30%</strong> of the total.</li>
                    <li className="mb-2 text-danger fw-semibold">🚫 Copy-pasting other's code can lead to a <strong>permanent account ban</strong>.</li>
                </ul>
            </div>
        </div>
    )
}

export default RulesAndRegulations
