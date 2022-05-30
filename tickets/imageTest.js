const fs = require('fs');

let image = fs.readFileSync('tickets/image', 'utf8');
let base64Data = image.replace(`data:image/png;base64,`, "");
console.log(base64Data);
let test = Buffer.from(base64Data, 'base64');

fs.writeFileSync('tickets/out.png', test);