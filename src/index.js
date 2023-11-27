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
        app[method.toLowerCase()](url, (req, res) => {
            const errorCode = [];
            if (json[method].request) checkKeys(json[method].request, req.body, (msg) => {
                errorCode.push(msg);
            });
            if (errorCode.length !== 0) res.status(400).send(errorCode.join("<br>"));
            else res.json(json[method].response);
        });
        console.log(`binding [${method.toUpperCase()}]`, url);
    }
}

function checkKeys(origin, target, cb, ...trace) {
    const keys = Object.keys(origin);
    for(const key of keys) {
        if (target[key] === undefined) {
            const msg = `\"${[...trace, key].join(".")}\" not found. (Type: ${typeof(origin[key])})`;
            console.error(msg);
            cb(msg);
            continue;
        }
        if (target[key] === null) {
            const msg = `[Warning] \"${[...trace, key].join(".")}\" is null (Type: ${typeof(origin[key])})`;
            console.error(msg);
            continue;
        }
        if (typeof origin[key] !== typeof target[key]) {
            const msg = `\"${[...trace, key].join(".")}\" is not a ${typeof origin[key]}`;
            console.error(msg);
            cb(msg);
            continue;
        }
        if (typeof origin[key] === 'object') {
            checkKeys(origin[key], target[key], cb, ...trace, key);
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
            const pathName = (name) => {
                if (name.startsWith("{") && name.endsWith("}"))
                    return `:${name.substring(1, name.length-1)}`;
                return name;
            }
            const endName = (name) => {
                if (name === "index") return "";
                return `/${pathName(name)}`;
            }
            const url = `/${folderDepth.reduce((prev, curr) => `${prev}/${pathName(curr)}`)}${endName(fileName)}`;
            generateUrl(url, filePath);
        }
        findFile(folderDepth);
    }
}

findFile();

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})