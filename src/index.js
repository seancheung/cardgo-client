import Application from './application';
import Coroutine from './coroutine';
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
        app.ticker.add(Coroutine.tick, Coroutine);
        scenes.forEach(scene => app.sceneManager.add(scene));
        app.sceneManager.load('loading');
    },
    false
);

export default app;
