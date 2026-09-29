.. DSpice documentation master file, created by
   sphinx-quickstart on Thu Dec 17 20:01:38 2020.
   You can adapt this file completely to your liking, but it should at least
   contain the root `toctree` directive.

Welcome to DSpice Extension and Circuit Editor for VSCode 
==========================================================


What is DSpice?
===============

DSpice (Designing Circuits and Simulation by SPICE) is an open-source tool designed to streamline the modeling of analog components and the simulation of electronic circuits. It leverages **ngspice** (the open-source successor to the classic SPICE engine) as its core simulation backend.

The main objectives and features of DSpice are:

* **Custom Modeling:** Creating new SPICE models for various electrical components.
* **Symbol Design:** Designing and managing custom schematic symbols for these models.
* **Schematic Capture:** Drawing and designing circuits using an intuitive CAD-style schematic editor.
* **Circuit Simulation:** Executing simulations seamlessly using ngspice commands.
* **Waveform Visualization:** Analyzing and presenting simulation results through a dedicated waveform viewer.


The DSpice VS Code Extension
============================

To bring the DSpice CAD experience directly into your development environment, we provide a dedicated **Visual Studio Code Extension**. This extension integrates seamlessly with the IDE by registering Custom Editors, allowing you to visually design and manage your projects without leaving VS Code.

Key capabilities of the VS Code extension include:

* **Custom File Editors:** Native visual editing support for `.dcs` (Circuit Schematics) and `.sym` (Component Symbols) files.
* **Interactive Drawing Canvas:** A full-featured graphical environment equipped with zoom, pan, grid snapping, and a dynamic context-aware toolbar.
* **Seamless IDE Integration:** Deep integration with VS Code's native features, including full support for Undo/Redo history, clipboard operations (Copy/Cut/Paste), and workspace file management.


Licensing
=========

DSpice is fully open-source and released under the **MIT License**. 
This means that anyone can freely use, modify, and distribute the software, provided 
that any derivative works also adhere to the same licensing terms.


.. panels::

    :ref:`News <news-page>`

    What's changed in versions

    ---

    :ref:`Future <future-page>`

    Future Work / Roadmap

*******************
Table of Contents
*******************
.. toctree::
   :maxdepth: 3
   :caption: Contents:
  Overview.rst
  News.rst
  Future.rst
  simulation.rst

.. End
