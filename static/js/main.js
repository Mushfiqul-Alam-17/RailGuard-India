// RailGuard India - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Dashboard chart initialization
    initializeCharts();

    // Handle seat management interactions
    setupSeatManagement();

    // Setup complaint risk level indicators
    setupRiskIndicators();

    // Setup QR code verification
    setupQRVerification();
});

// Initialize dashboard charts
function initializeCharts() {
    const complaintsChartEl = document.getElementById('complaintsChart');
    if (complaintsChartEl) {
        const ctx = complaintsChartEl.getContext('2d');
        
        // Sample data - In production, this would come from an API
        const data = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'High Risk Complaints',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: '#dc3545',
                borderColor: '#dc3545'
            }, {
                label: 'Low Risk Complaints',
                data: [5, 10, 15, 7, 8, 12],
                backgroundColor: '#198754',
                borderColor: '#198754'
            }]
        };
        
        new Chart(ctx, {
            type: 'bar',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Monthly Complaints'
                    }
                }
            }
        });
    }

    const ticketsChartEl = document.getElementById('ticketsChart');
    if (ticketsChartEl) {
        const ctx = ticketsChartEl.getContext('2d');
        
        // Sample data
        const data = {
            labels: ['Regular Tickets', 'Standing Zone', 'Emergency Slips'],
            datasets: [{
                data: [65, 25, 10],
                backgroundColor: ['#0d6efd', '#0dcaf0', '#ffc107']
            }]
        };
        
        new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Ticket Distribution'
                    }
                }
            }
        });
    }
}

// Setup seat management interactions
function setupSeatManagement() {
    const seatMap = document.querySelector('.seat-map');
    
    if (seatMap) {
        // Add event listeners to seats
        const seats = seatMap.querySelectorAll('.seat');
        
        seats.forEach(seat => {
            seat.addEventListener('click', function() {
                // Toggle selected state
                seat.classList.toggle('selected');
                
                // Update form if it exists
                const seatInput = document.getElementById('seat_number');
                const coachInput = document.getElementById('coach');
                const statusInput = document.getElementById('status');
                
                if (seatInput && coachInput && statusInput) {
                    if (seat.classList.contains('selected')) {
                        seatInput.value = seat.dataset.seat;
                        coachInput.value = seat.dataset.coach;
                        statusInput.value = seat.classList.contains('occupied') ? 'vacant' : 'occupied';
                    } else {
                        seatInput.value = '';
                        statusInput.value = '';
                    }
                }
            });
        });
    }
}

// Setup complaint risk level indicators
function setupRiskIndicators() {
    const complaintItems = document.querySelectorAll('.complaint-item');
    
    if (complaintItems.length > 0) {
        complaintItems.forEach(item => {
            const riskLevel = item.dataset.risk;
            const indicator = item.querySelector('.risk-indicator');
            
            if (indicator) {
                if (riskLevel === 'High') {
                    indicator.classList.add('risk-high');
                    indicator.innerHTML = '<i class="bi bi-exclamation-triangle-fill"></i> High Risk';
                } else {
                    indicator.classList.add('risk-low');
                    indicator.innerHTML = '<i class="bi bi-check-circle-fill"></i> Low Risk';
                }
            }
        });
    }
}

// Setup QR code verification
function setupQRVerification() {
    const verifyTicketBtn = document.getElementById('verifyTicketBtn');
    const verifyZoneBtn = document.getElementById('verifyZoneBtn');
    
    if (verifyTicketBtn) {
        verifyTicketBtn.addEventListener('click', function() {
            const ticketData = document.getElementById('ticketData').value;
            
            if (!ticketData) {
                showAlert('Please scan or enter ticket data', 'danger');
                return;
            }
            
            // Send verification request
            fetch('/api/verify-ticket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ticket_data: ticketData })
            })
            .then(response => response.json())
            .then(data => {
                if (data.valid) {
                    showTicketDetails(data.ticket);
                    showAlert('Valid ticket', 'success');
                } else {
                    showAlert('Invalid ticket', 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('Error verifying ticket', 'danger');
            });
        });
    }
    
    if (verifyZoneBtn) {
        verifyZoneBtn.addEventListener('click', function() {
            const zoneData = document.getElementById('zoneData').value;
            
            if (!zoneData) {
                showAlert('Please scan or enter zone data', 'danger');
                return;
            }
            
            // Send verification request
            fetch('/api/verify-standing-zone', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ zone_data: zoneData })
            })
            .then(response => response.json())
            .then(data => {
                if (data.valid) {
                    showZoneDetails(data.zone);
                    showAlert('Valid standing zone allocation', 'success');
                } else {
                    showAlert('Invalid standing zone allocation', 'danger');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('Error verifying standing zone', 'danger');
            });
        });
    }
}

