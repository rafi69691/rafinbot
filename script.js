let scene, camera, renderer, satellite, dish, beam;

function getSignal() {
    // Directly generate signal without password check
    const tradingPair = document.getElementById('tradingPair').value;
    const signals = ['UP 📈', 'DOWN 📉'];
    const expiries = [
        { label: 'Expires in 30s', time: 30 },
        { label: '1 min', time: 60 },
        { label: '5 min', time: 300 }
    ];

    const randomSignal = signals[Math.floor(Math.random() * signals.length)];
    const randomExpiry = expiries[Math.floor(Math.random() * expiries.length)];

    const signalColor = randomSignal === 'UP 📈' ? 'green' : 'red';

    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <span style="color: red;">${tradingPair}</span>: 
        <span style="color: ${signalColor};">${randomSignal}</span> 
        <span style="color: red;">(${randomExpiry.label})</span>
    `;

    startProgressBar(randomExpiry.time, randomSignal);
}

function startProgressBar(duration, signal) {
    const progressBarContainer = document.getElementById('progress-bar-container');
    const progressBar = document.getElementById('progress-bar');
    const getSignalButton = document.querySelector('button[onclick="getSignal()"]');
    
    // Hide the "Get Signal" button
    getSignalButton.style.visibility = 'hidden';
    
    progressBarContainer.style.display = 'block';

    // Set progress bar color based on signal direction
    progressBar.style.backgroundColor = signal === 'UP 📈' ? 'green' : 'red';
    progressBar.style.width = '100%';

    let timeLeft = duration;
    const interval = setInterval(() => {
        timeLeft--;
        const percentage = (timeLeft / duration) * 100;
        progressBar.style.width = `${percentage}%`;

        if (timeLeft <= 0) {
            clearInterval(interval);
            progressBarContainer.style.display = 'none';

            // Show the "Get Signal" button again
            getSignalButton.style.visibility = 'visible';
        }
    }, 1000);
}

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10); // Adjusted for better lighting
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Earth
    const earthGeometry = new THREE.SphereGeometry(25, 64, 64); // Increased size
    const earthMaterial = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
        bumpScale: 0.05,
        specular: new THREE.Color('grey'),
        shininess: 5
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.rotation.z = -0.41;
    scene.add(earth);

    // Satellite
    createSatellite();

    // Satellite Dish
    createDish();

    // Data beam
    createDataBeam();

    // Adjust camera position to center the scene horizontally
    camera.position.z = 70; // Adjusted to fit the larger scene
    camera.position.x = 0; // Center horizontally
    camera.position.y = 30;

    animate();
}

function createSatellite() {
    const satGroup = new THREE.Group();

    // Main body
    const bodyGeometry = new THREE.BoxGeometry(6, 2, 3); // Increased size
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: 0x3a3a3a,
        metalness: 0.7,
        roughness: 0.5
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;

    // Solar panels
    const panelGeometry = new THREE.BoxGeometry(12, 0.2, 6); // Increased size
    const panelMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a3a5a,
        emissive: 0x1a3a5a,
        emissiveIntensity: 0.2
    });

    const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    leftPanel.position.x = -8;
    const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    rightPanel.position.x = 8;

    // Antenna
    const antennaGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4); // Increased size
    const antenna = new THREE.Mesh(antennaGeometry, bodyMaterial);
    antenna.position.z = 2;

    satGroup.add(body, leftPanel, rightPanel, antenna);
    satGroup.position.set(-30, 20, 0); // Adjusted position
    satellite = satGroup;
    scene.add(satGroup);
}

function createDish() {
    const dishGroup = new THREE.Group();

    // Parabolic reflector
    const dishGeometry = new THREE.ParametricGeometry((u, v, target) => {
        const radius = 10; // Increased size
        const depth = 3; // Increased size
        const angle = u * Math.PI * 2;
        const r = v * radius;
        target.set(
            r * Math.cos(angle),
            r * Math.sin(angle),
            depth * (r * r) / (radius * radius)
        );
    }, 64, 64);

    const dishMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        metalness: 0.8,
        roughness: 0.4
    });

    const dishMesh = new THREE.Mesh(dishGeometry, dishMaterial);
    dishMesh.rotation.x = -Math.PI / 2;
    dishMesh.castShadow = true;

    // Feed horn
    const feedGeometry = new THREE.ConeGeometry(0.6, 3, 16); // Increased size
    const feed = new THREE.Mesh(feedGeometry, dishMaterial);
    feed.position.z = 3;

    dishGroup.add(dishMesh, feed);
    dishGroup.position.set(0, -20, 0); // Adjusted position
    dish = dishGroup;
    scene.add(dishGroup);
}

function createDataBeam() {
    const beamGeometry = new THREE.CylinderGeometry(0.4, 0.4, 60, 64); // Increased size
    const beamMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5
    });
    beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.rotation.x = Math.PI / 2;
    scene.add(beam);
}

function animate() {
    requestAnimationFrame(animate);

    // Satellite orbit
    satellite.position.x = Math.sin(Date.now() * 0.001) * 25;
    satellite.position.z = Math.cos(Date.now() * 0.001) * 25;
    satellite.rotation.y += 0.01;

    // Dish tracking
    const targetPosition = new THREE.Vector3().copy(satellite.position);
    dish.lookAt(targetPosition);

    // Beam animation
    beam.position.copy(satellite.position);
    beam.lookAt(dish.position);
    beam.scale.y = satellite.position.distanceTo(dish.position) / 30;
    beam.material.opacity = 0.3 + Math.sin(Date.now() * 0.01) * 0.1;

    renderer.render(scene, camera);
}

init();
window.addEventListener('resize', () => {
    // Ensure the canvas resizes properly
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});