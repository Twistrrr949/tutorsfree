// === CONFIGURATION CONSTANTS (Global Scope) ===
// Define the fade duration once. This drives both the CSS transition and the JS delay.
const FADE_DURATION_MS = 300; // 300 milliseconds
const FADE_DURATION_CSS = `${FADE_DURATION_MS / 1000}s`; // Creates "0.3s" for CSS

// --- NEW GLOBAL FLAG ---
// Used to signal the window.beforeunload handler that we are intentionally navigating away.
let manualExitIntent = false;


// === IMMEDIATE EXECUTION: THEME ATTRIBUTE LOAD & CSS INJECTION ===
// This function runs the moment the script is loaded.
(function initializeSetup() {
    // 1. Load Theme Attribute (Flash prevention)
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 2. Inject Dynamic CSS for Overlay Fading and Styling (RESTORED TO YOUR ORIGINAL)
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
        
        /* Basic Switch Styles for Stats Toggle (Ensuring switch visuals work before delayed JS runs) */
        .switch-container.on .switch-thumb {
            transform: translateX(24px);
        }
        .switch-container.on #switch-icon-stats {
            display: none; 
        }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
})();


// === GLOBAL TOGGLE FUNCTIONS (Defined immediately for HTML onclick events to work) ===

window.toggleTabProtection = function() {
    let tabProtectionEnabled = localStorage.getItem('tabProtectionState') === 'true'; 
    tabProtectionEnabled = !tabProtectionEnabled; 
    localStorage.setItem('tabProtectionState', tabProtectionEnabled ? 'true' : 'false');
    document.dispatchEvent(new Event('securityToggle'));
}

window.toggleRedirect = function() {
    let redirectEnabled = localStorage.getItem('redirectToggleState') === 'true' || localStorage.getItem('redirectToggleState') === null;
    redirectEnabled = !redirectEnabled;
    localStorage.setItem('redirectToggleState', redirectEnabled ? 'true' : 'false');
    document.dispatchEvent(new Event('securityToggle'));
}

window.toggleTheme = function() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = (currentTheme === 'light') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.dispatchEvent(new Event('themeToggle'));
}

/**
 * NEW: Toggle function for the Stats visibility.
 */
window.toggleStats = function() {
    // Note: Used the corrected logic for toggleStats from the previous turn, which defaults to OFF.
    const currentState = localStorage.getItem('statsToggleState') === 'true'; 
    const newState = !currentState;
    localStorage.setItem('statsToggleState', newState ? 'true' : 'false');
    document.dispatchEvent(new Event('statsToggle'));
    console.log(`[SETTINGSYNC] Show Stats toggled to: ${newState}`);
};


