  /*const defaultData = {
        header: { title: "Circle", subtitle: "Selected Objects  1" },
        sections: [
            {
                title: "Basic Properties",
                collapsed: false,
                showReset: true,
                rows: [
                    { label: "X Location", type: "number", value: "7" },
                    { label: "Y Location", type: "button", value: "4.15inch" },
                    { label: "Radius", type: "text", value: "1.56inch" },
                    { label: "Line Width", type: "dropdown", value: "1(Default)", options: ["1(Default)", "2", "3", "4", "5"] },
                    { label: "Line Style", type: "dropdown", value: "solid(Default)", options: ["solid(Default)", "dashed", "dotted", "double"] },
                    { label: "Stroke Color", type: "color", value: "#000000(Default)", color: "#000000" },
                    { label: "Fill Color", type: "color", value: "none(Default)", color: "#ffffff" },
                    { label: "Fill", type: "dropdown", value: "Solid(Default)", options: ["Solid(Default)", "Gradient", "Pattern", "None"] }
                ]
            },
            {
                title: "Group",
                collapsed: false,
                showReset: false,
                rows: [
                    { label: "Group", type: "dropdown", value: "", options: ["", "Group 1", "Group 2", "Group 3"] }
                ]
            }
        ]
    };*/
    
    let defaultData = null;
    let propertiesData = JSON.parse(JSON.stringify(defaultData));

    /* ===== Editable Dropdown Component ===== */
    function createDropdownEdit(options, value, onChange) {
        const wrapper = document.createElement('div');
        wrapper.className = 'pedit-wrap';

        const inputWrap = document.createElement('div');
        inputWrap.className = 'pedit-input-wrap';

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'pedit-input';
        input.value = value;
        input.autocomplete = 'off';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pedit-btn';
        btn.innerHTML = '▼';

        inputWrap.appendChild(input);
        inputWrap.appendChild(btn);
        wrapper.appendChild(inputWrap);

        const list = document.createElement('div');
        list.className = 'pedit-list';

        options.forEach(opt => {
            const item = document.createElement('div');
            item.className = 'pedit-item';
            item.dataset.value = opt;
            item.textContent = opt;
            list.appendChild(item);
        });

        wrapper.appendChild(list);

        let isOpen = false;
        let activeIndex = -1;
        const items = Array.from(list.querySelectorAll('.pedit-item'));

        function show() {
            isOpen = true;
            list.classList.add('show');
            btn.innerHTML = '▲';
            jumpToMatch();
        }

        function hide() {
            isOpen = false;
            list.classList.remove('show');
            btn.innerHTML = '▼';
            activeIndex = -1;
            items.forEach(i => i.classList.remove('active', 'matched'));
        }

        function toggle() {
            isOpen ? hide() : show();
        }

        function jumpToMatch() {
            const val = input.value.trim();
            items.forEach(i => i.classList.remove('active', 'matched'));
            if (!val) { activeIndex = -1; return; }
            const idx = items.findIndex(item => item.textContent.toLowerCase().startsWith(val.toLowerCase()));
            if (idx !== -1) {
                activeIndex = idx;
                items[idx].classList.add('active', 'matched');
                items[idx].scrollIntoView({ block: 'nearest' });
            } else {
                activeIndex = -1;
            }
        }

        function select(item) {
            input.value = item.dataset.value;
            hide();
            onChange(item.dataset.value);
        }

        input.addEventListener('input', () => {
            if (!isOpen) show(); else jumpToMatch();
            onChange(input.value);
        });

        input.addEventListener('focus', () => { if (!isOpen) show(); });

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggle();
            if (isOpen) input.focus();
        });

        items.forEach(item => {
            item.addEventListener('click', () => select(item));
        });

        input.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    if (!isOpen) show();
                    items.forEach(i => i.classList.remove('active'));
                    if (activeIndex < items.length - 1) activeIndex++;
                    items[activeIndex].classList.add('active');
                    items[activeIndex].scrollIntoView({ block: 'nearest' });
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (activeIndex > 0) {
                        items.forEach(i => i.classList.remove('active'));
                        activeIndex--;
                        items[activeIndex].classList.add('active');
                        items[activeIndex].scrollIntoView({ block: 'nearest' });
                    }
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (isOpen && activeIndex >= 0 && items[activeIndex]) {
                        select(items[activeIndex]);
                    } else {
                        hide();
                        onChange(input.value);
                    }
                    break;
                case 'Escape':
                    hide();
                    break;
            }
        });

        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) hide();
        });

        input.addEventListener('blur', () => {
            setTimeout(() => {
                if (!list.matches(':hover') && !btn.matches(':hover')) hide();
            }, 150);
        });

        return wrapper;
    }
