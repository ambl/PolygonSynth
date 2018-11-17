let polygonOsc, currentCanvasPath;
let canvasSampleRate = 256, animationIntervalId;
let animationPhase = 0;
let preInterval = 0, normalizerValue = 1;
let scale = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24].map(e => 220 * 2 ** (e / 12));
let keyboardEl = gE("keyboard"), keyboardContext, keys = scale.length;
let inputs = document.querySelectorAll("input");


class PolygonOsc {
    constructor(vertexList) {
        this.vertexList = vertexList;
        let vertices = this.vertices = vertexList.length;
        this.phasePerLine = 1 / vertices;
    }
    get(hz = 440, sec = 1, rounding = 0, sampleRate = 48000) {
        let output = [], outputWave = [];
        for (let i = 0, phase, phaseInLine, n, v1, v2, x, y, l = sec * sampleRate; i < l; i++) {
            phase = i / sampleRate * hz % 1;
            n = Math.floor(phase * this.vertices);
            phaseInLine = (phase - n * this.phasePerLine) / this.phasePerLine;

            v1 = this.vertexList[n];
            v2 = this.vertexList[(n+1)%this.vertices];
            x = v1[0] *(1-phaseInLine) + v2[0]*phaseInLine;
            y = v1[1] *(1-phaseInLine) + v2[1]*phaseInLine;

            let d = (x ** 2 + y ** 2) ** (1 / 2);// 中心からの距離, 一番遠い距離は1
            d = 2 - d;// 中心に近いほど高い数値が出る
            d = Math.abs(d); //TODO:削除
            d **= rounding;// 係数0なら1, 無効
            x *= d;
            y *= d;
            output.push([x, y]);
            outputWave.push(y);
        }
        
        return { coordinate: output, wave: outputWave };
    }
}

function createStarVertexList(vertices, interval, rotation) {
    let vertexList = [];
    let output = [];
    rotation = PI2 * rotation / 360;
    for (let i = 0; i < vertices; i++) {
        vertexList.push([
            Math.cos(rotation + PI2 / vertices * i),
            Math.sin(rotation + PI2 / vertices * i)
        ]);
    }

    function getLine(v1, v2) {
        let slope = (v2[1] - v1[1]) / (v2[0] - v1[0]);
        let b = v1[1] - slope * v1[0];
        if (Math.abs(slope) > 1000 || !isFinite(slope)) {
            slope = Infinity;
            b = v1[0]; // x=b equation
        }
        return { slope, b }
    }
    function getIntersection(e1, e2) {
        let x = (e2.b - e1.b) / (e1.slope - e2.slope);
        let y = e1.slope * x + e1.b;
        if (Math.abs(x) > 1000 || !isFinite(x)) { return false; }
        if (!isFinite(e1.slope)) {
            x = e1.b;  // if x=b equation, x=b
            y = e2.slope * x + e2.b;
        }
        if (!isFinite(e2.slope)) {
            x = e2.b;
            y = e1.slope * x + e1.b;
        }
        return [x, y];
    }

    for (let i = 0, li1, li2; i < vertices; i++) {
        output.push(vertexList[i]);// point1: index
        li1 = getLine(vertexList[i], vertexList[(i + interval) % vertices]); // line1: index to index +interval
        let nextIndex = (i + 1) % vertices;
        let nextIndex2 = (nextIndex + (vertices - interval)) % vertices;  // line2: (index+1) to (index+1) -interval
        while (nextIndex2 < 0) nextIndex2 += vertices;
        li2 = getLine(
            vertexList[nextIndex],
            vertexList[nextIndex2]
        );
        let crossingPoint = getIntersection(li1, li2); //point2
        if (crossingPoint === false) {
            li2 = getLine(
                vertexList[nextIndex],
                vertexList[(nextIndex + interval) % vertices]
            );
            crossingPoint = getIntersection(li1, li2);
        }
        output.push(crossingPoint);

    }

    return output;
}

function createVertexList(vertices, interval, rotation) {
    let vertexList = [];

    rotation = rotation / 360 * PI2;// degree to radian
    for (let i = 0; i < vertices; i++) {
        vertexList.push([
            Math.cos(rotation + PI2 / vertices * i * interval),
            Math.sin(rotation + PI2 / vertices * i * interval)
        ]);
    }
    return vertexList;
}

