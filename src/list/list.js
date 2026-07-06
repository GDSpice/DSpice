
/*
#-------------------------------------------------------------------------------
# Name:        List.js
# Description: List of elments
# Author:      d.fathi
# Created:     26/06/2026
# Update:      26/06/2026
# Copyright:   (c) DSpice 2026
# Licence:     free 
#-------------------------------------------------------------------------------
*/
const preSelectedValue = null;

    let selectedNode = null;
    let onResultCallback = null;

    function init(data, preSelected) {
      if (data) {
        treeData = data;
      }
      const preSel = preSelected !== undefined ? preSelected : preSelectedValue;
      renderTree(treeData, preSel);
    }

    function renderTree(data, preSel) {
      const treecontainer = document.getElementById('tree-container');
      treecontainer.innerHTML = ''; // Clear previous content
      const container = document.createElement('div');
      container.className = 'tcontainer';
      treecontainer.appendChild(container);
      

      data.forEach((group, index) => {
        const groupNode = createGroupNode(group, index, preSel);
        container.appendChild(groupNode);
      });
    }

    function createGroupNode(group, index, preSel) {
      const div = document.createElement('div');
      div.className = 'group-node';

      // Group header (collapsible)
      const header = document.createElement('div');
      header.className = 'section-header';
      // تمرير index لحفظ الحالة في treeData
      header.onclick = () => toggleSection(header, childrenDiv, index);

      const arrow = document.createElement('span');
      arrow.className = 'arrow';

      const title = document.createElement('span');
      title.className = 'section-title';
      title.textContent = group.name + ' (' + group.nodes.length + ')';

      header.appendChild(arrow);
      header.appendChild(title);
      div.appendChild(header);

      // Children container - with scroll
      const childrenDiv = document.createElement('div');
      childrenDiv.className = 'children';

      group.nodes.forEach((nodeValue) => {
        const row = document.createElement('div');
        row.className = 'node-row';
        row.dataset.value = nodeValue;
        row.onclick = (e) => {
          e.stopPropagation();
          selectNode(row, nodeValue);
        };

        if (preSel && nodeValue === preSel) {
          row.classList.add('selected');
          selectedNode = nodeValue;
          document.getElementById('selected-display').textContent = nodeValue;
        }

        const indicator = document.createElement('div');
        indicator.className = 'type-indicator';

        const label = document.createElement('span');
        label.className = 'node-label';
        label.textContent = nodeValue;

        row.appendChild(indicator);
        row.appendChild(label);
        childrenDiv.appendChild(row);
      });

      div.appendChild(childrenDiv);

      // Apply collapsed state from treeData
      const isCollapsed = group.collapsed === false;
      if (isCollapsed) {
        childrenDiv.classList.add('collapsed');
        arrow.classList.add('collapsed');
        arrow.innerHTML = '▶';
      } else {
        arrow.innerHTML = '▼';
      }

      return div;
    }

    // تحديث treeData عند الطي/الفتح
    function toggleSection(header, content, groupIndex) {
      const arrow = header.querySelector('.arrow');
      const isNowCollapsed = !content.classList.contains('collapsed');

      // تبديل الحالة في DOM
      content.classList.toggle('collapsed');
      arrow.classList.toggle('collapsed');
      arrow.innerHTML = content.classList.contains('collapsed') ? '▶' : '▼';

      // حفظ الحالة الجديدة في treeData
      if (treeData[groupIndex]) {
        treeData[groupIndex].collapsed = isNowCollapsed;
        console.log('Group "' + treeData[groupIndex].name + '" collapsed =', isNowCollapsed);
        console.log('Current treeData:', JSON.parse(JSON.stringify(treeData)));
      }
    }

    function selectNode(rowElement, value) {
      document.querySelectorAll('.node-row.selected').forEach(r => {
        r.classList.remove('selected');
      });
      rowElement.classList.add('selected');
      selectedNode = value;
      document.getElementById('selected-display').textContent = value;
      selectElemByIndex(value);
    }

    function clearSelection() {
      document.querySelectorAll('.node-row.selected').forEach(r => {
        r.classList.remove('selected');
      });
      selectedNode = null;
      document.getElementById('selected-display').textContent = 'No selection';
    }


    // ============================================================
    // واجهة برمجية (API)
    // ============================================================
    function openNodeSelector(data, preSelected) {
      return new Promise((resolve) => {
        onResultCallback = (result) => {
          onResultCallback = null;
          resolve(result);
        };
        init(data, preSelected);
      });
    }

    function setOnResult(callback) {
      onResultCallback = callback;
    }

    // دالة للحصول على treeData الحالي (مع حالات collapsed)
    function getTreeData() {
      return JSON.parse(JSON.stringify(treeData));
    }

    // دالة لتعيين treeData من الخارج
    function setTreeData(data) {
      treeData = JSON.parse(JSON.stringify(data));
      renderTree(treeData, null);
    }

    window.openNodeSelector = openNodeSelector;
    window.setOnResult = setOnResult;
    window.getTreeData = getTreeData;
    window.setTreeData = setTreeData;
    window.init = init;