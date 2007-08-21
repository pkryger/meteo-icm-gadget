/*
This is the logging module for a JavaScript application. It loggs the user messages
into the specified destination element innerHTML. The user shall use factory method Logger.getLogger()
in order to instantiate a logger.

*** User API:
+ static methods:

- getLogger(loggerName) - returns a Logger instance with a specified loggerName

+ static fields:

- loggingLevel - the current logging level. It could be dynamically changed while application is running. The
level change affects all further logging calls.

- output - the HTML element where the output shall be directed. The logger appends its messages in HTML style
to the output's innerHTML 

- LEVEL_NONE - do not log at all
- LEVEL_ERROR - log only error messages
- LEVEL_WARNING - log errors and warnings
- LEVEL_NOTIFY - log errors, warnings and notices
- LEVEL_TRACE - log errors, warnings, notices and traces

+ methods

- getName() - returns the logger instance name

- error(message) - logs specified message as an error
- error(message, parameters) - logs specified message with a array parameters as an error

- warning(message) - logs specified message as a warning
- warning(message) - logs specified message with a array parameters as a warning

- notify(message) - logs specified message as a notice
- notify(message) - logs specified message with a array parameters as a notice

- trace(message) - logs specified message as a trace
- trace(message) - logs specified message with a array parameters as a trace

+ functions

_testLogger(out) - sandbox for Logger class.
*/


// The constructor
function Logger(loggerName) {
    this._setName(loggerName);
}

// Factory method
Logger._loggers = new Array();
Logger.getLogger = function(loggerName) {
    if (null == Logger._loggers[loggerName]) {
	Logger._loggers[loggerName] = new Logger(loggerName);
    }
    return Logger._loggers[loggerName];
}

// Logging levels
Logger.LEVEL_NONE = 0;
Logger.LEVEL_ERROR = 1;
Logger.LEVEL_WARNING = 2;
Logger.LEVEL_NOTIFY = 3;
Logger.LEVEL_TRACE = 4;

// The logging level to use
Logger.loggingLevel = Logger.LEVEL_NONE;

// The logging destination output element. It shall be redefined by the user.
Logger.output = null;

// The logger name
Logger.prototype._name;
Logger.prototype.getName = function() {
    return "[" + this._name + "]";
}
Logger.prototype._setName = function(name) {
    this._name = name;
}

// One message number for all Loggers. It will be added for all messages
Logger._messageNumber = 0;

// If the current logging level is sufficient, appends the message
// to the current output DIV innerHTML
Logger.prototype._print = function(message, level) {
    // Print only if _loggingLevel is higher than LEVEL_NONE
    // and level is is lower or equal to _loggingLevel
    if (Logger.output != null
        && Logger.loggingLevel > Logger.LEVEL_NONE
	&& Logger.loggingLevel >= level) {
	Logger._messageNumber++;
	var outputHTML = Logger.output.innerHTML;
	outputHTML += Logger._messageNumber + ": " + message;
	Logger.output.innerHTML = outputHTML;
    }
}

// Parses the given array and returns its string represenatation
// The output is in the following form:
// {key1:value1, key2:value2}
Logger.prototype._parseArray = function(array) {
    var retString = "{";
    for (key in array) {
	retString += key + ":" + array[key] + ", ";
    }
    retString = retString.substring(0, retString.lastIndexOf(","));
    retString += "}";
}

// Endline character
Logger.prototype._endl = "<br />";
Logger.prototype.getEndl = function() {
    return this._endl;
}
Logger.prototype.setEndl = function(endl) {
    this._endl = endl;
}

