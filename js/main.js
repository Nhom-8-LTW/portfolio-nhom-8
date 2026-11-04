const members = [
  {
    name: "Mai Như Ý",
    zone: "Đầm lầy TikTok",
    img: "images/avatar1.jpg",
    icon: "📱",
    summary: "Sống sót qua Đầm lầy TikTok, vừa lướt vừa làm, vừa trend vừa kịp tiến độ nhóm",
    link: "https://ymn8611.github.io/portfolio/",
  },
  {
    name: "Phạm Đức Tiến",
    zone: "Đỉnh núi “Mai làm”",
    img: "images/avatar2.jpg",
    icon: "🏔️",
    summary: "Leo lên Đỉnh núi “Mai làm” để ngắm deadline từ trên cao, vẫn kịp nộp bài trước giờ G",
    link: "https://ptien1317-sys.github.io",
  },
  {
    name: "Trần Thị Ánh Tuyết",
    zone: "Rừng Group Chat",
    img: "images/tv3.jpg",
    icon: "💬",
    summary: "Lạc trong Rừng Group Chat, tin nhắn thì ngập mà deadline vẫn phải kịp.",
    link: "https://tuyettta3787-boop.github.io/portfolio-Anh-Tuyet/",
  },
  {
    name: "Trần Phạm Tường Vi",
    zone: "Thung lũng Cà phê",
    img: "images/avatar4.jpg",
    icon: "☕",
    summary: "Sống chậm ở Thung lũng Cà phê, sống gấp với deadline.",
    link: "https://vitpt-bubbles.github.io/Portfolio-c-nh-n/",
  },
  {
    name:"Phan Điền Nhật Tiến",
    zone: "Vực thẳm Hoảng Loạn",
    img: "images/avatar5.jpg",
    icon: "🌋",
    summary: "Vực thẳm sâu mấy cũng qua, deadline sát nút mới làm ta giật mình.",
    link: "https://tienpdn3922-lgtm.github.io/portfolio-cv-/",
  },
  {
    name: "Lâm Trần Minh Thư",
    zone: "Đảo Nộp Bài",
    img: "images/avatar6.jpg",
    icon: "🏝️",
    summary: "Thoát Vực Thẳm, cập Đảo thành công: Còn thở là còn nộp!",
    link: "https://lamtranminhthu.github.io/MyPortfolio/",
  },
];
const select = (selector) => document.querySelector(selector);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (from, to, t) => from + (to - from) * t;

const worldEl = select("#world");
const dialogEl = select("#dlg");
const statusEl = select("#status");

if (!window.THREE) {
  statusEl.textContent = "Không tải được Three.js, hãy kiểm tra mạng.";
  throw new Error("no three");
}
let seed = 20261103;
function random() {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function randomRange(min, max) {
  return min + random() * (max - min);
}
function randomPointInRing(center, minRadius, maxRadius) {
  const angle = randomRange(0, 6.283);
  const distance = Math.sqrt(randomRange(minRadius * minRadius, maxRadius * maxRadius));
  return [
    center[0] + Math.cos(angle) * distance,
    center[1] + Math.sin(angle) * distance,
  ];
}
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
worldEl.prepend(renderer.domElement);
const canvas = renderer.domElement;

const scene = new THREE.Scene();
const SKY_NORMAL = new THREE.Color(0xbfe3f2);
const SKY_PANIC = new THREE.Color(0xc4584a);
scene.background = SKY_NORMAL.clone();
scene.fog = new THREE.Fog(0xbfe3f2, 140, 480);

const camera = new THREE.PerspectiveCamera(50, 1, 2, 900);

scene.add(new THREE.HemisphereLight(0xffffff, 0x6b8f5a, 0.85));

const sun = new THREE.DirectionalLight(0xfff1cf, 1.1);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, {
  left: -75,
  right: 75,
  top: 75,
  bottom: -75,
  near: 1,
  far: 260,
});
sun.shadow.bias = -0.0006;
sun.shadow.normalBias = 0.3;
scene.add(sun, sun.target);

const materialCache = {};
function getMaterial(color, options) {
  if (options) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.9,
      flatShading: true,
      ...options,
    });
  }
  if (!materialCache[color]) {
    materialCache[color] = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.9,
      flatShading: true,
    });
  }
  return materialCache[color];
}
const boxGeo = new THREE.BoxGeometry(1, 1, 1);
const cylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 8);
const coneGeo = new THREE.ConeGeometry(1, 1, 7);
const sphereGeo = new THREE.SphereGeometry(1, 14, 10);

function addMesh(geometry, material, x = 0, y = 0, z = 0, parent = scene) {
  const mesh = new THREE.Mesh(
    geometry,
    typeof material === "number" ? getMaterial(material) : material
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addScaledMesh(geometry, material, sx, sy, sz, x, y, z, parent) {
  const mesh = addMesh(geometry, material, x, y, z, parent);
  mesh.scale.set(sx, sy, sz);
  return mesh;
}

function addDisc(x, z, radius, colorOrMaterial, y = 0.03, scaleX = 1, scaleZ = 1) {
  const material =
    typeof colorOrMaterial === "number"
      ? getMaterial(colorOrMaterial, {
          flatShading: false,
          polygonOffset: true,
          polygonOffsetFactor: -1,
          polygonOffsetUnits: -1,
        })
      : colorOrMaterial;
  const disc = new THREE.Mesh(new THREE.CircleGeometry(radius, 40), material);
  disc.rotation.x = -Math.PI / 2;
  disc.position.set(x, y > 0 ? y * 5 : y, z);
  disc.scale.set(scaleX, scaleZ, 1);
  disc.receiveShadow = true;
  scene.add(disc);
  return disc;
}


const animations = []; 
const pulsers = []; 
function addBobbing(object, baseY, offset = 0, amplitude = 0.6) {
  animations.push((time) => {
    object.position.y = baseY + Math.sin(time * 2 + offset) * amplitude;
  });
}
/*6 KHU VỰC*/
const ZONES = [
  { center: [-60, -40], stop: [-60, -40], radius: 34 }, // 1. Đầm lầy TikTok
  { center: [0, -68], stop: [0, -47], radius: 42 }, // 2. Đỉnh núi "Mai làm"
  { center: [-62, 32], stop: [-62, 32], radius: 34 }, // 3. Rừng Group Chat
  { center: [-8, 40], stop: [-8, 40], radius: 30 }, // 4. Thung lũng Cà phê
  { center: [50, 0], stop: [50, 0], radius: 26 }, // 5. Vực thẳm Hoảng Loạn
  { center: [150, 0], stop: [150, 5], radius: 28 }, // 6. Đảo Nộp Bài
];

function isInsideZone(x, z, margin = 0) {
  return ZONES.some(
    (zone, index) =>
      index < 5 && Math.hypot(x - zone.center[0], z - zone.center[1]) < zone.radius + margin
  );
}

// Chỗ trống để trồng cây/bụi trang trí
function isFreeForDecoration(x, z) {
  return (
    Math.hypot(x, z) < 108 &&
    !isInsideZone(x, z, 3) &&
    !(Math.abs(z) < 14 && x > 18)
  );
}

function groundHeight(x, z) {
  let height = 0;
  if (Math.abs(z) < 2.7 && x > 22 && x < 78) height = 0.7; // cầu 1
  if (Math.abs(z) < 2.7 && x > 106 && x < 130) height = 0.3; // cầu 2
  return height;
}

function makeLabelSprite(lines, width, background = "#f3e2b7") {
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = lines.length > 1 ? 200 : 128;
  const ctx = cv.getContext("2d");

  ctx.fillStyle = background;
  ctx.strokeStyle = "#3a2210";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(8, 8, 496, cv.height - 16, 30);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  lines.forEach(([text, font, color, y]) => {
    // Thu nhỏ chữ dần cho vừa khung
    let fontSize = +font.match(/(\d+)px/)[1];
    ctx.font = font;
    while (ctx.measureText(text).width > 470 && fontSize > 12) {
      fontSize -= 2;
      ctx.font = font.replace(/\d+px/, fontSize + "px");
    }
    ctx.fillStyle = color;
    ctx.fillText(text, 256, y);
  });

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), fog: false })
  );
  sprite.scale.set(width, (width * cv.height) / 512, 1);
  return sprite;
}

function addSpeechBubble(text, x, y, z, width = 12, background = "#fff", parent = scene) {
  const sprite = makeLabelSprite(
    [[text, "700 44px 'Segoe UI',Tahoma,Arial,sans-serif", "#25150a", 64]],
    width * 1.35,
    background
  );
  sprite.position.set(x, y, z);
  parent.add(sprite);
  return sprite;
}
/*Biển, đảo, mây*/
function buildSeaAndIslands() {
  // Mặt biển
  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(1600, 1600),
    new THREE.MeshStandardMaterial({
      color: 0x2f8fc0,
      roughness: 0.25,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92,
    })
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -1.2;
  sea.receiveShadow = true;
  scene.add(sea);
  // Khối đất của đảo 
  const addLandMass = (x, radius, topColor, sideColor) =>
    addMesh(
      new THREE.CylinderGeometry(radius, radius + 5, 4, 56),
      [getMaterial(sideColor), getMaterial(topColor, { flatShading: false }), getMaterial(sideColor)],
      x,
      -2,
      0
    );

  addLandMass(0, 115, 0x8fc066, 0xd9bf85); // đảo chính
  addLandMass(150, 26, 0xeed79c, 0xd9bf85); // đảo nộp bài
  // Vùng nước nông quanh đảo nộp bài
  addDisc(
    150,
    0,
    36,
    new THREE.MeshBasicMaterial({ color: 0x7fe3e0, transparent: true, opacity: 0.4 }),
    -1.15
  );
  // Vòng bọt sóng quanh hai đảo
  [[0, 115], [150, 26]].forEach(([x, radius]) => {
    const foam = new THREE.Mesh(
      new THREE.RingGeometry(radius + 0.6, radius + 4, 64),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      })
    );
    foam.rotation.x = -Math.PI / 2;
    foam.position.set(x, -1.1, 0);
    scene.add(foam);

    animations.push((time) => {
      foam.material.opacity = 0.35 + 0.25 * Math.sin(time * 1.6 + x);
      foam.scale.setScalar(1 + 0.01 * Math.sin(time + x));
    });
  });
}

