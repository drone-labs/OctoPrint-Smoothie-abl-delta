# coding=utf-8
from __future__ import absolute_import

import octoprint.plugin

class SmoothieABLDPlugin(octoprint.plugin.StartupPlugin):
    def on_after_startup(self):
        self._logger.info("Smoothie-abl-delta plugin is alive!")

# To register the plugin within OctoPrint under a different name than what is
# defined in setup.py ("OctoPrint-PluginSkeleton"), it can be defined here.
# Same goes for the other metadata derived from setup.py that can be overwritten
# via __plugin_xyz__ control properties.
__plugin_name__ = "Smoothie-abl-delta"
__plugin_version__ = "0.1.0"
__plugin_description__ = "A simple OctoPrint plugin to ease µDelta Rework Calibration"
__plugin_implementation__ = SmoothieABLDPlugin()
