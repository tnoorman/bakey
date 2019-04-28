window.addEventListener('load', () => { 
    const ws = new WebSocket("ws://localhost:1482");

    ws.onopen = () => {
        console.log("Connected!!");
    }

    const preloader = document.getElementById("loader");

    preloader.style.opacity = 0;
    preloader.style.pointerEvents = 'none';
    document.body.style.overflowY = 'scroll';

    setTimeout(() => {
        preloader.remove();
    }, 1500)

})