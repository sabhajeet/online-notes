const fs = require("fs");
const path = require("path");

const ignore = ["node_modules", ".git"];

function printTree(dir, indent = "") {
  const files = fs.readdirSync(dir).filter(f => !ignore.includes(f));

  files.forEach((file, index) => {
    const fullPath = path.join(dir, file);
    const isLast = index === files.length - 1;

    const prefix = isLast ? "└── " : "├── ";
    console.log(indent + prefix + file);

    if (fs.statSync(fullPath).isDirectory()) {
      const newIndent = indent + (isLast ? "    " : "│   ");
      printTree(fullPath, newIndent);
    }
  });
}

printTree("./");