  /*
#-------------------------------------------------------------------------------
# Name:        sidebar.js
# Author:      d.fathi
# Created:     29/04/2026
# Updated:     08/08/2026
# Purpose:     Sidebar for DSpice IDE
# Copyright:  (c) DSpice 2026
# Licence:   free (MIT)
#-------------------------------------------------------------------------------


# Usage:       This script configures the sidebar for the DSpice IDE.
*/  

// ========== ACTIVITY BAR CONFIGURATION ==========

document.getElementById('activityBar').innerHTML = `
  <div class="activity-icon active" data-panel="propertiesPanel" title="Properties">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 3H21V21H3Z"/>
      <path d="M6 7H10"/>
      <path d="M12 7H18"/>
      <path d="M6 12H10"/>
      <path d="M12 12H18"/>
      <path d="M6 17H10"/>
      <path d="M12 17H18"/>
    </svg>
  </div>

  <div class="activity-icon" data-panel="componentsPanel" title="Components">
    <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 3H21V21H3Z"/>
      <path d="M5 8H7L8 7L9 9L10 7L11 9L12 7L13 9L14 7L15 8H19"/>
      <path d="M5 16H9M9 13.5V18.5M11 13.5V18.5M11 16H19"/>
    </svg>
  </div>

  <div class="activity-icon" data-panel="SPICELibraryPanel" title="SPICE Library">
    <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 3H21V21H3Z"/>
      <path d="M4.5 9L12 4L19.5 9H4.5Z" fill="currentColor" stroke="none"/>
      <path d="M11 6.2 A1 1 0 1 0 13 6.2 A1 1 0 1 0 11 6.2Z" fill="white" stroke="none"/>
      <path d="M4.5 9H19.5V10.5H4.5Z" fill="currentColor" stroke="none"/>
      <path d="M6 10.5H8V19H6Z" fill="currentColor" stroke="none"/>
      <path d="M16 10.5H18V19H16Z" fill="currentColor" stroke="none"/>
      <path d="M4 19H20V20H4Z" fill="currentColor" stroke="none"/>
      <path d="M12 17.8 C10.7 16.7 9.2 16.2 7.8 16.2 V12 C9.4 11.7 10.8 12.2 12 13.3 C13.2 12.2 14.6 11.7 16.2 12 V16.2 C14.8 16.2 13.3 16.7 12 17.8Z"/>
      <path d="M12 13.3V17.8"/>
    </svg>
  </div>

  <div class="activity-icon" data-panel="libraryAIAssistant" title="AI Assistant">
    <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 3H21V21H3Z"/>
      <path d="M12 6 L13.3 10.7 L18 12 L13.3 13.3 L12 18 L10.7 13.3 L6 12 L10.7 10.7 Z"/>
      <path d="M17.5 5 L18 6.5 L19.5 7 L18 7.5 L17.5 9 L17 7.5 L15.5 7 L17 6.5 Z"/>
    </svg>
  </div>

  <div class="activity-bottom"></div>
`;

// ========== EVENT LISTENERS FOR ACTIVITY BAR ==========

document.querySelectorAll('.activity-icon').forEach(icon => {
  icon.addEventListener('click', () => {
    document.querySelectorAll('.activity-icon').forEach(i => i.classList.remove('active'));
    icon.classList.add('active');
    
    const panelToShow = icon.getAttribute('data-panel');
    document.querySelectorAll('.panel').forEach(panel => panel.style.display = 'none');
    
    if (panelToShow) {
      document.getElementById(panelToShow).style.display = 'block';
    }
  });
});