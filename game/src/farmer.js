// The farmer: the chaser in Turkey Trot.
// One job: hunt the turkey. He runs a fixed gap behind it — a clean run
// keeps him at bay, every stumble lets him lunge closer, and hiding in
// the hay fools him into falling back. When the gap closes, he corners it.

export function createFarmer() {
  return {
    x: 20,
    y: 452,
    gap: 160, // pixels between the farmer and the turkey
    state: 'chase', // 'chase' | 'search' | 'corner'
    searchTimer: 0,
    runPhase: 0,
    caught: false,
  };
}

// gap: pixels between the farmer and the turkey. Small gap = danger.
export function farmerGap(farmer, turkey) {
  return turkey.x - farmer.x;
}

export function updateFarmer(farmer, dt, turkey, worldSpeed, hiding, ducking) {
  farmer.runPhase += dt * (7 + worldSpeed / 55);

  if (farmer.state === 'search') {
    farmer.searchTimer -= dt;
    // Paces back and forth, peering into the hay.
    farmer.x += Math.sin(farmer.searchTimer * 6) * 26 * dt;
    if (farmer.searchTimer <= 0) {
      farmer.state = 'chase';
    }
    return;
  }

  if (hiding) {
    // The turkey vanished into the hay: the farmer stops and searches.
    farmer.state = 'search';
    farmer.searchTimer = 1.4;
    return;
  }

  // Ducking along slows the turkey down, so the farmer creeps closer.
  if (ducking && turkey.onGround) {
    farmer.gap = Math.max(60, farmer.gap - 10 * dt);
  }

  // Ease toward the spot his current gap puts him at.
  const target = turkey.x - farmer.gap;
  const step = 220 * dt;
  if (farmer.x < target) farmer.x = Math.min(target, farmer.x + step);
  else farmer.x = Math.max(target, farmer.x - step);

  // If he gets within grabbing range, the run is over.
  if (farmerGap(farmer, turkey) < 60) {
    farmer.state = 'corner';
    farmer.caught = true;
  }
}

// Called when the turkey stumbles: the farmer lunges forward.
export function farmerLunge(farmer, amount) {
  if (farmer.state === 'search') return;
  farmer.gap = Math.max(20, farmer.gap - amount);
}

// Called when the turkey hides successfully: the farmer falls back, fooled.
export function farmerFooled(farmer) {
  farmer.gap = Math.min(260, farmer.gap + 100);
  farmer.state = 'search';
  farmer.searchTimer = 1.4;
}
