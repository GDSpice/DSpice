const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function registerLibraryHandlers() {

    ipcMain.handle('read-library', async (event, libPath) => {
        try {
            const content = fs.readFileSync(libPath, 'utf-8');
            const libDir = path.dirname(libPath);

            const lines = content.split(/\r?\n/);
            const libraries = [];

            lines.forEach((line) => {
                const trimmed = line.trim();

                if (trimmed.toLowerCase().startsWith('.include')) {
                    const match = trimmed.match(/\.include\s+["'](.+)["']/i);

                    if (match) {
                        const filePath = match[1];
                        const isAbsolute = path.isAbsolute(filePath);
                        const fileName = path.basename(filePath);

                        let fullLocalPath = null;
                        let exists = false;

                        if (!isAbsolute) {
                            fullLocalPath = path.resolve(libDir, filePath);
                            exists = fs.existsSync(fullLocalPath);
                        } else {
                            exists = fs.existsSync(filePath);
                            fullLocalPath = filePath;
                        }

                        libraries.push({
                            fileName: fileName,
                            filePath: filePath,
                            fullPath: fullLocalPath,
                            isLocal: !isAbsolute,
                            exists: exists
                        });
                    }
                }
            });

            return {
                success: true,
                libPath: libPath,
                libName: path.basename(libPath),
                libDir: libDir,
                libraries: libraries
            };

        } catch (err) {
            return {
                success: false,
                error: err.message
            };
        }
    });


    function findLibFilesRecursive(dir, baseDir) {
        const results = [];

        try {
            const items = fs.readdirSync(dir, {
                withFileTypes: true
            });

            for (const item of items) {
                const fullPath = path.join(dir, item.name);
                const relativePath = path.relative(baseDir, fullPath);

                if (item.isDirectory()) {

                    const subResults =
                        findLibFilesRecursive(fullPath, baseDir);

                    results.push(...subResults);

                } else if (
                    item.isFile() &&
                    item.name.toLowerCase().endsWith('.lib')
                ) {
                    const stat = fs.statSync(fullPath);

                    results.push({
                        fileName: item.name,
                        relativePath: relativePath,
                        dir: path.dirname(relativePath),
                        fullPath: fullPath,
                        size: stat.size
                    });
                }
            }

        } catch (e) {
            console.error(
                'Error reading dir:',
                dir,
                e.message
            );
        }

        return results;
    }


    ipcMain.handle(
        'read-circuit-project-libs',
        async (event, circuitPath) => {

            try {
                const projectDir = path.dirname(circuitPath);

                const projectLibs =
                    findLibFilesRecursive(
                        projectDir,
                        projectDir
                    );

                return {
                    success: true,
                    circuitPath: circuitPath,
                    circuitName: path.basename(circuitPath),
                    projectDir: projectDir,
                    libCount: projectLibs.length,
                    projectLibs: projectLibs
                };

            } catch (err) {

                return {
                    success: false,
                    error: err.message
                };
            }
        }
    );


    ipcMain.handle(
        'read-file-content',
        async (event, filePath) => {

            try {
                const content =
                    fs.readFileSync(filePath, 'utf-8');

                return {
                    success: true,
                    content: content
                };

            } catch (err) {

                return {
                    success: false,
                    error: err.message
                };
            }
        }
    );
}

module.exports = {
    registerLibraryHandlers
};