// Helper function to show alerts
function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    
    if (alertContainer) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        
        alertContainer.appendChild(alert);
        
        // Auto dismiss after 5 seconds
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    }
}

// Helper function to show ticket details
function showTicketDetails(ticket) {
    const detailsContainer = document.getElementById('ticketDetailsContainer');
    
    if (detailsContainer) {
        detailsContainer.innerHTML = `
            <div class="ticket-details mt-3">
                <h5 class="ticket-title">Ticket Details</h5>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Train:</span>
                    <span class="ticket-info-value">${ticket.train_number}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Coach:</span>
                    <span class="ticket-info-value">${ticket.coach}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Seat:</span>
                    <span class="ticket-info-value">${ticket.seat}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Phone:</span>
                    <span class="ticket-info-value">${ticket.phone}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Created:</span>
                    <span class="ticket-info-value">${ticket.created_at}</span>
                </div>
            </div>
        `;
    }
}

// Helper function to show zone details
function showZoneDetails(zone) {
    const detailsContainer = document.getElementById('zoneDetailsContainer');
    
    if (detailsContainer) {
        detailsContainer.innerHTML = `
            <div class="ticket-details mt-3">
                <h5 class="ticket-title">Standing Zone Details</h5>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Train:</span>
                    <span class="ticket-info-value">${zone.train_number}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Coach:</span>
                    <span class="ticket-info-value">${zone.coach}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Zone:</span>
                    <span class="ticket-info-value">${zone.zone}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Phone:</span>
                    <span class="ticket-info-value">${zone.phone}</span>
                </div>
                <div class="ticket-info-item">
                    <span class="ticket-info-label">Created:</span>
                    <span class="ticket-info-value">${zone.created_at}</span>
                </div>
            </div>
        `;
    }
}

// Function to submit a complaint via API
function submitComplaintAPI(phone, message) {
    if (!phone || !message) {
        showAlert('Phone number and message are required', 'danger');
        return;
    }
    
    fetch('/api/submit-complaint', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, message })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success' || data.status === 'warning') {
            showAlert(data.message, data.status === 'success' ? 'success' : 'warning');
            
            // Update UI with new complaint
            const complaintsContainer = document.getElementById('complaintsContainer');
            if (complaintsContainer) {
                const newComplaint = document.createElement('div');
                newComplaint.className = 'complaint-item p-3 mb-3 border rounded';
                newComplaint.dataset.risk = data.risk_level;
                
                newComplaint.innerHTML = `
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>Phone:</strong> ${maskPhone(phone)}<br>
                            <strong>Message:</strong> ${message}<br>
                            <small class="text-muted">Just now</small>
                        </div>
                        <div class="risk-indicator ${data.risk_level === 'High' ? 'risk-high' : 'risk-low'}">
                            <i class="bi ${data.risk_level === 'High' ? 'bi-exclamation-triangle-fill' : 'bi-check-circle-fill'}"></i> 
                            ${data.risk_level} Risk
                        </div>
                    </div>
                `;
                
                complaintsContainer.prepend(newComplaint);
            }
            
            // Reset form
            document.getElementById('complaintForm').reset();
        } else {
            showAlert(data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showAlert('Error submitting complaint', 'danger');
    });
}

// Helper function to mask phone number
function maskPhone(phone) {
    return phone.toString().slice(0, -4).replace(/./g, '*') + phone.slice(-4);
}
