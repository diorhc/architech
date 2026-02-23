// Three JS Template
//----------------------------------------------------------------- BASIC parameters
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

if (window.innerWidth > 800) {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.needsUpdate = true;
}
//---

document.body.appendChild(renderer.domElement);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

var camera = new THREE.PerspectiveCamera(
  20,
  window.innerWidth / window.innerHeight,
  1,
  500,
);

camera.position.set(0, 2, 14);

var scene = new THREE.Scene();
var city = new THREE.Object3D();
var smoke = new THREE.Object3D();
var town = new THREE.Object3D();

var createCarPos = true;
var uSpeed = 0.001;

//----------------------------------------------------------------- FOG background

var setcolor = 0xf02050; // Original red-ish color
// var setcolor = 0x111111; // Darker alternative if needed

scene.background = new THREE.Color(setcolor);
scene.fog = new THREE.Fog(setcolor, 10, 16);

//----------------------------------------------------------------- RANDOM Function
function mathRandom(num = 8) {
  var numValue = -Math.random() * num + Math.random() * num;
  return numValue;
}

//----------------------------------------------------------------- CHANGE building colors
var setTintNum = true;
function setTintColor() {
  if (setTintNum) {
    setTintNum = false;
    var setColor = 0x000000;
  } else {
    setTintNum = true;
    var setColor = 0x000000;
  }
  return setColor;
}

//----------------------------------------------------------------- CREATE City

function init() {
  var segments = 2;
  for (var i = 1; i < 100; i++) {
    var geometry = new THREE.BoxGeometry(1, 0, 0, segments, segments, segments); // Updated to BoxGeometry
    var material = new THREE.MeshStandardMaterial({
      color: setTintColor(),
      wireframe: false,
      flatShading: true,
      side: THREE.DoubleSide,
    });
    var wmaterial = new THREE.MeshLambertMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.03,
      side: THREE.DoubleSide,
    });

    var cube = new THREE.Mesh(geometry, material);
    var wire = new THREE.Mesh(geometry, wmaterial);
    var floor = new THREE.Mesh(geometry, material);
    var wfloor = new THREE.Mesh(geometry, wmaterial);

    cube.add(wfloor);
    cube.castShadow = true;
    cube.receiveShadow = true;
    cube.rotationValue = 0.1 + Math.abs(mathRandom(8));

    floor.scale.y = 0.05;
    cube.scale.y = 0.1 + Math.abs(mathRandom(8));

    var cubeWidth = 0.9;
    cube.scale.x = cube.scale.z = cubeWidth + mathRandom(1 - cubeWidth);
    cube.position.x = Math.round(mathRandom());
    cube.position.z = Math.round(mathRandom());

    // Improved positioning: Buildings Sit ON Ground
    cube.position.y = cube.scale.y / 2;
    floor.position.set(cube.position.x, floor.scale.y / 2, cube.position.z);

    town.add(floor);
    town.add(cube);
  }
  //----------------------------------------------------------------- Particular

  var gmaterial = new THREE.MeshToonMaterial({
    color: 0xffff00,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
  });
  var gparticular = new THREE.SphereGeometry(0.01, 8, 8);
  var aparticular = 10;

  for (var h = 1; h < 300; h++) {
    var particular = new THREE.Mesh(gparticular, gmaterial);
    particular.position.set(
      mathRandom(aparticular),
      mathRandom(5),
      mathRandom(aparticular),
    );
    particular.rotation.set(mathRandom(), mathRandom(), mathRandom());
    smoke.add(particular);
  }

  var pmaterial = new THREE.MeshPhongMaterial({
    color: 0x000000,
    side: THREE.DoubleSide,
    opacity: 0.9,
    transparent: true,
  });
  var pgeometry = new THREE.PlaneGeometry(60, 60);
  var pelement = new THREE.Mesh(pgeometry, pmaterial);
  pelement.rotation.x = (-90 * Math.PI) / 180;
  pelement.position.y = -0.001;
  pelement.receiveShadow = true;

  city.add(pelement);
}

//----------------------------------------------------------------- MOUSE function
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(),
  INTERSECTED;

