import Application from './application';
import scenes from './scenes';

const app = new Application({
    width: window.innerWidth,
    height: window.innerHeight,
    transparent: false,
    antialias: true,
    resolution: 1,
    autoStart: false
});

document.body.appendChild(app.view);
document.addEventListener(
    'deviceready',
    () => {
        app.start();
        scenes.forEach(scene => app.sceneManager.add(scene));
        app.sceneManager.load('loading');
    },
    false
);

export default app;
