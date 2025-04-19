// QR Code Scanner functionality for RailGuard India

document.addEventListener('DOMContentLoaded', function() {
    const scanQRTicketBtn = document.getElementById('scanQRTicketBtn');
    const scanQRZoneBtn = document.getElementById('scanQRZoneBtn');
    const scannerContainer = document.getElementById('qrScannerContainer');
    const scanResult = document.getElementById('scanResult');
    const closeScannerBtn = document.getElementById('closeScannerBtn');
    
    // Keep track of scanner state
    let scanner = null;
    
    // Setup scan button event handlers
    if (scanQRTicketBtn) {
        scanQRTicketBtn.addEventListener('click', function() {
            initScanner('ticketData');
        });
    }
    
    if (scanQRZoneBtn) {
        scanQRZoneBtn.addEventListener('click', function() {
            initScanner('zoneData');
        });
    }
    
    if (closeScannerBtn) {
        closeScannerBtn.addEventListener('click', function() {
            closeScanner();
        });
    }
    
    // Initialize QR scanner
    function initScanner(targetInputId) {
        // Check if the browser supports the camera API
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showScanError('Your browser does not support camera access, or it is disabled.');
            return;
        }
        
        // Show scanner container
        if (scannerContainer) {
            scannerContainer.style.display = 'block';
        }
        
        // Clear previous scan results
        if (scanResult) {
            scanResult.innerText = 'Scanning...';
        }
        
        // Create a new scanner instance
        try {
            scanner = new Html5QrcodeScanner(
                "qrScanner",
                { fps: 10, qrbox: { width: 250, height: 250 } }
            );
            
            // Define success callback
            const onScanSuccess = (decodedText, decodedResult) => {
                // Set the decoded text to the target input
                const targetInput = document.getElementById(targetInputId);
                if (targetInput) {
                    targetInput.value = decodedText;
                }
                
                // Show scan result
                if (scanResult) {
                    scanResult.innerText = 'QR Code scanned successfully!';
                }
                
                // Auto-close scanner
                setTimeout(() => {
                    closeScanner();
                    
                    // Trigger verification if appropriate
                    if (targetInputId === 'ticketData' && document.getElementById('verifyTicketBtn')) {
                        document.getElementById('verifyTicketBtn').click();
                    } else if (targetInputId === 'zoneData' && document.getElementById('verifyZoneBtn')) {
                        document.getElementById('verifyZoneBtn').click();
                    }
                }, 1000);
            };
            
            // Define error callback
            const onScanFailure = (error) => {
                // Just log to console, don't show error to user for each scan failure
                console.warn(`QR scan error: ${error}`);
            };
            
            // Start the scanner
            scanner.render(onScanSuccess, onScanFailure);
        } catch (error) {
            showScanError(`Failed to initialize scanner: ${error.message}`);
        }
    }
    
    // Close scanner and release camera
    function closeScanner() {
        if (scanner) {
            try {
                scanner.clear();
                scanner = null;
            } catch (error) {
                console.error('Error closing scanner:', error);
            }
        }
        
        if (scannerContainer) {
            scannerContainer.style.display = 'none';
        }
    }
    
    // Display scanner error message
    function showScanError(message) {
        if (scanResult) {
            scanResult.innerText = message;
        }
        
        console.error(message);
    }
    
    // Function to load HTML5 QR Scanner library if needed
    function loadQRLibrary() {
        if (typeof Html5QrcodeScanner === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/html5-qrcode@2.0.9/dist/html5-qrcode.min.js';
            document.head.appendChild(script);
        }
    }
    
    // Load QR library if any scan buttons exist
    if (scanQRTicketBtn || scanQRZoneBtn) {
        loadQRLibrary();
    }
});

// Simulate QR scan for demo purposes (no camera needed)
function simulateScan(dataType, sampleData) {
    const targetInput = document.getElementById(dataType === 'ticket' ? 'ticketData' : 'zoneData');
    if (targetInput) {
        targetInput.value = sampleData;
        
        // Trigger verification
        const verifyBtn = document.getElementById(dataType === 'ticket' ? 'verifyTicketBtn' : 'verifyZoneBtn');
        if (verifyBtn) {
            verifyBtn.click();
        }
    }
}
