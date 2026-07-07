const { ipcMain, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const { spawn } = require("child_process");
const fs = require('fs');
const os = require('os');
const config = require('./config');

function getPythonFolder(){    
    
    const configPath = path.join(config.folderPath,'python', 'config.json');
    if (fs.existsSync(configPath)) {
        try {
            const _json = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            return path.join(config.folderPath, 'python', _json.pythonPath, "python.exe") 
        } catch (e) {
            return null;
        }
    }
    return null;
}


// Executing Python script and returning results-----------------------------------------------------------------------
// editor of codePy
let editWindowCodePy;


async function createEditWindowCodePy(codeCircuit,codeAnalysis,caption) {
    return new Promise((resolve) => {
      editWindowCodePy = new BrowserWindow({
            width: 800,
            height: 850,
            parent: BrowserWindow.getFocusedWindow(), 
            modal: true,
            icon: path.join(__dirname, 'build', 'logo_win.ico'), // 🖼️ modified logo
            autoHideMenuBar: true,
            resizable: false,
            minimizable: false,
            maximizable: false,
            title: caption,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false
            }
        });
        var pathpage=path.join(__dirname,'dialogs','editCodePy.html')
        
        editWindowCodePy.loadFile(pathpage);

        editWindowCodePy.webContents.once('did-finish-load', () => {
            editWindowCodePy.webContents.send('set-codePy', codeCircuit,codeAnalysis);
        });

        ipcMain.once('save-edited-codePy', (event, newText) => {
            resolve(newText); // ⬅️ return to `index.html`
            if (editWindowCodePy) {
                editWindowCodePy.close();
                editWindowCodePy = null;
            }
        });


                


        ipcMain.on("run-python-code", (event, code) => {
            if (pypyProcess) {
                console.log("PyPy process is already running.");
                return;
            }

            // Write the code to a temporary file
            const scriptPath = path.join(config.folderPath, 'temp_script.py');
            fs.writeFileSync(scriptPath,code , 'utf8');
            const pypyPath = getPythonFolder();
            console.log("Starting Python process...");
            pypyProcess = spawn(pypyPath, [scriptPath]);
    
                let buffer = "";

                pypyProcess.stdout.on("data", (data) => {
                    buffer += data.toString();

                    // تقسيم الإخراج إلى أسطر
                    let lines = buffer.split("\n");

                    // نحتفظ بآخر جزء لأنه قد يكون غير مكتمل
                    buffer = lines.pop();

                    for (let line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed) continue;

                        try {
                            const progressData = JSON.parse(trimmed);
                            editWindowCodePy.webContents.send("pyCode-progress", progressData);
                        } catch (error) {
                            // إذا لم يكن JSON نرسله كنص عادي
                            editWindowCodePy.webContents.send("pyCode-container", trimmed);
                        }
                    }
                });
    
                pypyProcess.stderr.on("data", (data) => {
                    console.error(`⚠️ stderr: ${data}`);
                    editWindowCodePy.webContents.send("pyCode-container", `⚠️ error: \n${data.toString()}`);
                });

                pypyProcess.on("close", (code) => {
                    console.log(`✅ انتهى PyPy برمز الخروج ${code}`);
                    // لو بقيت بيانات غير معالجة في buffer
                    if (buffer.trim()) {
                        try {
                            const lastData = JSON.parse(buffer.trim());
                            editWindowCodePy.webContents.send("pyCode-progress", lastData);
                        } catch {
                            editWindowCodePy.webContents.send("pyCode-container", buffer.trim());
                        }
                    }
                    buffer = "";
                    pypyProcess = null;
                    editWindowCodePy.webContents.send("pyCode-close");
                });
    });

        ipcMain.on("stop-python-execution", () => {
            if (pypyProcess) {
                console.log("🛑 Stope PyPy process...");
                pypyProcess.kill(); // stop process
                pypyProcess = null;
                editWindowCodePy.webContents.send("pyCode-close");
            } else {
                console.log("❌ PyPy process running.");
            }
        });


    });
    
}


ipcMain.handle('edit-codePy', async (event, codeCircuit,codeAnalysis,caption) => {
    return await createEditWindowCodePy(codeCircuit,codeAnalysis,caption);
});
            




const NGSPICE_PATH = path.join(config.folderPath, 'ngspice','bin', 'ngspice_con.exe');

