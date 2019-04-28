"use strict";

window.addEventListener('load', function () {
  var ws = new WebSocket("ws://localhost:1482");

  ws.onopen = function () {
    console.log("Connected!!");
  };

  var preloader = document.getElementById("loader");
  preloader.style.opacity = 0;
  preloader.style.pointerEvents = 'none';
  document.body.style.overflowY = 'scroll';
  setTimeout(function () {
    preloader.remove();
  }, 1500);
});