function onMouseMove(event) {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
function onDocumentTouchStart(event) {
  if (event.touches.length == 1) {
    event.preventDefault();
    mouse.x = event.touches[0].pageX - window.innerWidth / 2;
    mouse.y = event.touches[0].pageY - window.innerHeight / 2;
  }
}
function onDocumentTouchMove(event) {
  if (event.touches.length == 1) {
    event.preventDefault();
    mouse.x = event.touches[0].pageX - window.innerWidth / 2;
    mouse.y = event.touches[0].pageY - window.innerHeight / 2;
  }
}
window.addEventListener("mousemove", onMouseMove, false);
window.addEventListener("touchstart", onDocumentTouchStart, false);
window.addEventListener("touchmove", onDocumentTouchMove, false);

//----------------------------------------------------------------- Lights
var ambientLight = new THREE.AmbientLight(0xffffff, 4);
var lightFront = new THREE.SpotLight(0xffffff, 20, 10);
var lightBack = new THREE.PointLight(0xffffff, 0.5);

lightFront.rotation.x = (45 * Math.PI) / 180;
lightFront.rotation.z = (-45 * Math.PI) / 180;
lightFront.position.set(5, 5, 5);
lightFront.castShadow = true;
lightFront.shadow.mapSize.width = 2048;
lightFront.shadow.mapSize.height = lightFront.shadow.mapSize.width;
lightFront.penumbra = 0.1;
lightBack.position.set(0, 6, 0);

smoke.position.y = 2;

scene.add(ambientLight);
city.add(lightFront);
scene.add(lightBack);
scene.add(city);
city.add(smoke);
city.add(town);

//----------------------------------------------------------------- GRID Helper
var gridHelper = new THREE.GridHelper(60, 120, 0xff0000, 0x000000);
city.add(gridHelper);

//----------------------------------------------------------------- LINES world

var createCars = function (cScale = 2, cPos = 20, cColor = 0xffff00) {
  var cMat = new THREE.MeshToonMaterial({
    color: cColor,
    side: THREE.DoubleSide,
  });
  var cGeo = new THREE.BoxGeometry(1, cScale / 40, cScale / 40); // Updated to BoxGeometry
  var cElem = new THREE.Mesh(cGeo, cMat);
  var cAmp = 3;

  if (createCarPos) {
    createCarPos = false;
    cElem.position.x = -cPos;
    cElem.position.z = mathRandom(cAmp);

    TweenMax.to(cElem.position, 3, {
      x: cPos,
      repeat: -1,
      yoyo: true,
      delay: mathRandom(3),
    });
  } else {
    createCarPos = true;
    cElem.position.x = mathRandom(cAmp);
    cElem.position.z = -cPos;
    cElem.rotation.y = (90 * Math.PI) / 180;

    TweenMax.to(cElem.position, 5, {
      z: cPos,
      repeat: -1,
      yoyo: true,
      delay: mathRandom(3),
      ease: Power1.easeInOut,
    });
  }
  cElem.receiveShadow = true;
  cElem.castShadow = true;
  cElem.position.y = Math.abs(mathRandom(5));
  city.add(cElem);
};

var generateLines = function () {
  for (var i = 0; i < 60; i++) {
    createCars(0.1, 20);
  }
};

//----------------------------------------------------------------- ANIMATE

var animate = function () {
  requestAnimationFrame(animate);

  city.rotation.y -= (mouse.x * 8 - camera.rotation.y) * uSpeed;
  city.rotation.x -= (-(mouse.y * 2) - camera.rotation.x) * uSpeed;
  if (city.rotation.x < -0.05) city.rotation.x = -0.05;
  else if (city.rotation.x > 1) city.rotation.x = 1;

  smoke.rotation.y += 0.01;
  smoke.rotation.x += 0.01;

  camera.lookAt(city.position);
  renderer.render(scene, camera);
};

//----------------------------------------------------------------- KINETIC TEXT REVEAL
class KineticLoader {
  constructor(selector) {
    this.el = document.querySelector(selector);
    if (!this.el) return;

    this.text = this.el.dataset.text || this.el.innerText;
    this.el.innerText = "";
    this.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    this.spans = [];

    // Create spans
    this.text.split("").forEach((char) => {
      const span = document.createElement("span");
      span.innerText = " "; // Start empty/space
      this.el.appendChild(span);
      this.spans.push(span);
    });

    this.animate();
  }

  getRandomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }

  animate() {
    const totalDuration = 2000; // 2 seconds total
    const charDuration = 100; // scramble speed
    const stagger = 150; // delay between locking each char

    this.spans.forEach((span, index) => {
      // Scramble phase
      const interval = setInterval(() => {
        span.innerText = this.getRandomChar();
      }, charDuration);

      // Lock phase
      setTimeout(
        () => {
          clearInterval(interval);
          span.innerText = this.text[index];

          // Add a little distinctive color pop or scale on lock if desired
          // span.style.transform = "scale(1.2)";
          // setTimeout(() => span.style.transform = "scale(1)", 200);
        },
        500 + index * stagger,
      ); // Start locking after 500ms
    });
  }
}