ipcMain.handle('show-exec-op', async (event, spiceCode) => {
  try {
    // إنشاء ملف مؤقت للدائرة
    const tempDir = os.tmpdir();
    const circuitFile = path.join(tempDir, `circuit_${Date.now()}.cir`);
    const outputFile = path.join(tempDir, `output_${Date.now()}.txt`);

    // تعديل كود SPICE لإضافة كتلة .control إذا لم تكن موجودة
    let modifiedCode = spiceCode;

    // كتابة ملف الدائرة
    fs.writeFileSync(circuitFile, modifiedCode, 'utf-8');

    // تشغيل ngspice
    return new Promise((resolve, reject) => {
          const ngspiceProcess = spawn(NGSPICE_PATH, ['-b', circuitFile], {
            cwd: tempDir,
            env: { ...process.env, PATH: path.dirname(NGSPICE_PATH) + ';' + process.env.PATH }
          });
    
          let stdout = '';
          let stderr = '';
    
          ngspiceProcess.stdout.on('data', (data) => {
            stdout += data.toString();
          });
    
          ngspiceProcess.stderr.on('data', (data) => {
            stderr += data.toString();
          });
    
          ngspiceProcess.on('close', (code) => {
            // قراءة ملف الإخراج إذا وجد
            let outputContent = '';
            try {
              if (fs.existsSync(outputFile)) {
                outputContent = fs.readFileSync(outputFile, 'utf-8');
              }
            } catch (err) {
              console.error('Error reading output file:', err);
            }
    
            // تنظيف الملفات المؤقتة
            try {
              fs.unlinkSync(circuitFile);
              if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
            } catch (err) {
              console.error('Error cleaning temp files:', err);
            }
    
            // تحليل النتائج
            const results = parseSpiceResults(stdout, stderr, outputContent);
    
            resolve({
              success: code === 0,
              exitCode: code,
              stdout: stdout,
              stderr: stderr,
              outputFile: outputContent,
              results: results,
              rawOutput: stdout + '\n' + stderr
            });
          });
    
          ngspiceProcess.on('error', (error) => {
            // تنظيف الملفات المؤقتة
            try {
              fs.unlinkSync(circuitFile);
            } catch (err) {}
    
            reject({
              success: false,
              error: error.message,
              message: 'Failed to start ngspice. Please check the path: ' + NGSPICE_PATH
            });
          });
        });
    
      } catch (error) {
        return {
          success: false,
          error: error.message,
          message: 'Error preparing simulation'
        };
      }
    });

//*********************************************************************************** */

// تحليل نتائج ngspice
function parseSpiceResults(stdout, stderr, outputContent) {
  const results = {
    results: [],
    errors: [],
    warnings: []
  };

  const combinedOutput = stdout + '\n' + stderr + '\n' + outputContent;
  const lines = combinedOutput.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) continue;

    // البحث عن أخطاء
    if (trimmed.toLowerCase().includes('error') || trimmed.toLowerCase().includes('fatal')) {
      results.errors.push(trimmed);
    }

    // البحث عن تحذيرات
    if (trimmed.toLowerCase().includes('warning')) {
      results.warnings.push(trimmed);
    }
  }

  // تحليل النتائج من الناتج الكامل
  const allText = combinedOutput;

  // البحث عن نمط "v(node) = value" أو "i(component) = value"
  const viPattern = /([vi])\(([a-z0-9_]+)\)\s*=\s*([+-]?\d+\.?\d*[eE]?[+-]?\d*)/gi;
  let match;
  while ((match = viPattern.exec(allText)) !== null) {
    const type = match[1].toLowerCase();
    const name = match[2].trim();
    const value = parseFloat(match[3]);

    results.results.push({
      name: `${type}(${name})`,
      value: value,
      formatted: formatValue(value)
    });
  }

  // البحث عن نمط الجدول "node_name   value"
  const tablePattern = /^\s*([a-z][a-z0-9_]*)\s+([+-]?\d+\.\d+[eE][+-]?\d+)\s*$/gim;
  while ((match = tablePattern.exec(allText)) !== null) {
    const name = match[1].trim();
    const value = parseFloat(match[2]);

    // تجنب التكرار
    const exists = results.results.find(r => r.name === name);
    if (!exists) {
      results.results.push({
        name: name,
        value: value,
        formatted: formatValue(value)
      });
    }
  }

  // البحث عن نمط "print" output - أسطر تحتوي على قيم رقمية
  const printPattern = /^\s*([a-z][a-z0-9_]*)\s*=\s*([+-]?\d+\.?\d*[eE]?[+-]?\d*)\s*$/gim;
  while ((match = printPattern.exec(allText)) !== null) {
    const name = match[1].trim();
    const value = parseFloat(match[2]);

    const exists = results.results.find(r => r.name === name);
    if (!exists) {
      results.results.push({
        name: name,
        value: value,
        formatted: formatValue(value)
      });
    }
  }

  return results;
}

