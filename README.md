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
    <img src="https://img.shields.io/badge/Version-0.1.2-blue" alt="v0.1.2">
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

What’s New in Version 0.1.2 (06/08/2026)

* New Components: Added internal port elements (Input, Output, Bidirectional), Voltage Bar element, and a new MESFET element.
* Expanded SPICE Models: Added macro models for LM311 and LM393 (Voltage Comparator), and updated JFET and BJT model libraries for improved accuracy.
* Enhanced UI/UX: Added SVG icons for Port and VBar in the toolbar/menus, updated the element list to display symbol names, and adjusted port sizes for better visibility.
* Improved Workflow: Connected wires now automatically rename to match the port name.
* Terminology & Cleanup: Renamed "Part" to "Symbol" and "Net" to "Wire" in the selection list for better clarity, and removed obsolete "modelspice" entries from the symbol list.
* Expanded SPICE Model Libraries: Added OP-AMP library, ideal JFET, DIAC, and optoelectronics macro models (Photo Diode, Laser Diode).
* Updated BJT (Bipolar) Transistor (PNP/NPN) SPICE model library for improved accuracy.
* Added official DSpice documentation and manuals in reStructuredText (.rst) format.
* Enhanced UI/UX: Element descriptions now appear on mouse move, and basic drawing elements have been updated.
* Bug Fixes: Resolved issues with dragging analysis elements when adding them, and fixed selecting/moving polylines in the drawing canvas.


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





