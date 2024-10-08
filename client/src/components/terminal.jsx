import React, { useEffect, useRef, useState } from "react";
import { Terminal as XTerminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import socket from "../socket";

export default function Terminal() {
  const terminalRef = useRef();
  const isRendered = useRef(false);
  const [inputBuffer, setInputBuffer] = useState("");

  useEffect(() => {
    if (isRendered.current) return true;
    isRendered.current = true;

    const term = new XTerminal({
      rows: 20,
      // scrollback: 0,
    });

    term.open(terminalRef.current);

    term.onData((data)=>{
        // console.log(`terminal data::> ${data}`)
        socket.emit('terminal:write',data)
    })
   
    socket.on("terminal:data", (data) => {
      term.write(data);
    });
  }, []);

  return <div ref={terminalRef} id="terminal"></div>;
}