// تنسيق القيمة بشكل عام بدون وحدة محددة
function formatValue(value) {
  const absVal = Math.abs(value);

  if (absVal === 0) return '0';

  if (absVal >= 1e9) return (value / 1e9).toFixed(3) + ' G';
  if (absVal >= 1e6) return (value / 1e6).toFixed(3) + ' M';
  if (absVal >= 1e3) return (value / 1e3).toFixed(3) + ' k';
  if (absVal >= 1) return value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  if (absVal >= 1e-3) return (value * 1e3).toFixed(3) + ' m';
  if (absVal >= 1e-6) return (value * 1e6).toFixed(3) + ' µ';
  if (absVal >= 1e-9) return (value * 1e9).toFixed(3) + ' n';
  if (absVal >= 1e-12) return (value * 1e12).toFixed(3) + ' p';

  return value.toExponential(3);
}







//Analysis dialog--------------------------------------------------------------------------


let analysisWindow;
let ngspiceProcess = null;
let solveData= null;

async function createAnalysisWindow(spiceCode) {
    return new Promise((resolve) => {
        analysisWindow = new BrowserWindow({
            width: 450,
            height: 555,
            parent: BrowserWindow.getFocusedWindow(), 
            modal: true,
            icon: path.join(__dirname, 'build', 'logo.ico'), // 🖼️ modified logo
            autoHideMenuBar: true,
            resizable: false,
            minimizable: false,
            maximizable: false,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                enableRemoteModule: false,
                nodeIntegration: false
            }
        });

      
       
        
        analysisWindow.loadFile(path.join(__dirname, 'dialogs','processAnalysis.html'));


  
        ipcMain.on("start-progress", (event) => {

            const tempDir = os.tmpdir();
            const circuitFile = path.join(tempDir, `circuit_${Date.now()}.cir`);
            const resultsFile = path.join(tempDir, 'results.txt');

            let modifiedCode = spiceCode;
            const analysisType = detectAnalysisType(spiceCode);

            fs.writeFileSync(circuitFile, modifiedCode, 'utf-8');

            if (ngspiceProcess) {
                  console.log("Stopping ngspice process .....");
                  ngspiceProcess.kill(); // stop process
             
                  ngspiceProcess = null;
            }

            ngspiceProcess = spawn(NGSPICE_PATH, ['-b', circuitFile], {
                    cwd: tempDir,
                    env: { ...process.env, PATH: path.dirname(NGSPICE_PATH) + ';' + process.env.PATH }
                  });

            let stdout = '';
            let stderr = '';
            
            ngspiceProcess.stdout.on('data', (data) => { stdout += data.toString(); });
            ngspiceProcess.stderr.on('data', (data) => { stderr += data.toString(); });
            
            ngspiceProcess.on('close', (code) => {
                    let resultsContent = '';
                    try {
                      if (fs.existsSync(resultsFile)) {
                        resultsContent = fs.readFileSync(resultsFile, 'utf-8');
                      }
                    } catch (err) {}
            
                    try {
                      fs.unlinkSync(circuitFile);
                      if (fs.existsSync(resultsFile)) fs.unlinkSync(resultsFile);
                    } catch (err) {}
            
                    const results = parseSpiceResultstemp(stdout, stderr, resultsContent, analysisType);

        solveData={
          success: code === 0,
          exitCode: code,
          stdout: stdout,
          stderr: stderr,
          results: results,
          rawOutput: stdout + '\n' + stderr
        };

         analysisWindow.webContents.send("progress-update", { progress: 100, elapsed_time: "Stopped" });
         analysisWindow.webContents.send("random-data", { stdout: stdout, stderr:stderr });
        });

        ngspiceProcess.on('error', (error) => {
                try { fs.unlinkSync(circuitFile); } catch (err) {}
                 solveData={
                  success: false,
                  error: error.message,
                  message: 'Failed to start ngspice. Please check the path: ' + NGSPICE_PATH
                };
              });
            

        
      });

    
    
    
    //stop-progress
    ipcMain.on("stop-progress", () => {
              if (ngspiceProcess) {
                  console.log("Stopping ngspice process...");
                  ngspiceProcess.kill(); // stop process
                  ngspiceProcess = null;
                 ngspiceProcess.webContents.send("progress-update", { progress: 0, elapsed_time: "Stopped" });
              } else {
                  console.log("No ngspice process is running.");
              }
          });
    

       /* editWindowHtml.webContents.once('did-finish-load', () => {
            editWindowHtml.webContents.send('set-text-html', text);
        });*/

        ipcMain.once('send-spice-data', (event) => {
            resolve(solveData); // ⬅️ return to `index.html`
            if (analysisWindow) {
                analysisWindow.close();
                analysisWindow = null;
                ngspiceProcess = null;
            }
        });
 });
}


