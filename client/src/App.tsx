import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import io from "socket.io-client";

const socket = io("127.0.0.1:8080");

function App() {
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [lastPong, setLastPong] = useState("");

    useEffect(() => {
        socket.on("connect", () => {
            setIsConnected(true);
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.on("pong", () => {
            setLastPong(new Date().toISOString());
        });

        return () => {
            socket.off("connect");
            socket.off("disconnect");
            socket.off("pong");
        };
    }, []);
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
