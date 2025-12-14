// cloner.js content:

// The core logic function, now named for clarity
function executeCloningLogic() {


    // Check if the current URL is NOT about:blank
    if (window.location.href !== 'about:blank') {

        // Try to open the new 'about:blank' tab
        const newWindow = window.open('about:blank', '_blank');

        if (newWindow) {
            // Success!

            // 1. Find the script element itself
            const scriptElement = document.getElementById('cloning-script');
            
            // 2. Remove the script element from the original document
            if (scriptElement) {
                scriptElement.remove();
            }
            // 1. Find the script element itself
            const cloakElement = document.getElementById('cover');
            
            // 2. Remove the script element from the original document
            if (cloakElement) {
                cloakElement.remove();
            }
            // 3. Get the current page's entire HTML (now without the cloning script)
            const currentHtml = document.documentElement.outerHTML;

            // 4. Write that HTML into the new 'about:blank' tab
            newWindow.document.write(currentHtml);
            newWindow.document.close();
setTimeout(
    () => { 
        // 5. Redirect the *original* tab to Google
            window.location.replace('https://www.google.com');
},
    150 // 150 milliseconds = 0.15 seconds
);
        } else {
            // Failure! Popup was blocked.
            alert("Please enable popups!");
                        // 1. Find the script element itself
            const cloakElement = document.getElementById('cover');
            
            // 2. Remove the script element from the original document
            if (cloakElement) {
                cloakElement.remove();
            }
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
