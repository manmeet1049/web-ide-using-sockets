const FileTreeNode = ({ fileName, nodes, onSelect, path }) => {
  const isDir = !!nodes;
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (isDir) return;
        onSelect(path);
      }}
      style={{ marginLeft: "0px" }}
    >
      <p className={isDir ? "" : "file-node"}>{fileName}</p>
      {nodes && (
        <ul>
          {Object.keys(nodes).map((child) => (
            <li key={child}>
              <FileTreeNode
                onSelect={onSelect}
                fileName={child}
                path={path + "/" + child}
                nodes={nodes[child]}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const FileTree = ({ tree, onSelect }) => {
  return (
    <FileTreeNode onSelect={onSelect} fileName={"/"} path="" nodes={tree} />
  );
};

export default FileTree;
