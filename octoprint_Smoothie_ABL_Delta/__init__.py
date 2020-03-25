# coding=utf-8
from __future__ import absolute_import


import time
#import datetime
import octoprint.plugin
#import octoprint.printer
#import re
import flask

# A custom class that subclasses one of OctoPrint’s plugin mixins with
# StartupPlugin and another control property, __plugin_implementation__,
# that instantiates the plugin class and tells OctoPrint about it.
# Taking a look at the documentation of StartupPlugin we see that this
# mixin offers two methods that get called by OctoPrint during startup
# of the server, on_startup() and on_after_startup(). We decided to add
# The logging overrides on_after_startup(), but it could also have used
# on_startup() instead, in which case the logging statement would be
# executed before the server was done starting up and ready to serve
# requests.
class SmoothieABLDPlugin(octoprint.plugin.StartupPlugin,
                         octoprint.plugin.TemplatePlugin,
                         octoprint.plugin.SettingsPlugin,
                         octoprint.plugin.AssetPlugin,
                         octoprint.plugin.SimpleApiPlugin):

# ------------------------------------------------------------------------------
	def __init__(self):
		self.emergencyGCODE = ""

# ------------------------------------------------------------------------------
	def on_after_startup(self):
		self._logger.info("Plugin is alive!")

		Assets_dir = self.get_asset_folder()
		#img_dir = "/img/"
		#bg_Img_DeltaR = "uDelta_Rework_View-001.png"
		#bg_Img_DeltaR_Path = Assets_dir + img_dir + bg_Img_DeltaR
		
		self._logger.info("Assets Folder = %s" % Assets_dir)

		self.emergencyGCODE = self._settings.get(["emergencyGCODE"])
		self._logger.info("emergencyGCODE =  %s" % self.emergencyGCODE)

		self.confirme = self._settings.get(["confirmationDialog"])
		self._logger.info("confirmationDialog =  %s" % self.confirme)

		# Synchronization stuff
		self.timeOut = 100         # timeOut in seconds
		self.CalRunning = False    # Is Calibration running ?
		self.CalDone = False       # Is Calibration done ?
		self.CalError = False      # An Error occured?
		self.nbOK = 0              # Number of received ack
		self.sent_time = False     # Used to check timeOut

# ------------------------------------------------------------------------------
	def get_settings_defaults(self):
		return dict(
			emergencyGCODE="M112",
			confirmationDialog = True
		)

# ------------------------------------------------------------------------------
	def on_settings_save(self, data):
		octoprint.plugin.SettingsPlugin.on_settings_save(self,data)
		self.emergencyGCODE = self._settings.get(["emergencyGCODE"])

# ------------------------------------------------------------------------------
	def get_template_configs(self):
		return [
			dict(type="settings", template="Smoothie_ABL_Delta_settings.jinja2", custom_bindings=False),
			dict(type="navbar", template="Smoothie_ABL_Delta_navbar.jinja2", custom_bindings=True),
			dict(type="tab", template="Smoothie_ABL_Delta_tab.jinja2", custom_bindings=True)
			]


# ------------------------------------------------------------------------------
# Return a dictionary with the keys representing the accepted commands and the
# values being lists of mandatory parameter names. Here, we define one command,
# 'emergencyStop' with no mandatory parameter.
	def get_api_commands(self):
		return dict(
			emergencyStop=[],
			runCal=[]
		)

# ------------------------------------------------------------------------------
# Called by OctoPrint upon a POST request to /api/plugin/Smoothie_ABL_Delta.
# Command will contain one of the commands as specified via get_api_commands(),
# data will contain the full request body parsed from JSON into a Python
# dictionary. Note that this will also contain the command attribute itself.
# Parameters:
#  command (string) : the command with which the resource was called
#     data (dict)   : the full request body of the POST request parsed
#                     from JSON into a Python dictionary
# Logged values :
#  command = emergencyStop
#     data = {u'command': u'emergencyStop'}
#
	def on_api_command(self, command, data):
		#import flask
		if command == "emergencyStop":
			## check if there is a ':' char in Gcode line
			find_this = ":"
			if find_this in str(self.emergencyGCODE):
				# if : found then, split, then for each:		
				gcode_list = str(self.emergencyGCODE).split(':')
				for gcode in gcode_list:
					self._printer.commands(gcode)				
			else:
				self._printer.commands(self.emergencyGCODE)

		elif command == "runCal":
			#self._logger.info("cmdWait4ack called, some_parameter is {some_parameter}".format(**data))
			self._logger.info("Calibration Triggered!")
			self.CalRunning = True
			self.CalDone = False
			self.CalError = False
			self.nbOK = 0
			self.sent_time = time.time()