// Error
Logger.prototype._errorPrefix = "<font color=\"red\"><b>Error: ";
Logger.prototype.getErrorPrefix = function() {
    return this._errorPrefix;
}
Logger.prototype.setErrorPrefix = function(prefix) {
    this._errorPrefix = prefix;
}
Logger.prototype._errorSuffix = "</b></font>";
Logger.prototype.getErrorSuffix = function() {
    return this._errorSuffix;
}
Logger.prototype.setErrorSuffix = function(suffix) {
    this._errorSuffix = suffix;
}
Logger.prototype.error = function(message) {
    var msg = this.getErrorPrefix() + message + this.getErrorSuffix() + this.getName() + " " + this.getEndl();
    this._print(msg, Logger.LEVEL_ERROR);
}
Logger.prototype.error = function(message, parameters) {
    var msg = message + ": " + this.parseArray(parameters);
    this.error(msg);
}

// Warning
Logger.prototype._warningPrefix = "<b>Warning: ";
Logger.prototype.getWarningPrefix = function() {
    return this._warningPrefix;
}
Logger.prototype.setWarningPrefix = function(prefix) {
    this._warningPrefix = prefix;
}
Logger.prototype._warningSuffix = "</b>";
Logger.prototype.getWarningSuffix = function() {
    return this._warningSuffix;
}
Logger.prototype.setWarningSuffix = function(suffix) {
    this._warningSuffix = suffix;
}
Logger.prototype.warning = function(message) {
    var msg = this.getWarningPrefix() + message + this.getWarningSuffix() + this.getName() + " " + this.getEndl();
    this._print(msg, Logger.LEVEL_WARNING);
}
Logger.prototype.warning = function(message, parameters) {
    var msg = message + ": " + this.parseArray(parameters);
    this.warning(msg);
}

// Notify
Logger.prototype._notifyPrefix = "Note: ";
Logger.prototype.getNotifyPrefix = function() {
    return this._notifyPrefix;
}
Logger.prototype.setNotifyPrefix = function(prefix) {
    this._notifyPrefix = prefix;
}
Logger.prototype._notifySuffix = "";
Logger.prototype.getNotifySuffix = function() {
    return this._notifySuffix;
}
Logger.prototype.setNotifySuffix = function(suffix) {
    this._notifySuffix = suffix;
}
Logger.prototype.notify = function(message) {
    var msg = this.getNotifyPrefix() + message + this.getNotifySuffix() + this.getName() + " " + this.getEndl();
    this._print(msg, Logger.LEVEL_NOTIFY);
}
Logger.prototype.notify = function(message, parameters) {
    var msg = message + ": " + this.parseArray(parameters);
    this.notify(msg);
}

// Trace
Logger.prototype._tracePrefix = "<font color=\"blue\">";
Logger.prototype.getTracePrefix = function() {
    return this._tracePrefix;
}
Logger.prototype.setTracePrefix = function(prefix) {
    this._tracePrefix = prefix;
}
Logger.prototype._traceSuffix = "</font>";
Logger.prototype.getTraceSuffix = function() {
    return this._traceSuffix;
}
Logger.prototype.setTraceSuffix = function(suffix) {
    this._traceSuffix = suffix;
}
Logger.prototype.trace = function(message) {
    var msg = this.getTracePrefix() + message + this.getTraceSuffix() + this.getName() + " " + this.getEndl();
    this._print(msg, Logger.LEVEL_TRACE);
}
Logger.prototype.trace = function(message, parameters) {
    var msg = message + ": " + this.parseArray(parameters);
    this.trace(msg);
}

// Logger tests
function _testLogger(div) {
    // For all avaliabel levels, create a logger instance, then log messages
    // for each level.
    Logger.output = div;
    var array = {"key1":"value1", "key2":"value2"};
    for (var nLevel = 0; nLevel <= 4; nLevel++) {
	Logger.loggingLevel = nLevel;
	var log = Logger.getLogger("TestLogger" + nLevel);
	log.error("Test error message");
	log.error("Test error message with array", array);
	log.warning("Test warning message");
	log.warning("Test warning message with array", array);
	log.notify("Test notify message");
	log.notify("Test notify message with array", array);
	log.trace("Test trace message");
	log.trace("Test trace message with array", array);
    }    
}
