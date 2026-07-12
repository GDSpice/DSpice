var setFile = 'New file';
let initialValue = '';
var menuitems = {};
var toolbaritems = {};

// ===================== UNDO/REDO SYSTEM =====================
let undoStack = [];
let redoStack = [];
let lastValue = '';
let isUndoing = false;

function saveState() {
    if (isUndoing) return;
    const current = editor.value;
    if (current !== lastValue) {
        undoStack.push(lastValue);
        redoStack = [];
        lastValue = current;
        updateButtons();
    }
}

function undo() {
    if (undoStack.length === 0) return;
    isUndoing = true;
    redoStack.push(editor.value);
    const prev = undoStack.pop();
    editor.value = prev;
    lastValue = prev;
    updateAll();
    isUndoing = false;
}

function redo() {
    if (redoStack.length === 0) return;
    isUndoing = true;
    undoStack.push(editor.value);
    const next = redoStack.pop();
    editor.value = next;
    lastValue = next;
    updateAll();
    isUndoing = false;
}

// DOM Elements
const editor = document.getElementById('editor');
const highlightLayer = document.getElementById('highlightLayer');
const lineNumbers = document.getElementById('lineNumbers');
const lineInfo = document.getElementById('lineInfo');
const colInfo = document.getElementById('colInfo');
const descriptionText = document.getElementById('description-text');

// SPICE component prefixes
const COMPONENT_PREFIXES = 'RVILCDEFGHJKMNOPQSTUWXYZ';

// SPICE directives
const DIRECTIVES = [
    'TITLE', 'SUBCKT', 'ENDS', 'INCLUDE', 'LIB', 'MODEL', 'PARAM',
    'OPTION', 'OPTIONS', 'OP', 'DC', 'AC', 'TRAN', 'PZ', 'SENS',
    'NOISE', 'DISTO', 'TF', 'FOUR', 'PRINT', 'PLOT', 'PROBE',
    'SAVE', 'WIDTH', 'TEMP', 'STEP', 'ALTER', 'GLOBAL', 'IC',
    'NODESET', 'END', 'MEAS', 'MEASURE', 'LET', 'SET', 'UNSET',
    'SHOW', 'SHOWMOD', 'SHOWDEV', 'HARD', 'SOFT', 'RESET', 'RUN',
    'RUNS', 'OPPOINT', 'LOAD', 'DSP', 'FFT', 'STATUS', 'STOP',
    'WRITE', 'WRITEDATA', 'WRITESPICE', 'WRITECIR', 'WRITENETLIST',
    'SOURCE', 'RESTART', 'RESUME', 'SHELL', 'SPAWN', 'CD', 'PWD',
    'CONTROL', 'ENDC'
];

// ===================== EDITOR API =====================
const editorAPI = {
    getValue: function() {
        return editor.value;
    },
    setValue: function(text) {
        editor.value = text || '';
        lastValue = editor.value;
        undoStack = [];
        redoStack = [];
        updateAll();
    },
    getCursor: function() {
        const text = editor.value.substring(0, editor.selectionStart);
        const lines = text.split('\n');
        return {
            line: lines.length - 1,
            ch: lines[lines.length - 1].length
        };
    },
    somethingSelected: function() {
        return editor.selectionStart !== editor.selectionEnd;
    },
    getSelection: function() {
        return editor.value.substring(editor.selectionStart, editor.selectionEnd);
    },
    replaceSelection: function(text) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        editor.value = editor.value.substring(0, start) + text + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + text.length;
        saveState();
        updateAll();
    },
    undo: function() {
        undo();
    },
    redo: function() {
        redo();
    },
    clearHistory: function() {
        undoStack = [];
        redoStack = [];
        lastValue = editor.value;
    },
    historySize: function() {
        return { undo: undoStack.length, redo: redoStack.length };
    },
    on: function(event, callback) {
        if (event === 'change') {
            editor.addEventListener('input', () => callback(editorAPI));
        } else if (event === 'cursorActivity') {
            editor.addEventListener('click', () => callback(editorAPI));
            editor.addEventListener('keyup', () => callback(editorAPI));
        }
    }
};

