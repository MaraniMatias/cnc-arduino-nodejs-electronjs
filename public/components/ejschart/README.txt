Release Notes - Version 2.3

Getting Started:

	The basics for using the chart haven't changed.  Simply include the EJSChart.js
	file in your page and you can begin coding your charts immediately.  The supporting
	files will be loaded automatically as required by the browsers.

	We have added a number of new features and rewritten a large portion of the code to
	enhance performance and support better consistency in cross-browser rendering and
	functionality.

	For a quick run down of the new features, please see CHANGES.txt

Version 1 Compatibility:

	We have moved a significant number of properties and methods into separate classes
	to support multiple axes and new series types.  You may find that properties used
	in charts you have already developed no longer have the effect expected on your
	charts.  To help with the transition to the new code base we have included a
	version 1 compatibility JavaScript file.

	To have this code included automatically into your page, simply put the following
	tag in the page header BEFORE you include EJSChart.js:

	<head>
		<meta name="ejsc-v1-compatibility" content="true"/>
		<script type="text/javascript" src="/EJSChart/EJSChart.js"></script>
	</head>

	This utility script will automatically convert the deprecated properties to their
	version 2 counterparts.

	In addition, if you are using a browser, browser extension, or other JavaScript
	package which implements window.console, the script will log the deprecated
	properties being converted in order to aide you in upgrading your code.