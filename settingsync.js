/**
 * settingsync.js
 * * Manages security features and dynamically creates the required overlay element and CSS.
 * * This script should be loaded via <script src="settingsync.js"></script>
 * * REVISED: Refined toggleContentVisibility using requestAnimationFrame for reliable fading.
 */

(function() {
    // === CONFIGURATION ===
    const STORAGE_KEY_PROTECTION = 'tabProtectionState';
    const STORAGE_KEY_REDIRECT = 'redirectToggleState';
    const REDIRECT_DELAY = 65; // Delay for redirect on tab loss (in milliseconds)
    const REDIRECT_URL = "https://www.google.com"; // <-- CHANGE THIS URL

    let overlay = null;
    let timeoutHandle = null;

    // === SETUP FUNCTIONS (Runs first to create necessary DOM elements and styles) ===

    function createOverlayElement() {
        // Create the overlay div if it doesn't exist
        overlay = document.getElementById('overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'overlay';
            overlay.innerHTML = `
                <div style="text-align: center;">

                </div>
            `;
            document.body.appendChild(overlay);
        }
    }

    function injectOverlayCSS() {
        const css = `
            #overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: white; 
                z-index: 99999;
                display: none;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                color: black;
                font-family: sans-serif;
                
                /* --- MODIFIED CSS FOR FADE EFFECT --- */
                opacity: 1; 
                transition: opacity 0.3s ease-in-out; /* Transition effect */
            }
            /* The 'hidden' class controls the opacity for the fade */
            #overlay.hidden {
                opacity: 0; 
                pointer-events: none;
            }
            #overlay h1 {
                font-size: 2em;
                margin-bottom: 0.5em;
            }
        `;
        const style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    // === CORE SECURITY LOGIC ===
    
    function toggleContentVisibility(showContent) {
        if (!overlay) return; 

        if (showContent) {
            // FADE OUT: 
            overlay.classList.add('hidden'); // Start transition to opacity 0
            
            // Wait for the transition to finish before setting display: 'none'
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300); // 300ms matches the CSS transition time
            
        } else {
            // FADE IN:
            // 1. Prepare: Set display to 'flex' so it's in the DOM, but keep opacity 0 via 'hidden' class
            overlay.classList.add('hidden');
            overlay.style.display = 'flex'; 
            
            // 2. Use requestAnimationFrame to ensure the browser has rendered 'display: flex'
            requestAnimationFrame(() => {
                // 3. Remove 'hidden' class, allowing opacity to transition from 0 to 1
                overlay.classList.remove('hidden'); 
            });
        }
    }

    function redirect() {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        window.location.replace(REDIRECT_URL); 
    }

    // === EVENT LISTENERS ===

    function initializeListeners() {
        // 1. Tab Close Prevention Listener (onbeforeunload)
        window.addEventListener('beforeunload', function(e) {
            const tabProtectionEnabled = localStorage.getItem(STORAGE_KEY_PROTECTION) === 'true';

            if (tabProtectionEnabled) { 
                e.preventDefault(); 
                e.returnValue = '';
            }
        });

        // 2. Redirect/Overlay Listener (visibilitychange)
        document.addEventListener('visibilitychange', () => {
            const redirectEnabled = localStorage.getItem(STORAGE_KEY_REDIRECT) === 'true' || localStorage.getItem(STORAGE_KEY_REDIRECT) === null;

            if (document.visibilityState === 'hidden') {
                if (redirectEnabled) {
                    timeoutHandle = setTimeout(redirect, REDIRECT_DELAY);
                } else {
                    toggleContentVisibility(false); // Show overlay (Fade In)
                }
            } else {
                if (timeoutHandle) {
                    clearTimeout(timeoutHandle);
                    timeoutHandle = null;
                }
            }
        });

        // 3. Additional listener to clear redirect if focus is regained
        window.addEventListener('focus', function () {
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                timeoutHandle = null;
            }
        });
        
        // 4. Keypress Listener for 'E' and 'Space'
        document.addEventListener('keydown', (event) => {
            if (overlay && overlay.style.display === 'flex') {
                
                // 'E' key: Dismiss the cover (show content)
                if (event.key.toUpperCase() === 'E') {
                    toggleContentVisibility(true); // Hides the overlay with fade
                    event.preventDefault();
                }
                
                // 'Space' key: Execute immediate redirect
                
                if (event.key === ' ') {
                    redirect(); // Executes immediate redirect
                    event.preventDefault();
                }
            }
        });
    }

    // === ENTRY POINT ===
    document.addEventListener('DOMContentLoaded', () => {
        injectOverlayCSS();
        createOverlayElement();
        initializeListeners();

        console.log('[SETTINGSYNC] Security script is fully active and monitoring.');
    });
    
})();
