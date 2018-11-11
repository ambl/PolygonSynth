"use strict";

//js
const gE = id => { return document.getElementById(id) };
const getValue = id =>{return Number(document.getElementById(id).value);}
const log = (...e) => console.log(...e);

// Math
const PI = Math.PI;
const PI2 = Math.PI * 2;

// canvas
const canvasEl = document.getElementById("canvas");
const ctx = canvasEl.getContext("2d");
let width = canvasEl.offsetWidth, height = canvasEl.offsetHeight;
let mouseX = 0, mouseY = 0, mousePressed = false;


// canvas function
function background(col, context) {
    let c = context || ctx;
    c.fillStyle = col;
    c.fillRect(0, 0, width, height);
}

function line(x1, y1, x2, y2, col = "white", context = ctx) {
    let c = context;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.closePath();
    c.strokeStyle = col;
    c.stroke();
}

function circle(x = 0, y = 0, radius = 50, fillCol = "white", strokeCol, context) {
    let c = context || ctx;
    c.beginPath();
    c.arc(x, y, radius, 0, 2 * Math.PI);

    if (fillCol) {
        c.fillStyle = fillCol;
        c.fill();
    }
    if (strokeCol) {
        c.strokeStyle = strokeCol;
        c.stroke();
    }
    c.closePath();
}

window.onerror = function(msg, url, line, col, error) {  
    background("#fff8");
    ctx.textAlign= "left";
    ctx.textBaseline = "top";
    ctx.fillStyle="red";
    ctx.fillText(msg,0,0);
    clearInterval(animationIntervalId);
};
