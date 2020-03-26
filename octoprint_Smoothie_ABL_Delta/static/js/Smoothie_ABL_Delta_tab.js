/******************************************************************************
 *
 * View model for Smoothie ABL Delta plugin tab
 * Author: drone labs
 * License: AGPLv3
 *
 ******************************************************************************/

/******************************************************************************
 *
 * Application View Model
 *
 ******************************************************************************/
$(function() {
  function TabSABLDViewModel(parameters) {
    var self = this;
    self.settings = undefined;
    // See Dependencies
    self.allSettings = parameters[0];
    self.loginState = parameters[1];
    self.printerState = parameters[2];
    self.termState = parameters[3];

    // Which step of Bed Leveling procedure is active?
    // 1=Idle          : Plugin Tab triggered. Ask to plug the sensor
    // 2=Calibration   : Proceed button has been clicked
    // 3=Ask for Save  : Calibration done, ask to remove the sensor 
    // 4=Max Z Setting : Ask to put the paper sheet, Jog Z axis
    // We make the object observable by the ui so it can react to any change
    self.BedLevelingStep = ko.observable(1);

    // Calibration Status (step 2), bound to ui <p>
    self.CalStatus = ko.observable('Ready to Proceed');
    // Flag to Enable 'Save' button when Calibration is done
    self.CalDone = ko.observable(false);
    // Hold the spinner class (to control animation)
    self.CalSpinner = $(".spin4cal");
    // Hold the Calibration information text class
    self.CalText = $(".caltext");

    // Bed Heating Status (true: Heat ON, false:Heat OFF)
    self.BedIsHeating = false;

    // JS helpers
    self.waitTimer = null;

   /***************************************************************************
    *
    ***************************************************************************/
   /*
    self.onBeforeBinding = function() {
      self.BedLevelingStep = ko.observable(0);
      console.log("    self.BedLevelingStep = " + self.BedLevelingStep);
      console.log("  self.BedLevelingStep() = " + self.BedLevelingStep());
    }
    */

   /***************************************************************************
    *
    ***************************************************************************/
    self.onAfterBinding = function() {
      // Bind to the dialog box template id
      self.BedLeveling = $("#BedLeveling");
      self.MaxZSetting = $("#MaxZSetting");
      //self.optHeatON = $("#optHeatON");
      //self.optHeatOFF = $("#optHeatOFF");
    };

   /***************************************************************************
    *
    * Debug button to test the simple State Machine
    * 
    ***************************************************************************/
    self.SmTest = function () {
      var CurStep = self.BedLevelingStep();
      //console.log("  Current Step = " + CurStep);
      CurStep < 4 ? CurStep += 1 : CurStep = 1;
      self.BedLevelingStep(CurStep);
      //console.log("     Next Step = " + self.BedLevelingStep());

    }; // END self.SmTest

   /***************************************************************************
    *
    * Step 2: Proceed to Bed Leveling Calibration Sequence
    *         From Step1->Next or Step3->Back 
    * 
    ***************************************************************************/
    self.DoStep2 = function () {
 
      // Init Calibration Status and Spinner then jump to Step 2
      self.CalText.css( "color", "green" );
      self.CalStatus('Ready to Proceed');
      self.CalDone(false);
      self.CalSpinner.css( "borderTopColor", "black" );

      self.BedLevelingStep(2);

    };
 
   /***************************************************************************
    *
    * Within Step 2, 'Next' Button : Start Bed Leveling Calibration Sequence
    * 
    ***************************************************************************/
    self.CalStart = function () {
      // Gcode Calibration Sequence
      //var CalGcode = "G28\nG4 S4\nG4 S5";
      var CalGcode = ["G28; Homming all axes",
                      "M114; Get Current Position",
                      "G4 S4; Dwelling for 4 seconds",
                      "G4 S5; Dwelling for 5 seconds"];
      var Counter = 0;

      /************************************************************************/
      // Update Status String
      self.CalStatus('Calibration in progress...');
      self.CalText.css( "color", "gray" );
      // Show the animated border
      self.CalSpinner.css( "borderTopColor", "green" );

      // Request Server to trigger calibration Sequence
      $.ajax({
        url: API_BASEURL+"plugin/Smoothie_ABL_Delta",
        type: "POST",
        dataType: "json",
        data: JSON.stringify({ command: "runCal" }),
        contentType: "application/json; charset=UTF-8",
        success: function (data, status) {
          console.log("Smoothie_ABL_Delta Calibration :");
          console.log("   Sequence Triggered");
        }
      }); // END $.ajax()

      //console.log("Smoothie_ABL_Delta Calibration : Sending Gcode Sequence!");
      OctoPrint.control.sendGcode(CalGcode).done(function () {
      //OctoPrint.control.sendGcode(CalGcode.split("\n")).done(function () {
        console.log("   Gcode Sequence Sent");
      });

      // Create a 2 seconds periodic timer to poll sequence status
      self.waitTimer = setInterval(function () {
        // Polling data from server (PayLoad = CalRunning, CalDone, and CalError)
        OctoPrint.simpleApiGet("Smoothie_ABL_Delta").done(function(response) {
          console.log("      Polling : " + Counter*2 + "s");
          Counter += 1;

          if (response.CalError == true) {
            clearInterval(self.waitTimer);
            self.waitTimer = null;
            // Hide animated border
            self.CalSpinner.css( "borderTopColor", "black" );
            console.log("   Calibration Failed!");
            self.CalStatus("Calibration Failed!");
            self.CalText.css( "color", "red" );
            //self.CalDone(true);
          }     // END if(CalError)
          else if (response.CalDone == true) {
            clearInterval(self.waitTimer);
            self.waitTimer = null;
            self.CalDone(true);
            // Hide animated border
            self.CalSpinner.css( "borderTopColor", "black" );
            console.log("   Calibration Done!");
            self.CalStatus("Calibration Done!");
            self.CalText.css( "color", "green" );
          }     // END if(CalDone)
        });     // END .done
      }, 2000); // Check every 2 seconds

    }; // END CalStart()
 
   /***************************************************************************
    *
    * In Step 2, Save Bed Leveling Calibration datas (Enabled once, only after
    * a successfull calibration sequence)
    *
    ***************************************************************************/
    self.CalSave = function () {
      console.log("   Saving Data...");
      // Calibration sequence must be ran again to re-enable the 'Save' Button
      self.CalDone(false);
      console.log("   Data Saved!");
    };

   /***************************************************************************
    *
    * From Step 2, Bed Leveling Calibration Sequence, Switch to Step 3 :
    * Remove Sensor and ask for Max Z Setting step
    * 
    ***************************************************************************/
    self.DoStep3 = function () {
      // For now, jump to Step 3 : Grid Calibration Done, Ask for Save
      self.BedLevelingStep(3);
    };

   /***************************************************************************
    *
    * Step 4 : Proceed to Max Z Setting
    * 
    ***************************************************************************/
    //self.DoStep4 = function () {
    self.DoStep4 = function () {
      // For now, jump to Step 1 : Grid Calibration Done, Ask for Save
      self.BedLevelingStep(4);
      //console.log("   #optHeatON  : " + $('#optHeatON').prop('checked') );
      //console.log("   #optHeatOFF : " + $('#optHeatOFF').prop('checked') );
      //$('#optHeatON:checked').val('on');

      //$('#optHeatOFF').prop('checked', false);
      //$('#optHeatON').prop('checked', true);

      // Handle Bed Heating Toggle Buttons
      $("#optHeatON").click(function () { self.DoBedHeat(true); });
      $("#optHeatOFF").click(function () { self.DoBedHeat(false); });

    };

   /***************************************************************************
    *
    * In Step 4 : Control Bed Heating ON/OFF
    *             action = true/ON or false/OFF
    * 
    *             M105 : Report Temperatures 
    *                    Recv: T:21.30 /0.00 B:70.00 /70.00 @:64
    * 
    ***************************************************************************/
    self.DoBedHeat = function (action) {
      // Action is ON. Switch ON Bed Heating if not already the case
      if (action && !self.BedIsHeating) {
        self.BedIsHeating = true;
        OctoPrint.control.sendGcode("M190 S70").done(function () {
          console.log("   DoBedHeat() : Bed Heating turned ON" );
        });
      }
      // Action is OFF. Switch OFF Bed Heating if not already the case
      else if (!action && self.BedIsHeating) {
        self.BedIsHeating = false;
        OctoPrint.control.sendGcode("M190 S0").done(function () {
          console.log("   DoBedHeat() : Bed Heating turned OFF" );
        });
      }
    };

   /***************************************************************************
    * In Step 4 (Max Z Setting) : Large Jog up (+1mm)
    ***************************************************************************/
    self.LargeJogUp = function () { self.DoJog(1); };

   /***************************************************************************
    * In Step 4 (Max Z Setting) : Small Jog up (+0.05mm)
    ***************************************************************************/
    self.SmallJogUp = function () { self.DoJog(0.05); };

   /***************************************************************************
    * In Step 4 (Max Z Setting) : Small Jog down (-0.05mm)
    ***************************************************************************/
    self.SmallJogDn = function () { self.DoJog(-0.05); };

   /***************************************************************************
    * In Step 4 (Max Z Setting) : Large Jog down (-1mm)
    ***************************************************************************/
    self.LargeJogDn = function () { self.DoJog(-1); };

   /***************************************************************************
    *
    * In Step 4 (Max Z Setting) : Common function to Jog
    * 
    ***************************************************************************/
    self.DoJog = function (distance) {
      var GcodeStr = "G0 Z".concat(distance.toString());
      GcodeStr = GcodeStr.concat(" F300");
      //console.log("DoJog : " + distance + "mm");
      console.log("DoJog : " + GcodeStr);

      OctoPrint.control.sendGcode("G91").done(function () {
        //console.log("   G90 ; Switch to Relative Coordinates");
      });
      OctoPrint.control.sendGcode(GcodeStr).done(function () {
        //console.log("    " + GcodeStr + " ; Move " + distance + "mm");
      });
      OctoPrint.control.sendGcode("G90").done(function () {
        //console.log("   G91 ; Switch back to Absolute Coordinates");
      });

    };

   /***************************************************************************
    *
    * In Step 4 (Max Z Setting), Save Z Max Height (M)
    *
    ***************************************************************************/
    self.MaxZSave = function () {
      console.log("   Saving Max Z...");

      // Play with regex...
      var str1 = "ok X:0 Y:0 Z:-100.3200998777 E:0 Count: A:0 B:0 C:0";

      //var patt = /\bZ:[-\d.]\d*[.\d]\d*/;
      //var searchResult = str1.match(patt);
      //console.log("   Matching string : " + searchResult );
      
      var Zstr = str1.split(" ")[3].substr(2);

      //var splitstr = str.split(" ");
      //console.log("   splitstr = " + splitstr);
      //for (var substr in splitstr) {
      //  console.log("  " + substr);
      //};
      //console.log("  splitstr[3] = " + splitstr[3]);
      console.log("   Z = " + Zstr);

      // Calibration sequence must be ran again to re-enable the 'Save' Button
      self.CalDone(false);
      console.log("   Max Z Saved!");
    };

   /***************************************************************************
    *
    * From Step 4, Max Z Setting, Switch back to Step 1 : Iddle
    * 
    ***************************************************************************/
    self.DoStep1 = function () {
      // Return to step 1 : Iddle
      self.BedLevelingStep(1);
      //OctoPrint.control.sendGcode("G4 S5").done(function () {
      //  console.log("   Dwelled for 5s" );
      //});

    }; // END self.DoStep1()

   /***************************************************************************
    *
    * Return True if user is logged in and printer is connected. Used
    * to enable/disable buttons
    * 
    ***************************************************************************/
    self.enableTest = function () {
      return  self.loginState.isUser() && self.printerState.isOperational()
    }; // END self.visibleTest()


  }; // END TabSABLDViewModel()

 /***************************************************************************
  *
  * View Model Class, parameters for constructor, container to bind to
  *
  ***************************************************************************/
 OCTOPRINT_VIEWMODELS.push({
    construct: TabSABLDViewModel,
    additionalNames: ["TabSABLDViewModel"],
    dependencies: ["settingsViewModel",
                   "loginStateViewModel",
                   "printerStateViewModel",
                   "terminalViewModel"],
    optional: [],
    elements: ["#tab_plugin_Smoothie_ABL_Delta"]
  });

});

