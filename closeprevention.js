// === JAVASCRIPT LOGIC ===

// Key for localStorage
const STORAGE_KEY = 'tabProtectionState';

// State variable to track whether tab protection is active
let tabProtectionEnabled = false;

// DOM elements
const toggleSwitch = document.getElementById('toggle-switch');
const switchIcon = document.getElementById('switch-icon');
const statusText = document.getElementById('protection-status');

/**
 * Updates the visual appearance of the toggle switch and status text.
 */
function updateUI() {
    if (tabProtectionEnabled) {
        // Enable state (ON)
        const closepreventionwarning = 'closepreventionwarning'; 
        if (localStorage.getItem(closepreventionwarning) === null) {
            // Note: Replace with your actual showModal if needed
            // alert('NOTE: If redirect is on, it will still redirect, it will not prevent manual closing.');
            localStorage.setItem(closepreventionwarning, 'true');
        }

        toggleSwitch.classList.add('switch-on');
        switchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />`;
        switchIcon.classList.add('text-white');
        switchIcon.classList.remove('text-[#bdc3c7]');
        statusText.textContent = 'ACTIVE';
        statusText.classList.add('text-[#3498db]'); 
        statusText.classList.remove('text-white/80');

    } else {
        // Disable state (OFF)
        toggleSwitch.classList.remove('switch-on');
        switchIcon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />`;
        switchIcon.classList.remove('text-white');
        switchIcon.classList.add('text-[#bdc3c7]');
        statusText.textContent = 'DISABLED';
        statusText.classList.remove('text-[#3498db]');
        statusText.classList.add('text-white/80');
    }
}

/**
 * Main function to toggle the protection state and save it to localStorage.
 */
window.toggleProtection = function() {
    // 1. CRITICAL: FLIP THE BOOLEAN STATE IMMEDIATELY
    tabProtectionEnabled = !tabProtectionEnabled; 
    
    // 2. Save the new state to localStorage (important for the next session)
    localStorage.setItem(STORAGE_KEY, tabProtectionEnabled);

    // 3. Update the UI last (Visual feedback)
    updateUI();
}

/**
 * Event listener to intercept tab/window closing attempts.
 * !!! USING IF STATEMENT AS REQUESTED !!!
 */
window.addEventListener('beforeunload', function(e) {
    
    // Check the global variable directly using a simple IF statement
    if (tabProtectionEnabled) { // <-- The simple if statement you wanted
        
        // If true, trigger the browser warning to prevent closure
        e.preventDefault(); 
        e.returnValue = ''; 
    }
});

// === Initialization Logic (Load state and update UI on page load) ===

// 1. Load state from localStorage
const savedState = localStorage.getItem(STORAGE_KEY);
// Set the global variable used for UI state based on saved data
tabProtectionEnabled = savedState === 'true'; 

// 2. CRITICAL: Call updateUI() to reflect the saved state on load
updateUI();