ipcMain.handle('analysis-dialog', async (event, sourceCode) => {
    return await createAnalysisWindow(sourceCode);
});


// ==================== Helper Functions ====================

function detectAnalysisType(code) {
  if (/\.tran\s+/i.test(code)) return 'tran';
  if (/\.op\s*$/im.test(code)) return 'op';
  if (/\.dc\s+/i.test(code)) return 'dc';
  if (/\.ac\s+/i.test(code)) return 'ac';
  return 'op';
}

function parseSpiceResultstemp(stdout, stderr, resultsContent, analysisType) {
  const results = {
    results: [],
    errors: [],
    warnings: [],
    type: analysisType
  };

  const combinedOutput = stdout + '\n' + stderr;
  const lines = combinedOutput.split('\n');

  // استخراج الأخطاء والتحذيرات
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.toLowerCase().includes('error') || trimmed.toLowerCase().includes('fatal')) {
      results.errors.push(trimmed);
    }
    if (trimmed.toLowerCase().includes('warning')) {
      results.warnings.push(trimmed);
    }
  }

  // ==================== قراءة ملف results.txt ====================
  if (resultsContent && resultsContent.trim()) {
    // إزالة رموز الصفحة الجديدة (form feed)
    const cleanContent = resultsContent.replace(/\f/g, '\n');
    const contentLines = cleanContent.split('\n');

    // التحقق من نوع الملف: OP (أسطر منفصلة) أو TRAN/DC/AC (جدول)
    // نبحث عن سطر يحتوي على Index + أي عمود X (time, v-sweep, frequency, ...)
    const hasTableHeader = contentLines.some(l => 
      l.includes('Index') && (
        l.includes('time') || 
        l.includes('v-sweep') || 
        l.includes('frequency') ||
        l.includes('freq')
      )
    );

    if (hasTableHeader) {
      // ===== تحليل TRAN/DC/AC: جدول بيانات =====
      parseTableData(contentLines, results);
    } else {
      // ===== تحليل OP: أسطر منفصلة =====
      parseOpData(contentLines, results);
    }

    return results;
  }

  // ==================== fallback: تحليل stdout ====================
  parseStdoutData(combinedOutput, results);
  return results;
}

// تحليل بيانات الجدول (TRAN/DC/AC)
function parseTableData(contentLines, results) {
  let varNames = [];
  let xAxisName = 'x';
  let dataRows = [];
  let inDataSection = false;

  for (let i = 0; i < contentLines.length; i++) {
    const line = contentLines[i].trim();
    if (!line) continue;

    // تجاهل أسطر الترويسة والفواصل
    if (line.includes('---') || line.includes('Analysis') || line.includes('Index')) {
      // استخراج أسماء الأعمدة من سطر الرأس
      if (line.includes('Index')) {
        const parts = line.split(/\s+/).filter(p => p && p !== 'Index');
        if (parts.length > 0) {
          xAxisName = parts[0]; // time أو v-sweep أو frequency
          varNames = parts.slice(1); // v(a), v(b), i(vdd), ...
        }
      }
      inDataSection = true;
      continue;
    }

    // قراءة صفوف البيانات
    if (inDataSection) {
      const parts = line.split(/\s+/).filter(p => p);
      // يجب أن يكون العمود الأول رقم Index، الثاني X، والباقي قيم
      if (parts.length >= 3 && !isNaN(parseFloat(parts[0]))) {
        dataRows.push(parts);
      }
    }
  }

  // بناء القوائم
  for (let colIdx = 0; colIdx < varNames.length; colIdx++) {
    const list = [];
    for (const row of dataRows) {
      // row[0] = Index, row[1] = X (time/v-sweep/freq), row[2+] = values
      const x = parseFloat(row[1]);
      const value = parseFloat(row[colIdx + 2]);
      if (!isNaN(x) && !isNaN(value)) {
        list.push([x, value]);
      }
    }
    if (list.length > 0) {
      results.results.push({
        name: varNames[colIdx],
        data: list
      });
    }
  }
}

