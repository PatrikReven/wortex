document.addEventListener("DOMContentLoaded", () => {
  /*************************************************
   * 1) INITIALIZATION (WORTEX STYLE)
   *************************************************/
  const INITIAL_CX = 234;
  const INITIAL_CY = 10;

  // Gumbi in elementi
  const solutionBtn           = document.getElementById("solution-btn");
  const resetBtn              = document.getElementById("reset-btn");
  const toggleInstructionsBtn = document.getElementById("toggle-instructions-btn");
  const themeBtn              = document.getElementById("theme-btn");
  const downloadBtn           = document.getElementById("download-btn");
  const colorBtn              = document.getElementById("color-btn");
  const shareBtn              = document.getElementById("share-btn");

  // Glasba in video
  const musicBtn   = document.getElementById("music-btn");
  const bgVideo    = document.getElementById("bg-video");
  const bgMusic    = document.getElementById("bg-music");
  const clickSound = document.getElementById("click-sound");

  // Elementi
  const solutionPath      = document.getElementById("solution-path");
  const player            = document.getElementById("player");
  const playerTrail       = document.getElementById("player-trail");
  const spinner           = document.getElementById("spinner");
  const mazeSVG           = document.getElementById("maze");
  const instructionsModal = document.getElementById("instructions-modal");
  const closeModalBtn     = document.getElementById("close-modal-btn");
  const winModal          = document.getElementById("win-modal");
  const restartGameBtn    = document.getElementById("restart-game-btn");
  const shareBtnElement   = document.getElementById("share-btn");
  const mobileControls    = document.querySelector(".mobile-controls");
  const moveUpBtn         = document.getElementById("move-up");
  const moveDownBtn       = document.getElementById("move-down");
  const moveLeftBtn       = document.getElementById("move-left");
  const moveRightBtn      = document.getElementById("move-right");
  const lines             = document.querySelectorAll(".maze-paths line");
  const timerDisplay      = document.getElementById("timer-display");
  const confettiContainer = document.getElementById("confetti-container");
  const finalTimeSpan     = document.getElementById("final-time");
  const bestTimeInfo      = document.getElementById("best-time-info");
  const bestTimeDisplay   = document.getElementById("best-time-display");
  const playerNameDisplay = document.getElementById("player-name-display");

  // Modal za ime
  const nameModal       = document.getElementById("name-modal");
  const playerNameInput = document.getElementById("player-name-input");
  const startGameBtn    = document.getElementById("start-game-btn");

  let playerName        = "WortexFan";
  let isMusicPlaying    = false;
  let gameStarted       = false;

  // Timer
  let timerInterval;
  let startTime         = 0;
  let isTimerRunning    = false;
  let isSolutionVisible = false;
  let isDarkTheme       = false;
  let pathLength        = 0;

  // Premikanje
  let keysPressed       = {};
  const circleRadius    = parseFloat(player.getAttribute("r")) || 5;
  const moveSpeed       = 2;
  const boundary        = 482;
  const MAX_TRAIL_POINTS= 500;

  // Najboljši čas
  let bestTime = localStorage.getItem("wortexBestTime");
  if (bestTime) {
    bestTimeDisplay.textContent = `Najboljši Čas: ${bestTime}s`;
  } else {
    bestTimeDisplay.textContent = `Najboljši Čas: --`;
  }

  // Rešitev pot (dashoffset)
  if (solutionPath) {
    pathLength = solutionPath.getTotalLength();
    solutionPath.style.strokeDasharray = pathLength;
    solutionPath.style.strokeDashoffset= pathLength;
  }

  /*************************************************
   * 2) PREPREČI KONTEKSTNI MENI
   *************************************************/
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  }, { passive: false });

  /*************************************************
   * 3) MUSIC BTN: vklop/izklop
   *************************************************/
  musicBtn.addEventListener("click", () => {
    playClickSound();
    if (!isMusicPlaying) {
      bgVideo.style.display = "block";
      bgVideo.style.opacity = "0";
      bgVideo.style.transition = "opacity 1s ease";
      document.body.classList.add("video-active");
      requestAnimationFrame(() => {
        bgVideo.style.opacity = "1";
      });

      bgMusic.play().then(() => {
        isMusicPlaying = true;
        musicBtn.innerHTML = '<i class="fas fa-music"></i> MUSIC: ON';
      }).catch(err => {
        console.log("Music play error:", err);
        alert("Ne moremo predvajati glasbe samodejno. Prosim, dovoli zvok!");
      });
    } else {
      bgVideo.style.opacity = "0";
      setTimeout(() => {
        bgVideo.style.display = "none";
      }, 1000);

      bgMusic.pause();
      isMusicPlaying = false;
      musicBtn.innerHTML = '<i class="fas fa-music"></i> MUSIC: OFF';
      document.body.classList.remove("video-active");
    }
  });

  /*************************************************
   * 4) MOVE WORTEX ICON TO SOLUTION END
   *************************************************/
  function moveWortexIconToEnd() {
    if (!solutionPath) return;
    const solutionPoints = solutionPath.getAttribute("points");
    if (!solutionPoints) return;

    const pointsArray = solutionPoints.trim().split(" ");
    const lastPoint   = pointsArray[pointsArray.length - 1];
    if (!lastPoint) return;

    const [x, y] = lastPoint.split(",").map(Number);
    const wortexImg = document.querySelector("image");
    if (!wortexImg) return;

    const w = parseInt(wortexImg.getAttribute("width"),10);
    const h = parseInt(wortexImg.getAttribute("height"),10);

    wortexImg.setAttribute("x", x - w/2);
    wortexImg.setAttribute("y", y - h/2);
  }

  /*************************************************
   * 5) TIMER FUNKCIJE
   *************************************************/
  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    startTime = performance.now();
    timerInterval = requestAnimationFrame(updateTimer);
  }
  function updateTimer() {
    if (!isTimerRunning) return;
    const elapsed = Math.floor((performance.now() - startTime)/1000);
    timerDisplay.textContent = `Čas: ${elapsed}s`;
    timerInterval = requestAnimationFrame(updateTimer);
  }
  function stopTimer() {
    isTimerRunning = false;
    cancelAnimationFrame(timerInterval);
  }
  function resetTimerDisplay() {
    timerDisplay.textContent = "Čas: 0s";
  }

  /*************************************************
   * 6) TOGGLE SOLUTION (CHEAT)
   *************************************************/
  function toggleSolution() {
    playClickSound();
    if (!solutionPath) return;
    solutionBtn.disabled = true;

    if (!isSolutionVisible) {
      // Pokaži
      solutionPath.style.strokeDashoffset = "0";
      solutionBtn.innerHTML = '<i class="fas fa-pause-circle"></i> Skrij Cheat';
      stopTimer();
    } else {
      // Skrij
      solutionPath.style.strokeDashoffset = pathLength;
      solutionBtn.innerHTML = '<i class="fas fa-magic"></i> Cheat';
    }

    isSolutionVisible = !isSolutionVisible;
    setTimeout(() => (solutionBtn.disabled = false), 2000);
  }

  /*************************************************
   * 7) RESET MAZE
   *************************************************/
  function resetMaze() {
    playClickSound();
    if (solutionPath) {
      solutionPath.style.strokeDashoffset = pathLength;
    }
    isSolutionVisible = false;
    solutionBtn.innerHTML = '<i class="fas fa-magic"></i> Cheat';

    stopTimer();
    resetTimerDisplay();
    player.setAttribute("cx", INITIAL_CX);
    player.setAttribute("cy", INITIAL_CY);
    playerTrail.setAttribute("points", `${INITIAL_CX},${INITIAL_CY}`);
    keysPressed = {};
    gameStarted = false;

    const resetMessage = document.createElement("div");
    resetMessage.textContent = "Wortex Maze je ponastavljen!";
    resetMessage.classList.add("reset-message");
    document.body.appendChild(resetMessage);

    setTimeout(() => {
      resetMessage.classList.add("fade-out");
      setTimeout(() => resetMessage.remove(), 1000);
    }, 2000);
  }

  /*************************************************
   * 8) TOGGLE TEMA
   *************************************************/
  function toggleTheme() {
    playClickSound();
    document.body.classList.toggle("dark-theme");
    isDarkTheme = !isDarkTheme;
    themeBtn.innerHTML = isDarkTheme
      ? '<i class="fas fa-sun"></i> Svetla Tema'
      : '<i class="fas fa-moon"></i> Temna Tema';
  }

  /*************************************************
   * 9) DOWNLOAD (SVG)
   *************************************************/
  function downloadMaze() {
    playClickSound();
    spinner.classList.remove("hidden");
    downloadBtn.disabled = true;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(mazeSVG);

    // Dodaj xmlns, če manjka
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
    }
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "wortex_maze_ultra.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      spinner.classList.add("hidden");
      downloadBtn.disabled = false;
    }, 1000);
  }

  /*************************************************
   * 10) RANDOM SOLUTION COLOR
   *************************************************/
  function randomColor() {
    playClickSound();
    if (!solutionPath) return;
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    solutionPath.style.stroke = color;
  }

  /*************************************************
   * 11) COLLISION DETECTION
   *************************************************/
  function lineCircleCollides(x1, y1, x2, y2, cx, cy, r) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lineLenSq = dx * dx + dy * dy;
    if (lineLenSq === 0) {
      return Math.hypot(cx - x1, cy - y1) <= r;
    }
    const t = ((cx - x1) * dx + (cy - y1) * dy) / lineLenSq;
    const closestX = (t < 0) ? x1 : (t > 1) ? x2 : (x1 + t * dx);
    const closestY = (t < 0) ? y1 : (t > 1) ? y2 : (y1 + t * dy);

    return Math.hypot(closestX - cx, closestY - cy) <= r;
  }

  /*************************************************
   * 12) CAN MOVE?
   *************************************************/
  function canMoveTo(newCx, newCy) {
    newCx = Math.max(0, Math.min(boundary, newCx));
    newCy = Math.max(0, Math.min(boundary, newCy));

    for (const line of lines) {
      const x1 = parseFloat(line.getAttribute("x1"));
      const y1 = parseFloat(line.getAttribute("y1"));
      const x2 = parseFloat(line.getAttribute("x2"));
      const y2 = parseFloat(line.getAttribute("y2"));
      if (lineCircleCollides(x1, y1, x2, y2, newCx, newCy, circleRadius)) {
        return {
          blocked: true,
          cx: player.getAttribute("cx"),
          cy: player.getAttribute("cy")
        };
      }
    }

    // Preveri ali smo "notri" v Wortex ikoni (zmaga)
    const wortexImg = document.querySelector("image");
    if (!wortexImg)
      return { blocked: false, cx: newCx, cy: newCy, win: false };

    const bbox = wortexImg.getBBox();
    const margin = 10;
    if ((newCx - circleRadius) >= (bbox.x + margin) &&
        (newCx + circleRadius) <= (bbox.x + bbox.width - margin) &&
        (newCy - circleRadius) >= (bbox.y + margin) &&
        (newCy + circleRadius) <= (bbox.y + bbox.height - margin)) {
      return { blocked: false, cx: newCx, cy: newCy, win: true };
    }

    return { blocked: false, cx: newCx, cy: newCy, win: false };
  }

  /*************************************************
   * 13) UPDATE TRAIL
   *************************************************/
  function updateTrail(x, y) {
    let points = playerTrail.getAttribute("points").split(" ");
    points.push(`${x},${y}`);
    if (points.length > MAX_TRAIL_POINTS) {
      points.shift();
    }
    playerTrail.setAttribute("points", points.join(" "));
  }

  /*************************************************
   * 14) GAME LOOP
   *************************************************/
  function updatePlayerPosition() {
    if (!gameStarted) {
      requestAnimationFrame(updatePlayerPosition);
      return;
    }

    let cx = parseFloat(player.getAttribute("cx"));
    let cy = parseFloat(player.getAttribute("cy"));
    let moved = false;

    if (keysPressed["w"]) { cy -= moveSpeed; moved = true; }
    if (keysPressed["s"]) { cy += moveSpeed; moved = true; }
    if (keysPressed["a"]) { cx -= moveSpeed; moved = true; }
    if (keysPressed["d"]) { cx += moveSpeed; moved = true; }

    if (moved) {
      if (!isTimerRunning) startTimer();
      const result = canMoveTo(cx, cy);
      if (!result.blocked) {
        player.setAttribute("cx", result.cx);
        player.setAttribute("cy", result.cy);
        updateTrail(result.cx, result.cy);

        if (result.win) {
          stopTimer();
          const finalTime = parseInt(
            timerDisplay.textContent.replace(/[^\d]/g, ''),
            10
          );
          finalTimeSpan.textContent = isNaN(finalTime) ? '???' : finalTime;

          // Check best time
          if (!bestTime || (finalTime < parseInt(bestTime))) {
            bestTime = finalTime;
            localStorage.setItem("BestTime", bestTime);
            bestTimeDisplay.textContent = `Najboljši Čas: ${bestTime}s`;
          }
          if (bestTimeInfo) {
            bestTimeInfo.textContent = bestTime ? bestTime : '???';
          }
          showWinModal();
        }
      }
    }
    requestAnimationFrame(updatePlayerPosition);
  }
  requestAnimationFrame(updatePlayerPosition);

  // Tipke
  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (["w", "a", "s", "d"].includes(key)) {
      keysPressed[key] = true;
    }
  });
  document.addEventListener("keyup", (e) => {
    const key = e.key.toLowerCase();
    if (keysPressed[key]) delete keysPressed[key];
  });

  // Mobilni gumbi
  function pressKey(key) { keysPressed[key] = true; }
  function releaseKey(key) { if (keysPressed[key]) delete keysPressed[key]; }

  function pointerDownHandler(e, key) {
    e.preventDefault();
    pressKey(key);
  }
  function pointerUpHandler(e, key) {
    e.preventDefault();
    releaseKey(key);
  }
  function pointerCancelHandler(e, key) {
    e.preventDefault();
    releaseKey(key);
  }
  function pointerLeaveHandler(e, key) {
    e.preventDefault();
    releaseKey(key);
  }

  moveUpBtn.addEventListener("pointerdown", (e) => pointerDownHandler(e, "w"));
  moveUpBtn.addEventListener("pointerup",   (e) => pointerUpHandler(e, "w"));
  moveUpBtn.addEventListener("pointercancel",(e) => pointerCancelHandler(e, "w"));
  moveUpBtn.addEventListener("pointerout",  (e) => pointerLeaveHandler(e, "w"));
  moveUpBtn.addEventListener("pointerleave",(e) => pointerLeaveHandler(e, "w"));

  moveDownBtn.addEventListener("pointerdown",(e)=> pointerDownHandler(e,"s"));
  moveDownBtn.addEventListener("pointerup",  (e)=> pointerUpHandler(e,"s"));
  moveDownBtn.addEventListener("pointercancel",(e)=>pointerCancelHandler(e,"s"));
  moveDownBtn.addEventListener("pointerout",  (e)=> pointerLeaveHandler(e,"s"));
  moveDownBtn.addEventListener("pointerleave",(e)=> pointerLeaveHandler(e,"s"));

  moveLeftBtn.addEventListener("pointerdown",(e)=> pointerDownHandler(e,"a"));
  moveLeftBtn.addEventListener("pointerup",  (e)=> pointerUpHandler(e,"a"));
  moveLeftBtn.addEventListener("pointercancel",(e)=>pointerCancelHandler(e,"a"));
  moveLeftBtn.addEventListener("pointerout",  (e)=> pointerLeaveHandler(e,"a"));
  moveLeftBtn.addEventListener("pointerleave",(e)=> pointerLeaveHandler(e,"a"));

  moveRightBtn.addEventListener("pointerdown",(e)=> pointerDownHandler(e,"d"));
  moveRightBtn.addEventListener("pointerup",  (e)=> pointerUpHandler(e,"d"));
  moveRightBtn.addEventListener("pointercancel",(e)=>pointerCancelHandler(e,"d"));
  moveRightBtn.addEventListener("pointerout",  (e)=> pointerLeaveHandler(e,"d"));
  moveRightBtn.addEventListener("pointerleave",(e)=> pointerLeaveHandler(e,"d"));

  /*************************************************
   * 15) WIN MODAL
   *************************************************/
  function showWinModal() {
    winModal.classList.add("show");
    winModal.classList.remove("hidden");
    if (playerNameDisplay) {
      playerNameDisplay.textContent = playerName;
    }
    // Konfeti!
    launchConfetti(120);
    // MoreSparkles
    addSparkleEffect();
  }
  function hideWinModal() {
    winModal.classList.remove("show");
    setTimeout(() => winModal.classList.add("hidden"), 400);
  }
  restartGameBtn.addEventListener("click", () => {
    playClickSound();
    hideWinModal();
    resetMaze();
  });

  /*************************************************
   * 16) KONFETI
   *************************************************/
  function launchConfetti(count = 100) {
    for (let i = 0; i < count; i++) {
      createConfetti();
    }
  }
  function createConfetti() {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.top = "-10px";
    const hue = Math.floor(Math.random() * 360);
    confetti.style.backgroundColor = `hsl(${hue}, 90%, 60%)`;
    const shapeRound = (Math.random() < 0.5);
    confetti.style.borderRadius = shapeRound ? "50%" : "0%";
    confetti.style.width = `${Math.random()*10 + 5}px`;
    confetti.style.height = `${Math.random()*10 + 5}px`;
    confetti.style.animationDuration = `${Math.random()*3 + 2}s`;
    confettiContainer.appendChild(confetti);
    confetti.addEventListener("animationend", () => confetti.remove());
  }

  /*************************************************
   * 17) HELPER: PLAY CLICK SOUND
   *************************************************/
  function playClickSound() {
    if (clickSound) {
      clickSound.currentTime = 0;
      clickSound.play().catch(() => {});
    }
  }

  /*************************************************
   * 18) INSTRUCTIONS BTN
   *************************************************/
  toggleInstructionsBtn.addEventListener("click", () => {
    playClickSound();
    const typedTitle = document.getElementById("typed-title");
    if (typedTitle) {
      typedTitle.style.width = "0";
      typedTitle.textContent = "WORTEX NAVODILA";
      typedTitle.style.animation = "none";
      typedTitle.offsetWidth;
      typedTitle.style.animation =
        "typing 3s steps(40, end) forwards, blinkCursor 1s infinite step-end alternate";
    }
    instructionsModal.classList.add("show");
    instructionsModal.classList.remove("hidden");
  });

  closeModalBtn.addEventListener("click", () => {
    playClickSound();
    instructionsModal.classList.remove("show");
    setTimeout(() => instructionsModal.classList.add("hidden"), 400);
  });

  solutionBtn.addEventListener("click", toggleSolution);
  resetBtn.addEventListener("click", resetMaze);
  themeBtn.addEventListener("click", toggleTheme);
  downloadBtn.addEventListener("click", downloadMaze);
  colorBtn.addEventListener("click", randomColor);

  /*************************************************
   * 19) MODAL ZA IME (Wortex Army)
   *************************************************/
  nameModal.classList.add("show");
  nameModal.classList.remove("hidden");

  startGameBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if (name === "") {
      Swal.fire({
        title: 'Manjka Ime',
        text: 'Prosim, vnesi ime za začetek Wortex avanture!',
        icon: 'warning',
        confirmButtonText: 'OK',
        zIndex: 10002
      });
      return;
    }
    playerName = name;
    gameStarted = true;
    nameModal.classList.remove("show");
    setTimeout(() => nameModal.classList.add("hidden"), 400);
    playClickSound();
  });

  /*************************************************
   * 20) SPARKLE EFEKT
   *************************************************/
  function addSparkleEffect() {
    const winModalContent = document.querySelector('.win-modal-content');
    for (let i = 0; i < 10; i++) {
      const sparkle = document.createElement('div');
      sparkle.classList.add('sparkle');
      sparkle.style.top = `${Math.random() * 100}%`;
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.animationDelay = `${Math.random() * 2}s`;
      winModalContent.appendChild(sparkle);

      sparkle.addEventListener('animationiteration', () => {
        sparkle.remove();
      });
    }
  }

  /*************************************************
   * 21) SHARE SCORE
   *************************************************/
  function shareScore() {
    playClickSound();
    winModal.classList.remove("show");
    setTimeout(() => winModal.classList.add("hidden"), 400);

    const currentTime = timerDisplay.textContent;
    const shareText = `${playerName} je končal Wortex Maze v ${currentTime}! Preizkusi še ti: https://patrikreven.github.io/labirint/`;

    navigator.clipboard.writeText(shareText).then(() => {
      Swal.fire({
        title: 'Dosežek skopiran!',
        html: `
          <p>Tvoj rezultat je bil skopiran v odložišče!</p>
          <p><strong>Wortex link:</strong></p>
          <a href="https://patrikreven.github.io/labirint/" target="_blank" rel="noopener noreferrer">patrikreven.github.io/labirint/</a>
        `,
        icon: 'success',
        confirmButtonText: 'OK',
        zIndex: 10002
      });
    }).catch(() => {
      Swal.fire({
        title: 'Ups...',
        text: 'Ni uspelo kopirati. Prosim, deli ročno!',
        icon: 'error',
        confirmButtonText: 'OK',
        zIndex: 10002
      });
    });
  }
  shareBtnElement.addEventListener("click", shareScore);

  /*************************************************
   * 22) INIT
   *************************************************/
  player.setAttribute("cx", INITIAL_CX);
  player.setAttribute("cy", INITIAL_CY);
  playerTrail.setAttribute("points", `${INITIAL_CX},${INITIAL_CY}`);
  moveWortexIconToEnd();
});
