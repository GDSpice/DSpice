# DSpice
DSpice: Design and Simulation of Circuits using Spice

<h4 align="center">
    <a href="https://dspice.sourceforge.io/"><img src="https://dspice.sourceforge.io/logo.png" width="175px" alt="DSpice"></a>
    <br>
    <a href="https://dspice.sourceforge.io/">https://dspice.sf.net/</a>
    
</h4>

---

<p align="center">
 
 <a href="#News">
    <img src="https://img.shields.io/badge/Version-0.1.4-blue" alt="v0.1.4">
 </a>

    
  <a href="https://github.com/GDSpice/DSpice/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/Licenses-MIT-blue?labelColor=black" alt="MIT-licenses">
  </a>
</p>


***************
What is DSpice?
***************

DSpice (Designing Circuits and Simulation by SPICE) is an open-source tool designed to streamline the modeling of analog components and the simulation of electronic circuits. It leverages ngspice (the open-source successor to the classic SPICE engine) as its core simulation backend.
The main objectives and features of DSpice are:

* **Custom Modeling:** Creating new SPICE models for various electrical components.
* **Symbol Design:** Designing and managing custom schematic symbols for these models.
* **Schematic Capture:** Drawing and designing circuits using an intuitive CAD-style schematic editor.
* **Circuit Simulation:** Executing simulations (OP/Tran/AC) seamlessly using ngspice.
* **Waveform Visualization:** Analyzing and presenting simulation results through a dedicated waveform viewer and Prob.

##  Core Features

* Interface of DSpice created using ElectronJS (v34.2.0) and Node.js (v22.13.1), enabling a modern cross-platform desktop experience.
* Powered by ngspice (v46), providing a robust library for analog and mixed-signal circuit simulation.
* Comprehensive support for analog models, offering flexibility for various use cases.

## News

What’s New in Version 0.1.4 (18/08/2026)

* Cross-Platform Expansion: Added native compatibility for Linux distributions (Ubuntu, Debian, Linux Mint, Xubuntu, Lubuntu) via `.deb` and `AppImage` packages.
* Advanced Viewing & Export: Introduced an HTML viewer page with print and save support, and a new Graph Viewer with PNG export capabilities.
* Simulation Enhancements: Added the UIC (Use Initial Conditions) option for more precise and controlled simulation startup.
* Codebase Optimization: Removed the legacy Python version of the application to streamline development and focus entirely on the modern ElectronJS architecture.
* Expanded SPICE Model Libraries: Added power MOSFET (VDMOS) and Zener diode SPICE models, with comprehensive updates to existing MOSFET and diode model libraries.
* Enhanced Sidebar & Library Management: Introduced a dedicated SPICE library panel in the sidebar, complete with new SVG icons for better navigation and visual consistency.
* Improved Workflow: Users can now open files directly from the SPICE library panel into the netlist editor, streamlining the circuit design process.
* System Improvements: Updated dialog handling mechanisms for better stability and a smoother user experience.
* New Components: Added internal port elements (Input, Output, Bidirectional), Voltage Bar element, and a new MESFET element.

## Future Work / Roadmap

* Develop a dedicated Project Workspace to manage multiple circuit files, simulation profiles, and related assets in a unified, organized environment.
* Integrate AI-assisted tools to help analyze circuits, troubleshoot errors, and optimize simulation performance.
* Implement interactive simulation capabilities, allowing real-time parameter adjustments and immediate visual feedback during runtime.
* Develop a comprehensive Options/Settings Dialog for advanced user customization.
* Expand the component library with additional advanced semiconductor devices and digital models.
* Export analysis results to standard formats (e.g., CSV, TXT files).
* Integrate Verilog (Verilog-A/AMS) for advanced mixed-signal (analog and digital) modeling.
* Embed a Python scripting engine for automation, custom extensions, and advanced data processing.
* Extend application compatibility to support multiple operating systems, specifically adding native builds for Linux and macOS.

## Web Site of Software

* **Hom page** <a href="https://dspice.sf.net">https://dspice.sf.net</a>.
* **DSpice’s documentation**  <a href="https://dspice.readthedocs.io/en/latest/index.html">https://dspice.readthedocs.io/</a>.

## Installation of Software

* **Download:** <a href="https://sourceforge.net/projects/dspice/">https://sourceforge.net/projects/dspice/</a>.

## Note

To create a DSpice application from the `src` directory:

1. Download and install **Node.js** from the official website: [https://nodejs.org/](https://nodejs.org/)
2. To update ngspice, download **ngspice** and add it to the `DSpice\ngspice` directory.
3. Navigate to the `src` directory and run the following commands:

```sh
   npm install
   npm start
````

## Support the Project 💖





