// This is the logging module for a JavaScript application. It loggs the user messages
// into the specified destination DIV. The user shall provide the following:
// - the Logger name (there can be multiple loggers for one application). The name
//   will be added to logging output.
// - the loggingLevel. One shall use defined LEVEL_... below.
// - the HTML <div> where the output shall be redirected.

function Logger(loggerName, loggingLevel, outputDIV) {
    this.setName(loggerName);
    this.setLoggingLevel(logginLevel);
    this.setOutputDIV(otputDIV);
}

// Logging levels for the user
Logger.prototpe.LEVEL_NONE = 0;
Logger.prototpe.LEVEL_ERROR = 1;
Logger.prototpe.LEVEL_WARNING = 2;
Logger.prototpe.LEVEL_NOTIFY = 3;
Logger.prototpe.LEVEL_TRACE = 4;

// The logger name
Logger.prototype._name;
Logger.prototype.getName = function() {
    return this._name;
}
Logger.prototype.setName = function(name)
{
    this._name = name;
}

// The logging level to use. It shall be redefined by the user
// to get the user output
Logger.prototype._loggingLevel;
Logger.prototype.getLoggingLevel = function() {
    return this._loggingLevel;
}
Logger.prototype.setLoggingLevel = function(loggingLevel) {
    this._logginhLevel = loggingLevel;
}

// The logging destination div. It shall be redefined by the user.
Logger.prototype._outputDIV;
Logger.prototype.getOutputDIV = function() {
    return this._outputDIV;
}
Logger.prototype.setOutputDIV = function(outputDIV) {
    this._outputDIV = outputDIV;
}

// If the current logging level is sufficient, appends the message
// to the current output DIV innerHTML
Logger.prototype._print = function(message, level) {
    // Print only if _loggingLevel is higher than LEVEL_NONE
    // and level is is lower or equal to _loggingLevel
    var loggingLevel = this.getLoggingLevel();
    if (loggingLevel > this.LEVEL_NONE
	&& loggingLevel >= level) {
	var outputDIV = this.getOutputDIV();
	var outputHTML = outputDIV.innerHTML;
	outputHTML += message;
	outputDIV.innerHTML = outputHTML;
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
    var msg = this.getErrorPrefix() + this.getName() + ":" + message + this.getErrorSuffix() + this.getEndl();
    this._print(msg, this.LEVEL_ERROR);
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
    var msg = this.getWarningPrefix() + this.getName() + ":" + message + this.getWarningSuffix() + this.getEndl();
    this._print(msg, this.LEVEL_WARNING);
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
    var msg = this.getNotifyPrefix() + this.getName() + ":" + message + this.getNotifySuffix() + this.getEndl();
    this._print(msg, this.LEVEL_NOTIFY);
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
    var msg = this.getTracePrefix() + this.getName() + ":" + message + this.getTraceSuffix() + this.getEndl();
    this._print(msg, this.LEVEL_TRACE);
}

// Logger tests
function _testLogger(div) {
    // For all avaliabel levels, create a logger instance, then log messages
    // for each level.
    for (var nLevel = Logger.LEVEL_NONE; nLevel <= Logger.LEVEL_TRACE; nLevel++) {
	var log = new Logger("TestLogger" + nLevel, nLevel, div);
	log.error("Test error message");
	log.waring("Test warning message");
	log.notify("Test notify message");
	log.trace("Test trace message");
    }
}