/* =====  End of Editable Dropdown Component ===== */

    function buildPanel() {
        if(!propertiesData) return;
        const panel = document.getElementById('propertiesPanel1');
        panel.className='panel1';
        panel.innerHTML = '';

        const header = document.createElement('div');
        header.className = 'panel-header';
        header.innerHTML = `<span>${propertiesData.header.title}</span><span class="selected-display">${propertiesData.header.subtitle}</span>`;
        panel.appendChild(header);
        const asections = document.createElement('div');
        asections.className = 'panel-sections';
        panel.appendChild(asections);

        propertiesData.sections.forEach((section, sIdx) => {
            const secDiv = document.createElement('div');
            secDiv.className = 'psection' + (section.collapsed ? ' collapsed' : '');

            const secHeader = document.createElement('div');
            secHeader.className = 'psection-header';
            secHeader.textContent = section.title;
            secHeader.onclick = () => {
                section.collapsed = !section.collapsed;
                secDiv.classList.toggle('collapsed');
                updatePreview();
            };
            secDiv.appendChild(secHeader);

            const body = document.createElement('div');
            body.className = 'psection-body';

            section.rows.forEach((row, rIdx) => {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'prow';

                const label = document.createElement('div');
                label.className = 'plabel';
                label.textContent = row.label;
                rowDiv.appendChild(label);

                const valueDiv = document.createElement('div');
                valueDiv.className = 'pvalue';

                if ((row.type === 'text') || row.type === 'number' || row.type === 'button') {
                    const input = document.createElement('input');
                    input.type = row.type;// === 'number' ? 'number' : 'text';
                    input.className = 'pinput';
                    input.value = row.value;
                    if (row.readonly!==undefined && row.readonly) 
                        input.setAttribute("readonly", true);
                    input.oninput = (e) => {
                        propertiesData.sections[sIdx].rows[rIdx].value = e.target.value;
                        updatePreview();
                    };
                    valueDiv.appendChild(input);
                } else if (row.type === 'dropdown') {
                    const select = document.createElement('select');
                    select.className = 'pselect';
                    row.options.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt;
                        option.textContent = opt;
                        if (opt === withOutQuotationMarks(row.value)) option.selected = true;
                        select.appendChild(option);
                    });
                    select.onchange = (e) => {
                        propertiesData.sections[sIdx].rows[rIdx].value = e.target.value;
                        updatePreview();
                    };
                    valueDiv.appendChild(select);
                }  else if (row.type === 'dropdownedit') {
                    // Editable dropdown with input + button + list
                    const combo = createDropdownEdit(row.options, row.value, (newValue) => {
                        propertiesData.sections[sIdx].rows[rIdx].value = newValue;
                        updatePreview();
                    });
                    valueDiv.appendChild(combo);
                } else if (row.type === 'color') {
                    const colorBox = document.createElement('div');
                    colorBox.className = 'pcolor-box';
                    colorBox.style.backgroundColor = row.color;

                    const colorInput = document.createElement('input');
                    colorInput.type = 'color';
                    colorInput.value = row.color;
                    colorInput.oninput = (e) => {
                        const hex = e.target.value;
                        colorBox.style.backgroundColor = hex;
                        propertiesData.sections[sIdx].rows[rIdx].color = hex;
                        propertiesData.sections[sIdx].rows[rIdx].value = hex;
                        colorVal.textContent = hex;
                        updatePreview();
                    };
                    colorBox.appendChild(colorInput);
                    valueDiv.appendChild(colorBox);

                    const colorVal = document.createElement('span');
                    colorVal.className = 'pcolor-value';
                    colorVal.textContent = row.value;
                    valueDiv.appendChild(colorVal);

                    const refresh = document.createElement('span');
                    refresh.className = 'prefresh-icon';
                    refresh.innerHTML = '↻';
                    refresh.title = 'Reset color';
                    refresh.onclick = () => {
                        const def = defaultData.sections[sIdx].rows[rIdx];
                        propertiesData.sections[sIdx].rows[rIdx].value = def.value;
                        propertiesData.sections[sIdx].rows[rIdx].color = def.color;
                        buildPanel();
                        updatePreview();
                    };
                    valueDiv.appendChild(refresh);
                } else if (row.type === 'Button') {
                    const btn = document.createElement('input');
                    btn.type = 'button';
                    btn.className = 'pinput';
                    btn.value = row.value;
                    btn.setAttribute("onclick", row.setClick);
                    valueDiv.appendChild(btn);
                } else if (row.type === 'dropdown') {
                    const select = document.createElement('select');
                    select.className = 'pselect';
                    row.options.forEach(opt => {
                        const option = document.createElement('option');
                        option.value = opt;
                        option.textContent = opt;
                        if (opt === withOutQuotationMarks(row.value)) option.selected = true;
                        select.appendChild(option);
                    });
                    select.onchange = (e) => {
                        propertiesData.sections[sIdx].rows[rIdx].value = e.target.value;
                        updatePreview();
                    };
                    valueDiv.appendChild(select);
                } else if (row.type === 'axeproperty') {
                    const colorBox = document.createElement('div');
                    colorBox.className = 'pcolor-box';
                    colorBox.style.backgroundColor = row.color;

                    const colorInput = document.createElement('input');
                    colorInput.type = 'color';
                    colorInput.value = row.color;
                    colorInput.setAttribute("onchange", row.setChange);
                    colorInput.oninput = (e) => {
                        const hex = e.target.value;
                        colorBox.style.backgroundColor = hex;
                        propertiesData.sections[sIdx].rows[rIdx].color = hex;
                        propertiesData.sections[sIdx].rows[rIdx].value = hex;
                        colorVal.textContent = hex;
                        updatePreview();
                    };
                    colorBox.appendChild(colorInput);
                    valueDiv.appendChild(colorBox);

                    const colorVal = document.createElement('span');
                    colorVal.className = 'pcolor-value';
                    colorVal.textContent = row.value;
                    valueDiv.appendChild(colorVal);

                    const refresh = document.createElement('span');
                    refresh.className = 'prefresh-icon';
                    refresh.innerHTML = '🗑';
                    refresh.title = 'Delete';
                    refresh.setAttribute("onclick", row.setClick);
                    valueDiv.appendChild(refresh);
                } 

                rowDiv.appendChild(valueDiv);
                body.appendChild(rowDiv);
            });

           /* if (section.showReset) {
                const resetBtn = document.createElement('div');
                resetBtn.className = 'preset-btn';
                resetBtn.textContent = 'Reset Default Style';
                resetBtn.onclick = () => {
                    propertiesData.sections[sIdx].rows = JSON.parse(JSON.stringify(defaultData.sections[sIdx].rows));
                    buildPanel();
                    updatePreview();
                };
                body.appendChild(resetBtn);
            }*/

            secDiv.appendChild(body);
            asections.appendChild(secDiv);
        });
    }

    function updatePreview() {
        const pre = document.getElementById('jsonPreview');
     /*   if (pre.classList.contains('show')) {
            pre.textContent = JSON.stringify(propertiesData, null, 2);
        }*/
       // console.log("propertiesData", propertiesData);
        changeSelect();
    }

    function togglePreview() {
        const pre = document.getElementById('jsonPreview');
        pre.classList.toggle('show');
        updatePreview();
    }

    function exportJSON() {
        const dataStr = JSON.stringify(propertiesData, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'properties.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function resetData() {
        propertiesData = JSON.parse(JSON.stringify(defaultData));
        buildPanel();
        updatePreview();
    }

    buildPanel();

