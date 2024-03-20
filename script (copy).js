let video = document.getElementById('video');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let detector;

async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser API navigator.mediaDevices.getUserMedia not available');
    }
    video.width = 600;
    video.height = 500;
    video.srcObject = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
            facingMode: 'user',
            width: video.width,
            height: video.height
        },
    });
    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function loadModel() {
    const model = poseDetection.SupportedModels.MoveNet;
    const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    };
    detector = await poseDetection.createDetector(model, detectorConfig);
}

async function detectPose() {
    const poses = await detector.estimatePoses(video);
    drawPose(poses);
}

function drawPose(poses) {
    if (video.width && video.height) {
        canvas.width = video.width;
        canvas.height = video.height;
        ctx.clearRect(0, 0, video.width, video.height);
        ctx.drawImage(video, 0, 0, video.width, video.height);

        poses.forEach(pose => {
            pose.keypoints.forEach(({x, y, score}) => {
                if (score > 0.5) {
                    ctx.beginPath();
                    ctx.arc(x, y, 5, 0, 2 * Math.PI);
                    ctx.fillStyle = "aqua";
                    ctx.fill();
                }
            });
        });
    }
}

async function run() {
    await loadModel();
    await setupCamera();
    video.play();
    setInterval(detectPose, 100);
}

run().catch(console.error);
