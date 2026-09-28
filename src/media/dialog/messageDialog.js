/*
#--------------------------------------------------------------------------------------------------
Name:        messageDialog.js
Author:      d.fathi
Created:     28/09/2026
Updated:     28/09/2026
Copyright:   (c) DSpice 2026
Licence:     free
#---------------------------------------------------------------------------------------------------
*/
//------------------Class for Message/Error Dialog-------------------------------------------------//

function fMessageDialog(self) {
    var selfDialog = this;
    selfDialog.drawing = self;
    selfDialog.isVisible = false;
    selfDialog.messageType = 'error';  // error, warning, info, success
    selfDialog.title = 'Error';
    selfDialog.message = '';
    selfDialog.details = null;
    selfDialog.onClose = null;
    selfDialog.onOk = null;

    // Drag state
    var isDragging = false;
    var dragStartX = 0, dragStartY = 0;
    var dialogStartX = 0, dialogStartY = 0;

    // Icon SVGs
    var icons = {
        error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    };

    // Inject CSS
    this.injectCSS = function() {
        var css = `
/* ===== Message Dialog ===== */
#messageDialog {
    position: fixed;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    width: 420px;
    max-width: 90vw;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background, #ffffff));
    border: 1px solid var(--vscode-editorWidget-border, var(--vscode-panel-border, #ccc));
    border-radius: 6px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.25);
    z-index: 4000;
    display: none;
    font-family: var(--vscode-font-family, 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif);
    font-size: var(--vscode-font-size, 13px);
    color: var(--vscode-editor-foreground, #333);
    flex-direction: column;
    overflow: hidden;
}

#messageDialog.visible {
    display: flex;
}

/* Overlay backdrop */
#messageDialogOverlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.45);
    z-index: 3999;
    display: none;
}

#messageDialogOverlay.visible {
    display: block;
}

/* Header - Draggable */
#messageDialogHeader {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    border-bottom: 1px solid var(--vscode-panel-border, #ddd);
    background: var(--vscode-titleBar-activeBackground, var(--vscode-editor-inactiveSelectionBackground, #fafafa));
    border-radius: 6px 6px 0 0;
    cursor: move;
    user-select: none;
    flex-shrink: 0;
}

#messageDialogHeader:hover {
    background: var(--vscode-list-hoverBackground, #f0f0f0);
}

#messageDialogTitle {
    font-size: 14px;
    font-weight: 600;
    color: var(--vscode-editor-foreground, #333);
    display: flex;
    align-items: center;
    gap: 8px;
}

#messageDialogTitle .msg-icon {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
}

#messageDialogTitle .msg-icon svg {
    width: 100%;
    height: 100%;
}

/* Type-specific title colors */
#messageDialog.type-error #messageDialogTitle { color: var(--vscode-errorForeground, #f44336); }
#messageDialog.type-warning #messageDialogTitle { color: var(--vscode-editorWarning-foreground, #ff9800); }
#messageDialog.type-info #messageDialogTitle { color: var(--vscode-textLink-foreground, #2196F3); }
#messageDialog.type-success #messageDialogTitle { color: #4CAF50; }

#messageDialogClose {
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
    color: var(--vscode-icon-foreground, #666);
    padding: 0 4px;
    line-height: 1;
    border-radius: 3px;
    font-family: inherit;
}

#messageDialogClose:hover {
    background: var(--vscode-list-hoverBackground, #e0e0e0);
    color: var(--vscode-editor-foreground, #333);
}

/* Content area */
#messageDialogContent {
    padding: 16px 14px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    flex: 1;
    overflow-y: auto;
}

/* Large icon in content */
#messageDialogIcon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    margin-top: 2px;
}

#messageDialogIcon svg {
    width: 100%;
    height: 100%;
}

#messageDialog.type-error #messageDialogIcon { color: var(--vscode-errorForeground, #f44336); }
#messageDialog.type-warning #messageDialogIcon { color: var(--vscode-editorWarning-foreground, #ff9800); }
#messageDialog.type-info #messageDialogIcon { color: var(--vscode-textLink-foreground, #2196F3); }
#messageDialog.type-success #messageDialogIcon { color: #4CAF50; }

/* Message text */
#messageDialogMessage {
    flex: 1;
    font-size: 13px;
    line-height: 1.5;
    color: var(--vscode-editor-foreground, #333);
    word-wrap: break-word;
    white-space: pre-wrap;
}

/* Details section (collapsible) */
#messageDialogDetails {
    margin-top: 12px;
    border: 1px solid var(--vscode-panel-border, #e0e0e0);
    border-radius: 4px;
    overflow: hidden;
}

#messageDialogDetailsHeader {
    padding: 8px 12px;
    background: var(--vscode-sideBar-background, #f5f5f5);
    cursor: pointer;
    user-select: none;
    font-size: 12px;
    font-weight: 600;
    color: var(--vscode-descriptionForeground, #666);
    display: flex;
    align-items: center;
    gap: 6px;
}

#messageDialogDetailsHeader:hover {
    background: var(--vscode-list-hoverBackground, #ebebeb);
}

#messageDialogDetailsHeader .arrow {
    font-size: 10px;
    transition: transform 0.2s;
}

#messageDialogDetailsHeader .arrow.collapsed {
    transform: rotate(-90deg);
}

#messageDialogDetailsContent {
    padding: 10px 12px;
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 11px;
    color: var(--vscode-editor-foreground, #444);
    background: var(--vscode-editor-background, #fafafa);
    max-height: 150px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-all;
    display: none;
}

#messageDialogDetailsContent.visible {
    display: block;
}

/* Buttons bar */
#messageDialogButtonsBar {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 14px;
    background: var(--vscode-editorWidget-background, var(--vscode-editor-background, #ffffff));
    border-top: 1px solid var(--vscode-panel-border, #ddd);
    flex-shrink: 0;
}

.message-btn {
    padding: 6px 20px;
    border: 1px solid var(--vscode-button-secondaryBackground, #ccc);
    border-radius: 3px;
    font-size: 12px;
    cursor: pointer;
    background: var(--vscode-button-secondaryBackground, #f0f0f0);
    color: var(--vscode-button-secondaryForeground, #333);
    transition: all 0.15s;
    font-family: inherit;
    min-width: 80px;
}

.message-btn:hover {
    background: var(--vscode-button-secondaryHoverBackground, #e0e0e0);
}

.message-btn-primary {
    background: var(--vscode-button-background, #2196F3);
    border-color: var(--vscode-button-border, #1976D2);
    color: var(--vscode-button-foreground, #fff);
}

.message-btn-primary:hover {
    background: var(--vscode-button-hoverBackground, #1976D2);
}

/* Type-specific primary button */
#messageDialog.type-error .message-btn-primary {
    background: var(--vscode-errorForeground, #f44336);
    border-color: #d32f2f;
}

#messageDialog.type-error .message-btn-primary:hover {
    background: #d32f2f;
}

#messageDialog.type-warning .message-btn-primary {
    background: var(--vscode-editorWarning-foreground, #ff9800);
    border-color: #f57c00;
}

#messageDialog.type-warning .message-btn-primary:hover {
    background: #f57c00;
}

#messageDialog.type-success .message-btn-primary {
    background: #4CAF50;
    border-color: #388E3C;
}

#messageDialog.type-success .message-btn-primary:hover {
    background: #388E3C;
}

/* Scrollbar for details */
#messageDialogDetailsContent::-webkit-scrollbar { width: 8px; }
#messageDialogDetailsContent::-webkit-scrollbar-track { background: var(--vscode-scrollbarSlider-background, #f1f1f1); }
#messageDialogDetailsContent::-webkit-scrollbar-thumb { background: var(--vscode-scrollbarSlider-hoverBackground, #c1c1c1); border-radius: 4px; }
`;
        var head = document.head || document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        head.appendChild(style);
        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
    };

    // Inject HTML
    this.injectHTML = function() {
        var dialogHTML = `
<div id="messageDialogOverlay"></div>
<div id="messageDialog" class="type-error">
    <div id="messageDialogHeader">
        <span id="messageDialogTitle">
            <span class="msg-icon" id="messageDialogTitleIcon"></span>
            <span id="messageDialogTitleText">Error</span>
        </span>
        <button id="messageDialogClose" title="Close">×</button>
    </div>
    <div id="messageDialogContent">
        <div id="messageDialogIcon"></div>
        <div id="messageDialogMessage"></div>
    </div>
    <div id="messageDialogDetails" style="display:none;">
        <div id="messageDialogDetailsHeader">
            <span class="arrow">▼</span>
            <span>Technical Details</span>
        </div>
        <div id="messageDialogDetailsContent"></div>
    </div>
    <div id="messageDialogButtonsBar">
        <button class="message-btn message-btn-primary" id="messageDialogBtnOk">OK</button>
    </div>
</div>
`;
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
    };

    // Toggle dialog visibility
    this.toggle = function() {
        if (selfDialog.isVisible) {
            selfDialog.hide();
        } else {
            selfDialog.show();
        }
    };

    // Show dialog
    this.show = function() {
        var dialog = document.getElementById('messageDialog');
        var overlay = document.getElementById('messageDialogOverlay');
        if (dialog) {
            dialog.classList.add('visible');
            if (overlay) overlay.classList.add('visible');
            selfDialog.isVisible = true;
            selfDialog.bindKeyEvents();
        }
    };

    // Hide dialog
    this.hide = function() {
        var dialog = document.getElementById('messageDialog');
        var overlay = document.getElementById('messageDialogOverlay');
        if (dialog) {
            dialog.classList.remove('visible');
            if (overlay) overlay.classList.remove('visible');
            selfDialog.isVisible = false;
            selfDialog.unbindKeyEvents();
        }
    };

    // Bind key events
    this.bindKeyEvents = function() {
        document.addEventListener('keydown', selfDialog.keyHandler);
    };

    // Unbind key events
    this.unbindKeyEvents = function() {
        document.removeEventListener('keydown', selfDialog.keyHandler);
    };

    // Key handler - Enter/Escape to close
    this.keyHandler = function(e) {
        if (e.key === 'Escape' || e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            selfDialog.closeDialog();
            return false;
        }
    };

    // Initialize with options
    this.initData = function(options) {
        options = options || {};
        
        selfDialog.messageType = options.type || 'error';
        selfDialog.title = options.title || selfDialog.getDefaultTitle();
        selfDialog.message = options.message || '';
        selfDialog.details = options.details || null;
        selfDialog.onClose = options.onClose || null;
        selfDialog.onOk = options.onOk || null;

        selfDialog.updateContent();
    };

    // Get default title based on type
    this.getDefaultTitle = function() {
        var titles = {
            error: 'Error',
            warning: 'Warning',
            info: 'Information',
            success: 'Success'
        };
        return titles[selfDialog.messageType] || 'Message';
    };

    // Update dialog content
    this.updateContent = function() {
        var dialog = document.getElementById('messageDialog');
        var titleIcon = document.getElementById('messageDialogTitleIcon');
        var titleText = document.getElementById('messageDialogTitleText');
        var contentIcon = document.getElementById('messageDialogIcon');
        var message = document.getElementById('messageDialogMessage');
        var detailsSection = document.getElementById('messageDialogDetails');
        var detailsContent = document.getElementById('messageDialogDetailsContent');

        if (!dialog) return;

        // Set type class
        dialog.className = 'type-' + selfDialog.messageType;

        // Set icons
        var iconSvg = icons[selfDialog.messageType] || icons.info;
        if (titleIcon) titleIcon.innerHTML = iconSvg;
        if (contentIcon) contentIcon.innerHTML = iconSvg;

        // Set title
        if (titleText) titleText.textContent = selfDialog.title;

        // Set message
        if (message) message.textContent = selfDialog.message;

        // Set details
        if (detailsSection && detailsContent) {
            if (selfDialog.details) {
                detailsSection.style.display = 'block';
                detailsContent.textContent = selfDialog.details;
                detailsContent.classList.remove('visible');
                detailsSection.querySelector('.arrow').classList.add('collapsed');
                detailsSection.querySelector('.arrow').textContent = '▶';
            } else {
                detailsSection.style.display = 'none';
            }
        }
    };

    // Toggle details
    this.toggleDetails = function() {
        var detailsContent = document.getElementById('messageDialogDetailsContent');
        var arrow = document.querySelector('#messageDialogDetailsHeader .arrow');
        
        if (detailsContent && arrow) {
            var isVisible = detailsContent.classList.toggle('visible');
            arrow.classList.toggle('collapsed', !isVisible);
            arrow.textContent = isVisible ? '▼' : '▶';
        }
    };

    // Close dialog
    this.closeDialog = function() {
        selfDialog.hide();
        if (typeof selfDialog.onClose === 'function') {
            selfDialog.onClose();
        }
    };

    // OK button handler
    this.okDialog = function() {
        selfDialog.hide();
        if (typeof selfDialog.onOk === 'function') {
            selfDialog.onOk();
        }
        if (typeof selfDialog.onClose === 'function') {
            selfDialog.onClose();
        }
    };

    // Initialize events
    this.init = function() {
        var dialog = document.getElementById('messageDialog');
        var header = document.getElementById('messageDialogHeader');
        var closeBtn = document.getElementById('messageDialogClose');
        var overlay = document.getElementById('messageDialogOverlay');
        var btnOk = document.getElementById('messageDialogBtnOk');
        var detailsHeader = document.getElementById('messageDialogDetailsHeader');

        if (!dialog || !header) return;

        // Close button
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                selfDialog.closeDialog();
            });
        }

        // Overlay click closes
        if (overlay) {
            overlay.addEventListener('click', function() {
                selfDialog.closeDialog();
            });
        }

        // OK button
        if (btnOk) {
            btnOk.addEventListener('click', function() {
                selfDialog.okDialog();
            });
        }

        // Details toggle
        if (detailsHeader) {
            detailsHeader.addEventListener('click', function() {
                selfDialog.toggleDetails();
            });
        }

        // Drag functionality from header
        header.addEventListener('mousedown', function(e) {
            if (e.target === closeBtn || closeBtn.contains(e.target)) return;

            isDragging = true;
            var rect = dialog.getBoundingClientRect();
            dialogStartX = rect.left;
            dialogStartY = rect.top;
            dragStartX = e.clientX;
            dragStartY = e.clientY;

            dialog.style.transform = 'none';
            dialog.style.right = 'auto';
            dialog.style.left = dialogStartX + 'px';
            dialog.style.top = dialogStartY + 'px';

            e.preventDefault();
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;

            var deltaX = e.clientX - dragStartX;
            var deltaY = e.clientY - dragStartY;

            var newX = dialogStartX + deltaX;
            var newY = dialogStartY + deltaY;

            var dialogWidth = dialog.offsetWidth;
            var dialogHeight = dialog.offsetHeight;
            var viewportWidth = window.innerWidth;
            var viewportHeight = window.innerHeight;

            if (newX < 0) newX = 0;
            if (newX + dialogWidth > viewportWidth) newX = viewportWidth - dialogWidth;
            if (newY < 0) newY = 0;
            if (newY + dialogHeight > viewportHeight) newY = viewportHeight - dialogHeight;

            dialog.style.left = newX + 'px';
            dialog.style.top = newY + 'px';
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
    };

    // Constructor
    this.injectCSS();
    this.injectHTML();
    this.init();
}

// Global instance
var messageDialog;

// Convenience functions for quick usage
function showError(message, details, onClose) {
    if (!messageDialog) messageDialog = new fMessageDialog(null);
    messageDialog.initData({
        type: 'error',
        title: 'Error',
        message: message,
        details: details,
        onClose: onClose
    });
    messageDialog.show();
}

function showWarning(message, details, onClose) {
    if (!messageDialog) messageDialog = new fMessageDialog(null);
    messageDialog.initData({
        type: 'warning',
        title: 'Warning',
        message: message,
        details: details,
        onClose: onClose
    });
    messageDialog.show();
}

function showInfo(message, details, onClose) {
    if (!messageDialog) messageDialog = new fMessageDialog(null);
    messageDialog.initData({
        type: 'info',
        title: 'Information',
        message: message,
        details: details,
        onClose: onClose
    });
    messageDialog.show();
}

function showSuccess(message, details, onClose) {
    if (!messageDialog) messageDialog = new fMessageDialog(null);
    messageDialog.initData({
        type: 'success',
        title: 'Success',
        message: message,
        details: details,
        onClose: onClose
    });
    messageDialog.show();
}