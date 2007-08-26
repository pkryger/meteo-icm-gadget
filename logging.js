/*
This is the logging module for a JavaScript application. It loggs the user messages
into the specified destination element innerHTML. The user shall use factory method Logger.getLogger()
in order to instantiate a logger.

*** User API:
** static methods:

- getLogger(loggerName) - returns a Logger instance with a specified loggerName

** static fields:

- loggingLevel - the current logging level. It could be dynamically changed while application is running. The
level change affects all further logging calls. It is calculated as a bit mask.

- output - the HTML element where the output shall be directed. The logger appends its messages in HTML style
to the output's innerHTML 

- LEVEL_NONE - do not log at all
- LEVEL_ERROR - log error messages
- LEVEL_WARNING - log warnings
- LEVEL_NOTIFY - log notices
- LEVEL_TRACE - log traces
- LEVEL_ALL - log everything

** methods

- getName() - returns the logger instance name

- error(message, parameters) - logs specified message with an optional array parameters as an error

- warning(message,parameters) - logs specified message with an optionsl array parameters as a warning

- notify(message, parameters) - logs specified message with an optional  array parameters as a notice

- trace(messagem, parameters) - logs specified message with an optional array parameters as a trace

** functions

_testLogger(out) - sandbox for Logger class.
*/


/**
 * The Logger class.
 */
