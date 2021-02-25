import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';

export default function List ({messages}) {
    return (<ul>
        {messages && messages.length > 0 ? messages.map((m, i) => {
            return <li className = {`text-${m.type}`} key = {i}>{m.text}</li>
        }) : null}
    </ul>)
}
