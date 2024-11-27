let head;
let requests = [];
let currentIndex = 0;
let seekTime = 0;
let direction = 1; // 1 for right, -1 for left
let animationInterval;

function initialize() {
    head = document.getElementById("head");
    const diskTrack = document.getElementById("diskTrack");
    const trackWidth = diskTrack.offsetWidth;

    // Clear existing requests
    const existingRequests = document.querySelectorAll(".request");
    existingRequests.forEach((req) => req.remove());

    // Get initial head position and requests
    const initialHead = parseInt(document.getElementById("initialHead").value);
    const requestInput = document.getElementById("requestQueue").value;
    requests = requestInput.split(",").map((x) => parseInt(x.trim()));

    // Set initial head position
    const headPosition = (initialHead / 199) * trackWidth;
    head.style.left = headPosition + "px";

    // Place request points
    requests.forEach((pos) => {
        const request = document.createElement("div");
        request.className = "request";
        request.style.left = (pos / 199) * trackWidth + "px";
        diskTrack.appendChild(request);
    });

    // Reset statistics
    seekTime = 0;
    currentIndex = 0;
    direction = 1;
    updateStats(initialHead);
}

function updateStats(position) {
    document.getElementById("seekTime").textContent = seekTime;
    document.getElementById("currentPos").textContent = position;
}

function startFCFS() {
    reset();
    const diskTrack = document.getElementById("diskTrack");
    const trackWidth = diskTrack.offsetWidth;
    const initialHead = parseInt(document.getElementById("initialHead").value);
    let currentPosition = initialHead;
    let currentRequestIndex = 0;

    animationInterval = setInterval(() => {
        if (currentRequestIndex >= requests.length) {
            clearInterval(animationInterval);
            return;
        }

        const targetPosition = requests[currentRequestIndex];
        const targetPixel = (targetPosition / 199) * trackWidth;

        seekTime += Math.abs(targetPosition - currentPosition);
        currentPosition = targetPosition;

        head.style.left = targetPixel + "px";

        setTimeout(() => {
            const requestElements = document.querySelectorAll(".request");
            requestElements.forEach((req) => {
                const reqPos = Math.round(
                    (parseFloat(req.style.left) / trackWidth) * 199
                );
                if (reqPos === targetPosition) {
                    req.classList.add("served");
                }
            });
        }, 400);

        direction = currentPosition > targetPosition ? -1 : 1;
        updateStats(targetPosition);
        currentRequestIndex++;
    }, 1000);
}

function startSSTF() {
    reset();
    const diskTrack = document.getElementById("diskTrack");
    const trackWidth = diskTrack.offsetWidth;
    const initialHead = parseInt(document.getElementById("initialHead").value);
    let currentPosition = initialHead;
    let remainingRequests = [...requests];

    animationInterval = setInterval(() => {
        if (remainingRequests.length === 0) {
            clearInterval(animationInterval);
            return;
        }

        let closestRequest = remainingRequests.reduce((closest, current) => {
            let closestDistance = Math.abs(closest - currentPosition);
            let currentDistance = Math.abs(current - currentPosition);
            return currentDistance < closestDistance ? current : closest;
        });

        remainingRequests = remainingRequests.filter(
            (req) => req !== closestRequest
        );
        const targetPixel = (closestRequest / 199) * trackWidth;

        seekTime += Math.abs(closestRequest - currentPosition);
        currentPosition = closestRequest;

        head.style.left = targetPixel + "px";

        setTimeout(() => {
            const requests = document.querySelectorAll(".request");
            requests.forEach((req) => {
                const reqPos = Math.round(
                    (parseFloat(req.style.left) / trackWidth) * 199
                );
                if (reqPos === closestRequest) {
                    req.classList.add("served");
                }
            });
        }, 400);

        direction = currentPosition > closestRequest ? -1 : 1;
        updateStats(closestRequest);
    }, 1000);
}

function startSCAN() {
    reset();
    const diskTrack = document.getElementById("diskTrack");
    const trackWidth = diskTrack.offsetWidth;
    const initialHead = parseInt(document.getElementById("initialHead").value);
    const initialDirection = document.getElementById("scanDirection").value;
    let currentPosition = initialHead;

    let sortedRequests = [...requests].sort((a, b) => a - b);
    let headIndex = sortedRequests.findIndex((x) => x >= initialHead);

    if (headIndex === -1) headIndex = sortedRequests.length;

    let scanOrder;
    if (initialDirection === "right") {
        scanOrder = [
            ...sortedRequests.slice(headIndex),
            ...sortedRequests.slice(0, headIndex).reverse(),
        ];
        direction = 1;
    } else {
        scanOrder = [
            ...sortedRequests.slice(0, headIndex).reverse(),
            ...sortedRequests.slice(headIndex),
        ];
        direction = -1;
    }

    let currentRequestIndex = 0;

    animationInterval = setInterval(() => {
        if (currentRequestIndex >= scanOrder.length) {
            clearInterval(animationInterval);
            return;
        }

        const targetPosition = scanOrder[currentRequestIndex];
        const targetPixel = (targetPosition / 199) * trackWidth;

        seekTime += Math.abs(targetPosition - currentPosition);
        currentPosition = targetPosition;

        head.style.left = targetPixel + "px";

        setTimeout(() => {
            const requests = document.querySelectorAll(".request");
            requests.forEach((req) => {
                const reqPos = Math.round(
                    (parseFloat(req.style.left) / trackWidth) * 199
                );
                if (reqPos === targetPosition) {
                    req.classList.add("served");
                }
            });
        }, 400);

        updateStats(targetPosition);
        currentRequestIndex++;
    }, 1000);
}

function reset() {
    if (animationInterval) {
        clearInterval(animationInterval);
    }
    initialize();
}

function markRequestAsServed(request) {
    request.classList.add("served");
    request.style.animation = "pulse 0.3s ease";
}

// Initialize on load
window.onload = initialize;