function buildClouds() {
  for (let i = 0; i < 12; i++) {
    const cloud = new THREE.Group();
    cloud.position.set(randomRange(-260, 260), randomRange(75, 120), randomRange(-260, 260));
    for (let j = 0; j < 4; j++) {
      const puff = addScaledMesh(
        sphereGeo,
        getMaterial(0xffffff, { flatShading: false, emissive: 0xffffff, emissiveIntensity: 0.45 }),
        randomRange(9, 16),
        randomRange(5, 8),
        randomRange(8, 12),
        j * 11 - 16,
        randomRange(-2, 2),
        randomRange(-4, 4),
        cloud
      );
      puff.castShadow = false;
    }
    scene.add(cloud);
    // Mây trôi sang phải, hết bản đồ thì quay lại bên trái
    animations.push((time, dt) => {
      cloud.position.x += dt * 1.5;
      if (cloud.position.x > 300) cloud.position.x = -300;
    });
  }
}
/*CHẶNG 1-ĐẦM LẦY TIKTOK*/
function buildTikTokSwamp() {
  const center = ZONES[0].center;
  // Nền đầm lầy
  addDisc(center[0], center[1], 34, 0x56784a);
  addDisc(center[0], center[1], 25, 0x4a6a3c, 0.04);
  // Các vũng bùn; 3 vũng đầu có điện thoại cắm xuống
  for (let k = 0; k < 6; k++) {
    const angle = k * 1.05 + 0.4;
    const distance = randomRange(14, 25);
    const x = center[0] + Math.cos(angle) * distance;
    const z = center[1] + Math.sin(angle) * distance;
    const radiusX = randomRange(5, 8);
    const radiusZ = randomRange(3, 5);
    addDisc(x, z, 1, 0x4a3a22, 0.05, radiusX + 1, radiusZ + 1); // viền bùn
    addDisc(x, z, 1, 0x2f4f3b, 0.06, radiusX, radiusZ); // nước đầm
    if (k < 3) {
      const phone = addScaledMesh(
        boxGeo,
        getMaterial(0x15151c, {
          emissive: k % 2 ? 0xfe2c55 : 0x25f4ee, // hồng / xanh TikTok
          emissiveIntensity: 1,
        }),
        1.6,
        3,
        0.3,
        x,
        1.6,
        z
      );
      phone.rotation.set(randomRange(-0.3, 0.3), randomRange(0, 6), randomRange(-0.3, 0.3));
      pulsers.push([phone.material, k]);
    }
  }
  // Lau sậy
  for (let i = 0; i < 50; i++) {
    const [x, z] = randomPointInRing(center, 9, 32);
    for (let j = 0; j < 3; j++) {
      const height = randomRange(3, 5);
      addScaledMesh(cylinderGeo, 0x6b7a3a, 0.07, height, 0.07, x + j * 0.4, height / 2, z + j * 0.2);
    }
    addScaledMesh(cylinderGeo, 0x5a3a1a, 0.25, 1, 0.25, x + 0.4, 4.2, z + 0.2); // bông lau
  }
  // Cây chết
  for (let i = 0; i < 8; i++) {
    const [x, z] = randomPointInRing(center, 10, 31);
    const height = randomRange(5, 9);
    addScaledMesh(cylinderGeo, 0x3a2c20, 0.5, height, 0.5, x, height / 2, z);
    const branchRight = addScaledMesh(cylinderGeo, 0x3a2c20, 0.22, 4, 0.22, x + 1.2, height * 0.75, z);
    branchRight.rotation.z = -0.9;
    const branchLeft = addScaledMesh(cylinderGeo, 0x3a2c20, 0.22, 3, 0.22, x - 1, height * 0.6, z);
    branchLeft.rotation.z = 0.9;
  }
  // Sương mù bồng bềnh
  for (let i = 0; i < 6; i++) {
    const [x, z] = randomPointInRing(center, 0, 28);
    const mist = addScaledMesh(
      sphereGeo,
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, depthWrite: false }),
      randomRange(10, 16),
      1.3,
      randomRange(6, 9),
      x,
      2,
      z
    );
    mist.castShadow = false;
    animations.push((time) => {
      mist.position.x = x + Math.sin(time * 0.3 + i) * 6;
    });
  }
  const clock = new THREE.Group();
  clock.position.set(center[0] + 20, 4.5, center[1] - 14);
  clock.rotation.set(-0.3, -0.6, 0.25);
  scene.add(clock);
  addScaledMesh(cylinderGeo, 0xf4ead2, 4.5, 0.8, 4.5, 0, 0, 0, clock).rotation.x = Math.PI / 2;
  addMesh(new THREE.TorusGeometry(4.5, 0.4, 8, 24), getMaterial(0xfe2c55), 0, 0, 0, clock);
  const addClockHand = (length, color, width) => {
    const pivot = new THREE.Group();
    pivot.position.z = 0.6;
    clock.add(pivot);
    addScaledMesh(boxGeo, color, width, length, 0.2, 0, length / 2 - 0.4, 0, pivot);
    return pivot;
  };
  const minuteHand = addClockHand(3.6, 0x25150a, 0.25);
  const hourHand = addClockHand(2.4, 0xc0392b, 0.35);
  animations.push((time, dt) => {
    minuteHand.rotation.z -= dt * 9;
    hourHand.rotation.z -= dt * 0.75;
  });

  addSpeechBubble("5 phút thôi mà…", clock.position.x, 13, clock.position.z, 13, "#d8f7f5");
  ["Lướt 5 phút thôi", "Thêm 1 video nữa", "Ơ… 3 giờ sáng rồi?", "Hết ngày rồi sao?"].forEach(
    (text, i) => {
      const [x, z] = randomPointInRing(center, 10, 26);
      const y = randomRange(9, 14);
      const bubble = addSpeechBubble(text, x, y, z, 12, i % 2 ? "#ffd6e0" : "#d8f7f5");
      addBobbing(bubble, y, i);
    }
  );
  // Trái tim bay lên
  const heartCanvas = document.createElement("canvas");
  heartCanvas.width = heartCanvas.height = 64;
  const heartCtx = heartCanvas.getContext("2d");
  heartCtx.font = "46px serif";
  heartCtx.textAlign = "center";
  heartCtx.textBaseline = "middle";
  heartCtx.fillText("❤️", 32, 36);
  const heartTexture = new THREE.CanvasTexture(heartCanvas);
  for (let i = 0; i < 14; i++) {
    const heart = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: heartTexture, transparent: true, fog: false })
    );
    const [x, z] = randomPointInRing(center, 8, 28);
    const offset = randomRange(0, 8);
    heart.scale.set(2.4, 2.4, 1);
    scene.add(heart);

    animations.push((time) => {
      const progress = ((time * 1.6 + offset) % 8) / 8; // 0 → 1
      heart.position.set(x + Math.sin(progress * 8 + i) * 1.5, 3 + progress * 12, z);
      heart.material.opacity = 1 - progress;
    });
  }
}

/*CHẶNG 2-NGỌN NÚI*/
// Một ngọn núi hình nón; núi cao có thêm chóp tuyết
function addPeak(x, z, radius, height) {
  const mountain = addScaledMesh(coneGeo, 0x8c7b66, radius, height, radius, x, height / 2, z);
  mountain.rotation.y = randomRange(0, 3);

  if (height > 20) {
    const snowHeight = height * 0.46 + 0.2;
    const snowCap = addScaledMesh(
      coneGeo,
      0xf4f8fb,
      radius * 0.48,
      snowHeight,
      radius * 0.48,
      x,
      height - snowHeight / 2 + 0.2,
      z
    );
    snowCap.rotation.y = mountain.rotation.y;
  }
}
function buildMountain() {
  addDisc(0, -62, 42, 0x9b8f7e);
  addDisc(0, -47, 9, 0xf2f6fa, 0.05); // bãi tuyết chân núi
  addPeak(0, -72, 26, 54); // đỉnh chính
  // Các ngọn núi nhỏ xung quanh (tránh đè lên đỉnh chính và bãi tuyết)
  for (let i = 0; i < 18; i++) {
    const x = randomRange(-62, 62);
    const z = randomRange(-104, -54);
    if (Math.hypot(x, z) < 108 && Math.hypot(x, z + 47) > 14 && Math.hypot(x, z + 72) > 24) {
      addPeak(x, z, randomRange(7, 15), randomRange(14, 34));
    }
  }
  // Cột cờ trên đỉnh
  addScaledMesh(cylinderGeo, 0x2e2014, 0.2, 9, 0.2, 0, 58.5, -72);
  const flag = addScaledMesh(boxGeo, 0xc0392b, 5, 3, 0.2, 2.6, 61.5, -72);
  animations.push((time) => {
    flag.rotation.y = Math.sin(time * 3) * 0.25;
  });
  // Giường ngủ của người "để mai làm"
  const bedX = -13;
  const bedZ = -43;
  addScaledMesh(boxGeo, 0x8a5a30, 4, 0.6, 7, bedX, 0.3, bedZ); // khung giường
  addScaledMesh(boxGeo, 0xf3e7c6, 3.6, 0.5, 6.6, bedX, 0.85, bedZ); // nệm
  addScaledMesh(boxGeo, 0x5b4a8a, 3.7, 0.4, 4, bedX, 1.2, bedZ + 1); // chăn
  addScaledMesh(boxGeo, 0xffffff, 2.4, 0.4, 1.4, bedX, 1.3, bedZ - 2.6); // gối
  addScaledMesh(sphereGeo, 0xf0c8a0, 0.8, 0.8, 0.8, bedX, 1.8, bedZ - 2.4); // đầu

  ["Zzz…", "Mai làm…", "Zzz…"].forEach((text, i) => {
    const bubble = addSpeechBubble(text, bedX + i * 1.5, 7 + i * 2.5, bedZ, 7 + i, "#e8e6ff");
    addBobbing(bubble, 7 + i * 2.5, i);
  });
  // Bậc thang leo lên núi
  for (let k = 0; k < 8; k++) {
    const height = 0.8 * (k + 1);
    addScaledMesh(boxGeo, 0x9b8f7e, 4, height, 3, 11 + k * 0.7, height / 2, -50 - k * 2.6);
  }
  addSpeechBubble("Bậc thang…mai leo tiếp", 17, 11, -66, 14);
  // Biển chỉ đường
  const signGroup = new THREE.Group();
  addScaledMesh(cylinderGeo, 0x5a3a1a, 0.25, 7, 0.25, 8, 3.5, -40, signGroup);
  scene.add(signGroup);
  addSpeechBubble("Hôm nay? Mai làm!", 8, 9, -40, 13, "#fff1c6");
  addSpeechBubble("MAI LÀM", 0, 63, -72, 22, "#ffe08a");
  // Tuyết rơi
  const SNOW_COUNT = 800;
  const positions = new Float32Array(SNOW_COUNT * 3);
  const speeds = [];
  for (let i = 0; i < SNOW_COUNT; i++) {
    positions.set([randomRange(-70, 70), randomRange(0, 80), randomRange(-112, -28)], i * 3);
    speeds.push(randomRange(3, 7));
  }
  const snowGeometry = new THREE.BufferGeometry();
  snowGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const snow = new THREE.Points(
    snowGeometry,
    new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    })
  );
  snow.frustumCulled = false;
  scene.add(snow);

  animations.push((time, dt) => {
    for (let i = 0; i < SNOW_COUNT; i++) {
      let y = positions[i * 3 + 1] - speeds[i] * dt;
      positions[i * 3] += Math.sin(time * 0.8 + i) * dt * 1.5; // gió lay nhẹ
      if (y < 0) y = 80; // rơi chạm đất thì quay lên trời
      positions[i * 3 + 1] = y;
    }
    snowGeometry.attributes.position.needsUpdate = true;
  });
}

