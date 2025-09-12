const path = require("path")
const fs = require("fs")

const baseDir = process.pkg ? path.dirname(process.execPath) : process.cwd();

const paths = {
    uploadExcel:path.join(baseDir,"uploadExcel"),
    sampleFile:path.join(baseDir, "sampleFile"),
    dist:path.join(baseDir,"dist")
}

if(!fs.existsSync(paths.uploadExcel)){
    fs.mkdirSync(paths.uploadExcel, {recursive:true});
}


module.exports = paths;