// Start animation
new KineticLoader(".architech-title");

//----------------------------------------------------------------- PAGE TRANSITION
//----------------------------------------------------------------- PAGE TRANSITION
const enterBtn = document.getElementById("enter-btn");
const contactBtn = document.getElementById("contact-btn");
const backBtn = document.getElementById("back-btn");
const contactBackBtn = document.getElementById("contact-back-btn");
const header = document.querySelector(".header");
const studiosWrap = document.querySelector(".studios-wrap");
const contactWrap = document.querySelector(".contact-wrap");

// Default Camera Position (from line 24)
const defaultCamPos = { x: 0, y: 2, z: 14 };
const defaultCamRot = { x: 0, y: 0, z: 0 };

if (header) {
  // ENTER EXPERIENCE
  if (enterBtn && studiosWrap) {
    enterBtn.addEventListener("click", () => {
      header.classList.add("intro-hidden");

      // Warp In
      TweenMax.to(camera.position, 1.5, {
        z: 2,
        y: 1,
        ease: Expo.easeInOut,
      });

      setTimeout(() => {
        studiosWrap.classList.add("visible");
      }, 500);
    });
  }

  // OPEN CONTACT - PREMIUM ANIMATIONS
  if (contactBtn && contactWrap) {
    contactBtn.addEventListener("click", () => {
      header.classList.add("intro-hidden");
      contactWrap.classList.add("visible");

      // Animate Slogan (Staggered or simple fade up)
      TweenMax.to(".contact-slogan", 1, {
        y: 0,
        opacity: 1,
        ease: Power3.easeOut,
        delay: 0.5,
      });

      // Animate Info Blocks
      TweenMax.staggerTo(
        ".contact-info-block",
        0.8,
        {
          y: 0,
          opacity: 1,
          ease: Power3.easeOut,
          delay: 0.8,
        },
        0.2,
      );

      // Animate Form
      TweenMax.to(".contact-form-mockup", 0.8, {
        y: 0,
        opacity: 1,
        ease: Power3.easeOut,
        delay: 1.2,
      });

      // Animate Social Layer
      TweenMax.to(".social-row", 0.8, {
        opacity: 1,
        ease: Power3.easeOut,
        delay: 1.4,
      });
    });
  }

  // SERVICES SECTION LOGIC
  const servicesBtn = document.getElementById("services-btn");
  const servicesWrap = document.querySelector(".services-wrap");
  const servicesBackBtn = document.getElementById("services-back-btn");

  if (servicesBtn && servicesWrap) {
    servicesBtn.addEventListener("click", () => {
      header.classList.add("intro-hidden");
      servicesWrap.classList.add("visible");

      // CAMERA ANIMATION: Blueprint View (Top-Down)
      // Move camera high up and look down
      TweenMax.to(camera.position, 1.5, {
        x: 0,
        y: 20,
        z: 0.1, // Small Z to avoid gimbal lock/flipping issues with lookAt(0,0,0)
        ease: Power3.easeInOut,
        onUpdate: function () {
          camera.lookAt(scene.position);
        },
      });
      // Flatten the city slightly for blueprint effect?
      // Or just keep as is. Top down looks cool.

      // Animate Title
      TweenMax.to(".section-title", 1, {
        y: 0,
        opacity: 1,
        ease: Power3.easeOut,
        delay: 0.8,
      });

      // Animate Service Cards
      TweenMax.staggerTo(
        ".service-card",
        0.8,
        {
          y: 0,
          opacity: 1,
          ease: Power3.easeOut,
          delay: 1.0,
        },
        0.2,
      );
    });
  }

  // BACKGROUND RESET FUNCTION
  const resetToHome = () => {
    // 1. Hide Sections
    if (studiosWrap) studiosWrap.classList.remove("visible");

    // Reset Contact
    if (contactWrap) {
      contactWrap.classList.remove("visible");
      TweenMax.set(".contact-slogan", { y: 50, opacity: 0 });
      TweenMax.set(".contact-info-block", { y: 20, opacity: 0 });
      TweenMax.set(".contact-form-mockup", { y: 20, opacity: 0 });
      TweenMax.set(".social-row", { opacity: 0 });
    }

    // Reset Services
    if (servicesWrap) {
      servicesWrap.classList.remove("visible");
      TweenMax.set(".section-title", { y: 30, opacity: 0 });
      TweenMax.set(".service-card", { y: 50, opacity: 0 });
    }

    // 2. Reset Camera (Warp Back)
    // We need to kill any onUpdate loop that might be forcing lookAt
    TweenMax.killTweensOf(camera.position); // Stop the lookAt update

    TweenMax.to(camera.position, 1.5, {
      x: defaultCamPos.x,
      y: defaultCamPos.y,
      z: defaultCamPos.z,
      ease: Expo.easeInOut,
      onUpdate: function () {
        // Optional: Smoothly transition lookAt back to center if needed,
        // but default default lookAt behavior is controlled in render loop
        // or just by position if not actively looking elsewhere.
        // Actually, our animate() loop calls lookAt(city.position) every frame!
        // So we just need to move the position.
      },
    });
    TweenMax.to(camera.rotation, 1.5, {
      x: defaultCamRot.x,
      y: defaultCamRot.y,
      z: defaultCamRot.z,
      ease: Expo.easeInOut,
    });

    // 3. Show Header
    setTimeout(() => {
      header.classList.remove("intro-hidden");
    }, 800);
  };

  // BACK BUTTONS
  if (backBtn) {
    backBtn.addEventListener("click", resetToHome);
  }
  if (contactBackBtn) {
    contactBackBtn.addEventListener("click", resetToHome);
  }
  if (servicesBackBtn) {
    servicesBackBtn.addEventListener("click", resetToHome);
  }
}