// تحليل بيانات OP
function parseOpData(contentLines, results) {
  for (const line of contentLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // نمط: v(a) = 1.500000e+01
    const match = trimmed.match(/^([a-z]\([a-z0-9_]+\))\s*=\s*([+-]?\d+\.?\d*[eE]?[+-]?\d*)/i);
    if (match) {
      const name = match[1];
      const value = parseFloat(match[2]);
      results.results.push({
        name: name,
        value: value,
        formatted: formatValuetemp(value)
      });
    }
  }
}

// تحليل stdout كـ fallback
function parseStdoutData(allText, results) {
  // نمط "v(node) = value"
  const vPattern = /v\(([a-z0-9_]+)\)\s*=\s*([+-]?\d+\.?\d*[eE]?[+-]?\d*)/gi;
  let match;
  while ((match = vPattern.exec(allText)) !== null) {
    const name = match[1].trim();
    const value = parseFloat(match[2]);
    const exists = results.results.find(r => r.name === `v(${name})`);
    if (!exists) {
      results.results.push({ name: `v(${name})`, value: value, formatted: formatValuetemp(value) });
    }
  }

  // جدول Node Voltage
  const nodeTablePattern = /Node\s+Voltage[\s\S]*?----\s*\n\s*----\s*-------\n([\s\S]*?)(?=\n\s*Source|$)/i;
  const nodeTableMatch = allText.match(nodeTablePattern);
  if (nodeTableMatch) {
    const tableLines = nodeTableMatch[1].split('\n');
    for (const line of tableLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.includes('----')) continue;
      const nodeMatch = trimmed.match(/^([a-z][a-z0-9_]*)\s+([+-]?\d+\.\d+[eE][+-]?\d+)/i);
      if (nodeMatch) {
        const name = nodeMatch[1].trim();
        const value = parseFloat(nodeMatch[2]);
        const exists = results.results.find(r => r.name === `v(${name})`);
        if (!exists) {
          results.results.push({ name: `v(${name})`, value: value, formatted: formatValuetemp(value) });
        }
      }
    }
  }

  // جدول Source Current
  const currentTablePattern = /Source\s+Current[\s\S]*?------\s*\n\s*------\s*-------\n([\s\S]*?)(?=\n\s*\w+\s+models|$)/i;
  const currentTableMatch = allText.match(currentTablePattern);
  if (currentTableMatch) {
    const tableLines = currentTableMatch[1].split('\n');
    for (const line of tableLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.includes('------')) continue;
      const currentMatch = trimmed.match(/^([a-z][a-z0-9_#]+)\s+([+-]?\d+\.\d+[eE][+-]?\d+)/i);
      if (currentMatch) {
        const name = currentMatch[1].trim();
        const value = parseFloat(currentMatch[2]);
        const exists = results.results.find(r => r.name === `i(${name})`);
        if (!exists) {
          results.results.push({ name: `i(${name})`, value: value, formatted: formatValuetemp(value) });
        }
      }
    }
  }

  // إضافة GND
  const hasVoltages = results.results.some(r => r.name.startsWith('v('));
  if (hasVoltages && !results.results.find(r => r.name === 'v(0)')) {
    results.results.unshift({ name: 'v(0)', value: 0, formatted: '0' });
  }
}

function formatValuetemp(value) {
  const absVal = Math.abs(value);
  if (absVal === 0) return '0';
  if (absVal >= 1e9) return (value / 1e9).toFixed(3) + ' G';
  if (absVal >= 1e6) return (value / 1e6).toFixed(3) + ' M';
  if (absVal >= 1e3) return (value / 1e3).toFixed(3) + ' k';
  if (absVal >= 1) return value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  if (absVal >= 1e-3) return (value * 1e3).toFixed(3) + ' m';
  if (absVal >= 1e-6) return (value * 1e6).toFixed(3) + ' µ';
  if (absVal >= 1e-9) return (value * 1e9).toFixed(3) + ' n';
  if (absVal >= 1e-12) return (value * 1e12).toFixed(3) + ' p';
  return value.toExponential(3);
}



module.exports = {
    getPythonFolder
  };