/* CÂY THÔNG */
const pineMaterials = [getMaterial(0x2f6b3a), getMaterial(0x3a7d44), getMaterial(0x275a33)];
// Cây thông gồm thân + 3 tầng tán; k là hệ số kích thước
function addPine(x, z, k, leafMaterial) {
  addScaledMesh(cylinderGeo, 0x5a3a1e, 0.6 * k, 3 * k, 0.6 * k, x, 1.5 * k, z);
  for (let j = 0; j < 3; j++) {
    const radius = (4.2 - j * 1.1) * k;
    const height = (6 - j) * k;
    addScaledMesh(coneGeo, leafMaterial, radius, height, radius, x, (2.2 + j * 3) * k + height / 2, z);
  }
}
/* CHẶNG 3-RỪNG GROUP CHAT*/
function buildGroupChatForest() {
  const center = ZONES[2].center;
  addDisc(center[0], center[1], 34, 0x3c7a3c);
  addDisc(center[0], center[1], 9, 0x6fa354, 0.04); // bãi cỏ giữa rừng
  // Cây nhiều màu như các "tin nhắn" trong group
  const leafMaterials = [
    0x2f6b3a, 0x3a7d44, 0x5aa04a, 0xe0a030, 0xd9622b, 0xc0392b, 0x8e5bb5, 0xe58ab4, 0x2fa59a,
  ].map((color) => getMaterial(color));
  for (let i = 0; i < 95; i++) {
    const [x, z] = randomPointInRing(center, 10, 33);
    addPine(x, z, randomRange(0.8, 1.4), leafMaterials[(random() * leafMaterials.length) | 0]);
  }
  // Tin nhắn lơ lửng trên tán cây
  ["...", "Ai làm slide?", "Seen 23:59", "Mai nộp rồi!", "Deadline???", "@all", "Họp gấp!", "😭", "ok"].forEach(
    (text, i) => {
      const sprite = makeLabelSprite([[text, "700 54px 'Segoe UI',Tahoma,Arial,sans-serif", "#25150a", 64]], 15, "#fff");
      const [x, z] = randomPointInRing(center, 12, 30);
      const y = randomRange(15, 24);
      sprite.position.set(x, y, z);
      scene.add(sprite);
      animations.push((time) => {
        sprite.position.y = y + Math.sin(time * 2 + i) * 0.8;
      });
    }
  );
}
/* CHẶNG 4-THUNG LŨNG CÀ PHÊ */
const SKIN_COLORS = [0xf0c8a0, 0xe0b48a, 0xc99a72, 0xb98560];
// Người ngồi quanh bàn cà phê
function addSeatedPerson(x, z, shirtColor, index) {
  addScaledMesh(cylinderGeo, shirtColor, 0.55, 1.3, 0.55, x, 1.95, z);
  addScaledMesh(sphereGeo, SKIN_COLORS[index % 4], 0.5, 0.5, 0.5, x, 3, z);
}
function buildCafeValley() {
  const center = ZONES[3].center;
  const shopColors = [0xd98b5f, 0x7fa8c9, 0xc9b458, 0xa57fc9];
  const umbrellaColors = [0xc0392b, 0x2f7d9c, 0xd4a73a, 0x5b8a4a];
  addDisc(center[0], center[1], 30, 0xdcc08c);
  addDisc(center[0], center[1], 9, 0xc9a66b, 0.04);
  // 4 quán cà phê xếp theo vòng cung, quay mặt vào giữa
  ["Cà phê Deadline", "Trà đá Mai Làm", "Cafe Chém Gió", "Tiệm Bạn Thân"].forEach((name, k) => {
    const angle = 0.5 + k * 1.45;
    const shop = new THREE.Group();
    shop.position.set(center[0] + Math.cos(angle) * 22, 0, center[1] + Math.sin(angle) * 22);
    shop.rotation.y = Math.atan2(-Math.cos(angle), -Math.sin(angle));
    scene.add(shop);
    addScaledMesh(boxGeo, shopColors[k], 9, 5, 6, 0, 2.5, 0, shop); // thân quán
    addScaledMesh(boxGeo, 0x7a3a22, 10, 0.6, 7, 0, 5.3, 0, shop); // mái
    // Mái hiên sọc đỏ trắng
    for (let i = 0; i < 5; i++) {
      addScaledMesh(
        boxGeo,
        i % 2 ? 0xffffff : 0xc0392b,
        1.8,
        0.25,
        2.6,
        -3.6 + i * 1.8,
        3.9,
        4.2,
        shop
      ).rotation.x = 0.3;
    }
    addScaledMesh(boxGeo, 0x3a2210, 1.6, 2.6, 0.2, 0, 1.3, 3.05, shop); // cửa ra vào
    // Hai cửa sổ sáng đèn
    [-2.8, 2.8].forEach((windowX) =>
      addScaledMesh(
        boxGeo,
        getMaterial(0xffe3a0, { emissive: 0xffc860, emissiveIntensity: 0.7 }),
        1.6,
        1.4,
        0.2,
        windowX,
        2.6,
        3.05,
        shop
      )
    );
    addSpeechBubble(name, 0, 9, 0, 13, "#fff1c6", shop); // biển hiệu
  });
  // 4 bộ bàn ghế có dù và người ngồi
  const chatLines = ["Rảnh ko? Đi cà phê!", "Deadline hả? Mai tính!", "Cho ly bạc xỉu", "Kể bạn nghe chuyện này…"];
  for (let k = 0; k < 4; k++) {
    const angle = 1.2 + k * 1.57;
    const x = center[0] + Math.cos(angle) * 13;
    const z = center[1] + Math.sin(angle) * 13;
    addScaledMesh(cylinderGeo, 0x7a4a22, 1.6, 0.2, 1.6, x, 1.7, z); // mặt bàn
    addScaledMesh(cylinderGeo, 0x5a3a1a, 0.25, 1.6, 0.25, x, 0.8, z); // chân bàn
    addScaledMesh(cylinderGeo, 0x5a3a1a, 0.12, 4, 0.12, x, 3.4, z); // cán dù
    addScaledMesh(coneGeo, umbrellaColors[k], 3.4, 1.1, 3.4, x, 5.5, z); // mặt dù
    // 4 ghế quanh bàn, 3 ghế có người ngồi
    [[2.3, 0], [-2.3, 0], [0, 2.3], [0, -2.3]].forEach(([offsetX, offsetZ], j) => {
      addScaledMesh(boxGeo, 0x8a5a30, 0.9, 0.15, 0.9, x + offsetX, 1.1, z + offsetZ);
      addScaledMesh(cylinderGeo, 0x5a3a1a, 0.1, 1.1, 0.1, x + offsetX, 0.55, z + offsetZ);
      if (j < 3) {
        addSeatedPerson(x + offsetX * 0.85, z + offsetZ * 0.85, shopColors[(k + j) % 4], k + j);
      }
    });
    addScaledMesh(cylinderGeo, 0xf4ead2, 0.3, 0.45, 0.3, x + 0.5, 2, z + 0.3); // ly cà phê
    const bubble = addSpeechBubble(chatLines[k], x, 8.8, z, 13);
    animations.push((time) => {
      bubble.position.y = 8.8 + Math.sin(time * 2 + k) * 0.5;
    });
  }
  // Cốc cà phê khổng lồ có khói bốc lên
  const cupX = 12;
  const cupZ = 28;
  addMesh(
    new THREE.CylinderGeometry(5, 3.6, 7, 24),
    getMaterial(0xf4ead2, { flatShading: false }),
    cupX,
    3.5,
    cupZ
  );
  addScaledMesh(cylinderGeo, 0x5a3416, 4.4, 0.1, 4.4, cupX, 7.1, cupZ); // mặt cà phê
  addMesh(new THREE.TorusGeometry(2.2, 0.55, 8, 16), getMaterial(0xf4ead2), cupX + 5.3, 3.8, cupZ); // quai cốc

  for (let i = 0; i < 4; i++) {
    const steam = addScaledMesh(
      sphereGeo,
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, depthWrite: false }),
      1.2,
      1.2,
      1.2,
      cupX,
      8,
      cupZ
    );
    steam.castShadow = false;

    animations.push((time) => {
      const progress = (time * 0.5 + i / 4) % 1; // 0 → 1 rồi lặp lại
      steam.position.set(cupX + Math.sin(progress * 9) * 0.8, 8 + progress * 9, cupZ);
      steam.material.opacity = 0.45 * (1 - progress);
      steam.scale.setScalar(1 + progress * 1.6);
    });
  }
}
/*CHẶNG 5-VỰC THẲM HOẢNG LOẠN */
let lavaMaterial; 
function buildPanicAbyss() {
  const center = ZONES[4].center;
  addDisc(center[0], center[1], 30, 0x4a3b34);
  // Hố dung nham 
  lavaMaterial = new THREE.MeshStandardMaterial({
    color: 0xff5a1a,
    emissive: 0xff4a10,
    emissiveIntensity: 1.2,
    flatShading: false,
  });
  addDisc(center[0], center[1], 1, 0x2b1a12, 0.05, 23, 13.5);
  addDisc(center[0], center[1], 1, lavaMaterial, 0.08, 20, 11);
  const lavaLight = new THREE.PointLight(0xff5a20, 1.6, 80);
  lavaLight.position.set(center[0], 7, center[1]);
  scene.add(lavaLight);
  // Cầu gỗ bắc ngang hố dung nham 
  for (let x = 22; x <= 78; x += 1.6) {
    addScaledMesh(boxGeo, 0x8a5a30, 1.3, 0.25, 5.4, x, 0.55, 0); // ván cầu
  }
  [-2.6, 2.6].forEach((z) => addScaledMesh(boxGeo, 0x3a2210, 58, 0.25, 0.25, 50, 1.5, z)); // tay vịn
  for (let x = 22; x <= 78; x += 8) {
    [-2.6, 2.6].forEach((z) => addScaledMesh(boxGeo, 0x3a2210, 0.35, 1.4, 0.35, x, 0.8, z)); // cột
  }
  // Đá núi lửa xung quanh 
  for (let i = 0; i < 16; i++) {
    const angle = randomRange(0, 6.283);
    const distance = randomRange(26, 40);
    const x = center[0] + Math.cos(angle) * distance;
    const z = center[1] + Math.sin(angle) * distance * 0.8;
    if (Math.abs(z) > 7) {
      const height = randomRange(5, 14);
      const radius = randomRange(2.5, 6);
      addScaledMesh(coneGeo, 0x3a2e2a, radius, height, radius, x, height / 2, z).rotation.y =
        randomRange(0, 3);
    }
  }
  // Tia lửa bay lên từ dung nham
  const SPARK_COUNT = 80;
  const positions = new Float32Array(SPARK_COUNT * 3);
  const velocities = [];
  for (let i = 0; i < SPARK_COUNT; i++) {
    positions.set(
      [center[0] + randomRange(-18, 18), randomRange(0, 14), center[1] + randomRange(-9, 9)],
      i * 3
    );
    velocities.push(randomRange(2, 6));
  }
  const sparkGeometry = new THREE.BufferGeometry();
  sparkGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  scene.add(
    new THREE.Points(
      sparkGeometry,
      new THREE.PointsMaterial({ color: 0xffb347, size: 1.4, transparent: true, depthWrite: false })
    )
  );
  animations.push((time, dt) => {
    for (let i = 0; i < SPARK_COUNT; i++) {
      positions[i * 3 + 1] += velocities[i] * dt;
      if (positions[i * 3 + 1] > 16) {
        positions[i * 3 + 1] = 0; // bay quá cao thì quay về mặt dung nham
        positions[i * 3] = center[0] + randomRange(-18, 18);
      }
    }
    sparkGeometry.attributes.position.needsUpdate = true;
  });
  buildCountdownClock();
  buildAlarmClocksAndPapers();
}
// Đồng hồ đếm ngược lơ lửng phía trên cầu
function buildCountdownClock() {
  const clockCanvas = document.createElement("canvas");
  clockCanvas.width = 512;
  clockCanvas.height = 160;
  const ctx = clockCanvas.getContext("2d");
  const texture = new THREE.CanvasTexture(clockCanvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, fog: false }));
  sprite.scale.set(20, 6.25, 1);
  sprite.position.set(50, 27, 0);
  scene.add(sprite);
  let lastFrame = -1;
  const pad = (n) => String(n).padStart(2, "0");
  animations.push((time) => {
    // Chỉ vẽ lại 10 lần/giây cho nhẹ
    const frame = Math.floor(time * 10);
    if (frame === lastFrame) return;
    lastFrame = frame;
    // Đếm ngược từ 2 tiếng (7200 giây), chạy nhanh gấp 4.5 lần và lặp lại
    const remainingSeconds = 7200 - ((frame * 4.5) | 0) % 7200;
    ctx.fillStyle = "#1a0a0a";
    ctx.strokeStyle = "#ff3b2f";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 144, 24);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font = "700 28px 'Segoe UI',Tahoma,Arial,sans-serif";
    ctx.fillText("CÒN LẠI TRƯỚC DEADLINE", 256, 40);

    ctx.fillStyle = frame % 2 ? "#ff3b2f" : "#ff9a8a"; // nhấp nháy
    ctx.font = "700 80px 'Segoe UI',Tahoma,Arial,sans-serif";
    const hours = (remainingSeconds / 3600) | 0;
    const minutes = ((remainingSeconds % 3600) / 60) | 0;
    const seconds = remainingSeconds % 60;
    ctx.fillText(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`, 256, 112);
    texture.needsUpdate = true;
  });
}
// Đồng hồ báo thức nhảy loạn + giấy tờ bay + bóng thoại hoảng loạn
function buildAlarmClocksAndPapers() {
  [[34, -17], [66, -16], [35, 16], [65, 15], [50, -20]].forEach(([x, z], k) => {
    const alarm = new THREE.Group();
    alarm.position.set(x, 2, z);
    scene.add(alarm);
    addScaledMesh(sphereGeo, 0xd93a2b, 1.6, 1.6, 1, 0, 0, 0, alarm); // thân
    addScaledMesh(cylinderGeo, 0xffffff, 1.2, 0.1, 1.2, 0, 0, 0.95, alarm).rotation.x = Math.PI / 2; // mặt số
    [-0.9, 0.9].forEach((bellX) => addScaledMesh(sphereGeo, 0xd4a73a, 0.5, 0.5, 0.5, bellX, 1.7, 0, alarm)); // chuông
    addScaledMesh(boxGeo, 0x25150a, 0.12, 0.9, 0.1, 0, 0.3, 1.05, alarm); // kim

    animations.push((time) => {
      alarm.rotation.z = Math.sin(time * 30 + k) * 0.18; // rung
      alarm.position.y = 2 + Math.abs(Math.sin(time * 15 + k)) * 0.3; // nảy
    });
  });
  // Tờ giấy bay xoáy quanh hố
  const papers = [];
  for (let i = 0; i < 24; i++) {
    papers.push([
      addScaledMesh(boxGeo, 0xffffff, 1.6, 0.05, 2.2, 50, 6, 0),
      randomRange(0, 6.28), // góc ban đầu
      randomRange(10, 26), // bán kính xoáy
      randomRange(3, 16), // độ cao
      randomRange(0.5, 1.6), // tốc độ xoáy
    ]);
  }
  animations.push((time) =>
    papers.forEach(([paper, startAngle, radius, y, speed], i) => {
      const angle = startAngle + time * speed;
      paper.position.set(
        50 + Math.cos(angle) * radius,
        y + Math.sin(time * 2 + i) * 1.5,
        Math.sin(angle) * radius * 0.6
      );
      paper.rotation.set(time * 3 + i, time * 2, i);
    })
  );
  ["AAAA!!", "Còn 2 tiếng!!!", "Sao chưa làm?!", "Nộp sao đây trời"].forEach((text, i) => {
    const angle = i * 1.6 + 0.5;
    const y = 12 + i;
    const bubble = addSpeechBubble(
      text,
      50 + Math.cos(angle) * 20,
      y,
      Math.sin(angle) * 14,
      12,
      "#ffd0c8"
    );
    addBobbing(bubble, y, i, 0.8);
  });
}
/* CHẶNG 6 -ĐẢO NỘP BÀI */
function buildSubmitIsland() {
  // --- Cây dừa ---
  const addPalm = (x, z, lean) => {
    const palm = new THREE.Group();
    palm.position.set(x, 0, z);
    scene.add(palm);
    addScaledMesh(cylinderGeo, 0x6a4524, 0.55, 9, 0.55, 0, 4.5, 0, palm);

    const crown = new THREE.Group();
    crown.position.y = 9;
    palm.add(crown);
    for (let j = 0; j < 7; j++) {
      const frondPivot = new THREE.Group();
      frondPivot.rotation.y = j * 0.9;
      crown.add(frondPivot);
      addScaledMesh(boxGeo, 0x3d8a3a, 0.3, 0.18, 6, 0, 0, 3, frondPivot).rotation.x = 0.5;
    }

    palm.rotation.z = 0.15 * lean;
    animations.push((time) => {
      palm.rotation.x = Math.sin(time * 1.3 + x) * 0.04; // đung đưa
    });
  };
  [[136, -9, 1], [166, -8, -1], [164, 12, -1], [137, 12, 1]].forEach((args) => addPalm(...args));
  // --- Rương kho báu ---
  const chest = new THREE.Group();
  chest.position.set(142, 0, -3);
  chest.rotation.y = 0.5;
  scene.add(chest);
  addScaledMesh(boxGeo, 0x7a4a22, 4, 2, 2.6, 0, 1, 0, chest);
  addScaledMesh(boxGeo, 0x8b5a2b, 4.2, 0.9, 2.8, 0, 2.4, 0, chest);
  addScaledMesh(boxGeo, 0xd4a73a, 0.6, 3, 2.9, 0, 1.4, 0, chest);
  for (let i = 0; i < 4; i++) {
    // đồng vàng rơi ra ngoài
    addScaledMesh(
      sphereGeo,
      getMaterial(0xf2c230, { emissive: 0x8a6a10 }),
      0.5,
      0.2,
      0.5,
      2.8 + i * 0.5,
      0.2,
      1 - i * 0.5,
      chest
    );
  }
  // Dấu X đỏ chỉ chỗ kho báu
  [0.8, -0.8].forEach((angle) => {
    addScaledMesh(boxGeo, 0xb0301f, 7, 0.15, 0.9, 158, 0.1, 9).rotation.y = angle;
  });
  // --- Cầu gỗ thứ 2 nối đảo chính với đảo nộp bài ---
  for (let x = 110; x <= 130; x += 1.5) {
    addScaledMesh(boxGeo, 0xa9794a, 1.2, 0.25, 5, x, 0.2, 0);
  }
  [-2.5, 2.5].forEach((z) => addScaledMesh(boxGeo, 0x3a2210, 22, 0.25, 0.25, 120, 1.2, z));
  // --- Tàu galleon ngoài khơi ---
  const ship = new THREE.Group();
  ship.position.set(186, -0.6, -36);
  ship.rotation.y = 0.5;
  ship.scale.setScalar(1.3);
  scene.add(ship);
  addScaledMesh(boxGeo, 0x6b4423, 16, 3, 5.5, 0, 1, 0, ship); // thân tàu
  addScaledMesh(coneGeo, 0x6b4423, 2.7, 4, 2.7, 9.5, 1, 0, ship).rotation.z = -Math.PI / 2; // mũi tàu
  [[-4, 14], [1, 18], [6, 12]].forEach(([x, height]) => {
    addScaledMesh(cylinderGeo, 0x2e2014, 0.22, height, 0.22, x, height / 2 + 2.5, 0, ship); // cột buồm
    const sail = addScaledMesh(boxGeo, 0xf3e7c6, 0.15, height * 0.6, 4.2, x + 0.2, height * 0.62 + 2.5, 0, ship);
    animations.push((time) => {
      sail.rotation.y = Math.sin(time * 1.5 + x) * 0.08; // buồm phập phồng
    });
  });
  addScaledMesh(boxGeo, 0x8f2a1d, 2.4, 1.2, 0.15, 1, 21.2, 0, ship); // cờ

  animations.push((time) => {
    ship.position.y = -0.6 + Math.sin(time * 1.2) * 0.35; // nhấp nhô theo sóng
    ship.rotation.z = Math.sin(time * 1.1) * 0.04;
  });
  // --- Vây cá mập bơi vòng quanh đảo ---
  [[42, 0.45, 1], [52, 0.32, -1]].forEach(([radius, speed, direction], i) => {
    const fin = new THREE.Group();
    scene.add(fin);
    addScaledMesh(coneGeo, 0x2f3b42, 0.9, 3, 0.25, 0, 0.4, 0, fin);
    animations.push((time) => {
      const angle = time * speed * direction + i * 3;
      fin.position.set(150 + Math.cos(angle) * radius * 1.6, 0, Math.sin(angle) * radius);
      fin.rotation.y = -angle + (direction > 0 ? 0 : Math.PI);
    });
  });
  // --- Trăng, sao, tháp đồng hồ, nút NỘP BÀI, laptop ---
  buildNightSky();
  buildDeadlineTower();
  buildSubmitButtonAndLaptop();
}
function buildNightSky() {
  // Mặt trăng
  const moon = new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ color: 0xfff2c4, fog: false }));
  moon.scale.setScalar(8);
  moon.position.set(200, 75, -70);
  scene.add(moon);
  // Sao
  const STAR_COUNT = 240;
  const starPositions = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    starPositions.set([randomRange(90, 270), randomRange(50, 150), randomRange(-170, 170)], i * 3);
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  scene.add(
    new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, fog: false, sizeAttenuation: false })
    )
  );
  // Ánh sáng xanh của đêm
  const nightLight = new THREE.PointLight(0x8fa8ff, 1, 80);
  nightLight.position.set(150, 20, 0);
  scene.add(nightLight);
}
function buildDeadlineTower() {
  const tower = new THREE.Group();
  tower.position.set(158, 0, -14);
  scene.add(tower);
  addScaledMesh(boxGeo, 0x9a8f84, 5, 16, 5, 0, 8, 0, tower); // thân tháp
  addScaledMesh(coneGeo, 0x7a2a20, 4.4, 5, 4.4, 0, 18.5, 0, tower).rotation.y = Math.PI / 4; // mái
  const sign = makeLabelSprite(
    [
      ["HẠN NỘP 00:00", "700 34px'Segoe UI',Tahoma,Arial,sans-serif", "#fff", 50],
      ["23:59", "700 84px 'Segoe UI',Tahoma,Arial,sans-serif", "#ff3b2f", 130],
    ],
    12,
    "#14141c"
  );
  sign.position.set(0, 25, 0);
  tower.add(sign);
}
function buildSubmitButtonAndLaptop() {
  // Nút NỘP BÀI to màu đỏ
  addScaledMesh(cylinderGeo, 0x555555, 3, 0.6, 3, 160, 0.3, -2);
  const button = addScaledMesh(
    cylinderGeo,
    getMaterial(0xd93a2b, { emissive: 0xff2a1a, emissiveIntensity: 0.8 }),
    2.2,
    0.7,
    2.2,
    160,
    0.95,
    -2
  );
  pulsers.push([button.material, 3]);
  addSpeechBubble("NỘP BÀI!", 160, 6, -2, 9, "#ffd0c8");
  // Bàn + laptop của người đang gõ nốt
  const deskX = 156;
  const deskZ = 12;
  addScaledMesh(boxGeo, 0x7a4a22, 5, 0.3, 3, deskX, 1.6, deskZ); // mặt bàn
  [[-2, -1], [2, -1], [-2, 1], [2, 1]].forEach(([dx, dz]) =>
    addScaledMesh(boxGeo, 0x5a3a1a, 0.3, 1.5, 0.3, deskX + dx, 0.75, deskZ + dz) // chân bàn
  );
  addScaledMesh(boxGeo, 0x333333, 2.4, 0.1, 1.6, deskX, 1.8, deskZ); // thân laptop
  const screen = addScaledMesh(
    boxGeo,
    getMaterial(0x0b1b2b, { emissive: 0x38d6ff, emissiveIntensity: 0.8 }),
    2.4,
    1.5,
    0.1,
    deskX,
    2.7,
    deskZ - 0.8
  );
  screen.rotation.x = -0.2;
  pulsers.push([screen.material, 1]);
  addScaledMesh(cylinderGeo, 0xf4ead2, 0.3, 0.45, 0.3, deskX + 1.8, 2, deskZ); // ly cà phê
  const typingBubble = addSpeechBubble("Đang gõ… 99%", deskX, 7, deskZ, 10, "#d8f7f5");
  addBobbing(typingBubble, 7, 2);
}

/*DỰNG TOÀN BỘ BẢN ĐỒ */
buildSeaAndIslands();
buildClouds();
buildTikTokSwamp();
buildMountain();
buildGroupChatForest();
buildCafeValley();
buildPanicAbyss();
buildSubmitIsland();

/* BÓNG ĐỔ CỦA MẶT TRỜI */
const SUN_OFFSET = new THREE.Vector3(55, 85, 35);
const SUN_DIRECTION = SUN_OFFSET.clone().normalize();
const SUN_RIGHT = new THREE.Vector3(0, 1, 0).cross(SUN_DIRECTION).normalize();
const SUN_UP = SUN_DIRECTION.clone().cross(SUN_RIGHT);

function snapSunToHero() {
  const texelSize = 150 / 2048;
  const heroPoint = new THREE.Vector3(heroPosition.x, 0, heroPosition.z);
  const snappedRight = Math.round(heroPoint.dot(SUN_RIGHT) / texelSize) * texelSize;
  const snappedUp = Math.round(heroPoint.dot(SUN_UP) / texelSize) * texelSize;

  sun.target.position
    .copy(SUN_RIGHT)
    .multiplyScalar(snappedRight)
    .addScaledVector(SUN_UP, snappedUp)
    .addScaledVector(SUN_DIRECTION, heroPoint.dot(SUN_DIRECTION));
  sun.position.copy(sun.target.position).add(SUN_OFFSET);
}

/* NHÂN VẬT CHÍNH */
const hero = new THREE.Group();
const heroBody = new THREE.Group();
hero.add(heroBody);
scene.add(hero);
hero.scale.setScalar(2.1);
const heroPosition = hero.position;
// Tay/chân là một nhóm xoay quanh điểm gắn vào thân
function addHeroLimb(x, y, width, height, color) {
  const pivot = new THREE.Group();
  pivot.position.set(x, y, 0);
  heroBody.add(pivot);
  addScaledMesh(boxGeo, color, width, height, width, 0, -height / 2, 0, pivot);
  return pivot;
}
const heroLegLeft = addHeroLimb(-0.5, 1.5, 0.65, 1.5, 0x3a2a1c);
const heroLegRight = addHeroLimb(0.5, 1.5, 0.65, 1.5, 0x3a2a1c);
const heroArmLeft = addHeroLimb(-1.35, 3.5, 0.5, 1.7, 0x8b2c2c);
const heroArmRight = addHeroLimb(1.35, 3.5, 0.5, 1.7, 0x8b2c2c);
addScaledMesh(cylinderGeo, 0x8b2c2c, 1.1, 2.1, 0.8, 0, 2.6, 0, heroBody); // thân
addScaledMesh(cylinderGeo, 0xd4a73a, 1.15, 0.35, 0.85, 0, 2.1, 0, heroBody); // thắt lưng
addScaledMesh(sphereGeo, 0xe0b48a, 0.85, 0.85, 0.85, 0, 4.5, 0, heroBody); // đầu
[-0.3, 0.3].forEach((x) => addScaledMesh(sphereGeo, 0x25150a, 0.11, 0.11, 0.11, x, 4.6, 0.76, heroBody)); // mắt
// Mũ phù thủy
addScaledMesh(cylinderGeo, 0x2b2118, 1.55, 0.2, 1.55, 0, 5.2, 0, heroBody);
addScaledMesh(coneGeo, 0x2b2118, 1.1, 0.9, 1.1, 0, 5.75, 0, heroBody);
addScaledMesh(cylinderGeo, 0xd4a73a, 1.12, 0.12, 1.12, 0, 5.35, 0, heroBody);
// Mũi tên đỏ trên đầu nhân vật (chỉ vị trí hiện tại)
const heroPin = addScaledMesh(
  coneGeo,
  getMaterial(0xd93a2b, { emissive: 0x7a1d12 }),
  0.8,
  1.6,
  0.8,
  0,
  8.6,
  0,
  hero
);
heroPin.rotation.x = Math.PI;
heroPin.castShadow = false;
/* NHÃN CHẶNG, VÒNG ĐỎ DƯỚI ĐẤT, DẤU CHẤM ĐIỂM ĐẾN */
const zoneLabels = [];
const DEFAULT_STATUS =
  "Bấm để đi · Kéo trái: dịch view · Kéo phải: xoay · Cuộn: zoom vào chỗ trỏ chuột · WASD: đi · Nút chặng: bay tới";
ZONES.forEach((zone, i) => {
  const member = members[i];
  const label = makeLabelSprite(
    [
      [`CHẶNG ${i + 1}`, "700 28px 'Segoe UI',Tahoma,Arial,sans-serif", "#8f2a1d", 44],
      [member.zone, "700 42px 'Segoe UI',Tahoma,Arial,sans-serif", "#3a2210", 96],
      [member.name, "italic 32px 'Segoe UI',Tahoma,Arial,sans-serif", "#6b4423", 148],
    ],
    16
  );
  // Chặng 4 nằm sát quán cà phê nên nhãn đặt cao hơn
  label.position.set(zone.stop[0], zone.stop[1] === 40 ? 26 : 22, zone.stop[1]);
  label.userData.i = i;
  scene.add(label);
  zoneLabels.push(label);
  // Vòng đỏ nhấp nháy dưới chân mỗi chặng
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(5.5, 7, 48),
    new THREE.MeshBasicMaterial({
      color: 0xc0392b,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(zone.stop[0], groundHeight(zone.stop[0], zone.stop[1]) + 0.6, zone.stop[1]);
  scene.add(ring);
  animations.push((time) => {
    ring.material.opacity = 0.45 + 0.3 * Math.sin(time * 3 + i);
  });
});
// Dấu tròn trắng chỗ vừa bấm
const destinationMarker = new THREE.Mesh(
  new THREE.RingGeometry(1.2, 1.9, 32),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  })
);
destinationMarker.rotation.x = -Math.PI / 2;
destinationMarker.visible = false;
scene.add(destinationMarker);
animations.push((time) => {
  destinationMarker.scale.setScalar(1 + 0.25 * Math.sin(time * 8));
});
/* CÂY THÔNG VÀ BỤI TRÊN ĐẢO CHÍNH */
for (let attempt = 0, placed = 0; attempt < 400 && placed < 85; attempt++) {
  const x = randomRange(-112, 112);
  const z = randomRange(-112, 112);
  if (isFreeForDecoration(x, z)) {
    addPine(x, z, randomRange(0.7, 1.2), pineMaterials[attempt % 3]);
    placed++;
  }
}

for (let attempt = 0, placed = 0; attempt < 200 && placed < 16; attempt++) {
  const x = randomRange(-112, 112);
  const z = randomRange(-112, 112);
  if (isFreeForDecoration(x, z)) {
    addScaledMesh(sphereGeo, 0x7fb35a, randomRange(6, 12), randomRange(2, 4), randomRange(6, 12), x, 0, z).castShadow =
      false;
    placed++;
  }
}

/* 20. ĐƯỜNG ĐI: CHỖ NÀO ĐI ĐƯỢC, TỰ VÒNG QUA HỐ DUNG NHAM*/
function isInLavaPit(x, z, margin = 0) {
  return ((x - 50) / (20 + margin)) ** 2 + (z / (11 + margin)) ** 2 < 1;
}
// Điểm p có nằm trên cầu 1 không?
function isOnBridge1(p) {
  return Math.abs(p.z) < 2.7 && p.x > 22 && p.x < 78;
}
// Điểm (x, z) có đi bộ được không (đất liền, đảo nộp bài, hoặc 2 cây cầu)?
function isWalkable(x, z) {
  const onMainIsland = Math.hypot(x, z) < 109 && (!isInLavaPit(x, z) || isOnBridge1({ x, z }));
  const onSubmitIsland = Math.hypot(x - 150, z) < 24;
  const onBridge2 = Math.abs(z) < 2.7 && x > 106 && x < 130;
  return onMainIsland || onSubmitIsland || onBridge2;
}
// Đường thẳng từ a tới b có cắt hố dung nham không?
function lineHitsLavaPit(a, b) {
  for (let t = 0; t <= 1; t += 0.02) {
    if (isInLavaPit(lerp(a.x, b.x, t), lerp(a.z, b.z, t), 1.3)) return true;
  }
  return false;
}
// Các điểm đầu/cuối cầu 1 và cầu 2
const BRIDGE1_WEST = { x: 20, z: 0 };
const BRIDGE1_EAST = { x: 80, z: 0 };
const BRIDGE2_WEST = { x: 106, z: 0 };
const BRIDGE2_EAST = { x: 128, z: 0 };
// Đường đi trên đảo chính: nếu bị hố dung nham chắn thì đi vòng qua đầu cầu 1
function routeOnMainIsland(from, to) {
  const fromOnBridge = isOnBridge1(from);
  const toOnBridge = isOnBridge1(to);
  if (fromOnBridge && toOnBridge) return [to];
  if (fromOnBridge) return [to.x < 50 ? BRIDGE1_WEST : BRIDGE1_EAST, to];
  if (toOnBridge) return [from.x < 50 ? BRIDGE1_WEST : BRIDGE1_EAST, to];
  if (!lineHitsLavaPit(from, to)) return [to];

  return [
    from.x < 50 ? BRIDGE1_WEST : BRIDGE1_EAST,
    to.x < 50 ? BRIDGE1_WEST : BRIDGE1_EAST,
    to,
  ];
}
const isOnSubmitIsland = (p) => p.x > 117;
// Đường đi đầy đủ giữa 2 điểm bất kỳ (có thể phải qua cầu 2 sang đảo nộp bài)
function planRoute(from, to) {
  if (isOnSubmitIsland(from) === isOnSubmitIsland(to)) {
    return routeOnMainIsland(from, to);
  }
  return isOnSubmitIsland(to)
    ? [...routeOnMainIsland(from, BRIDGE2_WEST), BRIDGE2_EAST, to]
    : [BRIDGE2_EAST, BRIDGE2_WEST, ...routeOnMainIsland(BRIDGE2_WEST, to)];
}
/* 21. DI CHUYỂN NHÂN VẬT VÀ MỞ THẺ THÀNH VIÊN*/
let path = []; // danh sách điểm cần đi qua
let targetZoneIndex = -1; // chặng đang hướng tới (-1 nếu chỉ đi bộ thường)
let moveId = 0; // đánh số mỗi lần đi, để huỷ việc mở thẻ nếu đã đổi ý
let lastZoneIndex = -1; // chặng vừa mở thẻ lần trước

function goTo(x, z, zoneIndex = -1) {
  path = planRoute({ x: heroPosition.x, z: heroPosition.z }, { x, z });
  targetZoneIndex = zoneIndex;
  moveId++;

  destinationMarker.position.set(x, groundHeight(x, z) + 0.7, z);
  destinationMarker.visible = true;
  statusEl.textContent =
    zoneIndex >= 0 ? `Đang đi tới ${members[zoneIndex].zone}…` : "Đang di chuyển…";
  // Chỗ đứng cố định
  if (Math.hypot(heroPosition.x - x, heroPosition.z - z) < 0.8) {
    path = [];
    onArrive();
  }
}
function onArrive() {
  destinationMarker.visible = false;
  const clickedLabel = targetZoneIndex >= 0;
  const zoneIndex = clickedLabel
    ? targetZoneIndex
    : ZONES.findIndex(
        (zone) => Math.hypot(heroPosition.x - zone.stop[0], heroPosition.z - zone.stop[1]) < 7
      );
  targetZoneIndex = -1;
  const currentMoveId = ++moveId;

  if (zoneIndex < 0) {
    lastZoneIndex = -1;
    statusEl.textContent = DEFAULT_STATUS;
    return;
  }
  statusEl.textContent = `Đã tới ${members[zoneIndex].zone}.`;
  // Mở thẻ sau 0.25 giây (trừ khi người chơi đã di chuyển tiếp)
  if (clickedLabel || zoneIndex !== lastZoneIndex) {
    setTimeout(() => {
      if (moveId === currentMoveId) openMemberCard(zoneIndex);
    }, 250);
  }
  lastZoneIndex = zoneIndex;
}
function openMemberCard(index) {
  const member = members[index];
  select("#dAva").innerHTML = member.img
    ? `<img src="${member.img}" alt="${member.name}">`
    : member.icon;
  select("#dName").textContent = member.name;
  select("#dZone").textContent = `Chặng ${index + 1} · ${member.zone}`;
  select("#dSum").textContent = member.summary;
  select("#dLink").href = member.link;
  dialogEl.showModal();
}

/*22. NPC (người dân trong bản đồ) */
const NPC_SHIRT_COLORS = [0xd98b5f, 0x7fa8c9, 0xc9b458, 0xa57fc9, 0x8b2c2c, 0x3c6e47, 0x2f5d62, 0xd36a8a];
const NPC_HAIR_COLORS = [0x2b2118, 0x5a3a1c, 0xb0382c, 0x222222];
const npcs = [];
// Tạo mô hình người (thân, đầu, tóc, tay chân)
function createPersonModel(index) {
  const group = new THREE.Group();
  const body = new THREE.Group();
  const shirtColor = NPC_SHIRT_COLORS[index % 8];
  group.add(body);

  const addLimb = (x, y, width, height, color) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, 0);
    body.add(pivot);
    addScaledMesh(boxGeo, color, width, height, width, 0, -height / 2, 0, pivot).castShadow = false;
    return pivot;
  };
  const legLeft = addLimb(-0.35, 1.1, 0.45, 1.1, 0x3a2a1c);
  const legRight = addLimb(0.35, 1.1, 0.45, 1.1, 0x3a2a1c);
  const armLeft = addLimb(-0.95, 2.5, 0.35, 1.2, shirtColor);
  const armRight = addLimb(0.95, 2.5, 0.35, 1.2, shirtColor);
  addScaledMesh(cylinderGeo, shirtColor, 0.8, 1.5, 0.6, 0, 1.85, 0, body);
  addScaledMesh(sphereGeo, SKIN_COLORS[index % 4], 0.6, 0.6, 0.6, 0, 3.1, 0, body);
  addScaledMesh(sphereGeo, NPC_HAIR_COLORS[index % 4], 0.63, 0.4, 0.63, 0, 3.4, 0, body);
  group.scale.setScalar(1.35);
  scene.add(group);
  return { group, body, legLeft, legRight, armLeft, armRight };
}
// Chọn điểm đến hợp lệ ngẫu nhiên trong vùng đi lang thang của NPC
function pickWanderPoint(npc) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const point = randomPointInRing(npc.wanderCenter, 0, npc.wanderRadius);
    if (!npc.isValidPoint || npc.isValidPoint(point[0], point[1])) return point;
  }
  return [npc.wanderCenter[0], npc.wanderCenter[1]];
}
/*
  options:
    i            : chỉ số (quyết định màu áo/da/tóc)
    mode         : "static" = đứng/nằm yên, còn lại = đi lang thang
    wc, wr       : tâm và bán kính vùng đi lang thang
    sp           : tốc độ đi
    waitR        : [min, max] số giây nghỉ giữa các lần đi
    phone / cup  : cầm điện thoại / cầm ly
    armsUp       : giơ tay hoảng loạn
    route        : dùng planRoute để tránh hố dung nham
    valid        : hàm kiểm tra điểm đến hợp lệ
    say, bg      : bóng thoại trên đầu và màu nền
    lie          : nằm xuống (chế độ static)
    typing       : đang gõ phím (chế độ static)
    x, z, face   : vị trí và hướng (chế độ static)
*/
function spawnNpc(options) {
  const npc = Object.assign(createPersonModel(options.i), options, {
    wanderCenter: options.wc,
    wanderRadius: options.wr,
    isValidPoint: options.valid,
    phase: randomRange(0, 6),
    waitTime: randomRange(0, 2),
    path: [],
  });

  if (options.mode === "static") {
    npc.group.position.set(options.x, groundHeight(options.x, options.z), options.z);
    npc.group.rotation.y = options.face || 0;
    if (options.lie) {
      npc.group.rotation.x = -Math.PI / 2;
      npc.group.position.y += 0.55;
    }
  } else {
    const point = pickWanderPoint(npc);
    npc.group.position.set(point[0], groundHeight(point[0], point[1]), point[1]);
  }
  // Điện thoại gắn vào tay trái, ly gắn vào tay phải
  if (options.phone) {
    addScaledMesh(
      boxGeo,
      getMaterial(0x15151c, { emissive: 0x25f4ee, emissiveIntensity: 1 }),
      0.4,
      0.65,
      0.1,
      0,
      -1.2,
      0.25,
      npc.armLeft
    );
  }
  if (options.cup) {
    addScaledMesh(cylinderGeo, 0xf4ead2, 0.22, 0.4, 0.22, 0, -1.25, 0, npc.armRight);
  }
  if (options.say) {
    addBobbing(addSpeechBubble(options.say, 0, 5.4, 0, 7, options.bg || "#fff", npc.group), 5.4, options.i, 0.15);
  }
  npcs.push(npc);
}
// Cập nhật chuyển động NPC mỗi frame
animations.push((time, dt) =>
  npcs.forEach((npc) => {
    const group = npc.group;
    const phase = npc.phase;
    // NPC đứng yên: chỉ thở nhẹ (hoặc gõ phím)
    if (npc.mode === "static") {
      npc.body.position.y = Math.sin(time * 2 + phase) * 0.04;
      if (npc.typing) {
        npc.armLeft.rotation.x = -1.2 + Math.sin(time * 14 + phase) * 0.15;
        npc.armRight.rotation.x = -1.2 + Math.cos(time * 13 + phase) * 0.15;
      }
      return;
    }
    // NPC đi lang thang
    let isMoving = false;

    if (npc.waitTime > 0) {
      npc.waitTime -= dt; // đang nghỉ
    } else {
      // Hết đường thì chọn điểm mới
      if (!npc.path.length) {
        const point = pickWanderPoint(npc);
        npc.path = npc.route
          ? routeOnMainIsland(
              { x: group.position.x, z: group.position.z },
              { x: point[0], z: point[1] }
            )
          : [{ x: point[0], z: point[1] }];
      }
      const target = npc.path[0];
      const dx = target.x - group.position.x;
      const dz = target.z - group.position.z;
      const distance = Math.hypot(dx, dz);

      if (distance < 0.6) {
        npc.path.shift();
        if (!npc.path.length) npc.waitTime = randomRange(npc.waitR[0], npc.waitR[1]);
      } else {
        isMoving = true;
        const step = Math.min(distance, npc.sp * dt);
        group.position.x += (dx / distance) * step;
        group.position.z += (dz / distance) * step;

        // Xoay mượt về hướng đang đi
        const angleDiff =
          ((Math.atan2(dx, dz) - group.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        group.rotation.y += angleDiff * Math.min(1, dt * 8);
      }
    }
    group.position.y = groundHeight(group.position.x, group.position.z);
    // Vung tay chân
    const swing = isMoving ? Math.sin(time * npc.sp * 2.2 + phase) : 0;
    npc.legLeft.rotation.x = swing * 0.8;
    npc.legRight.rotation.x = -swing * 0.8;
    npc.armRight.rotation.x = npc.armsUp ? -2.6 + Math.sin(time * 16 + phase) * 0.5 : -swing * 0.7;
    npc.armLeft.rotation.x = npc.phone
      ? -1.4
      : npc.armsUp
      ? -2.6 + Math.cos(time * 16 + phase) * 0.5
      : swing * 0.7;
    npc.body.position.y = isMoving ? Math.abs(swing) * 0.2 : Math.sin(time * 2 + phase) * 0.04;
  })
);
// Tâm đứng của 6 chặng
const zoneStops = ZONES.map((zone) => zone.stop);
// Chặng 1: người lướt TikTok
for (let k = 0; k < 8; k++) {
  spawnNpc({
    i: k,
    wc: zoneStops[0],
    wr: 11,
    sp: 1.6,
    waitR: [3, 8],
    phone: true,
    say: ["Thêm 1 video…", "5 phút thôi mà"][k] || null,
    bg: "#d8f7f5",
  });
}
// Chặng 2: người "để mai làm" đi lang thang
for (let k = 0; k < 4; k++) {
  spawnNpc({
    i: k + 1,
    wc: zoneStops[1],
    wr: 12,
    sp: 1.8,
    waitR: [2, 6],
    say: ["Mai làm…", "Để mai nhé", "Còn lâu mới deadline", "Nghỉ tí đã"][k],
    bg: "#e8e6ff",
  });
}
// Chặng 2: người nằm ngủ trên tuyết
[[7, -41], [-6, -53], [3, -55]].forEach(([x, z], k) => {
  spawnNpc({
    i: k + 2,
    mode: "static",
    x,
    z,
    lie: true,
    say: k < 2 ? "Zzz…" : null,
    bg: "#e8e6ff",
  });
});
// Chặng 3: người trong group chat
for (let k = 0; k < 10; k++) {
  spawnNpc({
    i: k + 3,
    wc: zoneStops[2],
    wr: 9,
    sp: 2.4,
    waitR: [1, 4],
    say: ["Ai làm slide?", "Seen rồi mà…", "@all họp gấp", "Mai nộp rồi!"][k] || null,
  });
}
// Chặng 4: người cầm ly cà phê
for (let k = 0; k < 10; k++) {
  spawnNpc({
    i: k + 5,
    wc: zoneStops[3],
    wr: 10,
    sp: 2.4,
    waitR: [1, 4],
    cup: true,
    say: ["Cho ly bạc xỉu", "Đi cà phê ko?", "Mai tính!"][k] || null,
  });
}
// Chặng 5: người hoảng loạn chạy khắp vùng dung nham (tránh rơi xuống hố)
const isValidPanicPoint = (x, z) =>
  Math.hypot(x - 50, z) < 34 && (!isInLavaPit(x, z, 2.5) || isOnBridge1({ x, z }));
for (let k = 0; k < 10; k++) {
  spawnNpc({
    i: k + 7,
    wc: [50, 0],
    wr: 34,
    sp: 9,
    waitR: [0, 0.4],
    armsUp: true,
    route: true,
    valid: isValidPanicPoint,
    say: ["!!!", "Giúp với!", "Còn 1 tiếng!", "AAAA"][k] || null,
    bg: "#ffd0c8",
  });
}
// Chặng 6: 2 người gõ laptop
[[154.5, 15.3], [157.5, 15.3]].forEach(([x, z], k) => {
  spawnNpc({
    i: k + 1,
    mode: "static",
    x,
    z,
    face: Math.PI,
    typing: true,
    say: k ? null : "Sắp xong rồi…",
  });
});
// Chặng 6: 4 người xếp hàng chờ nộp bài
[[163.5, -2], [166, -2], [168.5, -2], [171, -2]].forEach(([x, z], k) => {
  spawnNpc({
    i: k + 3,
    mode: "static",
    x,
    z,
    face: -Math.PI / 2,
    say: ["Chờ 23:59…", null, "Nộp chưa?!", null][k],
    bg: "#ffd0c8",
  });
});
// Chặng 6: 3 người đi dạo trên đảo
for (let k = 0; k < 3; k++) {
  spawnNpc({
    i: k + 4,
    wc: [150, 5],
    wr: 12,
    sp: 2,
    waitR: [2, 5],
    valid: (x, z) =>
      Math.hypot(x - 150, z) < 20 &&
      Math.hypot(x - 160, z) > 5 &&
      Math.hypot(x - 156, z - 12) > 5,
  });
}
/* ĐIỀU KHIỂN CAMERA VÀ CHUỘT / BÀN PHÍM */
let cameraYaw = 0.2; // góc xoay ngang
let cameraPitch = 0.82; // góc nghiêng dọc
let cameraDistance = 85; // khoảng cách camera
let panicForced = false; // bật nút "hoảng loạn" thủ công
let followHero = true; // camera có bám theo nhân vật không
let cameraDistanceGoal = null; // khoảng cách muốn zoom tới (mượt dần)
const cameraTarget = heroPosition.clone(); // điểm camera đang nhìn (mượt)
const cameraGoal = new THREE.Vector3(); // điểm camera muốn nhìn khi không bám nhân vật
const tempGoal = new THREE.Vector3();
// Bay camera tới một chặng
function flyToZone(index) {
  followHero = false;
  cameraGoal.set(ZONES[index].stop[0], 3.5, ZONES[index].stop[1]);
  cameraDistanceGoal = 60;
}
// Tia từ con trỏ chuột xuống mặt đất để biết người dùng bấm vào đâu
const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();
const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const groundHit = new THREE.Vector3();
// Trả về { zi: chỉ số chặng } nếu bấm trúng nhãn, hoặc { zi: -1, x, z } nếu bấm xuống đất
function pickAtPointer(event) {
  const rect = canvas.getBoundingClientRect();
  pointerNdc.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  raycaster.setFromCamera(pointerNdc, camera);

  const labelHit = raycaster.intersectObjects(zoneLabels)[0];
  if (labelHit) return { zi: labelHit.object.userData.i };

  return raycaster.ray.intersectPlane(groundPlane, groundHit)
    ? { zi: -1, x: groundHit.x, z: groundHit.z }
    : null;
}
let drag = null; // trạng thái đang kéo chuột
canvas.addEventListener("pointerdown", (event) => {
  const isRotate = event.button === 2 || event.button === 1 || event.shiftKey;
  drag = {
    x: event.clientX,
    y: event.clientY,
    moved: 0,
    button: event.button,
    rotate: isRotate, // chuột phải / giữa / Shift: xoay
    pan: !isRotate, // chuột trái: dịch view
  };
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointermove", (event) => {
  if (!drag) {
    // Không kéo: đổi con trỏ khi rê chuột lên nhãn chặng
    const picked = pickAtPointer(event);
    worldEl.classList.toggle("hover", !!(picked && picked.zi >= 0));
    return;
  }
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;
  drag.moved += Math.abs(dx) + Math.abs(dy);
  drag.x = event.clientX;
  drag.y = event.clientY;
  const isFirstPerson = followHero && cameraDistance < 8;
  if (drag.pan && !isFirstPerson) {
    // Kéo trái: dịch view tới chặng bất kỳ, không cần nhân vật
    if (drag.moved < 6) return; // chưa kéo đủ xa thì coi là bấm
    if (followHero) {
      followHero = false;
      cameraGoal.copy(cameraTarget);
      cameraDistanceGoal = null;
    }
    const k = cameraDistance * 0.0018;
    const rightX = Math.cos(cameraYaw);
    const rightZ = -Math.sin(cameraYaw);
    const forwardX = -Math.sin(cameraYaw);
    const forwardZ = -Math.cos(cameraYaw);
    cameraGoal.x = clamp(cameraGoal.x + (-rightX * dx + forwardX * dy) * k, -140, 270);
    cameraGoal.z = clamp(cameraGoal.z + (-rightZ * dx + forwardZ * dy) * k, -150, 150);
  } else {
    // Xoay camera (ngược chiều khi ở góc nhìn thứ nhất)
    cameraYaw += (isFirstPerson ? 1 : -1) * dx * 0.005;
    cameraPitch = clamp(cameraPitch + (isFirstPerson ? -1 : 1) * dy * 0.004, -1.45, 1.5);
  }
});

canvas.addEventListener("pointerup", (event) => {
  // Nhấn chuột trái mà gần như không kéo = bấm để đi
  if (drag && drag.button === 0 && !drag.rotate && drag.moved < 6) {
    const picked = pickAtPointer(event);
    if (picked && picked.zi >= 0) {
      goTo(ZONES[picked.zi].stop[0], ZONES[picked.zi].stop[1], picked.zi);
    } else if (picked && isWalkable(picked.x, picked.z)) {
      goTo(picked.x, picked.z);
    } else {
      statusEl.textContent = "Chỗ đó là biển hoặc dung nham, không đi được.";
    }
  }
  drag = null;
});
canvas.addEventListener("contextmenu", (event) => event.preventDefault());
// Cuộn chuột: zoom vào đúng chỗ con trỏ đang trỏ
canvas.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
    cameraDistanceGoal = null;

    const oldDistance = cameraDistance;
    const newDistance = clamp(cameraDistance * (1 + event.deltaY * 0.001), 2.5, 220);

    if (!(followHero && newDistance < 8) && newDistance !== oldDistance) {
      const rect = canvas.getBoundingClientRect();
      pointerNdc.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(pointerNdc, camera);

      const pivot = followHero ? cameraTarget : cameraGoal;
      if (
        raycaster.ray.intersectPlane(groundPlane, groundHit) &&
        Math.hypot(groundHit.x - pivot.x, groundHit.z - pivot.z) < oldDistance * 3
      ) {
        const ratio = newDistance / oldDistance;
        const nextX = groundHit.x + (pivot.x - groundHit.x) * ratio;
        const nextZ = groundHit.z + (pivot.z - groundHit.z) * ratio;

        if (followHero && Math.hypot(nextX - cameraTarget.x, nextZ - cameraTarget.z) > 0.5) {
          followHero = false;
          cameraGoal.copy(cameraTarget);
        }
        if (!followHero) {
          cameraGoal.x = clamp(nextX, -140, 270);
          cameraGoal.z = clamp(nextZ, -150, 150);
        }
      }
    }
    cameraDistance = newDistance;
  },
  { passive: false }
);
// Phím WASD
const pressedKeys = {};
addEventListener("keydown", (event) => {
  if (!dialogEl.open && "KeyW KeyA KeyS KeyD".includes(event.code) && event.code.length === 4) {
    pressedKeys[event.code] = 1;
  }
});
addEventListener("keyup", (event) => {
  delete pressedKeys[event.code];
});
// Nút bật/tắt chế độ hoảng loạn và nút đóng thẻ
select("#panicBtn").onclick = (event) => {
  panicForced = !panicForced;
  event.currentTarget.setAttribute("aria-pressed", panicForced);
};
select("#dClose").onclick = () => dialogEl.close();
dialogEl.addEventListener("click", (event) => {
  if (event.target === dialogEl) dialogEl.close(); // bấm ra ngoài thẻ thì đóng
});
// Co giãn theo kích thước khung
function resize() {
  const width = worldEl.clientWidth;
  const height = worldEl.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(worldEl);
resize();
// Vị trí xuất phát
heroPosition.set(10, 0, 12);
// Thanh nút bay tới từng chặng
const zoneBar = document.createElement("div");
zoneBar.className = "zones";
zoneBar.innerHTML =
  members.map((member, i) => `<button data-i="${i}">${member.icon} ${member.zone}</button>`).join("") +
  '<button data-i="-1" class="me">🎯 Theo nhân vật</button>';
zoneBar.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const index = +button.dataset.i;
  if (index < 0) {
    followHero = true;
    cameraDistanceGoal = Math.min(cameraDistance, 70);
  } else {
    flyToZone(index);
  }
});
worldEl.appendChild(zoneBar);

/* 24. VÒNG LẶP CHÍNH (mỗi frame)*/
let lastTime = performance.now();
let elapsed = 0;
let heroYaw = Math.PI;
let walkCycle = 0;
// Xoay nhân vật về hướng đang đi và tăng nhịp bước chân
function turnHeroToward(dx, dz, dt) {
  const targetYaw = Math.atan2(dx, dz);
  const diff = ((targetYaw - heroYaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  heroYaw += diff * Math.min(1, dt * 10);
  walkCycle += dt * 12;
}
function frame(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  elapsed += dt;
  let isMoving = false;
  /* --- Di chuyển bằng WASD hoặc theo đường đã bấm --- */
  const forward = (pressedKeys.KeyW ? 1 : 0) - (pressedKeys.KeyS ? 1 : 0);
  const right = (pressedKeys.KeyD ? 1 : 0) - (pressedKeys.KeyA ? 1 : 0);
  if (forward || right) {
    // Người chơi bấm phím: huỷ đường đang đi
    path = [];
    destinationMarker.visible = false;
    targetZoneIndex = -1;
    moveId++;
    isMoving = true;
    followHero = true;
    let dx = -Math.sin(cameraYaw) * forward + Math.cos(cameraYaw) * right;
    let dz = -Math.cos(cameraYaw) * forward - Math.sin(cameraYaw) * right;
    const length = Math.hypot(dx, dz);
    dx /= length;
    dz /= length;
    const nextX = heroPosition.x + dx * 22 * dt;
    const nextZ = heroPosition.z + dz * 22 * dt;
    // Thử đi chéo, nếu vướng thì trượt dọc theo mép
    if (isWalkable(nextX, nextZ)) {
      heroPosition.x = nextX;
      heroPosition.z = nextZ;
    } else if (isWalkable(nextX, heroPosition.z)) {
      heroPosition.x = nextX;
    } else if (isWalkable(heroPosition.x, nextZ)) {
      heroPosition.z = nextZ;
    }
    turnHeroToward(dx, dz, dt);
  } else if (path.length) {
    const point = path[0];
    const dx = point.x - heroPosition.x;
    const dz = point.z - heroPosition.z;
    const distance = Math.hypot(dx, dz);
    if (distance < 0.7) {
      path.shift();
      if (!path.length) onArrive();
    } else {
      isMoving = true;
      const step = Math.min(distance, 24 * dt);
      heroPosition.x += (dx / distance) * step;
      heroPosition.z += (dz / distance) * step;
      turnHeroToward(dx, dz, dt);
    }
  }
  heroPosition.y = lerp(heroPosition.y, groundHeight(heroPosition.x, heroPosition.z), Math.min(1, dt * 6));
  hero.rotation.y = heroYaw;
  /* --- Hoạt hoạ nhân vật chính --- */
  const swing = isMoving ? Math.sin(walkCycle) : 0;
  heroLegLeft.rotation.x = swing * 0.8;
  heroLegRight.rotation.x = -swing * 0.8;
  heroArmLeft.rotation.x = -swing * 0.7;
  heroArmRight.rotation.x = isMoving ? swing * 0.7 : Math.sin(elapsed * 3) * 0.15;
  heroBody.position.y = isMoving ? Math.abs(Math.sin(walkCycle)) * 0.35 : Math.sin(elapsed * 2) * 0.05;
  heroPin.position.y = 8.6 + Math.sin(elapsed * 3) * 0.4;

  /* --- Chế độ hoảng loạn: đứng gần vực thẳm hoặc bấm nút --- */
  const isPanic = panicForced || Math.hypot(heroPosition.x - 50, heroPosition.z) < 28;
  worldEl.classList.toggle("panic", isPanic);
  scene.background.lerp(isPanic ? SKY_PANIC : SKY_NORMAL, Math.min(1, dt * 3));
  scene.fog.color.copy(scene.background);
  lavaMaterial.emissiveIntensity = 1.1 + Math.sin(elapsed * (isPanic ? 12 : 3)) * (isPanic ? 0.6 : 0.25);

  // Các vật phát sáng nhấp nháy
  pulsers.forEach(([material, offset]) => {
    material.emissiveIntensity = 0.55 + 0.45 * Math.sin(elapsed * 2.5 + offset * 2);
  });

  // Chạy tất cả hoạt hoạ đã đăng ký
  animations.forEach((animate) => animate(elapsed, dt));

  /* --- Camera --- */
  const isFirstPerson = followHero && cameraDistance < 8; // zoom sát = góc nhìn thứ nhất
  hero.visible = !isFirstPerson;

  if (cameraDistanceGoal !== null) {
    cameraDistance = lerp(cameraDistance, cameraDistanceGoal, 1 - Math.exp(-dt * 4));
    if (Math.abs(cameraDistance - cameraDistanceGoal) < 0.3) cameraDistanceGoal = null;
  }

  // Điểm camera muốn nhìn: nhân vật hoặc điểm tự do
  tempGoal.copy(
    followHero
      ? tempGoal.set(heroPosition.x, heroPosition.y + (isFirstPerson ? 9.5 : 5.5), heroPosition.z)
      : cameraGoal
  );
  cameraTarget.lerp(tempGoal, 1 - Math.exp(-dt * (isFirstPerson ? 25 : followHero ? 4 : 10)));

  const shake = isPanic ? 0.7 : 0; // rung camera khi hoảng loạn
  const dirX = Math.sin(cameraYaw) * Math.cos(cameraPitch);
  const dirY = Math.sin(cameraPitch);
  const dirZ = Math.cos(cameraYaw) * Math.cos(cameraPitch);

  if (isFirstPerson) {
    camera.position.copy(cameraTarget);
    camera.lookAt(cameraTarget.x - dirX, cameraTarget.y - dirY, cameraTarget.z - dirZ);
  } else {
    camera.position.set(
      cameraTarget.x + dirX * cameraDistance + (Math.random() - 0.5) * shake,
      Math.max(cameraTarget.y + dirY * cameraDistance, 1.2) + (Math.random() - 0.5) * shake,
      cameraTarget.z + dirZ * cameraDistance
    );
    camera.lookAt(cameraTarget);
  }
  snapSunToHero();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);