//----------------------------------------------------------------- START functions
generateLines();
init();
animate();

//----------------------------------------------------------------- APPLY SAVED COLORS
function applySavedColors() {
  try {
    const savedColors = localStorage.getItem("architechColors");
    if (savedColors) {
      const colors = JSON.parse(savedColors);
      Object.keys(colors).forEach((target) => {
        const colorHex = colors[target];
        const threeColor = new THREE.Color(colorHex);

        // Update UI trigger
        const trigger = document.querySelector(
          `.change-item[data-target="${target}"] .color-trigger`,
        );
        if (trigger) {
          trigger.style.backgroundColor = colorHex;
        }

        switch (target) {
          case "buildings":
            if (town && town.children) {
              town.children.forEach((child) => {
                if (child.isMesh && child.material && child.scale.y > 0.1) {
                  child.material.color = threeColor;
                }
              });
            }
            break;
          case "smoke":
            if (smoke && smoke.children) {
              smoke.children.forEach((child) => {
                if (child.isMesh && child.material) {
                  child.material.color = threeColor;
                }
              });
            }
            break;
          case "grid":
            if (gridHelper && gridHelper.material) {
              gridHelper.material.color = threeColor;
            }
            break;
          case "cars":
            if (city && city.children) {
              city.children.forEach((child) => {
                if (child.isMesh && child.material && child.position.y > 0.1) {
                  child.material.color = threeColor;
                }
              });
            }
            break;
          case "scene":
            if (scene) {
              scene.background = threeColor;
              if (scene.fog) {
                scene.fog.color = threeColor;
              }
            }
            break;
        }
      });
    }
  } catch (error) {
    console.warn("Failed to apply saved colors:", error);
  }
}

