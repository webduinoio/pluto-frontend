function stdin_func() {

}

function stdout_func(msg) {
    output.innerHTML = output.innerHTML + msg + '<br>';
}

function stderr_func(msg) {
    output.innerHTML = output.innerHTML + msg + '<br>';
}

async function runPython(code) {
    await pyodide.runPython(code);
}

let pyodide;
async function main() {
    console.log("init pyodide....");
    pyodide = await loadPyodide({
        //stdin: stdin_func,
        stdout: stdout_func,
        stderr: stderr_func,
    });
    // Pyodide is now ready to use...
    console.log("pyodide ready !");
    run.removeAttribute('disabled');
};
main();
