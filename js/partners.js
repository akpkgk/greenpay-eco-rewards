
// Partners page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    setupPartnersEventListeners();
});

function setupPartnersEventListeners() {
    // Partnership application button
    const partnershipBtn = document.querySelector('.become-partner .cta-btn');
    if (partnershipBtn) {
        partnershipBtn.addEventListener('click', function() {
            window.GreenPayCommon.showMessage('Partnership application feature coming soon!', 'success');
        });
    }
}