function changeOsc() {
    let vertices = Math.floor(getValue("vertices"));
    let interval = Math.floor(getValue("interval"));
    let rotation = getValue("rotation");
    let crossing = gE("crossing").checked;
    let rounding = getValue("rounding");

    if (Number.isInteger(interval / vertices)) {
        if (preInterval < interval || interval === 0) interval++;
        else interval--;
        gE("interval").value = interval;
    }
    preInterval = interval;

    let fnc = crossing ? createStarVertexList : createVertexList;
    let vertexList = fnc(vertices, interval, rotation);

    polygonOsc = new PolygonOsc(vertexList);
    setupCanvas(polygonOsc, rounding);
    setupSound(polygonOsc, rounding);
}

function setupCanvas(polygonOsc, rounding) {
    let sampleRate = canvasSampleRate;
    currentCanvasPath = polygonOsc.get(1, 1, rounding, sampleRate).coordinate;
    normalizerValue = normalizer2D(currentCanvasPath);
    startAnimation();
}

function normalizer2D(x, value = 1) {
    let max = 0, len = x.length;
    for (let i = 0, n; i < len; i++) {
        n = (x[i][0] ** 2 + x[i][1] ** 2) ** (1 / 2);
        if (n > max) max = n;
    }
    for (let i = 0, r = max / value; i < len; i++) {
        x[i][0] /= r;
        x[i][1] /= r;
    }
    return max / value;
}

function drawPolygonCanvas(path, sampleRate, animationPhase = 0) {
    background("orange");
    let radius = height / 3;
    let cX = width * 1 / 6, cY = height / 2;
    circle(cX, cY, radius / normalizerValue, null, "grey");
    for (let i = 0, x, y; i < sampleRate; i++) {
        x = cX + path[i][0] * radius;
        y = cY - path[i][1] * radius;
        circle(x, y, 1)
        if (i == animationPhase) circle(x, y, 3)
    }

    let waveformWidth = 200, waveformX = width * 2 / 6;
    let y1 = Math.round(cY - radius / normalizerValue) + 0.5;
    let y2 = Math.round(cY + radius / normalizerValue) + 0.5;
    ctx.lineWidth = 1;
    line(waveformX, cY, waveformX + waveformWidth, cY, "grey");
    line(waveformX, y1, waveformX + waveformWidth, y1, "grey");
    line(waveformX, y2, waveformX + waveformWidth, y2, "grey");
    for (let i = 0, y; i < sampleRate; i++) {
        y = cY - path[i][1] * radius;
        circle(waveformX + i / sampleRate * waveformWidth, y, 1)
        if (i == animationPhase) circle(waveformX + i / sampleRate * waveformWidth, y, 3)
    }
}

function startAnimation() {
    animationPhase = 0;
    if (animationIntervalId) clearInterval(animationIntervalId);
    animationIntervalId = setInterval(animate, 1000 / 30);
}

function animate() {
    drawPolygonCanvas(currentCanvasPath, canvasSampleRate, animationPhase);
    animationPhase++;
    if (animationPhase == canvasSampleRate) {
        animationPhase = 0;
        clearInterval(animationIntervalId);
        return;
    }
}

function setupKeyboard() {
    let ctx = keyboardContext = keyboardEl.getContext("2d");
    let width = keyboardEl.offsetWidth, height = keyboardEl.offsetHeight;
    for (let i = 0; i <= keys; i++) {
        let x = width / keys * i;
        x = Math.round(x);
        line(x, 0, x, height, "grey", ctx);
        if (i % 7 != 0) continue;
        x += width / 30;
        circle(x, height * 3 / 4, height / 15, "orange", null, ctx);
    }
    line(0, 0, width, 0, "grey", ctx);
    line(0, height, width, height, "grey", ctx);

    keyboardEl.addEventListener("mousemove", mousemoveHandler, false);
    keyboardEl.addEventListener("mousedown", mouseHandler, false);
    keyboardEl.addEventListener("mouseup", mouseupHandler, false);
}


function start() {
    setupWebAudio();
    setupKeyboard();
    for (let i of inputs) i.addEventListener("change", changeOsc);
    canvasEl.addEventListener("click", startAnimation);
    document.addEventListener("keydown", keydownHandler);
    changeOsc();
}

window.addEventListener("load", start);