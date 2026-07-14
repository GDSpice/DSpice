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
    <img src="https://img.shields.io/badge/Version-0.0.9-blue" alt="v0.0.9">
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
* **Circuit Simulation:** Executing simulations (OP/Tran) seamlessly using ngspice.
* **Waveform Visualization:** Analyzing and presenting simulation results through a dedicated waveform viewer and Prob.

## News

What’s changed in versions

* Interface of DSpice created using **ElectronJS (v34.2.0)** and **NodeJs (v22.13.1)**, enabling a modern cross-platform desktop experience.
* Using ngspice (v46), which provides a robust library for analog and mixed-signal circuit simulation.
* Support for both analog models, providing flexibility for various use cases.

## Future Work / Roadmap

* Implement AC (Alternating Current) Analysis.
* Develop a comprehensive Options/Settings Dialog.
* Create a Library Management Dialog for better component organization.
* Expand the component library with additional semiconductor devices and digital models.
* Export analysis results to standard formats (e.g., CSV files).
* Integrate Verilog (Verilog-A/AMS) for mixed-signal (analog and digital) modeling.
* Embed a Python scripting engine for automation and custom extensions.
* Extend pplication compatibility to support multiple operating systems, specifically adding native builds for Linux and macOS.

## Web Site of Software

* **Hom page** <a href="https://dspice.sf.net">https://dspice.sf.net</a>.
* **DSpice’s documentation**  <a href="https://dspice.sf.net/doc">https://dspice.sf.net/doc</a>.

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





