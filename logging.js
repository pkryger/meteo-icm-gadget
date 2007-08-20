// This is the logging module for a JavaScript application. It loggs the user messages
// into the specified destination DIV. The user shall provide the following:
// - the Logger name (there can be multiple loggers for one application). The name
//   will be added to logging output.
// - the loggingLevel. One shall use defined LEVEL_... below.
// - the HTML <div> where the output shall be redirected.


function Logger(loggerName) {
    this.setName(loggerName);
}

Logger._loggers = new Array();
Logger.getLogger = function(loggerName) {
    if (null == Logger._loggers[loggerName]) {
	Logger._loggers[loggerName] = new Logger(loggerName);
    }
    return Logger._loggers[loggerName];
}

// Logging levels for the user
Logger.LEVEL_NONE = 0;
Logger.LEVEL_ERROR = 1;
Logger.LEVEL_WARNING = 2;
Logger.LEVEL_NOTIFY = 3;
Logger.LEVEL_TRACE = 4;

// The logging level to use
Logger.loggingLevel = Logger.LEVEL_NONE;

// The logging destination div. It shall be redefined by the user.
Logger.outputDIV = null;

// The logger name
Logger.prototype._name;
Logger.prototype.getName = function() {
    return "[" + this._name + "]";
}
Logger.prototype.setName = function(name) {
    this._name = name;
}

// One message number for all Loggers. It will be added for all messages
Logger._messageNumber = 0;

// If the current logging level is sufficient, appends the message
// to the current output DIV innerHTML
Logger.prototype._print = function(message, level) {
    // Print only if _loggingLevel is higher than LEVEL_NONE
    // and level is is lower or equal to _loggingLevel
    if (Logger.outputDIV != null
        && Logger.loggingLevel > Logger.LEVEL_NONE
	&& Logger.loggingLevel >= level) {
	Logger._messageNumber++;
	var outputHTML = Logger.outputDIV.innerHTML;
	outputHTML += Logger._messageNumber + ": " + message;
	Logger.outputDIV.innerHTML = outputHTML;
    }
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

// Logger tests
function _testLogger(div) {
    // For all avaliabel levels, create a logger instance, then log messages
    // for each level.
    Logger.outputDIV = div;
    for (var nLevel = 0; nLevel <= 4; nLevel++) {
	Logger.loggingLevel = nLevel;
	var log = getLogger("TestLogger" + nLevel);
	log.error("Test error message");
	log.warning("Test warning message");
	log.notify("Test notify message");
	log.trace("Test trace message");
    }
    
}
