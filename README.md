# OctoPrint-Smoothie-abl-delta
## A simple OctoPrint plugin to ease µDelta Rework Calibration.
It will handle Bed Level grid Calibration and Max Z settings (almost) automatically. 

## Setup

Install via the bundled [Plugin Manager](https://github.com/foosel/OctoPrint/wiki/Plugin:-Plugin-Manager)
or manually using this URL:

    https://github.com/drone-labs/OctoPrint-Smoothie-abl-delta/archive/master.zip

**TODO:** Describe how to install your plugin, if more needs to be done than just installing it via pip or through
the plugin manager.

## Configuration

**TODO:** Describe your plugin's configuration options (if any).

## Usage

<!-- html comment are not escaped... -->
The diagram below highlights the Plugin Navigation Loop :

![Navigation](Images/usage.png)



<!-- yes, not very pure markdown...  -->
<!-- ----------------------------------------------------------------------- -->
<!-- Plugin invocation -->
<p align="center">
  Entering the Plugin is done the standard way :</p>

<!-- <p align="center"> -->
<!--   <img src="ScreenShots/ReachMe.png" alt="Enter the Plugin"/></p> -->

<!-- ----------------------------------------------------------------------- -->
<!-- Step 1/4  Mount the Probe -->
<p align="center">
  Before proceeding, the user is asked to mount the Probe
  Assembly (supplied with the kit) on the Printer :</p>

<!-- <p align="center"> -->
<!--   <img src="ScreenShots/Step1.png" alt="Step1"/></p> -->

<!-- ----------------------------------------------------------------------- -->
<!-- Step 2a/4 Ready to start Calibration -->
<p align="center">
  When the setup is ready, a click on the <b>Next</b> button leads
  to the Bed Level Calibration page :</p>

<!-- <p align="center"> -->
<!--   <img src="ScreenShots/Step2a.png" alt="Step2a"/></p> -->

<!-- ----------------------------------------------------------------------- -->
<!-- Step 2b/4 Calibration in progress -->
<p align="center">
  A click on the <b>Start</b> button triggers the Calibration Sequence.
  A 'radar style' (sorry for the lack of imagination) green spinner will
  animate during the whole sequence (it should last between 2 and 3 minutes) :</p>

<!-- <p align="center"> -->
<!--   <img src="ScreenShots/Step2b.png" alt="Step2b"/></p> -->

<!-- ----------------------------------------------------------------------- -->
<!-- Step 2c/4 Calibration Done -->
<p align="center">
  When Calibration Sequence is done, the green spinner disappear :</p>

<!-- <p align="center"> -->
<!--   <img src="ScreenShots/Step2c.png" alt="Step2c"/></p> -->

<!-- ----------------------------------------------------------------------- -->
<!-- Step 3/4 -->
<p align="center">
  When Calibration is done, a click on the <b>Save</b> button will update the
  grid datas on the SD Card. A click on the <b>Next</b> button leads to the
  third page, asking to remove the probe Assembly from the Printer :</p>

<!-- <p align="center"> -->
<!--   <img src="ScreenShots/Step3.png" alt="Step3"/></p> -->

<!-- ----------------------------------------------------------------------- -->
<!-- Step 4/4 -->
<p align="center">
  When the Probe Assembly has been removed, a click on the <b>Next</b> button
  leads to the Max Z Setting Page. Before proceeding to any height adjustment,
  make sure that Bed Heating is <b>ON</b> and Bed Temperature is at least 70°C
  (Refer to Temperature Tab). Follow the given instructions to reach the
  correct Height. When done, a click on the <b>Save</b> button will update the
  setting on the SD Card. Bed Heating can then be turned <b>OFF</b>. </p>

<!-- <p align="center"> -->
<!--   <img src="ScreenShots/Step4.png" alt="Step4"/></p> -->