// ===================== SYNTAX HIGHLIGHTING =====================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function highlightLine(line) {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
        return '<span class="text">' + escapeHtml(line) + '</span>';
    }
    if (trimmed.startsWith('*')) {
        return '<span class="comment">' + escapeHtml(line) + '</span>';
    }
    if (trimmed.startsWith('.')) {
        const match = trimmed.match(/^\.(\w+)(.*)$/);
        if (match) {
            const directive = match[1].toUpperCase();
            const rest = match[2];
            if (DIRECTIVES.includes(directive)) {
                const leadingSpaces = line.match(/^(\s*)/)[1];
                return escapeHtml(leadingSpaces) + 
                       '<span class="directive">.' + directive + '</span>' + 
                       escapeHtml(rest);
            }
        }
        return '<span class="directive">' + escapeHtml(line) + '</span>';
    }
    const firstChar = trimmed.charAt(0).toUpperCase();
    if (COMPONENT_PREFIXES.includes(firstChar)) {
        const leadingSpaces = line.match(/^(\s*)/)[1];
        const afterSpaces = line.substring(leadingSpaces.length);
        const tokens = afterSpaces.split(/(\s+)/);
        let componentName = '';
        let restStart = 0;
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i].trim().length > 0) {
                componentName = tokens[i];
                restStart = leadingSpaces.length + tokens.slice(0, i + 1).join('').length;
                break;
            }
        }
        const rest = line.substring(restStart);
        return escapeHtml(leadingSpaces) + 
               '<span class="component">' + escapeHtml(componentName) + '</span>' + 
               escapeHtml(rest);
    }
    return '<span class="text">' + escapeHtml(line) + '</span>';
}

let highlightRaf = 0;
function scheduleHighlight() {
    cancelAnimationFrame(highlightRaf);
    highlightRaf = requestAnimationFrame(() => {
        updateHighlight();
    });
}

function updateHighlight() {
    let text = editor.value;
    if (text.endsWith('\n')) {
        text += ' ';
    }
    const lines = text.split('\n');
    const highlighted = lines.map(highlightLine);
    highlightLayer.innerHTML = highlighted.join('\n');
}

// ===================== LINE NUMBERS =====================
function updateLineNumbers() {
    const lines = editor.value.split('\n');
    const count = lines.length;
    const cursorLine = editorAPI.getCursor().line;
    let html = '';
    for (let i = 0; i < count; i++) {
        const currentClass = (i === cursorLine) ? 'current' : '';
        html += '<div class="line-num ' + currentClass + '">' + (i + 1) + '</div>';
    }
    lineNumbers.innerHTML = html;
}

// ===================== SCROLL SYNC =====================
function syncScroll() {
    highlightLayer.scrollTop = editor.scrollTop;
    highlightLayer.scrollLeft = editor.scrollLeft;
    lineNumbers.scrollTop = editor.scrollTop;
}

// ===================== CURSOR / STATUS BAR =====================
function updateCursorInfo() {
    const cursor = editorAPI.getCursor();
    lineInfo.textContent = 'Ln: ' + (cursor.line + 1);
    colInfo.textContent = 'Col: ' + (cursor.ch + 1);
    updateLineNumbers();
}

// ===================== UPDATE ALL =====================
function updateAll() {
    scheduleHighlight();
    updateLineNumbers();
    updateCursorInfo();
    updateTitle();
    updateButtons();
    syncScroll();
}

// ===================== TITLE =====================
function updateTitle() {
    const modified = isTextChanged();
    if (modified) {
        document.title = 'Spice Netlist Editor  [' + setFile + ' *]';
    } else {
        document.title = 'Spice Netlist Editor  [' + setFile + ']';
    }
}