//----------------------------------------------------------------- CHANGE COLOR PANEL (IRO.JS)
setTimeout(function () {
  console.log("Initializing color panel...");

  const changeBtn = document.getElementById("change-btn");
  const changePanel = document.getElementById("change-panel");
  const pickerContainer = document.getElementById("color-picker-container");
  let activeTarget = null;
  let activeTrigger = null;

  // Initialize iro.js color picker
  var colorPicker = new iro.ColorPicker("#color-picker-container", {
    width: 200,
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "#fff",
  });

  if (changeBtn && changePanel) {
    // Helper to center color picker
    function centerPicker() {
      if (
        pickerContainer.classList.contains("visible") &&
        changePanel.classList.contains("visible")
      ) {
        const panelRect = changePanel.getBoundingClientRect();
        const pickerRect = pickerContainer.getBoundingClientRect();
        const wrapperRect = changePanel.parentElement.getBoundingClientRect();

        // Calculate mid point of panel relative to viewport
        const panelMid = panelRect.top + panelRect.height / 2;

        // Convert viewport coordination to wrapper-relative coordination
        // Since wrapper is relative, we set top relative to wrapper's top
        const relativeTop = panelMid - wrapperRect.top - pickerRect.height / 2;

        pickerContainer.style.top = relativeTop + "px";
        pickerContainer.style.bottom = "auto";
      }
    }

    // Toggle Change Panel
    changeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      changePanel.classList.toggle("visible");
      // Hide color picker when closing main panel
      if (!changePanel.classList.contains("visible")) {
        pickerContainer.classList.remove("visible");
      }
    });

    // Handle clicks on change items to open color picker
    const changeItems = document.querySelectorAll(".change-item");
    changeItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();

        // Update active target
        activeTarget = item.dataset.target;
        activeTrigger = item.querySelector(".color-trigger");

        // Set picker color to current trigger color
        const currentColor = activeTrigger.style.backgroundColor;
        colorPicker.color.set(currentColor);

        // Show picker container
        pickerContainer.classList.add("visible");

        // Center it after visibility change (needs time for layout)
        setTimeout(centerPicker, 10);
      });
    });

    // Handle color changes from iro.js
    colorPicker.on("color:change", function (color) {
      if (!activeTarget || !activeTrigger) return;

      const hexString = color.hexString;
      const threeColor = new THREE.Color(hexString);

      // Update trigger UI
      activeTrigger.style.backgroundColor = hexString;

      // Save to localStorage with error handling
      try {
        const savedColors = JSON.parse(
          localStorage.getItem("architechColors") || "{}",
        );
        savedColors[activeTarget] = hexString;
        localStorage.setItem("architechColors", JSON.stringify(savedColors));
      } catch (error) {
        console.warn("Failed to save color to localStorage:", error);
      }

      // Update 3D Scene with null checks
      switch (activeTarget) {
        case "buildings":
          if (town && town.children) {
            town.children.forEach((child) => {
              if (child.isMesh && child.material && child.scale.y > 0.1) {
                child.material.color = threeColor;
              }
            });
          }
          break;
        case "smoke":
          if (smoke && smoke.children) {
            smoke.children.forEach((child) => {
              if (child.isMesh && child.material) {
                child.material.color = threeColor;
              }
            });
          }
          break;
        case "grid":
          if (gridHelper && gridHelper.material) {
            gridHelper.material.color = threeColor;
          }
          break;
        case "cars":
          if (city && city.children) {
            city.children.forEach((child) => {
              if (child.isMesh && child.material && child.position.y > 0.1) {
                child.material.color = threeColor;
              }
            });
          }
          break;
        case "scene":
          if (scene) {
            scene.background = threeColor;
            if (scene.fog) {
              scene.fog.color = threeColor;
            }
          }
          break;
      }
    });

    // Close panels when clicking outside the wrapper
    document.addEventListener("click", (e) => {
      const wrapper = document.querySelector(".change-btn-wrapper");
      if (wrapper && !wrapper.contains(e.target)) {
        changePanel.classList.remove("visible");
        pickerContainer.classList.remove("visible");
      }
    });

    // Handle window resize for centering
    window.addEventListener("resize", centerPicker);

    // Apply saved colors after color picker is initialized
    applySavedColors();
  }
}, 1000);
