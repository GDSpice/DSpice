
function addCodeHtml(elem) {
    var newElement = document.createElementNS("http://www.w3.org/2000/svg", 'foreignObject');
    newElement.setAttribute("x", 0);
    newElement.setAttribute("y", 0);
    newElement.setAttribute("width", 222);
    newElement.setAttribute("height", 200);
	  newElement.innerHTML =`<div  name="htmlCode"  style="zoom:60%;" 
    code="<div class='ch'><h1>Hellow word</h1>\n <p>Here write the text in HTML</p></div>">

    <!-- Parent container that responds to mouse movement -->
    <div class="chtool"> 
        
        <!-- tool bar-->
        <div class="ch-page-toolbar">
            <button class="ch-toolbar-button" title="Home" onclick="goHome()">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3 L3 10 V21 H9 V15 H15 V21 H21 V10 Z"/>
                </svg>
            </button>
           <button class="ch-toolbar-button" title="Modified" onclick="modifyAction()">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
            </button>
        </div>

       <div class="ch">
         <h1>Hellow word</h1> 
         <p> Here write the text in HTML</p> 
       </div>
    </div>
    `;
    newElement.firstChild.style.height =200+'px';
    newElement.firstChild.style.width =222+'px';
    elem.appendChild(newElement);
}


function modifedSizeCodeHtml(element) {
  var a=100/60;
    if (element.getAttribute("name") == "codeHTML") {
        var x = parseInt(element.getAttribute("x"));
        var y = parseInt(element.getAttribute("y"));
        var w = parseInt(element.getAttribute("width"))*a;
        var h = parseInt(element.getAttribute("height"));

        element.setAttribute('transform', "translate(" + x + "," + y + ")");
        
        element.firstChild.style.height=h+'px';
        element.firstChild.style.width=w+'px';
        element.firstChild.firstChild.style.height=h+'px';
		    element.firstChild.firstChild.style.width=w+'px';
    }
}



function updateHtmlCode(){
  var s=document.getElementsByName('htmlCode');
  var i=0;
  while (i <= s.length-1) {
    s[i].innerHTML= ` 
    <!-- Parent container that responds to mouse movement -->
    <div class="chtool"> 
        
        <!-- tool bar-->
        <div class="ch-page-toolbar">
            <button class="ch-toolbar-button" title="Home" onclick="goHome()">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3 L3 10 V21 H9 V15 H15 V21 H21 V10 Z"/>
                </svg>
            </button>
            <button class="ch-toolbar-button" title="Modified" onclick="modifyAction()">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
            </button>
        </div>

       ${s[i].getAttribute("code")}
    </div>
    `;
    
    
    

    MathJax.Hub.Queue(["Typeset",MathJax.Hub,s[i]]);
   i++;
 }
}

function setHtmlCode(text){
  mtable.select.firstChild.firstChild.innerHTML=text;
  mtable.select.firstChild.firstChild.setAttribute("code",text);
  updateHtmlCode();
}


async function openEditHtml() {
  const originalText = mtable.select.firstChild.firstChild.getAttribute("code");
  const editedText = await window.electron.editTextHtml(originalText,'HTML Code Editor');
  setHtmlCode(editedText);
}


async function openEditCSS() {
  const originalText = mtable.select.getAttribute("style");
  const editedText = await window.electron.editTextHtml(originalText,'Style Editor');
  mtable.select.setAttribute("style",editedText);
}


