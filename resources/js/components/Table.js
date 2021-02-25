import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';

export default function Table ({messages}) {
    return (<table className = "table table-bordered text-center">
        <thead>
        <tr>
            <th>Time</th>
            <th>Source</th>
            <th>Topic</th>
            <th>Type</th>
            <th>Data</th>
        </tr>
        </thead>
        <tbody>
        {messages && messages.length > 0 ? messages.map((m, i) => {
            const data = JSON.parse(m.msg.data);
            return <tr key = {i}>
                <td>{data.time}</td>
                <td>{data.source}</td>
                <td>{data.topic}</td>
                <td>{m.msg.type}</td>
                <td>{m.msg.data}</td>
            </tr>
        }) : null}
        </tbody>
    </table>)
}
