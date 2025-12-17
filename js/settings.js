// === CONFIGURATION CONSTANTS (Global Scope) ===
const FADE_DURATION_MS = 300; // 300 milliseconds
const FADE_DURATION_CSS = `${FADE_DURATION_MS / 1000}s`; // Creates "0.3s" for CSS

// --- GLOBAL FLAG ---
let manualExitIntent = false;
let blankWindow = null; // Kept as a declaration, but unused for action here
let isInitialLoad = true; // <<< NEW FLAG: Tracks if the script is loading for the first time


// === IMMEDIATE EXECUTION: THEME ATTRIBUTE LOAD & CSS INJECTION ===
(function initializeSetup() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const css = `
        /* Overlay Base Styles */
        #offscreen-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background-color: white; z-index: 99999; display: none;
            flex-direction: column; justify-content: center; align-items: center;
            color: black; font-family: sans-serif; opacity: 1;
            transition: opacity ${FADE_DURATION_CSS} ease-in-out;
        }
        #offscreen-overlay.fade-out { opacity: 0 !important; }

    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
})();


// === GLOBAL TOGGLE FUNCTIONS (Defined immediately for HTML onclick events to work) ===

window.toggleTabProtection = function() {
    let tabProtectionEnabled = localStorage.getItem('tabProtectionState') !== 'false'; 
    tabProtectionEnabled = !tabProtectionEnabled; 
    localStorage.setItem('tabProtectionState', tabProtectionEnabled ? 'true' : 'false');
    document.dispatchEvent(new Event('securityToggle'));
}

window.toggleRedirect = function() {
    let redirectEnabled = localStorage.getItem('redirectToggleState') === 'true'; 
    redirectEnabled = !redirectEnabled;
    localStorage.setItem('redirectToggleState', redirectEnabled ? 'true' : 'false');
    document.dispatchEvent(new Event('securityToggle'));
}

window.toggleOverlay = function() {
    // Default state: ON (visible overlay) unless explicitly set to 'false'
    let overlayEnabled = localStorage.getItem('overlayToggleState') !== 'false';
    overlayEnabled = !overlayEnabled;
    localStorage.setItem('overlayToggleState', overlayEnabled ? 'true' : 'false');
    document.dispatchEvent(new Event('securityToggle'));
}

// NEW FUNCTION: Toggle for the separate About:Blank Popup (ONLY sets localStorage)
window.toggleAboutBlankPopup = function() {
let popupEnabled = localStorage.getItem('aboutBlankPopupState') !== 'false';
    popupEnabled = !popupEnabled;
    
    // Sets local storage item to 'true' or 'false'
    localStorage.setItem('aboutBlankPopupState', popupEnabled ? 'true' : 'false');
    // <<< NEW: Set the flag to false before dispatching, signaling a user-initiated change
    isInitialLoad = false; 
    document.dispatchEvent(new Event('securityToggle'));
}


window.toggleTheme = function() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = (currentTheme === 'light') ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.dispatchEvent(new Event('themeToggle'));
}

window.toggleStats = function() {
    const currentState = localStorage.getItem('statsToggleState') === 'true'; 
    const newState = !currentState;
    localStorage.setItem('statsToggleState', newState ? 'true' : 'false');
    document.dispatchEvent(new Event('statsToggle'));
    console.log(`[SETTINGSYNC] Show Stats toggled to: ${newState}`);
};

window.addEventListener('load', () => {

// === MAIN SETUP LOGIC (Runs 700ms after script load) ===
setTimeout(() => {
    
    // === CONFIGURATION ===
    const STORAGE_KEY_PROTECTION = 'tabProtectionState';
    const STORAGE_KEY_REDIRECT = 'redirectToggleState';
    const STORAGE_KEY_OVERLAY = 'overlayToggleState';
    const STORAGE_KEY_ABOUT_BLANK = 'aboutBlankPopupState'; 
    const STORAGE_KEY_STATS = 'statsToggleState';
    const REDIRECT_DELAY = 65; 
    const REDIRECT_URL = localStorage.getItem('LINKTAB_KEY');
    const REDIRECT_URL_fallback = 'https://google.com/'

    // === DOM ELEMENTS ===
    // Security UI
    const toggleSwitch = document.getElementById('protection-toggle-switch'); 
    const switchIcon = document.getElementById('switch-icon-protection');    
    const statusText = document.getElementById('protection-status');         
    const redirectToggleBtn = document.getElementById('blur-toggle-switch'); 
    const redirectSwitchIcon = document.getElementById('switch-icon-redirect');
    let overlay = document.getElementById('offscreen-overlay');
    
    // Overlay/Popup UI
    const overlayOptionContainer = document.getElementById('overlay-option-container'); // Container to hide/show
    const overlayToggleSwitch = document.getElementById('overlay-toggle-switch');
    const overlaySwitchIcon = document.getElementById('switch-icon-overlay');
    
    // ABOUT BLANK UI ELEMENTS
    const aboutBlankToggleSwitch = document.getElementById('about-blank-toggle-switch');
    const aboutBlankSwitchIcon = document.getElementById('switch-icon-about-blank');
    
    // Theme UI
    const themeSwitchContainer = document.getElementById('theme-toggle-switch');
    const themeIcon = document.getElementById('switch-icon-theme'); 
    const themeStatusSpan = document.getElementById('theme-status'); 
    
    // Stats UI
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
        overlay.innerHTML = `<div></div>`;
        document.body.appendChild(overlay);
        overlay.addEventListener('transitionend', handleOverlayTransitionEnd);
    } else {
        overlay.addEventListener('transitionend', handleOverlayTransitionEnd);
    }
    
    function handleOverlayTransitionEnd(event) {
        if (event.propertyName === 'opacity' && overlay.classList.contains('fade-out')) {
            overlay.style.display = 'none';
            overlay.classList.remove('fade-out'); 
        }
    }


    // === UI UPDATE FUNCTIONS ===
    
    function updateProtectionUI(isEnabled) { 

        if (isEnabled) {
            localStorage.setItem(STORAGE_KEY_PROTECTION, 'true'); // may fix errors
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
    
    function updateOverlayUI(isEnabled) { 
        if (!overlayToggleSwitch) return;
        if (isEnabled) {
            overlayToggleSwitch.classList.add('switch-on');
            if(overlaySwitchIcon) overlaySwitchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.879 16.121A10.05 10.05 0 0112 15c4.477 0 8.268-2.943 9.542-7-1.274-4.057-5.065-7-9.542-7a9.97 9.97 0 00-2.31 1.708m-1.72-1.72l-1.81 1.81M14.25 18.75l-1.72-1.72M5.25 5.25l1.81 1.81M18.75 18.75l-1.81-1.81" />`;

        } else {
            overlayToggleSwitch.classList.remove('switch-on');
            if(overlaySwitchIcon) overlaySwitchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />`;
        }
    }
    
    // UI UPDATE FUNCTION FOR ABOUT BLANK
    function updateAboutBlankUI(isEnabled) { 
        if (!aboutBlankToggleSwitch) return;
        
        if (isEnabled) {
            aboutBlankToggleSwitch.classList.add('switch-on');
                localStorage.setItem('aboutBlankPopupState', 'true');
            if(aboutBlankSwitchIcon) aboutBlankSwitchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
        } else {
            aboutBlankToggleSwitch.classList.remove('switch-on');
            if(aboutBlankSwitchIcon) aboutBlankSwitchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />`;
                            localStorage.setItem('aboutBlankPopupState', 'false');

            // <<< CHANGE: Only show modal if it's NOT the initial page load
            if (!isInitialLoad) { 
                 showModal("I wouldn't recommend turning this option off since 'GoGuardian' can see your tabs and this can popup in history, if you want, you can enable it back.");
            }
        }
    }


    function applyThemeUI(theme) { 
        if (theme === 'dark') {
            if (themeSwitchContainer) themeSwitchContainer.classList.add('switch-on');
            if (themeIcon) themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`;

            if (themeStatusSpan) themeStatusSpan.textContent = 'Dark Mode';
        } else {
            if (themeSwitchContainer) themeSwitchContainer.classList.remove('switch-on');
            if (themeIcon) themeIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />`;

            if (themeStatusSpan) themeStatusSpan.textContent = 'Light Mode';
        }
    }

    function updateStatsUI(isVisible) { 
        const displayStyle = isVisible ? 'initial' : 'none';
        if (infoBtn) infoBtn.style.display = displayStyle;
        if (modal) modal.style.display = displayStyle;
        if (fpsValue) fpsValue.style.display = displayStyle;
        if (pingValue) pingValue.style.display = displayStyle;

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


    // === CORE LOGIC (Functions kept but execution removed from visibilitychange) ===
    
    function toggleContentVisibility(showContent) {
        if (!overlay) return;

        if (showContent) {
            overlay.classList.add('fade-out');
        } else {
            overlay.classList.remove('fade-out'); 
            overlay.style.display = 'flex'; 
        }
    }
    
    // Function for redirect (kept but not executed in visibilitychange)
    function redirect(isKeypress = false) {
        clearTimeout(timeoutHandle);
        manualExitIntent = true; 
        if(REDIRECT_URL){
            window.location.replace(REDIRECT_URL);
        }else{
            window.location.replace(REDIRECT_URL_fallback);
        }
    }

    // === EVENT LISTENERS (Stripped of external action logic) ===

    window.addEventListener('beforeunload', function(e) {
        if (localStorage.getItem(STORAGE_KEY_PROTECTION) === 'true' && !manualExitIntent) { 
            e.preventDefault(); 
            e.returnValue = ''; 
        }
    });

    document.addEventListener('visibilitychange', () => {
        const redirectEnabled = localStorage.getItem(STORAGE_KEY_REDIRECT) === 'true'; 
        const overlayEnabled = localStorage.getItem(STORAGE_KEY_OVERLAY) !== 'false';
        
        // **NO ACTIONS FOR redirectEnabled OR aboutBlankPopupState are executed here.**

        if (document.visibilityState === 'hidden') {
            if (redirectEnabled) {
                // Your external script handles redirect/popup based on storage keys. 
                // We ensure the timeout handle is set for manual clearing on focus.
                timeoutHandle = setTimeout(() => { /* do nothing, external script runs action */ }, REDIRECT_DELAY);
            } else if (overlayEnabled) {
                // Only the local overlay is handled here if redirect is off.
                toggleContentVisibility(false); 
            } else {
                // Do nothing (stealth bypass)
            }
        } else {
            // Tab is visible/focused again
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
            // No cleanup for about:blank here, as your external script controls it.
        }
    });

    window.addEventListener('focus', function () {
        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
            timeoutHandle = null;
        }
    });

    document.addEventListener('keydown', (event) => {
        if (overlay && overlay.style.display === 'flex') {
            if (event.key.toUpperCase() === 'E') {
                toggleContentVisibility(true);
                event.preventDefault();
            }
            if (event.key === ' ') {
                redirect(true); // Manually trigger redirect on space bar
                event.preventDefault();
            }
        }
    });
    
    // Listen for custom events triggered by the global toggle functions to update the UI
    document.addEventListener('securityToggle', () => {
        const protEnabled = localStorage.getItem(STORAGE_KEY_PROTECTION) !== 'false';
        const redirEnabled = localStorage.getItem(STORAGE_KEY_REDIRECT) === 'true';
        const overlayEnabled = localStorage.getItem(STORAGE_KEY_OVERLAY) !== 'false';
        const savedAboutBlankState = localStorage.getItem(STORAGE_KEY_ABOUT_BLANK) !== 'false'; 

        updateProtectionUI(protEnabled);
        updateRedirectUI(redirEnabled);
        updateOverlayUI(overlayEnabled);
        updateAboutBlankUI(savedAboutBlankState); 
        
        // After any toggle event is processed, we ensure the initial load flag is set to false
        isInitialLoad = false;

        // Control the visibility of the Overlay option
        if (overlayOptionContainer) {
            overlayOptionContainer.style.display = redirEnabled ? 'none' : 'flex';
        }
    });
    
    document.addEventListener('themeToggle', () => {
        const theme = localStorage.getItem('theme') || 'light';
        applyThemeUI(theme);
    });
    
    document.addEventListener('statsToggle', () => {
        const statsEnabled = localStorage.getItem(STORAGE_KEY_STATS) === 'true';
        updateStatsUI(statsEnabled);
    });


    // === INITIALIZATION LOGIC (Runs inside setTimeout) ===

    const savedProtectionState = localStorage.getItem(STORAGE_KEY_PROTECTION) !== 'false'; 
    const savedRedirectState = localStorage.getItem(STORAGE_KEY_REDIRECT) === 'true'; 
    const savedOverlayState = localStorage.getItem(STORAGE_KEY_OVERLAY) !== 'false';
    const savedAboutBlankState = localStorage.getItem(STORAGE_KEY_ABOUT_BLANK) !== 'false'; 
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedStatsState = localStorage.getItem(STORAGE_KEY_STATS) === 'true'; 
    
    // Apply initial UI states
    updateProtectionUI(savedProtectionState);
    updateRedirectUI(savedRedirectState);
    updateOverlayUI(savedOverlayState);
    updateAboutBlankUI(savedAboutBlankState);
    applyThemeUI(savedTheme);
    updateStatsUI(savedStatsState);

    // Initial check for Overlay option visibility
    if (overlayOptionContainer) {
        overlayOptionContainer.style.display = savedRedirectState ? 'none' : 'flex';
    }
    
    // <<< NEW: After all initial UI updates are done, set the flag to false.
    // Subsequent calls to updateAboutBlankUI will be considered user-initiated.
    setTimeout(() => {
        isInitialLoad = false;
    }, 1200); // Wait slightly longer than the main timeout (1000ms) to ensure all initial UI rendering is complete.
    
}, 1000);
});