function goHome(){
  var data=`

      <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
                <style>
body {
    font-family: Arial, sans-serif;
    margin: 0;          /* Remove default browser margin */
    padding: 0;         /* Remove default padding */
    background-color: #f0f0f0;
}

.chtool {
    position: relative;
    width: 100%;        /* Fill the full width */
    max-width: none;    /* Cancel max-width limit */
    margin: 0;          /* Cancel centering */
}

.ch {
    font-family: Arial, sans-serif;
    width: 100%;        /* Fill the full width */
    max-width: none;    /* Cancel max-width limit */
    margin: 0;          /* Cancel centering */
    padding: 20px;      /* Internal spacing only (can set to 0 if desired) */
    background-color: #f9f9f9;
    border-radius: 0;   /* Remove rounded corners */
    color: #333;
    box-sizing: border-box;
    position: relative;
}


.ch h1 {
    color: #2c3e50;
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
    font-size: 24px;
    margin-top: 0;
}

.ch h2 {
    color: #34495e;
    font-size: 18px;
    margin-top: 20px;
    margin-bottom: 10px;
}

.ch h3 {
    font-size: 16px;
    margin-top: 0;
    margin-bottom: 10px;
}


.ch ul {
    line-height: 1.6;
    margin: 0;
    padding-left: 20px;
}


.ch-card {
    background-color: #ffffff;
    padding: 15px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    margin-bottom: 20px;
}

.ch-card.green-border {
    border-top: 3px solid #2ecc71;
}

.ch-card.green-border h2 {
    color: #27ae60;
}


.ch-formula {
    background-color: #fff3cd;
    padding: 12px;
    border-left: 4px solid #ffc107;
    font-family: 'Courier New', monospace;
    border-radius: 4px;
    margin-bottom: 20px;
    font-size: 15px;
}

.ch-formula strong {
    color: #d35400;
}


.ch-grid {
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    margin-bottom: 20px;
}

.ch-col {
    flex: 1;
    min-width: 280px;
    padding: 15px;
    border-radius: 5px;
}

/* ألوان أعمدة النتائج */
.ch-col.blue {
    background-color: #e8f4f8;
    border-left: 4px solid #3498db;
}

.ch-col.blue h3 {
    color: #2980b9;
}

.ch-col.red {
    background-color: #fdf2f2;
    border-left: 4px solid #e74c3c;
}

.ch-col.red h3 {
    color: #c0392b;
}

/*
@media (max-width: 600px) {
    .ch-grid {
        flex-direction: column;
    }
    .ch-col {
        min-width: 100%;
    }
}*/



/****************************************************************/



   

        /* Toolbar hidden by default */
        .ch-page-toolbar {
            position: fixed;
            top: 20px;
            left: 20px;
            display: flex;
            gap: 6px;
            z-index: 9999;
            opacity: 0;
            transform: translateY(-10px);
            pointer-events: none; /* Prevents clicking while hidden */
            transition: opacity 0.3s ease, transform 0.3s ease;
            background: rgba(255, 255, 255, 0.9);
            padding: 8px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        /* Fix here: When hovering over the parent .chtool container, the toolbar appears */
        .chtool:hover .ch-page-toolbar {
            opacity: 1;
            transform: translateY(0);
            pointer-events: auto; /* Allows clicking when visible */
        }

        .ch-toolbar-button {
            width: 45px;
            height: 45px;
            border: none;
            padding: 0;
            background: #d0d0d0;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border-radius: 6px;
            transition: background 0.2s;
        }

        .ch-toolbar-button:hover {
            background: #bcbcbc;
        }

        .ch-toolbar-button svg {
            width: 24px;
            height: 24px;
            fill: #555;
        }

        @media print {
            .ch-page-toolbar {
                display: none !important;
            }
        }
     </style>
    </head>
    <body>

        <!-- Parent container that responds to mouse movement -->
    <div class="chtool"> 
        
        <!-- tool bar-->
        <div class="ch-page-toolbar">
            <button class="ch-toolbar-button" title="Print" onclick="printPage()">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
                </svg>
            </button>

            <!-- زر حفظ HTML (Save HTML) - إضافة جديدة -->
            <button class="ch-toolbar-button" title="HTML (Save)" onclick="saveHtml()">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                </svg>
            </button>
        </div>

       ${mtable.select.firstChild.firstChild.getAttribute("code")}
    </div>
    <script>
 // 3. دالة زر الطباعة (Print)
    window.printPage = function() {
        window.print();
    }

    // 4. دالة زر حفظ HTML (Save HTML)
    window.saveHtml = function() {
        // الحصول على محتوى الصفحة بالكامل
        const htmlContent = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;
        
        // إنشاء Blob من المحتوى
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        
        // إنشاء رابط تحميل مؤقت
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
  
        link.download = 'page.html'; // اسم الملف المحفوظ
        
        // إضافة الرابط للصفحة والنقر عليه برمجياً
        document.body.appendChild(link);
        link.click();
        
        // تنظيف الرابط المؤقت
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        
        console.log("تم حفظ الصفحة بنجاح!");
    }
    </script>

    </body>
  </html>


  `;
    window.electron.openHtmlWindow(data);
}