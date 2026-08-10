let currentData = null;
    let selectedFile = null;

    async function openLibrary() {
        const p = await window.electron.getLibraryPath();
        if (p) loadLibrary(p);
    }

    async function openCircuit() {
        const p = await window.electron.getCircuitPath();
        if (p) loadCircuit(p);
    }

    async function configLibrary() {
        const p = await window.electron.getLibraryPath();
        if (p) loadLibrary(p);
    }

    async function loadLibrary(libPath) {
        const result = await window.electron.readLibrary(libPath);
        if (result.success) {
            currentData = result;
            buildpanelLib(result, null);
            document.getElementById('headerSubtitle').textContent = result.libPath; //path.basename(
        } else {
            alert('Error: ' + result.error);
        }
    }

    async function loadCircuit(circuitPath) {
        const libPath = 'D:\\project\\DSpice\\lib\\library.lib';
        const libResult = await window.electron.readLibrary(libPath);
        const projResult = await window.electron.readCircuitProjectLibs(circuitPath);

        if (libResult.success) {
            currentData = libResult;
            buildpanelLib(libResult, projResult);
            document.getElementById('headerSubtitle').textContent = circuitPath; //path.basename(circuitPath);
        } else {
            buildpanelLib({ libraries: [], libPath: libPath }, projResult);
            document.getElementById('headerSubtitle').textContent = circuitPath; //path.basename(circuitPath);
        }
    }

    function buildpanelLib(libData, projectData) {
        const scroll = document.getElementById('panelLibScroll');
        scroll.innerHTML = '';

        // Update top path bars
        const panelLibTop = document.getElementById('panelLibTop');
        // Remove old path bars (keep header)
        panelLibTop.querySelectorAll('.path-bar').forEach(b => b.remove());

        // Library path bar
        const libBar = document.createElement('div');
        libBar.className = 'path-bar';
        libBar.innerHTML = '<span title="' + libData.libPath + '"><strong>Library:</strong> ' + libData.libPath + '</span>'; //libData.libPath
        const cfgBtn = document.createElement('button');
        cfgBtn.className = 'config-btn';
        cfgBtn.innerHTML = '⚙️ Config';
        cfgBtn.title = 'Configure Library';
        cfgBtn.onclick = () => configLibrary();
        libBar.appendChild(cfgBtn);
        panelLibTop.appendChild(libBar);

        // Circuit path bar
        if (projectData && projectData.circuitPath) {
            const cirBar = document.createElement('div');
            cirBar.className = 'path-bar circuit';
            cirBar.innerHTML = '<span title="' + projectData.circuitPath + '"><strong>Circuit:</strong> ' + projectData.circuitPath + '</span>'; //path.basename
            panelLibTop.appendChild(cirBar);
        }

        // ===== Section 1: Libraries (collapsed by default) =====
        const sec1 = document.createElement('div');
        sec1.className = 'plsection collapsed';
        const body1 = document.createElement('div');
        body1.className = 'plsection-body';
        if (libData.libraries && libData.libraries.length > 0) {
            libData.libraries.forEach(lib => body1.appendChild(createLibRow(lib)));
        } else {
            body1.innerHTML = '<div class="no-files-msg">No libraries found in library.lib</div>';
        }
        sec1.innerHTML = '<div class="plsection-header" onclick="toggleSection(this)"><span>📁 Libraries</span><span class="section-badge">' + (libData.libraries ? libData.libraries.length : 0) + '</span></div>';
        sec1.appendChild(body1);
        scroll.appendChild(sec1);

        // ===== Section 2: Project Libraries =====
        const sec2 = document.createElement('div');
        sec2.className = 'plsection';
        const body2 = document.createElement('div');
        body2.className = 'plsection-body';

        const hasProj = projectData && projectData.success;
        const projLibs = hasProj ? projectData.projectLibs : [];

        if (projLibs.length > 0) {
            const byDir = {};
            projLibs.forEach(p => {
                const d = path.dirname(p.relativePath);
                if (!byDir[d]) byDir[d] = [];
                byDir[d].push(p);
            });
            Object.keys(byDir).sort().forEach(dk => {
                if (dk !== '.') {
                    const lbl = document.createElement('div');
                    lbl.className = 'subfolder-label';
                    lbl.textContent = '📁 ' + dk;
                    body2.appendChild(lbl);
                }
                byDir[dk].forEach(p => body2.appendChild(createProjectLibRow(p)));
            });
        } else {
            body2.innerHTML = '<div class="no-files-msg">' + (hasProj ? 'No .lib files found in project folder' : 'Open a circuit file to scan for project libraries') + '</div>';
        }
        sec2.innerHTML = '<div class="plsection-header" onclick="toggleSection(this)"><span>⚡ Project Libraries</span><span class="section-badge project">' + projLibs.length + '</span></div>';
        sec2.appendChild(body2);
        scroll.appendChild(sec2);
    }

    function createLibRow(lib) {
        const row = document.createElement('div');
        row.className = 'plrow' + (!lib.exists ? ' missing' : '');
        row.innerHTML = '<div class="plrow-icon">' + (lib.exists ? '📄' : '❓') + '</div><div class="plrow-info"><div class="plrow-name">' + lib.fileName + '</div><div class="plrow-path">' + lib.filePath + '</div></div><span class="plrow-status ' + (lib.isLocal ? 'status-local' : 'status-external') + '">' + (lib.isLocal ? 'Local' : 'External') + '</span>' + (!lib.exists ? '<span class="plrow-status status-missing">Missing</span>' : '');
        row.onclick = () => selectFile(row, lib);
        return row;
    }

    function createProjectLibRow(p) {
        const row = document.createElement('div');
        row.className = 'plrow';
        const d = path.dirname(p.relativePath) !== '.' ? path.dirname(p.relativePath) + '\\' : '';
        row.innerHTML = '<div class="plrow-icon">📄</div><div class="plrow-info"><div class="plrow-name">' + p.fileName + '</div><div class="plrow-path">' + d + p.fileName + '</div></div><span class="plrow-status status-project">Project</span>';
        row.onclick = () => selectFile(row, { fileName: p.fileName, fullPath: p.fullPath, exists: true });
        return row;
    }

    async function selectFile(row, lib) {
        document.querySelectorAll('.plrow.selected').forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
        selectedFile = lib;
        if (lib.exists) {
            const r = await window.electron.readFileContent(lib.fullPath);
            showPreview(lib.fileName, r.success ? r.content : 'Error: ' + r.error);
        } else {
            showPreview(lib.fileName, 'File not found at: ' + lib.fullPath);
        }
    }

    function toggleSection(h) { h.parentElement.classList.toggle('collapsed'); }

    function showPreview(t, c) {
        document.getElementById('filePreview').classList.add('show');
        document.getElementById('previewTitle').textContent = '📄 ' + t;
        document.getElementById('previewContent').textContent = c;
    }

    function closePreview() {
        document.getElementById('filePreview').classList.remove('show');
        document.querySelectorAll('.plrow.selected').forEach(r => r.classList.remove('selected'));
        selectedFile = null;
    }

   function updateContainerHeight() {
        const container = document.querySelector('.panelLib-container');
        if (container) {
            container.style.height = (window.innerHeight - 80) + 'px';
            console.log('Updated panelLib-container height to:', container.style.height);
        }
    }

    window.addEventListener('resize', updateContainerHeight);

    window.onload = () => {
        updateContainerHeight();
        loadLibrary('D:\\project\\DSpice\\lib\\library.lib');
    };