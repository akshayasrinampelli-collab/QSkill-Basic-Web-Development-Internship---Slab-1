/**
 * AETHER PORTAL INTERACTIVE SCRIPT
 * Handles Canvas Particle Background, Form Validations, and Loading Animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleBackground();
  initFormValidation();
});

/* ==========================================================================
   1. CANVAS PARTICLE BACKGROUND
   ========================================================================== */
function initParticleBackground() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particlesArray = [];
  const particleCount = 75; // Balanced for style & CPU performance
  const connectionDistance = 110;
  
  // Track mouse coordinates
  const mouse = {
    x: null,
    y: null,
    radius: 150 // Connection radius for mouse hover
  };

  // Track mouse movements on window (pointer-events: none on canvas)
  window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Handle Resize
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }
  window.addEventListener('resize', resizeCanvas);
  
  // Setup initial viewport size
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Particle Blueprint
  class Particle {
    constructor(x, y, directionX, directionY, size, color) {
      this.x = x;
      this.y = y;
      this.directionX = directionX;
      this.directionY = directionY;
      this.size = size;
      this.color = color;
    }

    // Render single particle
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.fill();
    }

    // Keep particles moving and handle boundaries
    update() {
      // Boundary collision check
      if (this.x > canvas.width || this.x < 0) {
        this.directionX = -this.directionX;
      }
      if (this.y > canvas.height || this.y < 0) {
        this.directionY = -this.directionY;
      }

      // Check mouse collision / interactivity (subtle draw toward mouse)
      if (mouse.x !== null && mouse.y !== null) {
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          // Slow drag towards mouse coordinates
          this.x += (dx / 40);
          this.y += (dy / 40);
        }
      }

      // Move particle
      this.x += this.directionX;
      this.y += this.directionY;
      
      this.draw();
    }
  }

  // Generate Particle Array
  function initParticles() {
    particlesArray = [];
    // Adjust particle count for mobile screens to optimize performance
    const dynamicCount = window.innerWidth < 768 ? Math.floor(particleCount / 2) : particleCount;

    for (let i = 0; i < dynamicCount; i++) {
      let size = (Math.random() * 2.5) + 1; // 1px to 3.5px size
      let x = (Math.random() * (window.innerWidth - size * 2) + size * 2);
      let y = (Math.random() * (window.innerHeight - size * 2) + size * 2);
      let directionX = (Math.random() * 0.4) - 0.2; // slow drift speed
      let directionY = (Math.random() * 0.4) - 0.2;
      
      // Cyber colors: glow cyan and purple particles
      let color = i % 2 === 0 ? 'rgba(0, 206, 201, 0.45)' : 'rgba(108, 92, 231, 0.45)';

      particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
  }

  // Draw lines connecting close particles
  function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        let dx = particlesArray[a].x - particlesArray[b].x;
        let dy = particlesArray[a].y - particlesArray[b].y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          opacityValue = 1 - (distance / connectionDistance);
          // Fade connection lines out based on distance
          ctx.strokeStyle = `rgba(142, 144, 166, ${opacityValue * 0.15})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }

      // Connect particles to mouse
      if (mouse.x !== null && mouse.y !== null) {
        let dx = particlesArray[a].x - mouse.x;
        let dy = particlesArray[a].y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius) {
          opacityValue = 1 - (distance / mouse.radius);
          ctx.strokeStyle = `rgba(0, 206, 201, ${opacityValue * 0.25})`; // cyan hover thread
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
  }

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
    }
    connect();
  }

  initParticles();
  animate();
}

/* ==========================================================================
   2. FORM VALIDATION & INTERACTIVITY
   ========================================================================== */
function initFormValidation() {
  const form = document.getElementById('login-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const passwordToggle = document.getElementById('password-toggle');
  
  const submitBtn = document.getElementById('submit-btn');
  const btnText = submitBtn.querySelector('.btn-text');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');

  // Regex rules
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_]{3,}$/; // Alphanumeric, min 3 chars

  // Track if fields have been interacted with (dirty state)
  const formState = {
    usernameTouched: false,
    passwordTouched: false
  };

  // Show/Hide Password Toggle
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      
      // Toggle accessibility and SVGs
      passwordToggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      
      const eyeShow = passwordToggle.querySelector('.eye-icon-show');
      const eyeHide = passwordToggle.querySelector('.eye-icon-hide');
      
      if (eyeShow && eyeHide) {
        eyeShow.classList.toggle('hidden');
        eyeHide.classList.toggle('hidden');
      }
      
      // Maintain focus inside the password input
      passwordInput.focus();
    });
  }

  // Real-time Field Validation Listeners
  usernameInput.addEventListener('input', () => {
    formState.usernameTouched = true;
    validateUsernameField(false);
  });
  
  usernameInput.addEventListener('blur', () => {
    formState.usernameTouched = true;
    validateUsernameField(true);
  });

  passwordInput.addEventListener('input', () => {
    formState.passwordTouched = true;
    validatePasswordField(false);
  });

  passwordInput.addEventListener('blur', () => {
    formState.passwordTouched = true;
    validatePasswordField(true);
  });

  /**
   * Username / Email Validator
   * @param {boolean} forceShowErrors Whether to display invalid borders immediately
   */
  function validateUsernameField(forceShowErrors = false) {
    const val = usernameInput.value.trim();
    const errorEl = document.getElementById('username-error');
    let isValid = true;
    let message = '';

    if (val === '') {
      isValid = false;
      message = 'Username or Email is required.';
    } else if (val.includes('@')) {
      // Validate email format
      if (!emailRegex.test(val)) {
        isValid = false;
        message = 'Please enter a valid email address.';
      }
    } else {
      // Validate username format
      if (!usernameRegex.test(val)) {
        isValid = false;
        message = 'Must be at least 3 characters & alphanumeric (a-z, 0-9).';
      }
    }

    // Apply UI classes based on check
    updateFieldUI(usernameInput, errorEl, isValid, message, forceShowErrors || formState.usernameTouched);
    return isValid;
  }

  /**
   * Password Strengths Validator
   */
  function validatePasswordField(forceShowErrors = false) {
    const val = passwordInput.value;
    const errorEl = document.getElementById('password-error');
    let isValid = true;
    let errors = [];

    if (val === '') {
      isValid = false;
      errors.push('Password is required.');
    } else {
      if (val.length < 8) {
        errors.push('8+ characters');
      }
      if (!/[A-Z]/.test(val)) {
        errors.push('1 uppercase');
      }
      if (!/[a-z]/.test(val)) {
        errors.push('1 lowercase');
      }
      if (!/[0-9]/.test(val)) {
        errors.push('1 number');
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) {
        errors.push('1 special char');
      }
    }

    if (errors.length > 0) {
      isValid = false;
    }

    const message = isValid ? '' : 'Requires: ' + errors.join(', ');
    updateFieldUI(passwordInput, errorEl, isValid, message, forceShowErrors || formState.passwordTouched);
    return isValid;
  }

  /**
   * Set CSS validation classes and text display
   */
  function updateFieldUI(inputEl, errorEl, isValid, message, showErrors) {
    if (!showErrors) {
      // Neutral state if not touched yet
      inputEl.classList.remove('valid', 'invalid');
      errorEl.classList.remove('active');
      inputEl.setAttribute('aria-invalid', 'false');
      return;
    }

    if (isValid) {
      inputEl.classList.remove('invalid');
      inputEl.classList.add('valid');
      errorEl.classList.remove('active');
      inputEl.setAttribute('aria-invalid', 'false');
    } else {
      inputEl.classList.remove('valid');
      inputEl.classList.add('invalid');
      errorEl.textContent = message;
      errorEl.classList.add('active');
      inputEl.setAttribute('aria-invalid', 'true');
    }
  }

  // Handle Form Submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Force touch state on both fields to trigger validation visuals
    formState.usernameTouched = true;
    formState.passwordTouched = true;

    const isUsernameValid = validateUsernameField(true);
    const isPasswordValid = validatePasswordField(true);

    if (!isUsernameValid || !isPasswordValid) {
      alert('Please fix all errors before submitting.');
      
      // Focus on the first invalid field for keyboard accessibility
      if (!isUsernameValid) {
        usernameInput.focus();
      } else if (!isPasswordValid) {
        passwordInput.focus();
      }
      return;
    }

    // SUCCESS - ENTER LOADING STATE
    enterLoadingState();

    // Mock delay (e.g. server communication latency)
    setTimeout(() => {
      exitLoadingState();
      alert('Login Successful!');
      
      // Clear inputs and state
      form.reset();
      formState.usernameTouched = false;
      formState.passwordTouched = false;
      usernameInput.classList.remove('valid', 'invalid');
      passwordInput.classList.remove('valid', 'invalid');
    }, 1500);
  });

  // Toggle Loading Mode UI
  function enterLoadingState() {
    submitBtn.disabled = true;
    usernameInput.disabled = true;
    passwordInput.disabled = true;
    if (passwordToggle) passwordToggle.disabled = true;

    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
  }

  function exitLoadingState() {
    submitBtn.disabled = false;
    usernameInput.disabled = false;
    passwordInput.disabled = false;
    if (passwordToggle) passwordToggle.disabled = false;

    btnText.classList.remove('hidden');
    btnSpinner.classList.add('hidden');
  }
}
