import * as path from 'path';
const scenes = [];
const context = require.context('./', false, /^((?!index).)*\.js$/);
context.keys().forEach(key => {
    const name = path.basename(key, path.extname(key));
    const type = context(key).default;
    scenes.push(new type(name));
});

export default scenes;
