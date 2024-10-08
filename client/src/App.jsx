import "./App.css";
import Terminal from "./components/terminal";

function App() {
  return (
    <div className="playground">
      <div className="editor-container">
        <div className="file-explorer">explorer</div>
        <div className="file-editor">editor</div>
      </div>
      <div className="terminal-container">
        <Terminal />
      </div>
    </div>
  );
}

export default App;
