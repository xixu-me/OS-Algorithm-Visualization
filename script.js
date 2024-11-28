let head;
let requests = [];
let currentIndex = 0;
let seekTime = 0;
let direction = 1; // 1 for right, -1 for left
let animationInterval;
let buttons;
let algorithmHistory = {
    fcfs: { seekTime: "-", order: [] },
    sstf: { seekTime: "-", order: [] },
    scan: { seekTime: "-", order: [] },
};

function initialize() {
    head = document.getElementById("head");
    const diskTrack = document.getElementById("diskTrack");
    buttons = document.querySelectorAll("button");
    updateTrackElements(diskTrack);
}

function updateTrackElements(diskTrack) {
    const trackWidth = diskTrack.offsetWidth;
    const initialHead = parseInt(document.getElementById("initialHead").value);
    const requestInput = document.getElementById("requestQueue").value;
    requests = requestInput.split(",").map((x) => parseInt(x.trim()));

    const headPosition = (initialHead / 199) * trackWidth;
    head.style.left = headPosition + "px";

    const existingRequests = document.querySelectorAll(".request");
    existingRequests.forEach((req) => req.remove());

    requests.forEach((pos) => {
        const request = document.createElement("div");
        request.className = "request";
        request.style.left = (pos / 199) * trackWidth + "px";
        diskTrack.appendChild(request);
    });

    seekTime = 0;
    currentIndex = 0;
    direction = 1;
    updateStats(initialHead);
}

function updateStats(position) {
    document.getElementById("seekTime").textContent = seekTime;
    document.getElementById("currentPos").textContent = position;
}

function disableButtons(activeButton = null) {
    buttons.forEach((button) => {
        if (button.textContent === "重置") return;

        button.disabled = true;
        if (activeButton && button === activeButton) {
            button.classList.add("active");
        }
    });
}

function enableButtons() {
    buttons.forEach((button) => {
        button.disabled = false;
        button.classList.remove("active");
    });
}

function startFCFS() {
    reset();
    disableButtons(event.target);
    const diskTrack = document.getElementById("diskTrack");
    let currentPosition = parseInt(
        document.getElementById("initialHead").value
    );
    let currentRequestIndex = 0;
    let visitOrder = [];

    animationInterval = setInterval(() => {
        if (currentRequestIndex >= requests.length) {
            clearInterval(animationInterval);
            enableButtons();
            updateComparisonTable("fcfs", seekTime, visitOrder);
            return;
        }

        const trackWidth = diskTrack.offsetWidth;
        const targetPosition = requests[currentRequestIndex];
        visitOrder.push(targetPosition);
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
    disableButtons(event.target);
    const diskTrack = document.getElementById("diskTrack");
    const trackWidth = diskTrack.offsetWidth;
    const initialHead = parseInt(document.getElementById("initialHead").value);
    let currentPosition = initialHead;
    let remainingRequests = [...requests];
    let visitOrder = [];

    animationInterval = setInterval(() => {
        if (remainingRequests.length === 0) {
            clearInterval(animationInterval);
            enableButtons();
            updateComparisonTable("sstf", seekTime, visitOrder);
            return;
        }

        let closestRequest = remainingRequests.reduce((closest, current) => {
            let closestDistance = Math.abs(closest - currentPosition);
            let currentDistance = Math.abs(current - currentPosition);
            return currentDistance < closestDistance ? current : closest;
        });
        visitOrder.push(closestRequest);
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
    disableButtons(event.target);
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
    let visitOrder = [];

    animationInterval = setInterval(() => {
        if (currentRequestIndex >= scanOrder.length) {
            clearInterval(animationInterval);
            enableButtons();
            updateComparisonTable("scan", seekTime, visitOrder);
            return;
        }

        const targetPosition = scanOrder[currentRequestIndex];
        visitOrder.push(targetPosition);
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
        enableButtons();
    }
    const diskTrack = document.getElementById("diskTrack");
    updateTrackElements(diskTrack);
}

function markRequestAsServed(request) {
    request.classList.add("served");
    request.style.animation = "pulse 0.3s ease";
}

function handleResize() {
    const diskTrack = document.getElementById("diskTrack");
    updateTrackElements(diskTrack);
}

window.onload = function () {
    initialize();
    let resizeTimeout;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleResize, 100);
    });
};

function updateComparisonTable(algorithm, totalSeekTime, order) {
    algorithmHistory[algorithm] = {
        seekTime: totalSeekTime,
        order: order,
    };

    const row = document.getElementById(`${algorithm}Row`);
    row.cells[1].textContent = totalSeekTime;
    row.cells[2].textContent = order.join(" → ");
}

function resetComparisonTable() {
    algorithmHistory = {
        fcfs: { seekTime: "-", order: [] },
        sstf: { seekTime: "-", order: [] },
        scan: { seekTime: "-", order: [] },
    };

    ["fcfs", "sstf", "scan"].forEach((algorithm) => {
        const row = document.getElementById(`${algorithm}Row`);
        row.cells[1].textContent = "-";
        row.cells[2].textContent = "-";
    });
}
