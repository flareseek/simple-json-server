const express = require("express");
const fs = require("node:fs");
const path = require("node:path");

const app = express();
const port = 3000;

app.use(express.json());

function generateUrl(url, filePath) {
    const file = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(file);

    for(const method in json) {
        app[method](url, (req, res) => {
            const errorCode = [];
            if (json[method].request) checkKeys(json[method].request, req.body, (key) => {
                const errorMsg = key.join(".") + " Not found.";
                errorCode.push(errorMsg);
                console.log(errorMsg);
            });
            if (errorCode.length !== 0) res.status(400).send(errorCode.join("\n"));
            else res.json(json[method].response);
        });
    }
    console.log("binding ", url);
}

function checkKeys(origin, target, undefinedCb, ...trace) {
    const keys = Object.keys(origin);
    for(const key of keys) {
        if (!target[key]) {
            undefinedCb([...trace, key]);
            continue;
        }
        if (typeof origin[key] === 'object') {
            checkKeys(origin[key], target[key], undefinedCb, ...trace, key);
        }
    }
}

function getFileNames(filesPath) {
    return fs.readdirSync(filesPath).filter(file => file.endsWith(".json")).map(fileName => fileName.substring(0, fileName.length - 5));
}

function getFolderNames (folderPath) {
    return fs.readdirSync(folderPath, { withFileTypes: true }).filter(dir => dir.isDirectory()).map(dir => dir.name);
}

function findFile(urlDepth = []) {
    const rootPath = path.join(__dirname, "router");

    const folderPath = path.join(rootPath, ...urlDepth);
    const childFolderNames = getFolderNames(folderPath);
    if (childFolderNames.length === 0) return;

    for(const childFolderName of childFolderNames) {
        const folderDepth = [...urlDepth];
        folderDepth.push(childFolderName);

        const childFolderPath = path.join(rootPath, ...folderDepth);
        const fileNames = getFileNames(childFolderPath);

        for(const fileName of fileNames) {
            const filePath = path.join(childFolderPath, `${fileName}.json`);
            const url = `/${folderDepth.reduce((prev, curr) => `${prev}/${curr}`)}${fileName === "index" ? "" : `/${fileName}`}`
            generateUrl(url, filePath);
        }
        findFile(folderDepth);
    }
}

findFile();

app.listen(port, () => {
    console.log(`http://localhost:${port}`);
})