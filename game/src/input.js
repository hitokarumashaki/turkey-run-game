// Keyboard, mouse and touch input for Turkey Trot.
// One job: turn raw events into edge-triggered game actions.
// The game polls this each frame and consumes the edges it uses.

export function createInput(canvas) {
  const input = {
    jumpQueued: false,
    restartQueued: false,
    duckHeld: false,
    hideHeld: false,
    anyQueued: false,
    muted: false,
  };

  function queueJump() {
    input.jumpQueued = true;
    input.anyQueued = true;
  }

  function onKeyDown(event) {
    if (event.repeat) return;
    const key = event.code;
    if (key === 'Space' || key === 'ArrowUp' || key === 'KeyW') {
      event.preventDefault();
      queueJump();
      input.restartQueued = true;
    } else if (key === 'ArrowDown' || key === 'KeyS') {
      event.preventDefault();
      input.duckHeld = true;
      input.hideHeld = true;
    } else if (key === 'KeyR' || key === 'Enter') {
      input.restartQueued = true;
      input.anyQueued = true;
    } else if (key === 'KeyM') {
      input.muted = !input.muted;
    }
  }

  function onKeyUp(event) {
    const key = event.code;
    if (key === 'ArrowDown' || key === 'KeyS') {
      input.duckHeld = false;
      input.hideHeld = false;
    }
  }

  function onPointerDown(event) {
    event.preventDefault();
    queueJump();
    input.restartQueued = true;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointerdown', onPointerDown);

  // Optional on-screen buttons (duck / hide) wired by id from the page.
  const duckButton = document.getElementById('duck-btn');
  const hideButton = document.getElementById('hide-btn');
  if (duckButton) {
    duckButton.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      input.duckHeld = true;
    });
    duckButton.addEventListener('pointerup', () => {
      input.duckHeld = false;
    });
    duckButton.addEventListener('pointerleave', () => {
      input.duckHeld = false;
    });
  }
  if (hideButton) {
    hideButton.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      input.hideHeld = true;
    });
    hideButton.addEventListener('pointerup', () => {
      input.hideHeld = false;
    });
    hideButton.addEventListener('pointerleave', () => {
      input.hideHeld = false;
    });
  }

  input.consumeJump = function consumeJump() {
    const queued = input.jumpQueued;
    input.jumpQueued = false;
    return queued;
  };

  input.consumeRestart = function consumeRestart() {
    const queued = input.restartQueued;
    input.restartQueued = false;
    return queued;
  };

  input.consumeAny = function consumeAny() {
    const queued = input.anyQueued;
    input.anyQueued = false;
    return queued;
  };

  input.clearEdges = function clearEdges() {
    input.jumpQueued = false;
    input.restartQueued = false;
    input.anyQueued = false;
  };

  return input;
}
