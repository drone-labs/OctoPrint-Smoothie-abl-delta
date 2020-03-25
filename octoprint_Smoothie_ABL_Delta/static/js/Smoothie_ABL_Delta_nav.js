/******************************************************************************
 *
 * View model for Smoothie ABL Delta plugin Navigation Bar
 * Author: drone labs
 * License: AGPLv3
 *
 ******************************************************************************/

$(function() {
  function NavSABLDViewModel(parameters) {
    var self = this;
    self.settings = undefined;
    self.allSettings = parameters[0];
    self.loginState = parameters[1];
    self.printerState = parameters[2];
    self.confirmation = undefined;

   /***************************************************************************
    *
    ***************************************************************************/
    self.onAfterBinding = function() {
      // Bind to the dialog box template id
      self.confirmation = $("#confirmation");
      // confirmationDialog and emergencyGCODE
      self.settings = self.allSettings.settings.plugins.Smoothie_ABL_Delta;
    };

   /***************************************************************************
    *
    * When Stop button is clicked
    * 
    ***************************************************************************/
    self.click = function () {
      //window.alert("Entering self.click()...");
      if(self.settings.confirmationDialog())
        self.confirmation.modal("show");
      else
        self.sendCommand()
    }; // END self.click

   /***************************************************************************
    *
    * Actually Stop the machine
    * 
    ***************************************************************************/
    self.sendCommand = function () {
      //window.alert("Stoping the machine!");
      
      // API_BASEURL = "/api/"
      $.ajax({
        url: API_BASEURL+"plugin/Smoothie_ABL_Delta",
        type: "POST",
        dataType: "json",
        data: JSON.stringify({ command: "emergencyStop" }),
        contentType: "application/json; charset=UTF-8",
        success: function (data, status) {
          //console.log("self.sendcommand.success.data   = " + data);   // undefined
          //console.log("self.sendcommand.success.status = " + status); // nocontent
        }
      }); // END $.ajax()
      // Close dialog box
      self.confirmation.modal("hide");
    };

   /***************************************************************************
    *
    * Return True if user is logged in and printer is connected. Used
    * to control button display/hide
    * 
    ***************************************************************************/
    self.visibleTest = function () {
      return  self.loginState.isUser() && self.printerState.isOperational()
    }; // END self.visibleTest()

  }; // END NavSABLDViewModel()

 /***************************************************************************
  *
  * View Model Class, parameters for constructor, container to bind to
  *
  ***************************************************************************/
  OCTOPRINT_VIEWMODELS.push([
    NavSABLDViewModel,
    ["settingsViewModel","loginStateViewModel","printerStateViewModel"],
    ["#navbar_plugin_Smoothie_ABL_Delta"]
    ]);

});
