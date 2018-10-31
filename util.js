"use strict";

//js
let gE =id=>{return document.getElementById(id)}
const log =(...e)=>console.log(...e);
const performanceCheck = {
    list:[],
    exec(text=""){
        const p =performance.now(), li = this.list, le = li.length;
        if(le>0)console.log(`[${le}]total:${(p-li[0]).toFixed(3)}, ${(p-li[le-1]).toFixed(3)} ${text}`);
        li.push(p);
    },
};
const perf =text=>performanceCheck.exec(text);

// Math
const PI = Math.PI;
const PI2 = Math.PI*2
const PHI = 1.618033988749895;//(Math.sqrt(5)+1)/2

// canvas
const canvasEl = document.getElementById("canvas");
const ctx = canvasEl.getContext("2d");
let width = canvasEl.offsetWidth, height = canvasEl.offsetHeight;
let mouseX = 0, mouseY = 0, mousePressed = false;

function getMousePos(e){
    e.preventDefault();
    let rect = e.target.getBoundingClientRect();
    return [mouseX, mouseY] = [
        Math.floor( ( e.x - rect.left )  ),
        Math.floor( ( e.y - rect.top  )  )
    ];
}


//canvas function
function background(col,context){
    let c = context||ctx;
    c.fillStyle = col;
    c.fillRect(0,0,width, height);
}


function line(x1,y1,x2,y2,col="white",context=ctx){
    let c = context;
    c.beginPath();
    c.moveTo(x1,y1);
    c.lineTo(x2,y2);
    c.closePath();
    c.strokeStyle=col;
    c.stroke();
}

function circle(x=0, y=0, radius=50, fillCol="white", strokeCol, context){
    let c = context||ctx;
    c.beginPath();
    c.arc(x,y,radius,0,2*Math.PI);
    
    if(fillCol){
        c.fillStyle= fillCol;
        c.fill();
    }
    if(strokeCol){
        c.strokeStyle = strokeCol;
        c.stroke();
    }
    c.closePath();
}

function rectangle(x=1,y=1,width=1, height=1, color="white", stroke, context){
    let c = context||ctx;
    c.fillStyle= color;
    c.fillRect(x,y,width,height);
    if(stroke){
        c.strokeStyle= stroke;
        c.strokeRect(x,y,width,height);
    }

}
