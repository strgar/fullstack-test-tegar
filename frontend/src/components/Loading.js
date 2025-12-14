class Loading {
    constructor() {
        this.overlayId = 'loading-overlay';
    }

    show(message = 'Memproses...') {
        let overlay = document.getElementById(this.overlayId);

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = this.overlayId;
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-content">
                    <div class="spinner-border text-primary" role="status"></div>
                    <p>${message}</p>
                </div>
            `;

            const style = document.createElement('style');
            style.textContent = `
                .loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0,0,0,0.45);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 9999;
                    backdrop-filter: blur(2px);
                }
                .loading-content {
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    text-align: center;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.15);
                }
            `;
            document.head.appendChild(style);

            document.body.appendChild(overlay);
        }

        overlay.style.display = "flex";
    }

    hide() {
        const overlay = document.getElementById(this.overlayId);
        if (overlay) overlay.style.display = "none";
    }
}

export default new Loading();
