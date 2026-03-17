let cb = async () => {
const video = document.getElementById("video");
const divA = document.getElementById("a");
const divB = document.getElementById("b");
const divOp = document.getElementById("op");
const result = document.getElementById("result");

// Start camera
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
video.srcObject = stream;
await video.play();

// Load model
const model = await ml5.handpose(video);
let predictions = [];
model.on("predict", r => predictions = r);

let A = null;
let B = null;
let operator = null;
let stage = 0;
let isBLocked = false; // 🔥 fix for B locking

// Finger detection
function fingerUp(lm, tip, pip) {
    return lm[tip][1] < lm[pip][1];
}

function countFingers(hand) {
    const lm = hand.landmarks;
    let count = 0;

    if (fingerUp(lm, 8, 6)) count++;
    if (fingerUp(lm, 12, 10)) count++;
    if (fingerUp(lm, 16, 14)) count++;
    if (fingerUp(lm, 20, 18)) count++;

    // Improved thumb detection (works both hands)
    if (Math.abs(lm[4][0] - lm[3][0]) > 20) count++;

    return count;
}

// Main loop
function loop() {
    requestAnimationFrame(loop);

    if (!predictions.length) return;

    const fingers = countFingers(predictions[0]);

    // Update A
    if (stage === 0 && A === null) {
        divA.textContent = fingers;
    }

    // Update B (only if not locked)
    if (stage === 1 && !isBLocked) {
        divB.textContent = fingers;
    }
}

loop();

// Keyboard controls
window.addEventListener("keydown", e => {

    // Lock A
    if (e.code === "Space" && stage === 0) {
        A = parseInt(divA.textContent);
        stage = 1;
    }

    // Choose operator
    if (stage === 1) {
        if (e.key === "+") {
            operator = "+";
            divOp.textContent = "+";
        }
        if (e.key === "-") {
            operator = "-";
            divOp.textContent = "-";
        }
        if (e.key === "*") {
            operator = "*";
            divOp.textContent = "×";
        }
        if (e.key === "/") {
            operator = "/";
            divOp.textContent = "÷";
        }
    }

    // Lock B and calculate
    if (e.code === "Enter" && stage === 1 && operator) {
        B = parseInt(divB.textContent);
        isBLocked = true; // 🔥 stops updating

        let res;

        if (operator === "+") res = A + B;
        if (operator === "-") res = A - B;
        if (operator === "*") res = A * B;
        if (operator === "/") {
            res = B !== 0 ? (A / B).toFixed(2) : "Error";
        }

        result.textContent = res;
    }

    // Reset everything
    if (e.key.toLowerCase() === "r") {
        A = B = null;
        operator = null;
        stage = 0;
        isBLocked = false;

        divA.textContent = "–";
        divB.textContent = "–";
        divOp.textContent = "–";
        result.textContent = "–";
    }
});


};

cb();
