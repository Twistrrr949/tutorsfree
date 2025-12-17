// cloner.js content:

// The core logic function, now named for clarity
function executeCloningLogic() {
    // 1. Check if we should attempt cloning
    if (window.location.href !== 'about:blank' && localStorage.getItem('aboutBlankPopupState')) {

        // Try to open the new 'about:blank' tab
        const newWindow = window.open('about:blank', '_blank');

        if (newWindow) {
            // Success! (Cloning Logic)

            // 1. Find and remove the script element
            const scriptElement = document.getElementById('cloning-script');
            if (scriptElement) {
                scriptElement.remove();
            }
            
            // 2. Find and remove the cloak/cover element
            const cloakElement = document.getElementById('cover');
            if (cloakElement) {
                cloakElement.remove(); // Note: Removing here so it doesn't get cloned
            }
            
            // 3. Get the current page's entire HTML (now without the cloning script)
            const currentHtml = document.documentElement.outerHTML;

            // 4. Write that HTML into the new 'about:blank' tab
            newWindow.document.write(currentHtml);
            newWindow.document.close();

            // 5. Redirect the original window
            const savedLink = localStorage.getItem('LINKTAB_KEY');
            if (savedLink) {
                window.location.replace(savedLink);
            } else {
                window.location.replace('https://google.com/');
            }
        } else {
            // Failure! Popup was blocked.
            showModal("Please enable popups!");
            // Remove cover only in failure case, as it's already removed in success case
            const cloakElement = document.getElementById('cover');
            if (cloakElement) {
                cloakElement.remove();
            }
        }
    } else {
        // Condition for cloning was not met (e.g., already on about:blank or state not set).
        // Just remove the cloak if it exists.
        const cloakElement = document.getElementById('cover');
        if (cloakElement) {
            cloakElement.remove();
        }
    }
}
function alertthing() {
    // A unique key to store in localStorage
const localStorageKey4 = 'tipadvisoryShown_v2_2_0'; 

// Check if the advisory has already been shown
if (localStorage.getItem(localStorageKey4) === null) {
    
    // The advisory has NOT been shown, so proceed to display the modals
        alert("If studentkeeper is blocking this webpage, turn off your internet, then paste back the link, it should say studentkeeper blocked it, if so, turn on internet and enter link again then you bypassed the blocker!");
        // After showing all the modals, set the flag in localStorage
        // This prevents the modals from showing again on subsequent visits
        localStorage.setItem(localStorageKey4, 'true');
        
}
}
// --- New Delay Implementation ---
      window.addEventListener('load', () => {
    
    // Set a delay of 10 milliseconds (0.01 seconds)
    const delayInMilliseconds = 10; 
    
    console.log(`Cloning will start in ${delayInMilliseconds / 1000} seconds...`);

    // Use setTimeout to wrap the cloning logic
    setTimeout(executeCloningLogic, delayInMilliseconds);
});
