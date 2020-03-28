# OctoPrint-Smoothie-abl-delta
## A simple OctoPrint plugin to ease µDelta Rework Calibration.
It will handle Bed Level grid Calibration and Max Z settings (almost) automatically. 
Also included is an Emergency Stop Feature largely inspired by the work of Sébastien
Clément. 

## Credits
https://github.com/Sebclem/OctoPrint-SimpleEmergencyStop 
https://github.com/scottrini/OctoPrint-PrusaLevelingguide

## Setup

For now, Install manually using this URL:

    https://github.com/drone-labs/OctoPrint-Smoothie-abl-delta/archive/master.zip

## Configuration

#### Emergency Stop

- **emergencyGcode**

    Define the GCODE to send when the button is pressed.
    Default = "M112"
    
- **confirmationDialog**

    Show confirmation dialog?
    Default = Yes

#### Bed Level Calibration

- **Gcode Sequence**

    List of Gcode lines to send, separated by  a '\n' character.
    Default = "G28\nG32\nG31"

- **Save Gcode**

    Gcode Command used to save Grid Data on the SD Card.
    Default = "M374"

- **TimeOut**

    Time (in seconds) Allocated to the process before a TimeOut error is triggered.
    Default = 200

#### Max Z setting

- **Bed Temperature**

    Print Bed Temperature set point (in °C).
    Default = 70

- **Save Gcode Sequence**

    List of Gcode lines to send, separated by  a '\n' character.
    Default = "M306 Z0\nM500"

## Usage

<!-- html comment are not escaped... -->
The diagram below highlights the Plugin Navigation Loop :

![Navigation](Images/usage.png)

## Known Bugs

- **Bed Temperature**

    For now, Bed Heating is assumed to be turned OFF when entering the Plugin;
    This is not 100% guaranteed and Jog is enabled whatever the Bed Temperature...
    
    An idea : Read the Temperatures (M105) and compare the current value against
    the setting.
    -Setting = 0 : Heating is OFF
    -Current value is less than setting : Disable Jog
    -Current value equal or greater than setting : Enable Jog
    
## ToDo