// ===================== BUTTON STATES =====================
function updateButtons() {
    const hasSelection = editorAPI.somethingSelected();

    // ===== MENU ITEMS (Cut, Copy) =====
    if (!hasSelection) {
        addClass([menuitems.copy, menuitems.cut]);
    } else {
        removeClass([menuitems.copy, menuitems.cut]);
    }

    // ===== TOOLBAR BUTTONS (Cut, Copy) =====
    if (!hasSelection) {
        disableToolbarButtons(['copy', 'cut']);
    } else {
        enableToolbarButtons(['copy', 'cut']);
    }

    // ===== UNDO / REDO =====
    if (undoStack.length === 0) {
        disableToolbarButtons(['undo']);
        addClass([menuitems.undo]);
    } else {
        enableToolbarButtons(['undo']);
        removeClass([menuitems.undo]);
    }
    
    if (redoStack.length === 0) {
        disableToolbarButtons(['redo']);
        addClass([menuitems.redo]);
    } else {
        enableToolbarButtons(['redo']);
        removeClass([menuitems.redo]);
    }

    // ===== PASTE (Menu & Toolbar) =====
    if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(text => {
            if (text.trim() === '') {
                addClass([menuitems.paste]);
                disableToolbarButtons(['past']);
            } else {
                removeClass([menuitems.paste]);
                enableToolbarButtons(['past']);
            }
        }).catch(() => {
            removeClass([menuitems.paste]);
            enableToolbarButtons(['past']);
        });
    } else {
        removeClass([menuitems.paste]);
        enableToolbarButtons(['past']);
    }
}

function disableToolbarButtons(actions) {
    actions.forEach(action => {
        if (toolbaritems[action]) {
            toolbaritems[action].disabled = true;
            toolbaritems[action].classList.add('disabled');
        }
    });
}

function enableToolbarButtons(actions) {
    actions.forEach(action => {
        if (toolbaritems[action]) {
            toolbaritems[action].disabled = false;
            toolbaritems[action].classList.remove('disabled');
        }
    });
}

function removeClass(elements) {
    elements.forEach(el => {
        if (el) el.classList.remove('disabled');
    });
}

function addClass(elements) {
    elements.forEach(el => {
        if (el) el.classList.add('disabled');
    });
}

// ===================== TAB HANDLING =====================
editor.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 4;
        saveState();
        updateAll();
    }
});

// ===================== EVENT LISTENERS =====================
editor.addEventListener('input', function() {
    saveState();
    updateAll();
    setTimeout(() => {
        scrollToCursor();
    }, 0);
});

editor.addEventListener('scroll', syncScroll);

editor.addEventListener('click', function() {
    updateCursorInfo();
    updateButtons();
});

