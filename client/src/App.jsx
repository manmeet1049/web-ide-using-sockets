import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Terminal from "./components/terminal";
import FileTree from "./components/fileTree";
import socket from "./socket";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";
import { getFileMode } from "./utils/getFileMode";

function App() {
  const [fileTree, setFileTree] = useState({});
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [code, setCode] = useState("");

  const isSaved = selectedFileContent === code;

  const getFileTree = async () => {
    const response = await fetch("http://localhost:9000/files");
    const result = await response.json();
    setFileTree(result.tree);
  };

  const getFileContents = useCallback(async () => {
    if (!selectedFile) return;
    const response = await fetch(
      `http://localhost:9000/files/content?path=${selectedFile}`
    );
    const result = await response.json();
    setSelectedFileContent(result.content);
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile) getFileContents();
  }, [getFileContents, selectedFile]);

  useEffect(() => {
    getFileTree();
  }, []);

  useEffect(() => {
    if (selectedFile && selectedFileContent) {
      setCode(selectedFileContent);
    }
  }, [selectedFile, selectedFileContent]);

  useEffect(() => {
    socket.on("file:refresh", getFileTree);
    return () => {
      socket.off("file:refresh");
    };
  }, []);

  useEffect(() => {
    if (code && !isSaved) {
      const timer = setTimeout(() => {
        console.log("save:::>>>", code);
        socket.emit("file:change", {
          content: code,
          path: selectedFile,
        });
      }, 5 * 1000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [code, selectedFile, isSaved]);

  useEffect(() => {
    setCode("");
  }, [selectedFile]);

  return (
    <div className="playground">
      <div className="editor-container">
        <div className="file-explorer">
          <FileTree
            tree={fileTree}
            onSelect={(path) => {
              setSelectedFile(path);
            }}
          />
        </div>
        <div className="file-editor">
          {selectedFile && <p>{selectedFile.replaceAll("/", "> ")}</p>}
          {isSaved ?'Saved':'Not Saved'}
          <AceEditor
            value={code}
            onChange={(e) => {
              setCode(e);
            }}
          />
        </div>
      </div>
      <div className="terminal-container">
        <Terminal />
      </div>
    </div>
  );
}

export default App;
