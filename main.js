let polygonOsc, currentCanvasPath;
let canvasSampleRate = 256, animationIntervalId;
let animationPhase = 0;
let keyboardEl = gE("keyboard"), keyboardContext, keys = 15;
let inputs = [gE("vertices"), gE("interval"), gE("rotation"), gE("rounding")];

class PolygonOsc {
    constructor(vertexList) {
        this.vertexList = vertexList;
        let vertices = this.vertices = vertexList.length;
        this.phasePerLine = 1 / vertices;

        for (let i = 0; i < vertices; i++) {
            let p1 = vertexList[i];
            let p2 = vertexList[(i + 1) % vertices];
            let slope = (p2[1] - p1[1]) / (p2[0] - p1[0]);
            let yIntercept = p1[1] - slope * p1[0];
            let interval = p2[0] - p1[0];//interval は頂点間xの距離
            if (slope > 10000 || slope < -10000) {
                slope = Infinity;
                interval = p2[1] - p1[1];//傾きなしならyの距離
            }
            vertexList[i].push(slope, yIntercept, interval);
        }
    }
    get(hz = 440, sec = 1, rounding = 0, sampleRate = 48000) {
        let output = [], outputWave = [];
        for (let i = 0, phase, phaseInLine, n, v, x, y, l = sec * sampleRate; i < l; i++) {
            phase = i / sampleRate * hz % 1;
            n = Math.floor(phase * this.vertices);
            v = this.vertexList[n];
            phaseInLine = (phase - n * this.phasePerLine) / this.phasePerLine;
            x = v[0] + phaseInLine * v[4];
            y = v[2] * x + v[3];
            if (!isFinite(v[2])) {
                x = v[0];
                y = v[1] + phaseInLine * v[4];
            }

            let d = (x ** 2 + y ** 2) ** (1 / 2);// 中心からの距離
            d = 2 - d;// 一番遠い距離は1で内に行くほど高い数値が出る
            d **= rounding;// e=0なら1, そのままの星
            x *= d;
            y *= d;
            output.push([x, y]);
            outputWave.push(y);
        }
        return { coordinate: output, wave: outputWave };
    }

    round(x, y, rounding) {
        let d = (x ** 2 + y ** 2) ** (1 / 2);
        d = 2 - d;
        d **= rounding;
        return [x * d, y * d];
    }
}

function createVertexList() {
    let vertexList = [];
    let vertices = getValue("vertices");
    let interval = getValue("interval");
    let rotation = getValue("rotation");
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
    let vertexList = createVertexList();
    polygonOsc = new PolygonOsc(vertexList);
    let rounding = getValue("rounding")
    setupCanvas(polygonOsc, rounding);
    setupSound(polygonOsc, rounding);
}

function setupCanvas(polygonOsc, rounding) {
    let sampleRate = canvasSampleRate;
    let path = currentCanvasPath = polygonOsc.get(1, 1, rounding, sampleRate).coordinate;
    drawPolygonCanvas(path, sampleRate);

    animationPhase = 0;
    if (animationIntervalId) clearInterval(animationIntervalId);
    animationIntervalId = setInterval(animate, 1000 / 30);
}
function drawPolygonCanvas(path, sampleRate, animationPhase = 0) {
    background("orange");
    let radius = height / 3;
    let cX = width * 1 / 6, cY = height / 2;
    circle(cX, cY, radius, null, "#fff4");
    for (let i = 0, x, y; i < sampleRate; i++) {
        x = cX + path[i][0] * radius;
        y = cY - path[i][1] * radius;
        circle(x, y, 1)
        if (i == animationPhase) circle(x, y, 3)
    }

    let waveformWidth = 200, waveformX = width * 2 / 6;
    for (let i = 0, y; i < sampleRate; i++) {
        y = cY - path[i][1] * radius;
        circle(waveformX + i / sampleRate * waveformWidth, y, 1)
        if (i == animationPhase) circle(waveformX + i / sampleRate * waveformWidth, y, 3)
    }
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
        x = Math.floor(x)
        line(x, 0, x, height, "grey", ctx);
        if (i % 7 != 0) continue;
        x += width / 30;
        circle(x, height * 3 / 4, height / 15, "orange", null, ctx);
    }
    line(0, 0, width, 0, "grey", ctx);
    line(0, height, width, height, "grey", ctx);

    keyboardEl.addEventListener("click", keyboardHandler);
    keyboardEl.addEventListener("mousemove", getMousePos, false);
}


function start(){
    for (let i of inputs) i.addEventListener("change", changeOsc);
    setupKeyboard();
    changeOsc();
}
window.addEventListener("load",start);