// === MAIN SETUP LOGIC (Runs 800ms after script load) ===
setTimeout(() => {
    
    // === CONFIGURATION ===
    const STORAGE_KEY_PROTECTION = 'tabProtectionState';
    const STORAGE_KEY_REDIRECT = 'redirectToggleState';
    const STORAGE_KEY_STATS = 'statsToggleState';
    const REDIRECT_DELAY = 65; // Preserving the almost instant redirect delay
    const REDIRECT_URL = "https://www.google.com";

    // === DOM ELEMENTS ===
    
    // Security UI
    const toggleSwitch = document.getElementById('protection-toggle-switch'); 
    const switchIcon = document.getElementById('switch-icon-protection');    
    const statusText = document.getElementById('protection-status');         
    const redirectToggleBtn = document.getElementById('blur-toggle-switch'); 
    const redirectSwitchIcon = document.getElementById('switch-icon-redirect');
    let overlay = document.getElementById('offscreen-overlay');

    // Theme UI
    const themeSwitchContainer = document.getElementById('theme-toggle-switch');
    const themeIcon = document.getElementById('switch-icon-theme'); 
    const themeStatusSpan = document.getElementById('theme-status'); 
    
    // Stats UI (The elements you want to hide/show)
    const statsToggleContainer = document.getElementById('stats-toggle-switch');
    const statsIcon = document.getElementById('switch-icon-stats');
    const infoBtn = document.getElementById('info-btn'); 
    const modal = document.getElementById('performance-modal');
    const fpsValue = document.getElementById('fps-value');
    const pingValue = document.getElementById('ping-value');

    let timeoutHandle = null;

    // --- Create Overlay Element if it doesn't exist ---
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'offscreen-overlay';
        overlay.innerHTML = `
            <div style="text-align: center;">
                <h1>Content Hidden</h1>
                <p>Press **E** to dismiss (fades out)</p>
                <p>Press **Space** to immediately redirect</p>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener('transitionend', handleOverlayTransitionEnd);
    } else {
        overlay.addEventListener('transitionend', handleOverlayTransitionEnd);
    }
    
    // Helper function for the reliable fade-out logic
    function handleOverlayTransitionEnd(event) {
        if (event.propertyName === 'opacity' && overlay.classList.contains('fade-out')) {
            overlay.style.display = 'none';
            overlay.classList.remove('fade-out'); 
        }
    }


    // === UI UPDATE FUNCTIONS (Omitted for brevity, assumed correct) ===
    function updateProtectionUI(isEnabled) { /* ... */ 
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
    function updateRedirectUI(isEnabled) { /* ... */ 
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
    function applyThemeUI(theme) { /* ... */ 
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
    function updateStatsUI(isVisible) { /* ... */ 
        const displayStyle = isVisible ? 'initial' : 'none';
        
        // Apply visibility to stats elements
        if (infoBtn) infoBtn.style.display = displayStyle;
        if (modal) modal.style.display = displayStyle;
        if (fpsValue) fpsValue.style.display = displayStyle;
        if (pingValue) pingValue.style.display = displayStyle;

        // Update the toggle switch visual state
        if (statsToggleContainer) {
            if (isVisible) {
                statsToggleContainer.classList.add('switch-on');
                if (statsIcon) statsIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`; 
            } else {
                statsToggleContainer.classList.remove('switch-on');
                if (statsIcon) statsIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />`; 
            }
        }
    }


    // === CORE OVERLAY LOGIC (Implements Fading) ===
    
    function toggleContentVisibility(showContent) {
        if (!overlay) return;

        if (showContent) {
            // FADE OUT LOGIC
            overlay.classList.add('fade-out');
        } else {
            // SHOW OVERLAY
            overlay.classList.remove('fade-out'); 
            overlay.style.display = 'flex'; 
        }
    }

    function redirect(isKeypress = false) {
        clearTimeout(timeoutHandle);
        
        // FIX: Set the global flag to allow the navigation.
        manualExitIntent = true; 
                window.location.replace(REDIRECT_URL);

    }

    // === EVENT LISTENERS ===

    window.addEventListener('beforeunload', function(e) {
        // FIX: Only prevent if protection is ON AND we did NOT trigger a manual exit (like redirect())
        if (localStorage.getItem(STORAGE_KEY_PROTECTION) === 'true' && !manualExitIntent) { 
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
                toggleContentVisibility(false); // Show overlay (Instant)
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
                redirect(true); // Redirect immediately, which now bypasses beforeunload
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
    
    // Listen for the custom stats toggle event
    document.addEventListener('statsToggle', () => {
        // Note: Used the corrected logic for updateStatsUI that defaults to OFF.
        const statsEnabled = localStorage.getItem(STORAGE_KEY_STATS) === 'true';
        updateStatsUI(statsEnabled);
    });


    // === INITIALIZATION LOGIC (Runs inside setTimeout) ===

    // Corrected to check for 'true' or assume initial state based on your requirements
    const savedProtectionState = localStorage.getItem(STORAGE_KEY_PROTECTION) === 'true'; 
    const savedRedirectState = localStorage.getItem(STORAGE_KEY_REDIRECT) === 'true'; 
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedStatsState = localStorage.getItem(STORAGE_KEY_STATS) === 'true'; // Default is OFF
    
    // Apply initial UI states
    updateProtectionUI(savedProtectionState);
    updateRedirectUI(savedRedirectState);
    applyThemeUI(savedTheme);
    updateStatsUI(savedStatsState);
    
}, 800);
