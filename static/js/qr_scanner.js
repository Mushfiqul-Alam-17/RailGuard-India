// QR Code Scanner functionality for RailGuard India - Simplified Version

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const scanQRTicketBtn = document.getElementById('scanQRTicketBtn');
    const scanQRZoneBtn = document.getElementById('scanQRZoneBtn');
    const scannerContainer = document.getElementById('qrScannerContainer');
    const closeScannerBtn = document.getElementById('closeScannerBtn');
    const closeQRScannerBtn = document.getElementById('closeQRScannerBtn');
    const scanResult = document.getElementById('scanResult');
    
    // Global state variables
    let videoStream = null;
    
    // Attach click events to scan buttons
    if (scanQRTicketBtn) {
        scanQRTicketBtn.addEventListener('click', function() {
            openQRScanner('ticketData');
        });
    }
    
    if (scanQRZoneBtn) {
        scanQRZoneBtn.addEventListener('click', function() {
            openQRScanner('zoneData');
        });
    }
    
    // Attach close events to buttons
    if (closeScannerBtn) {
        closeScannerBtn.addEventListener('click', closeQRScanner);
    }
    
    if (closeQRScannerBtn) {
        closeQRScannerBtn.addEventListener('click', closeQRScanner);
    }
    
    // Close scanner when clicking outside
    scannerContainer?.addEventListener('click', function(event) {
        if (event.target === scannerContainer) {
            closeQRScanner();
        }
    });
    
    // Close scanner with Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && scannerContainer?.style.display === 'block') {
            closeQRScanner();
        }
    });
    
    function openQRScanner(targetInputId) {
        // Display the scanner container
        if (scannerContainer) {
            scannerContainer.style.display = 'block';
        }
        
        if (scanResult) {
            scanResult.textContent = "Accessing camera...";
        }
        
        // Force close any existing streams first
        stopVideoStream();
        
        // Use the demo function for now (for testing purposes)
        const demoValue = targetInputId === 'ticketData' 
            ? 'T12345-C04-S23' 
            : 'Z12345-C02-Z03';
            
        // For demo purposes - wait 2 seconds then use demo data
        setTimeout(() => {
            if (scanResult) {
                scanResult.textContent = "Scan successful (demo mode)";
            }
            
            // Set the input value
            const input = document.getElementById(targetInputId);
            if (input) {
                input.value = demoValue;
            }
            
            // Close after delay
            setTimeout(() => {
                closeQRScanner();
                
                // Trigger verification if appropriate
                const btnId = targetInputId === 'ticketData' ? 'verifyTicketBtn' : 'verifyZoneBtn';
                const verifyBtn = document.getElementById(btnId);
                if (verifyBtn) {
                    verifyBtn.click();
                }
            }, 1000);
        }, 1500);
    }
    
    function closeQRScanner() {
        // Stop the video stream if it exists
        stopVideoStream();
        
        // Hide the scanner container
        if (scannerContainer) {
            scannerContainer.style.display = 'none';
        }
        
        console.log('QR Scanner closed');
    }
    
    function stopVideoStream() {
        // Stop any video streams
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
            videoStream = null;
        }
        
        // Also find and stop any video elements
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (video.srcObject) {
                const tracks = video.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                video.srcObject = null;
            }
        });
    }
});

// Simulate QR scan for demo purposes (no camera needed)
function simulateScan(dataType, sampleData) {
    const targetInput = document.getElementById(dataType === 'ticket' ? 'ticketData' : 'zoneData');
    if (targetInput) {
        targetInput.value = sampleData || (dataType === 'ticket' ? 'T12345-C04-S23' : 'Z12345-C02-Z03');
        
        // Trigger verification
        const verifyBtn = document.getElementById(dataType === 'ticket' ? 'verifyTicketBtn' : 'verifyZoneBtn');
        if (verifyBtn) {
            verifyBtn.click();
        }
    }
}
