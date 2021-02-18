import React, {useRef, useState, useEffect} from 'react';
import ReactDOM from 'react-dom';
import {NativeEventSource, EventSourcePolyfill} from 'event-source-polyfill';
import 'bootstrap/dist/css/bootstrap.css';

window.EventSourceOf = NativeEventSource || EventSourcePolyfill;
window.EventSourcePolyfill = EventSourcePolyfill;

function App () {
    const [topicRef, messageRef, typeRef] = [
        useRef(),
        useRef(),
        useRef(),
    ];
    const [messages, setMessage] = useState([]);
    const [messageType, setMessageType] = useState('public');
    const [hub, setHub] = useState('');

    const addMessage = (message, type = 'info') => {
        if ( typeof message != "string" ) {
            message = message.message
        }

        setMessage(prev => [
            {type, text: message},
            ...prev
        ]);
    }

    useEffect(() => {
        fetch('/api/discovery').then(response => {
            addMessage(`Hub discovery. Status: "${response.status}"`);
            if ( response.ok ) {
                return response;
            }

            return Promise.reject(response);
        }).then(response => {
            const hubUrl = response.headers.get('Link').match(/<([^>]+)>;\s+rel=(?:mercure|"[^"]*mercure[^"]*")/)[1];
            setHub(() => hubUrl);
            addMessage(`Found hub: "${hubUrl}"`, 'success')
        }).catch(e => {
            addMessage("Cannot find Hub URL.", "danger");
            console.log(e);
        });
    }, []);

    const publish = () => {
        const topic = topicRef.current.value.trim();
        const message = messageRef.current.value.trim();
        if ( !topic || !message ) {
            alert('Topic Or Message cannot be empty');
            return;
        }
        const payload = {
            'topic': topicRef.current.value, 'message': messageRef.current.value, 'publish_type': messageType,
            'type': typeRef.current.value.trim() ?? null
        }

        fetch('/api/broadcast', {
            headers: {
                'content-type': 'application/json',
            }, method: 'post', body: JSON.stringify(payload)
        }).then(response => {
            addMessage(`Broadcast message. Status: "${response.status}"`);
            if ( response.ok ) {
                return response;
            }

            return Promise.reject(response);
        }).then(() => {
            addMessage('Successfully broadcasts message.', 'success');
        }).catch(e => {
            addMessage("Check console.", 'warning');
            console.log(e);
        });
    }

    const changeMessageType = (value) => {
        setMessageType(prev => value)
    }

    return (<div className = "container-fluid" style = {{marginTop: 5}}>
        <div className = "row">
            <div className = "col-8">
                <div className = "col-12">
                    <p className = "text-info">Publish a message</p>
                    <form className = "form-row" onSubmit = {e => e.preventDefault()}>
                        <div className = "form-group col-3">
                            <input type = "text" placeholder = "Topic" ref = {topicRef} name = "topic"
                                   className = "form-control" />
                        </div>
                        <div className = "form-group col-3">
                            <input type = "text" placeholder = "Message content" ref = {messageRef}
                                   name = "message" className = "form-control" />
                        </div>
                        <div className = "form-group col-2">
                            <input type = "text" placeholder = "Type" ref = {typeRef}
                                   name = "type" className = "form-control" />
                        </div>
                        <div className = "form-group col-2">
                            <div className = "form-check form-check-inline">
                                <input className = "form-check-input" type = "radio"
                                       checked = {messageType == 'public'}
                                       onChange = {() => changeMessageType('public')}
                                       name = "message_type" id = "public" value = "pubic" />
                                <label className = "form-check-label" htmlFor = "public">Pub</label>
                            </div>
                            <div className = "form-check form-check-inline">
                                <input className = "form-check-input" type = "radio"
                                       checked = {messageType == 'private'}
                                       onChange = {() => changeMessageType('private')}
                                       name = "message_type" id = "private" value = "private" />
                                <label className = "form-check-label" htmlFor = "private">Priv</label>
                            </div>
                        </div>
                        <div className = "form-group col-2">
                            <button className = "btn btn-block btn-primary" onClick = {() => publish()}
                                    type = "button">Publish
                            </button>
                        </div>
                    </form>
                </div>
                <hr />
                <div className = "col-12">
                    <p className = "text-info">Subscribe for events</p>
                    <form className = "form-row">
                        <div className = "form-group col-9">
                            <input type = "text" placeholder = "Topic to subscribe" className = "form-control" />
                        </div>
                        <div className = "form-group col-3">
                            <button className = "btn btn-block btn-info" type = "button">Connect</button>
                        </div>
                    </form>
                </div>
            </div>
            <div className = "col-4">
                <ul>
                    {messages && messages.length > 0 ? messages.map((m, i) => {
                        return <li className = {`text-${m.type}`} key = {i}>{m.text}</li>
                    }) : null}
                </ul>
            </div>
        </div>

    </div>);
}

export default App;

if ( document.getElementById('root') ) {
    ReactDOM.render(<App />, document.getElementById('root'));
}