# ------------------------------------------------------------------------------
# SimpleApiPlugin mixin
	def on_api_get(self, request):
		return flask.jsonify(CalRunning = self.CalRunning,
                         CalDone = self.CalDone,
                         CalError = self.CalError)

# ------------------------------------------------------------------------------
	def get_assets(self):
		return dict(
			js=["js/Smoothie_ABL_Delta_nav.js", "js/Smoothie_ABL_Delta_tab.js"],
			css=["css/Smoothie_ABL_Delta.css"]
		)

# ------------------------------------------------------------------------------
	##~~ Softwareupdate hook
#	def get_update_information(self):
		# Define the configuration for your plugin to use with the Software Update
		# Plugin here.
		# See https://github.com/foosel/OctoPrint/wiki/Plugin:-Software-Update
		# for details.
#		return dict(
#			simpleemergencystop=dict(
#				displayName="Simple Emergency Stop",
#				displayVersion=self._plugin_version,

				# version check: github repository
#				type="github_release",
#				user="BrokenFire",
#				repo="OctoPrint-SimpleEmergencyStop",
#				current=self._plugin_version,

				# update method: pip
#				pip="https://github.com/BrokenFire/OctoPrint-SimpleEmergencyStop/archive/{target_version}.zip"
#			)
#		)

# ------------------------------------------------------------------------------
# Hook to manage sent G-code (No more used)
	def gcode_sender(self, comm_instance, phase, cmd, cmd_type, gcode, subcode=None, tags=None, *args, **kwargs):
		if gcode == "G400":
			self._logger.info("Gcode_sender : G4 Send Caught!")
			self.Waiting4Response = True
			self.sent_time = time.time()

# ------------------------------------------------------------------------------
# Hook to read (capture) received G-code
	def gcode_listener(self, comm_instance, line, *args, **kwargs):
		# Wait for "ok"
		if not self.CalRunning:
			return line

		# Check for TimeOut (from the beginning)
		if (time.time() - self.sent_time) > self.timeOut:
			self.nbOK = 0
			self.CalDone = False
			self.CalRunning = False
			self.CalError = True
			self._logger.info("Calibration Failed!")
			return line

		# OK, Calibration is in progress; count acknowledgements ("ok")
		if line == "ok":
			self.nbOK += 1
			if self.nbOK == 3:
			  self.CalDone = True
			  self.CalRunning = False
			  self._logger.info("Calibration done!")

		return line

# ------------------------------------------------------------------------------
# To register the plugin within OctoPrint under a different name than
# what is defined in setup.py, it can be defined here.
__plugin_name__ = "Smoothie ABL Delta"
__plugin_version__ = "0.1.0"
__plugin_description__ = "A simple OctoPrint plugin to ease µDelta Rework Calibration"
__plugin_implementation__ = SmoothieABLDPlugin()
__plugin_pythoncompat__ = ">=2.7,<3"


# ------------------------------------------------------------------------------
def __plugin_load__():
	global __plugin_implementation__
	__plugin_implementation__ = SmoothieABLDPlugin()

	global __plugin_hooks__
	__plugin_hooks__ = {
		"octoprint.comm.protocol.gcode.received": __plugin_implementation__.gcode_listener,
		"octoprint.comm.protocol.gcode.sent": __plugin_implementation__.gcode_sender
	}

# ------------------------------------------------------------------------------
#	global __plugin_hooks__
#	__plugin_hooks__ = {
#		"octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
#	}