var Logger = (function() {
    /**
     * Creates the instance of Logger with given loggerName.
     * Note: this constructor is private. One shall use Logger.getLogger(loggetName) to obtain a logger name
     *
     * Parameters:
     *   loggerName  the object to identify the logger name.
     */
    function _Logger(loggerName) {
	if (_Logger.caller != _Logger.getLogger) {
	    throw new Error("Only Logger.getLogger can create a Logger instance!" + _Logger.caller);
	}
	/**
	 * By convention, we make a private self parameter. This is used to make the object
	 * available to the private methods.
	 * This is a workaround for an error in the ECMAScript Language Specification which
	 * causes this to be set incorrectly for inner functions.
	 */
	var self = this;

	/**
	 * The object that represents the name of the Logger instance
	 */
	var _name = loggerName;

	/** 
	 * The Logger instance name getter. The name is returned as a String.
	 *
	 * Return:
	 *   The instance name as a String 
	 */
	this.getName = function() {
	    return "[" + self._name.toString() + "]";
	};
	
	/**
	 * Appends the message to the output.innerHTML if lefel is sufficient.
	 *
	 * Parameters:
	 *   message - a messate to be logged
	 *   level - the level of the message; it will be checked against loggingLevel
	 */
	function _print(message, level) {
	    // Print only if loggingLevel is different than LEVEL_NONE
	    // and level matches loggingLevel
	    if (Logger.output != null
		&& Logger.loggingLevel != Logger.LEVEL_NONE
		&& (Logger.loggingLevel & level) == level) {
		var outputHTML = Logger.output.innerHTML;
		outputHTML += _incrementMessageNumber() + ": " + message.toString();
		Logger.output.innerHTML = outputHTML;
	    }
	};

	/**
	 * Logs the error message with specified parameters to the output
	 *
	 * Parameters:
	 *   message - the message to be logged
	 *   parameters - the Array of parameters to be logged
	 */
	_Logger.prototype.error = function(message, parameters) {
	    if ((Logger.loggingLevel & Logger.LEVEL_ERROR) == Logger.LEVEL_ERROR) {
		var params = ": " + parseArray(parameters);
		var msg = getErrorPrefix() + message + params + getErrorSuffix() + self.getName() + " " + getEndl();
		self._print(msg, Logger.LEVEL_ERROR);
	    }
	};

	/**
	 * Logs the warning message with specified parameters to the output
	 *
	 * Parameters:
	 *   message - the message to be logged
	 *   parameters - the Array of parameters to be logged
	 */
	this.warning = function(message, parameters) {
	    if ((Logger.loggingLevel & Logger.LEVEL_WARNING) == Logger.LEVEL_WARNING) {
		var params = ": " + parseArray(parameters);
		var msg = getWarningPrefix() + message + params + getWarningSuffix() + self.getName() + " " + getEndl();
		self._print(msg, Logger.LEVEL_WARNING);
	    }
	};

	/**
	 * Logs the notify message with specified parameters to the output
	 *
	 * Parameters:
	 *   message - the message to be logged
	 *   parameters - the Array of parameters to be logged
	 */
	this.notify = function(message, parameters) {
	    if ((Logger.loggingLevel & Logger.LEVEL_NOTIFY) == Logger.LEVEL_NOTIFY) {
		var params = ": " + parseArray(parameters);
		var msg = getNotifyPrefix() + message + params + getNotifySuffix() + self.getName() + " " + getEndl();
		self._print(msg, Logger.LEVEL_NOTIFY);
	    }
	};

	/**
	 * Logs the trace message with specified parameters to the output
	 *
	 * Parameters:
	 *   message - the message to be logged
	 *   parameters - the Array of parameters to be logged
	 */
	this.trace = function(message, parameters) {
	    if ((Logger.loggingLevel & Logger.LEVEL_TRACE) == Logger.LEVEL_TRACE) {
		var params = ": " + parseArray(parameters);
		var msg = getTracePrefix() + message + params + getTraceSuffix() + self.getName() + " " + getEndl();
		self._print(msg, Logger.LEVEL_TRACE);
	    }
	};

    }; // End of constuctor

    /**
     * The array of loggers for factory method
     */
    var _loggers = new Array();

    /**
     * Gives a Logger instance to be used by the user. This factory method shall be used to
     * obtain a instance of a logger.
     *
     * Parameters:
     *   loggerName the object that represents the Logger name
     * Return:
     *   The Logger instance for a given loggerName
     */
    _Logger.getLogger = function(loggerName) {
	if (null == _loggers[loggerName]) {
	    _loggers[loggerName] = _Logger(loggerName);
	}
	return _loggers[loggerName];
    };

    /**
     * One message number for all Loggers. It will be added for all messages
     */
    var _messageNumber = 0;
    
    /**
     * Gives the message number and increments it.
     * 
     * Return:
     *   The message number to be used
     */
    function _incrementMessageNumber() {
	return _messageNumber++;
    };
    
    /**
     * Parses the given array and returns its string represenatation
     * 
     * Parameters:
     *   array - the array object to be parsed
     * Return:
     *  The String in the following form: {key1:value1, key2:value2}
     */
    function _parseArray(array) {
	var retString = "";
	if (null != array) {
	    retString = "{";
	    for (key in array) {
		retString += key.toString() + ":" + array[key].toString() + ", ";
	    }
	    retString = retString.substring(0, retString.lastIndexOf(","));
	    retString += "}";
	}
	return retString;
    };
    
    /**
     * The sequence to be used as an end line
     */
    var _endl = "<br />";

    /**
     * The end line sequence getter
     *
     * Return:
     *   The String representation of end line
     */
    _Logger.getEndl = function() {
	return _endl.toString();
    };

    /**
     * The end line sequence setter
     *
     * Parameters:
     *   endl - the sequence to be used as end line
     */
    _Logger.setEndl = function(endl) {
	_endl = endl;
    };
    
    /**
     * The sequence to be used as an error prefix
     */
    var _errorPrefix = "<font color=\"red\"><b>Error: ";
    
    /**
     * The error prefix sequence getter
     * 
     * Return:
     *    The String represenataion of error prefix
     */
    _Logger.getErrorPrefix = function() {
	return _errorPrefix.toString();
    };

    /**
     * The error prefix setter
     *
     * Parameters:
     *    prefix - the sequence to be used as error prefix
     */
    _Logger.setErrorPrefix = function(prefix) {
	_errorPrefix = prefix;
    };

    /**
     * The sequence to be used as an error suffix
     */
    var _errorSuffix = "</b></font>";

    /**
     * The error suffix getter
     *
     * Return:
     *   The String representation of error suffix
     */
    _Logger.getErrorSuffix = function() {
	return _errorSuffix.toString();
    };

    /**
     * The error suffix setter
     *
     * Parameters:
     *    suffix - the sequence to be used as error suffix
     */
    _Logger.setErrorSuffix = function(suffix) {
	_errorSuffix = suffix;
    };

    /**
     * The sequence to be used as an warning prefix
     */
    var _warningPrefix = "<font color=\"black\"><b>Warning: ";
    
    /**
     * The warning prefix sequence getter
     * 
     * Return:
     *    The String represenataion of warning prefix
     */
    _Logger.getWarningPrefix = function() {
	return _warningPrefix.toString();
    };

    /**
     * The warning prefix setter
     *
     * Parameters:
     *    prefix - the sequence to be used as warning prefix
     */
    _Logger.setWarningPrefix = function(prefix) {
	_warningPrefix = prefix;
    };

    /**
     * The sequence to be used as an warning suffix
     */
    var _warningSuffix = "</b></font>";

    /**
     * The warning suffix getter
     *
     * Return:
     *   The String representation of warning suffix
     */
    _Logger.getWarningSuffix = function() {
	return _warningSuffix.toString();
    };
    
    /**
     * The warning suffix setter
     *
     * Parameters:
     *    suffix - the sequence to be used as warning suffix
     */
    _Logger.setWarningSuffix = function(suffix) {
	_warningSuffix = suffix;
    };

    /**
     * The sequence to be used as an notify prefix
     */
    var _notifyPrefix = "<font color=\"green\">Notify: ";
    
    /**
     * The notify prefix sequence getter
     * 
     * Return:
     *    The String represenataion of notify prefix
     */
    _Logger.getNotifyPrefix = function() {
	return _notifyPrefix.toString();
    };

    /**
     * The notify prefix setter
     *
     * Parameters:
     *    prefix - the sequence to be used as notify prefix
     */
    _Logger.setNotifyPrefix = function(prefix) {
	_notifyPrefix = prefix;
    };

    /**
     * The sequence to be used as an notify suffix
     */
    var _notifySuffix = "</font>";

    /**
     * The notify suffix getter
     *
     * Return:
     *   The String representation of notify suffix
     */
    _Logger.getNotifySuffix = function() {
	return _notifySuffix.toString();
    };

    /**
     * The notify suffix setter
     *
     * Parameters:
     *    suffix - the sequence to be used as notify suffix
     */
    _Logger.setNotifySuffix = function(suffix) {
	_notifySuffix = suffix;
    };

    /**
     * The sequence to be used as an trace prefix
     */
    var _tracePrefix = "<font color=\"blue\">Trace: ";
    
    /**
     * The trace prefix sequence getter
     * 
     * Return:
     *    The String represenataion of trace prefix
     */
    _Logger.getTracePrefix = function() {
	return _tracePrefix.toString();
    };

    /**
     * The trace prefix setter
     *
     * Parameters:
     *    prefix - the sequence to be used as trace prefix
     */
    _Logger.setTracePrefix = function(prefix) {
	_tracePrefix = prefix;
    };

    /**
     * The sequence to be used as an trace suffix
     */
    var _traceSuffix = "</font>";

    /**
     * The trace suffix getter
     *
     * Return:
     *   The String representation of trace suffix
     */
    _Logger.getTraceSuffix = function() {
	return _traceSuffix.toString();
    };

    /**
     * The trace suffix setter
     *
     * Parameters:
     *    suffix - the sequence to be used as trace suffix
     */
    _Logger.setTraceSuffix = function(suffix) {
	_traceSuffix = suffix;
    };
    
    // Return an instance
    return _Logger;
})();