editor.addEventListener('keyup', function(e) {
    updateCursorInfo();
    updateButtons();
    if (['Enter', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
        setTimeout(() => {
            scrollToCursor();
        }, 0);
    }
});

editor.addEventListener('select', function() {
    updateCursorInfo();
    updateButtons();
});

// ===================== SCROLL TO CURSOR =====================
function scrollToCursor() {
    const cursorLine = editorAPI.getCursor().line;
    const lineHeight = 21; 
    const paddingTop = 10; 
    const cursorTop = paddingTop + (cursorLine * lineHeight);
    const cursorBottom = cursorTop + lineHeight;
    const visibleTop = editor.scrollTop;
    const visibleBottom = visibleTop + editor.clientHeight;

    if (cursorTop < visibleTop) {
        editor.scrollTop = cursorTop - paddingTop;
    } else if (cursorBottom > visibleBottom) {
        editor.scrollTop = cursorBottom - editor.clientHeight + paddingTop;
    }
    syncScroll();
}

// ===================== FILE OPERATIONS =====================
function isTextChanged() {
    return editorAPI.getValue() !== initialValue;
}

function newFile() {
    setFile = 'New file';
    editorAPI.setValue('');
    initialValue = editorAPI.getValue();
    start();
}

async function openFile() {
    const result = await window.electron.openFileDialogEditor();
    if (result) {
        setFile = result.filePath;
        editorAPI.setValue(result.fileContent);
        initialValue = editorAPI.getValue();
        start();
    }
}

async function saveFile() {
    const result = await window.electron.saveCloseWindowEditor(editorAPI.getValue(), setFile, 2);
    if (result.saved) {
        setFile = result.path;
        initialValue = editorAPI.getValue();
        start();
    }
}

async function saveAsFile() {
    const result = await window.electron.saveAsWindowEditor(editorAPI.getValue(), setFile);
    if (result.saved) {
        setFile = result.path;
        initialValue = editorAPI.getValue();
        start();
    }
}

function start() {
    updateAll();
}

// ===================== ACTION HANDLERS =====================
function setAction(action) {
    switch (action) {
        case "newFile":
            if (isTextChanged()) confirmAction(2);
            else newFile();
            break;
        case "openFile":
            if (isTextChanged()) confirmAction(3);
            else openFile();
            break;
        case "saveFile":
            saveFile();
            break;
        case "saveAsFile":
            saveAsFile();
            break;
        case "exitApp":
            if (isTextChanged()) confirmAction(1);
            else window.electron.closeWindowEditor();
            break;
        case "copy":
            if (editorAPI.somethingSelected()) {
                navigator.clipboard.writeText(editorAPI.getSelection());
            }
            break;
        case "cut":
            if (editorAPI.somethingSelected()) {
                navigator.clipboard.writeText(editorAPI.getSelection()).then(() => {
                    editorAPI.replaceSelection("");
                });
            }
            break;
        case "past":
            navigator.clipboard.readText().then(text => {
                editorAPI.replaceSelection(text);
            });
            break;
        case "undo":
            editorAPI.undo();
            break;
        case "redo":
            editorAPI.redo();
            break;
    }
}

// ===================== MENU & TOOLBAR CREATION =====================
document.addEventListener("DOMContentLoaded", () => {
    const menuBar = document.querySelector(".menu-bar");
    const toolbar = document.querySelector(".toolbar");
    const data = {
        "menus": [
            {
                "title": "File",
                "items": [
                    { "label": "New", "icon": "", "shortcut": "Ctrl+N", "action": "newFile", "description": "Create a new file" },
                    { "label": "Open", "icon": "", "shortcut": "Ctrl+O", "action": "openFile", "description": "Open an existing file" },
                    { "label": "Save", "icon": "", "shortcut": "Ctrl+S", "action": "saveFile", "description": "Save the current file" },
                    { "label": "Save As", "icon": "", "shortcut": "", "action": "saveAsFile", "description": "Save the current file with a new name" },
                    { "label": "Exit", "icon": "", "shortcut": "Alt+F4", "action": "exitApp", "description": "Exit the application" }
                ]
            },
            {
                "title": "Edit",
                "items": [
                    { "label": "Undo", "icon": "", "shortcut": "Ctrl+Z", "action": "undo", "description": "Undo the last action" },
                    { "label": "Redo", "icon": "", "shortcut": "Ctrl+Y", "action": "redo", "description": "Redo the last undone action" },
                    { "label": "Cut", "icon": "", "shortcut": "Ctrl+X", "action": "cut", "description": "Cut selected text" },
                    { "label": "Copy", "icon": "", "shortcut": "Ctrl+C", "action": "copy", "description": "Copy selected text" },
                    { "label": "Paste", "icon": "", "shortcut": "Ctrl+V", "action": "past", "description": "Paste from clipboard" }
                ]
            }
        ],
        "toolbar": [
            { "type": "button", "label": "New", "icon": "images/new.png", "action": "newFile", "description": "Create a new file" },
            { "type": "button", "label": "Open", "icon": "images/open.png", "action": "openFile", "description": "Open an existing file" },
            { "type": "button", "label": "Save", "icon": "images/save.png", "action": "saveFile", "description": "Save the current file" },
            { "type": "separator" },
            { "type": "button", "label": "Cut", "icon": "images/cut.png", "action": "cut", "description": "Cut selected text" },
            { "type": "button", "label": "Copy", "icon": "images/copy.png", "action": "copy", "description": "Copy selected text" },
            { "type": "button", "label": "Paste", "icon": "images/paste.png", "action": "past", "description": "Paste from clipboard" },
            { "type": "separator" },
            { "type": "button", "label": "Undo", "icon": "images/undo.png", "action": "undo", "description": "Undo the last action" },
            { "type": "button", "label": "Redo", "icon": "images/redo.png", "action": "redo", "description": "Redo the last undone action" }
        ]
    };

    // Create Menus
    data.menus.forEach(menu => {
        const menuItem = document.createElement("div");
        menuItem.className = "menu-item";
        menuItem.textContent = menu.title;
        const dropdown = document.createElement("div");
        dropdown.className = "dropdown";
        menu.items.forEach(item => {
            const dropdownItem = document.createElement("div");
            dropdownItem.className = "dropdown-item";
            let iconHtml = '';
            if (item.icon) {
                iconHtml = '<img src="' + item.icon + '" alt="">';
            }
            dropdownItem.innerHTML = iconHtml + item.label + ' <span class="shortcut">' + item.shortcut + '</span>';
            dropdownItem.addEventListener("mouseover", () => {
                descriptionText.textContent = item.description;
            });
            dropdownItem.addEventListener("mouseout", () => {
                descriptionText.textContent = "Hover over an item for details.";
            });
            dropdownItem.addEventListener("click", (event) => {
                setAction(item.action);
                event.stopPropagation();
                dropdown.style.display = "none";
            });
            dropdown.appendChild(dropdownItem);
            menuitems[item.action] = dropdownItem;
        });
        menuItem.appendChild(dropdown);
        menuItem.addEventListener("mouseover", () => {
            dropdown.style.display = "block";
        });
        menuItem.addEventListener("mouseleave", () => {
            dropdown.style.display = "none";
        });
        menuBar.appendChild(menuItem);
    });

    // Create Toolbar Buttons
    data.toolbar.forEach(tool => {
        if (tool.type === "separator") {
            const separator = document.createElement("div");
            separator.className = "toolbar-separator";
            toolbar.appendChild(separator);
        } else {
            const button = document.createElement("button");
            button.className = "toolbar-button";
            button.title = tool.label;
            if (tool.icon) {
                const img = document.createElement('img');
                img.src = tool.icon;
                img.alt = tool.label;
                img.onerror = function() {
                    button.innerHTML = '';
                    button.textContent = tool.label.charAt(0).toUpperCase();
                };
                button.appendChild(img);
            } else {
                button.textContent = tool.label.charAt(0).toUpperCase();
            }
            button.addEventListener("mouseover", () => {
                descriptionText.textContent = tool.description;
            });
            button.addEventListener("mouseout", () => {
                descriptionText.textContent = "Hover over an item for details.";
            });
            button.addEventListener("click", () => {
                setAction(tool.action);
            });
            toolbar.appendChild(button);
            toolbaritems[tool.action] = button;
        }
    });

    // Initial update
    lastValue = editor.value;
    updateAll();
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
            case 'n':
                e.preventDefault();
                setAction('newFile');
                break;
            case 'o':
                e.preventDefault();
                setAction('openFile');
                break;
            case 's':
                e.preventDefault();
                if (e.shiftKey) {
                    setAction('saveAsFile');
                } else {
                    setAction('saveFile');
                }
                break;
            case 'z':
                e.preventDefault();
                if (e.shiftKey) {
                    setAction('redo');
                } else {
                    setAction('undo');
                }
                break;
            case 'y':
                e.preventDefault();
                setAction('redo');
                break;
            case 'x':
                e.preventDefault();
                setAction('cut');
                break;
            case 'c':
                e.preventDefault();
                setAction('copy');
                break;
            case 'v':
                e.preventDefault();
                setAction('past');
                break;
        }
    }
});