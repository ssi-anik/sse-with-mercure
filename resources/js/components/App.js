import React, {useEffect, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import {EventSourcePolyfill, NativeEventSource} from 'event-source-polyfill';
import 'bootstrap/dist/css/bootstrap.css';
import List from "./List";

window.EventSourceOf = NativeEventSource || EventSourcePolyfill;
window.EventSourcePolyfill = EventSourcePolyfill;

function App () {
    const [topicRef, messageRef, typeRef, listenerTopicRef, ttlRef] = [
        useRef(),
        useRef(),
        useRef(),
        useRef(),
        useRef(),
    ];

    const [eventStream, setEventStream] = useState(null);
    const [logs, setLogs] = useState([]);
    const [messages, setMessage] = useState([]);
    const [privateMessage, setPrivateMessage] = useState(false);
    const [anonymous, setAnonymous] = useState(false);
    const [hub, setHub] = useState('');

    const addMessage = (message, type = 'info') => {
        if ( typeof message != "string" ) {
            message = message.message
        }

        setLogs(prev => [
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
            'topic': topicRef.current.value,
            'message': messageRef.current.value,
            'publish_type': privateMessage ? 'private' : 'public',
            'type': typeRef.current.value.trim() || null
        }

        fetch('/api/broadcast', {
            headers: {
                'content-type': 'application/json',
            }, method: 'post', body: JSON.stringify(payload)
        }).then(response => {
            addMessage(`Broadcast message. Status: "${response.status}"`);
            if ( response.ok ) {
                return response.json();
            }

            return Promise.reject(response);
        }).then(() => {
            addMessage('Successfully broadcasts message.', 'success');
        }).catch(e => {
            addMessage("Check JS console.", 'warning');
            console.log(e);
        });
    }

    const connect = () => {
        const listenerTopic = listenerTopicRef.current.value.trim();
        if ( !listenerTopic ) {
            alert('Cannot connect due to empty topic');
            return;
        }
        const payload = {
            topics: listenerTopic, ttl: ttlRef.current.value, anonymous,
        };

        fetch('/api/subscriber-token', {
            headers: {
                'content-type': 'application/json',
            }, method: 'post', body: JSON.stringify(payload)
        }).then(response => {
            addMessage(`Subscriber token. Status: "${response.status}"`);
            if ( response.ok ) {
                return response.json();
            }

            return Promise.reject(response);
        }).then((response) => {
            addMessage('Got subscriber token.', 'success');
            const token = response.token;
            const url = new URL(hub);
            response.topics.forEach(topic => url.searchParams.append('topic', topic));
            const headers = {headers: {Authorization: 'Bearer ' + token}};
            if ( null !== eventStream ) {
                addMessage('Disconnecting previous event stream connection', 'danger');
                eventStream.close();
            }
            setEventStream(() => {
                const eventStream = new EventSourcePolyfill(url, headers)
                eventStream.onmessage = (msg) => {
                    messageReceived(msg);
                };
                return eventStream;
            })
        }).catch(e => {
            addMessage("Check JS console.", 'warning');
            console.log(e);
        });
    }

    const messageReceived = (msg) => {
        setMessage(prev => [
            {type: 'info', text: `Received message of type: "${msg.type}" - Message: "${msg.data}"`},
            ...prev
        ]);
    }

    const changeMessageType = (value) => {
        setPrivateMessage(() => value)
    }

    const changeAnonymity = (value) => {
        setAnonymous(() => value)
    }

    return (<div className = "container-fluid" style = {{marginTop: 5}}>
        <div className = "row">
            <div className = "col-8">
                <div className = "col-12">
                    <p className = "text-info">Publish a message</p>
                    <form className = "form-row" onSubmit = {e => e.preventDefault()}>
                        <div className = "form-group col-3">
                            <input type = "text" placeholder = "To topic" ref = {topicRef} name = "topic"
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
                            <div className = "custom-control custom-switch" style = {{marginTop: 5}}>
                                <input type = "checkbox" checked = {privateMessage}
                                       onChange = {() => changeMessageType(!privateMessage)}
                                       className = "custom-control-input" id = "private-message" />
                                <label className = "custom-control-label"
                                       htmlFor = "private-message">Private?</label>
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
                        <div className = "form-group col-5">
                            <input type = "text" placeholder = "Subscribe Topic (comma separated)"
                                   ref = {listenerTopicRef} className = "form-control" />
                        </div>
                        <div className = "form-group col-2">
                            <input type = "text" placeholder = "TTL"
                                   ref = {ttlRef} className = "form-control" />
                        </div>
                        <div className = "form-group col-2">
                            <div className = "custom-control custom-switch" style = {{marginTop: 5}}>
                                <input type = "checkbox" checked = {anonymous}
                                       onChange = {() => changeAnonymity(!anonymous)}
                                       className = "custom-control-input" id = "anonymous" />
                                <label className = "custom-control-label"
                                       htmlFor = "anonymous">Anonymous?</label>
                            </div>
                        </div>
                        <div className = "form-group col-3">
                            <button className = "btn btn-block btn-info" type = "button"
                                    onClick = {() => connect()}>Connect
                            </button>
                        </div>
                    </form>
                </div>
                <div className="col-12">
                    <List messages = {messages} />
                </div>
            </div>
            <div className = "col-4">
                <List messages = {logs} />
            </div>
        </div>

    </div>);
}

export default App;

if ( document.getElementById('root') ) {
    ReactDOM.render(<App />, document.getElementById('root'));
}