/**
 * Special logging level that prevents any logs to be shown
 */
Logger.LEVEL_NONE = 0;
/**
 * Logging level that causes the error messages to appear
 */
Logger.LEVEL_ERROR = 1 << 0;
/**
 * Logging level that causes the warning messages to appear
 */
Logger.LEVEL_WARNING = 1 << 1;
/**
 * Logging level that causes the notify messages to appear
 */
Logger.LEVEL_NOTIFY = 1 << 2;
/**
 * Logging level that causes the trace messages to appear
 */
Logger.LEVEL_TRACE = 1 << 3;
/**
 * Special logging level that causes all messages to appear
 */
Logger.LEVEL_ALL =
    Logger.LEVEL_ERROR
    | Logger.LEVEL_WARNING
    | Logger.LEVEL_NOTIFY
    | Logger.LEVEL_TRACE;

/**
 * The current logging level of the Logger class. This variable shall be set to
 * one of te above levels in order to make some log entries to appear. The logging
 * level is interpreted as a bit mask so it is possible to log any combination of
 * logging levels.
 */
Logger.loggingLevel = Logger.LEVEL_NONE;

/**
 * The logging destination output element. It shall be redefined by the user
 * in order to display logging messages
 */
Logger.output = null;


// Logger tests
function _testLogger(div) {
    // For all avaliabel levels, create a logger instance, then log messages
    // for each level.
    Logger.output = div;
    var array = {"key1":"value1", "key2":"value2"};
    for (var nLevel = Logger.LEVEL_NONE; nLevel <= Logger.LEVEL_ALL; nLevel++) {
	Logger.loggingLevel = nLevel;
	var log = Logger.getLogger("TestLogger: level = " + nLevel);
	log.error("Test error message");
	log.error("Test error message with array", array);
	log.warning("Test warning message");
	log.warning("Test warning message with array", array);
	log.notify("Test notify message");
	log.notify("Test notify message with array", array);
	log.trace("Test trace message");
	log.trace("Test trace message with array", array);
    }    
};
