// === CONFIGURATION CONSTANTS (Global Scope) ===
// Define the fade duration once. This drives both the CSS transition and the JS delay.
const FADE_DURATION_MS = 300; // 400 milliseconds
const FADE_DURATION_CSS = `${FADE_DURATION_MS / 1000}s`; // Creates "0.4s" for CSS

// === IMMEDIATE EXECUTION: THEME ATTRIBUTE LOAD & CSS INJECTION ===
// This function runs the moment the script is loaded.
(function initializeSetup() {
    // 1. Load Theme Attribute (Flash prevention)
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 2. Inject Dynamic CSS for Overlay Fading and Styling
    const css = `
        /* Overlay Base Styles (Dynamically created, no external CSS file needed for this feature) */
        #offscreen-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: white; /* Customize your background */
            z-index: 99999;
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: black;
            font-family: sans-serif;
            opacity: 1; /* Default visibility */
            /* Inject the dynamic transition property here */
            transition: opacity ${FADE_DURATION_CSS} ease-in-out;
        }
        /* Class used by JS to start the fade-out */
        #offscreen-overlay.fade-out {
            opacity: 0 !important;
        }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
})();


// === GLOBAL TOGGLE FUNCTIONS (Defined immediately for HTML onclick events to work) ===
// These functions only update localStorage and trigger a custom event.

window.toggleTabProtection = function() {
    let tabProtectionEnabled = localStorage.getItem('tabProtectionState') === 'true'; 
    tabProtectionEnabled = !tabProtectionEnabled; 
    localStorage.setItem('tabProtectionState', tabProtectionEnabled);
    document.dispatchEvent(new Event('securityToggle')); // Notify delayed block to update UI
}

window.toggleRedirect = function() {
    let redirectEnabled = localStorage.getItem('redirectToggleState') === 'true' || localStorage.getItem('redirectToggleState') === null;
    redirectEnabled = !redirectEnabled;
    localStorage.setItem('redirectToggleState', redirectEnabled);
    document.dispatchEvent(new Event('securityToggle')); // Notify delayed block to update UI
}

window.toggleTheme = function() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = (currentTheme === 'light') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme); // Update attribute instantly
    document.dispatchEvent(new Event('themeToggle')); // Notify delayed block to update UI
}


// === MAIN SETUP LOGIC (Runs 800ms after script load) ===
setTimeout(() => {
    
    // === CONFIGURATION ===
    const STORAGE_KEY_PROTECTION = 'tabProtectionState';
    const STORAGE_KEY_REDIRECT = 'redirectToggleState';
    const REDIRECT_DELAY = 65;
    const REDIRECT_URL = "https://www.google.com"; // Your desired redirect location

    // === DOM ELEMENTS ===
    
    // Security UI
    const toggleSwitch = document.getElementById('protection-toggle-switch'); 
    const switchIcon = document.getElementById('switch-icon-protection');    
    const statusText = document.getElementById('protection-status');         
    const redirectToggleBtn = document.getElementById('blur-toggle-switch'); 
    const redirectSwitchIcon = document.getElementById('switch-icon-redirect');
    let overlay = document.getElementById('offscreen-overlay'); // Get reference

    // Theme UI
    const themeSwitchContainer = document.getElementById('theme-toggle-switch');
    const themeIcon = document.getElementById('switch-icon-theme'); 
    const themeStatusSpan = document.getElementById('theme-status'); 

    let timeoutHandle = null;

    // --- Create Overlay Element if it doesn't exist ---
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'offscreen-overlay';
        overlay.innerHTML = `
            <div style="text-align: center;">
                <h1>Access Halted</h1>
                <p style="margin-top: 10px;">Press **E** to continue or **SPACE** to redirect.</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // === UI UPDATE FUNCTIONS ===

    function updateProtectionUI(isEnabled) {
        // ... (Protection UI update logic) ...
        if (isEnabled) {
            const closepreventionwarning = 'closepreventionwarning'; 
            if (localStorage.getItem(closepreventionwarning) === null) {
                localStorage.setItem(closepreventionwarning, 'true');
            }
            if(toggleSwitch) toggleSwitch.classList.add('switch-on');
            if(switchIcon) switchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
            if(switchIcon) switchIcon.classList.add('text-white');
            if(switchIcon) switchIcon.classList.remove('text-[#bdc3c7]');
            if(statusText) statusText.textContent = 'ACTIVE';
            if(statusText) statusText.classList.add('text-[#3498db]'); 
            if(statusText) statusText.classList.remove('text-white/80');
        } else {
            if(toggleSwitch) toggleSwitch.classList.remove('switch-on');
            if(switchIcon) switchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />`;
            if(switchIcon) switchIcon.classList.remove('text-white');
            if(switchIcon) switchIcon.classList.add('text-[#bdc3c7]');
            if(statusText) statusText.textContent = 'DISABLED';
            if(statusText) statusText.classList.remove('text-[#3498db]');
            if(statusText) statusText.classList.add('text-white/80');
        }
    }

    function updateRedirectUI(isEnabled) {
        // ... (Redirect UI update logic) ...
        if (!redirectToggleBtn) return;
        if (isEnabled) {
            redirectToggleBtn.classList.add('switch-on');
            if(redirectSwitchIcon) redirectSwitchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
            if(redirectSwitchIcon) redirectSwitchIcon.classList.add('text-white');
            if(redirectSwitchIcon) redirectSwitchIcon.classList.remove('text-[#bdc3c7]');
        } else {
            redirectToggleBtn.classList.remove('switch-on');
            if(redirectSwitchIcon) redirectSwitchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />`;
            if(redirectSwitchIcon) redirectSwitchIcon.classList.remove('text-white');
            if(redirectSwitchIcon) redirectSwitchIcon.classList.add('text-[#bdc3c7]');
        }
    }

    function applyThemeUI(theme) {
        // ... (Theme UI update logic) ...
        if (theme === 'dark') {
            if (themeSwitchContainer) themeSwitchContainer.classList.add('switch-on');
            if (themeIcon) themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />`;
            if (themeStatusSpan) themeStatusSpan.textContent = 'Dark Mode';
        } else {
            if (themeSwitchContainer) themeSwitchContainer.classList.remove('switch-on');
            if (themeIcon) themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`;
            if (themeStatusSpan) themeStatusSpan.textContent = 'Light Mode';
        }
    }

    // === CORE OVERLAY LOGIC (Implements Fading) ===
    
    function toggleContentVisibility(showContent) {
        if (!overlay) return;

        if (showContent) {
            // FADE OUT LOGIC: Trigger CSS transition, then hide after delay
            overlay.classList.add('fade-out');
            
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.classList.remove('fade-out'); // Reset class for next show
            }, FADE_DURATION_MS); // Use the global constant for synchronization

        } else {
            // SHOW OVERLAY: Instant display (no transition on show)
            overlay.classList.remove('fade-out'); 
            overlay.style.display = 'flex'; 
        }
    }

    function redirect(isKeypress = false) {
        clearTimeout(timeoutHandle);
        
        // Temporarily disable tab protection before redirecting if it was enabled.
        if (isKeypress || localStorage.getItem(STORAGE_KEY_PROTECTION) === 'true') {
            localStorage.setItem(STORAGE_KEY_PROTECTION, 'false');
            updateProtectionUI(false); 
        }
        
        window.location.replace(REDIRECT_URL);
    }

    // === EVENT LISTENERS ===

    window.addEventListener('beforeunload', function(e) {
        if (localStorage.getItem(STORAGE_KEY_PROTECTION) === 'true') { 
            e.preventDefault(); 
            e.returnValue = ''; 
        }
    });

    document.addEventListener('visibilitychange', () => {
        const redirectEnabled = localStorage.getItem(STORAGE_KEY_REDIRECT) === 'true' || localStorage.getItem(STORAGE_KEY_REDIRECT) === null;

        if (document.visibilityState === 'hidden') {
            if (redirectEnabled) {
                timeoutHandle = setTimeout(redirect, REDIRECT_DELAY);
            } else {
                toggleContentVisibility(false); // Show overlay
            }
        } else {
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
        }
    });

    window.addEventListener('focus', function () {
        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
            timeoutHandle = null;
        }
    });

    document.addEventListener('keydown', (event) => {
        // Check if overlay is currently visible
        if (overlay && overlay.style.display === 'flex') {
            if (event.key.toUpperCase() === 'E') {
                toggleContentVisibility(true); // Hide overlay (starts fade-out)
                event.preventDefault();
            }
            if (event.key === ' ') {
                redirect(true); // Redirect immediately (disables protection)
                event.preventDefault();
            }
        }
    });
    
    // Listen for custom events triggered by the global toggle functions to update the UI
    document.addEventListener('securityToggle', () => {
        const protEnabled = localStorage.getItem(STORAGE_KEY_PROTECTION) === 'true';
        const redirEnabled = localStorage.getItem(STORAGE_KEY_REDIRECT) === 'true' || localStorage.getItem(STORAGE_KEY_REDIRECT) === null;
        updateProtectionUI(protEnabled);
        updateRedirectUI(redirEnabled);
    });
    
    document.addEventListener('themeToggle', () => {
        const theme = localStorage.getItem('theme') || 'light';
        applyThemeUI(theme);
    });


    // === INITIALIZATION LOGIC (Runs inside setTimeout) ===

    const savedProtectionState = localStorage.getItem(STORAGE_KEY_PROTECTION) === 'true'; 
    const savedRedirectState = localStorage.getItem(STORAGE_KEY_REDIRECT) === 'true' || localStorage.getItem(STORAGE_KEY_REDIRECT) === null; 
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Apply initial UI states
    updateProtectionUI(savedProtectionState);
    updateRedirectUI(savedRedirectState);
    applyThemeUI(savedTheme);
    
}, 800);
