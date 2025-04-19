// QR Code Scanner functionality for RailGuard India - Bootstrap Modals Implementation

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements for scan buttons
    const scanQRTicketBtn = document.getElementById('scanQRTicketBtn');
    const scanQRZoneBtn = document.getElementById('scanQRZoneBtn');
    
    // Get DOM elements for demo scan buttons in modals
    const demoTicketScanBtn = document.getElementById('demoTicketScanBtn');
    const demoZoneScanBtn = document.getElementById('demoZoneScanBtn');
    
    // Get modal objects
    const ticketScanModal = new bootstrap.Modal(document.getElementById('ticketScanModal'), {
        keyboard: true,
        backdrop: true
    });
    
    const zoneScanModal = new bootstrap.Modal(document.getElementById('zoneScanModal'), {
        keyboard: true,
        backdrop: true
    });
    
    // Attach click events to scan buttons
    if (scanQRTicketBtn) {
        scanQRTicketBtn.addEventListener('click', function() {
            // Show the ticket scan modal
            ticketScanModal.show();
        });
    }
    
    if (scanQRZoneBtn) {
        scanQRZoneBtn.addEventListener('click', function() {
            // Show the zone scan modal
            zoneScanModal.show();
        });
    }
    
    // Handle demo scan for ticket
    if (demoTicketScanBtn) {
        demoTicketScanBtn.addEventListener('click', function() {
            const demoTicketData = 'T12345-C04-S23';
            const ticketInput = document.getElementById('ticketData');
            
            if (ticketInput) {
                ticketInput.value = demoTicketData;
            }
            
            // Close the modal
            ticketScanModal.hide();
            
            // Trigger verification after a short delay
            setTimeout(() => {
                const verifyBtn = document.getElementById('verifyTicketBtn');
                if (verifyBtn) {
                    verifyBtn.click();
                }
            }, 500);
        });
    }
    
    // Handle demo scan for zone
    if (demoZoneScanBtn) {
        demoZoneScanBtn.addEventListener('click', function() {
            const demoZoneData = 'Z12345-C02-Z03';
            const zoneInput = document.getElementById('zoneData');
            
            if (zoneInput) {
                zoneInput.value = demoZoneData;
            }
            
            // Close the modal
            zoneScanModal.hide();
            
            // Trigger verification after a short delay
            setTimeout(() => {
                const verifyBtn = document.getElementById('verifyZoneBtn');
                if (verifyBtn) {
                    verifyBtn.click();
                }
            }, 500);
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
