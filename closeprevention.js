/**
 * settingsync.js
 * * Manages security features and dynamically creates the required overlay element and CSS.
 * * This script should be loaded via <script src="settingsync.js"></script>
 * * FINAL ROBUST VERSION: Uses permanent CSS transition and 'transitionend' for reliable fade-out on 'E'.
 */

(function() {
    // === CONFIGURATION ===
    const STORAGE_KEY_PROTECTION = 'tabProtectionState';
    const STORAGE_KEY_REDIRECT = 'redirectToggleState';
    const REDIRECT_DELAY = 65; 
    const REDIRECT_URL = "https://www.google.com"; 
    const FADE_DURATION_CSS = '0.3s'; // Must match the CSS transition duration below

    let overlay = null;
    let timeoutHandle = null;

    // === SETUP FUNCTIONS ===

    function createOverlayElement() {
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
        
        // Listener to handle the moment the fade-out completes
        overlay.addEventListener('transitionend', handleTransitionEnd);
    }
    
    function handleTransitionEnd(event) {
        // Only run if the opacity transition has completed and the element is currently set to be hidden (opacity 0)
        if (event.propertyName === 'opacity' && overlay.classList.contains('hidden')) {
            // This is the key: only hide the element *after* the fade is done
            overlay.style.display = 'none';
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
                opacity: 1; 
                
                /* CRITICAL: Transition is ALWAYS set in CSS */
                transition: opacity ${FADE_DURATION_CSS} ease-in-out; 
            }
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
    
    function toggleContentVisibility(showContent, isFadeOut = false) {
        if (!overlay) return; 

        if (showContent) {
            // HIDING CONTENT (E key pressed)
            if (isFadeOut) {
                // FADE OUT: Remove the 'display: none' property and start the fade
                overlay.classList.add('hidden'); 
                
                // IMPORTANT: The 'transitionend' listener will set display: 'none' when the fade finishes.
                
            } else {
                // INSTANT HIDE (If somehow needed, used when refocusing)
                 overlay.style.display = 'none';
            }

        } else {
            // SHOWING CONTENT (Tab lost focus/visibility change)
            // INSTANT SHOW:
            
            // 1. Ensure it's instantly visible by removing the hidden class and setting display: flex
            overlay.classList.remove('hidden'); 
            overlay.style.display = 'flex'; 
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
                    // Instant Show
                    toggleContentVisibility(false, false); 
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
            // Must check if it's visible before processing E or Space
            if (overlay && overlay.style.display === 'flex') {
                
                // 'E' key: Dismiss the cover (FADE OUT)
                if (event.key.toUpperCase() === 'E') {
                    // Fade Hide (isFadeOut = true)
                    toggleContentVisibility(true, true); 
                    event.preventDefault();
                }
                
                // 'Space' key: Execute immediate redirect
                if (event.key === ' ') {
                    redirect();
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
