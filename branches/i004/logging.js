/*
This is the logging module for a JavaScript application. It loggs the user messages
into the specified destination element innerHTML. The user shall use factory method Logger.getLogger()
in order to instantiate a logger.

*** User API:
** static methods:

- Logger.getLogger(loggerName) - returns a Logger instance with a specified loggerName

** static fields:

- Logger.loggingLevel - the current logging level. It could be dynamically changed while application is running. The
level change affects all further logging calls. It is calculated as a bit mask.

- Logger.output - the HTML element where the output shall be directed. The logger appends its messages in HTML style
to the output's innerHTML 

- Logger.LEVEL_NONE - do not log at all
- Logger.LEVEL_ERROR - log error messages
- Logger.LEVEL_WARNING - log warnings
- Logger.LEVEL_NOTIFY - log notices
- Logger.LEVEL_TRACE - log traces
- Logger.LEVEL_ALL - log everything

** methods

- Logger.getName() - returns the logger instance name

- Logger.error(message, parameters) - logs specified message with an optional array parameters as an error

- Logger.warning(message,parameters) - logs specified message with an optionsl array parameters as a warning

- Logger.notify(message, parameters) - logs specified message with an optional  array parameters as a notice

- Logger.trace(messagem, parameters) - logs specified message with an optional array parameters as a trace

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
            throw new Error("Only Logger.getLogger can create a Logger instance!");
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
            var retValue;
            if (null != _name) {
                retValue = _name.toString();
            } else {
                retValue = "[/no name/]";
            }
            return retValue;
        };
        
        /**
         * Logs the error message with specified parameters to the output
         *
         * Parameters:
         *   message - the message to be logged
         *   parameters - the Array of parameters to be logged
         */
        this.error = function(message, parameters) {
            for (var i = 0; i < _outputs.length; i++) {
                if ((_outputs[i].value & Logger.LEVEL_ERROR) == Logger.LEVEL_ERROR) {
                    var loggingMessage = new LoggingMessage(self, message, parameters);
                    _outputs[i].key.appendError(loggingMessage);
                }
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
            for (var i = 0; i < _outputs.length; i++) {
                if ((_outputs[i].value & Logger.LEVEL_WARNING) == Logger.LEVEL_WARNING) {
                    var loggingMessage = new LoggingMessage(self, message, parameters);
                    _outputs[i].key.appendWarning(loggingMessage);
                }
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
            for (var i = 0; i < _outputs.length; i++) {
                if ((_outputs[i].value & Logger.LEVEL_NOTIFY) == Logger.LEVEL_NOTIFY) {
                    var loggingMessage = new LoggingMessage(self, message, parameters);
                    _outputs[i].key.appendNotify(loggingMessage);
                }
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
            for (var i = 0; i < _outputs.length; i++) {
                if ((_outputs[i].value & Logger.LEVEL_TRACE) == Logger.LEVEL_TRACE) {
                    var loggingMessage = new LoggingMessage(self, message, parameters);
                    _outputs[i].key.appendTrace(loggingMessage);
                }
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
        if (undefined == _loggers[loggerName]) {
            _loggers[loggerName] = new Logger(loggerName);
        }
        return _loggers[loggerName];
    };

    /**
     * The wrapper to tie LoggerOutput to corressponding logging level
     *
     * Parameters:
     *   loggerOutput - the LoggerOutput instance to be a key
     *   loggingLevel - the level to be a instance value
     */
    function LoggerOutputLoggingLevel(loggerOutput, loggingLevel) {
        this.key = loggerOutput;
        this.value = loggingLevel;
    };
    
    /**
     * The array that contains all output handlers
     */
    var _outputs = new Array();

    /**
     * Adds the given output instance to the array of output handlers.
     * The otput instance must extend the LoggerOutput class.
     *
     * Parameters:
     *   output - the LoggerOutput instance to be added
     *   level - specifies the logging levels that shall be passed to this output
     *           in form of binary mask
     */
    _Logger.addLoggerOutput = function(output, level) {
        if (undefined != output && output instanceof LoggerOutput
            && typeof level != "undefined") {
            if (output instanceof LoggerOutput) {
                _outputs[_outputs.length] = new LoggerOutputLoggingLevel(output, level);
            } else {
                throw new Error("Cannot register the non LoggerOutput instance!");
            }
        }
    };

    /**
     * Removes all occurences of the given output instance from the array of output handlers.
     *
     * Parameters:
     *   output - the output instance to be removed
     */
    _Logger.removeLoggerOutput = function(output) {
        if (null != output && output instanceof LoggerOutput) {
            for (var i = _outputs.length - 1; i >= 0; i--) {
                if (_outputs[i].key == output) {
                    _outputs.splice(i, 1);
                }
            }
        }
    };

    /**
     * Removes all registered outputs.
     */
    _Logger.removeAllLoggerOutputs = function() {
        _outputs = new Array();
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
 * The logging message that is passed from the Logger to LoggerOutput
 *
 * Parameters:
 *   source - the logger instance that is the source of the message
 *   messagee - the message to be handled by LoggerOutput
 *   parameters - the optional message parameters to be handled by LoggerOutput
 */
function LoggingMessage(source, message, parameters) {
    
    if (!(source instanceof Logger)) {
        throw new Error("Only Logger instance can create the LoggingMessage!");
    }

    /**
     * The source of the LoggingMessage
     */
    var _source = source;

    /**
     * The LoggingMessage source getter
     *
     * Return:
     *   The Logger source of the message
     */
    this.getSource = function() {
        return _source;
    };

    /**
     * The message to be handled by LoggerOutput
     */
    var _message = message;

    /**
     * The LoggingMessage message getter
     *
     * Return:
     *   The message
     */
    this.getMessage = function() {
        return _message;
    };

    /**
     * The parameters of the message to be handled be LoggerOutput
     */
    var _parameters = parameters;

    /**
     * The LoggingMessage parameters getter
     *
     * Return:
     *   The message parameters
     */
    this.getParameters = function() {
        return _parameters;
    };

};


/**
 * The interface for Logger that allows output he messages
 */
function LoggerOutput() {
};

/**
 * Appends the given error message to the LoggerOutput instance attached output
 * 
 * Parameters:
 *   message - the LoggingMessage to be appended to the output
 */
LoggerOutput.prototype.appendError = function(message) {
    throw new Error("This is abstract method");
};

/**
 * Appends the given warning message to the LoggerOutput instance attached output
 * 
 * Parameters:
 *   message - the LoggingMessage to be appended to the output
 */
LoggerOutput.prototype.appendWarning = function(message) {
    throw new Error("This is abstract method");
};

/**
 * Appends the given notify message to the LoggerOutput instance attached output
 * 
 * Parameters:
 *   message - the LoggingMessage to be appended to the output
 */
LoggerOutput.prototype.appendNotify = function(message) {
    throw new Error("This is abstract method");
};

/**
 * Appends the given trace message to the LoggerOutput instance attached output
 * 
 * Parameters:
 *   message - the LoggingMessage to be appended to the output
 */
LoggerOutput.prototype.appendTrace = function(message) {
    throw new Error("This is abstract method");
};

/**
 * The PlainLoggerOutput class appends the messages to the specified output elements
 * as a plain HTML text. It adds the message number (specific for the instance) and
 * the endl sequence to the message and prints it into the element.
 *
 * Parameters:
 *   element - the HTML element where the messages shall be added
 */
function PlainLoggerOutput(element) {
    
    /**
     * By convention, we make a private self parameter. This is used to make the object
     * available to the private methods.
     * This is a workaround for an error in the ECMAScript Language Specification which
     * causes this to be set incorrectly for inner functions.
     */
    var self = this;

    /**
     * The output element to be used for adding the output
     */
    var _element = element;

    /**
     * One message number for all Loggers. It will be added for all messages
     */
    var _messageNumber = 1;
        
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
     * Appends the given message to the LoggerOutput instance attached output
     * 
     * Parameters:
     *   messageHTML - the message to be appended to the output
     */
    function _append(messageHTML) {
        _element.innerHTML += messageHTML;
    };

    function _a(message) {
        _element.innerHTML += message.format();
    };


    /**
     * Appends the given error message to the LoggerOutput instance attached output
     * 
     * Parameters:
     *   message - the LoggingMessage to be appended to the output
     */
    this.appendError = function(message) {
        _a(new PlainLoggerOutput.ErrorMessage(message));
    };

    /**
     * Appends the given warning message to the LoggerOutput instance attached output
     * 
     * Parameters:
     *   message - the LoggingMessage to be appended to the output
     */
    this.appendWarning = function(message) {
        _append(_formatMessage(new PlainLoggerOutput.WarningMessage(message)));
    };

    /**
     * Appends the given notify message to the LoggerOutput instance attached output
     * 
     * Parameters:
     *   message - the LoggingMessage to be appended to the output
     */
    this.appendNotify = function(message) {
        _append(_formatMessage(new PlainLoggerOutput.NotifyMessage(message)));
    };

    /**
     * Appends the given trace message to the LoggerOutput instance attached output
     * 
     * Parameters:
     *   message - the LoggingMessage to be appended to the output
     */    
    this.appendTrace = function(message) {
        _append(_formatMessage(new PlainLoggerOutput.TraceMessage(message)));
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
            retString = ": {";
            for (key in array) {
                retString += key.toString() + ":" + array[key].toString() + ", ";
            }
            retString = retString.substring(0, retString.lastIndexOf(","));
            retString += "}";
        }
        return retString;
    };
    
    //TODO - this shall be incorporated in Message
    function _formatMessage(message) {
        var loggingMessage = message.getLoggingMessage();
        return message.getPrefix()
            + _incrementMessageNumber() + ": "
            + loggingMessage.getMessage()
            + _parseArray(loggingMessage.getParameters())
            + " [" + loggingMessage.getSource().getName() + "]"
            + message.getSuffix()
            + self.getEndl();
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
    this.getEndl = function() {
        return _endl.toString();
    };

    /**
     * The end line sequence setter
     *
     * Parameters:
     *   endl - the sequence to be used as end line
     */
    this.setEndl = function(endl) {
        _endl = endl;
    };

    /**
     * This is a bassic wrapper for a logging message to be passed to a _formatMessage().
     * It is an abstract class.
     */
    function Message() {
        /**
         * The LoggingMessage instance to be wrapped
         */
        var _loggingMessage;

        /**
         * The setter for a logging message
         *
         * Parameters:
         *   loggingMessage - the logging message to be wrapped
         */
        this.setLoggingMessage = function(loggingMessage) {
            _loggingMessage = loggingMessage;
        };

        /**
         * The getter for a logging message
         *
         * Return:
         *   the logging message that is wrapped by this instance
         */
        this.getLoggingMessage = function() {
            return _loggingMessage;
        };
        
        /**
         * The prefix sequence getter
         * 
         * Return:
         *    The String represenataion of prefix
         */
        this.getPrefix = function() {
            throw new Error("This is abstract method");            
        };

        /**
         * The prefix setter
         *
         * Parameters:
         *    prefix - the sequence to be used as prefix
         */
        this.setPrefix = function(prefix) {
            throw new Error("This is abstract method");
        };

        /**
         * The suffix getter
         *
         * Return:
         *   The String representation of suffix
         */
        this.getSuffix = function() {
            throw new Error("This is abstract method");
        };

        /**
         * The suffix setter
         *
         * Parameters:
         *    suffix - the sequence to be used as suffix
         */
        this.setSuffix = function(suffix) {
            throw new Error("This is abstract method");
        };
    };

    // TODO - investigate this approach
    Message.prototype.format = function() {
        var loggingMessage = getLoggingMessage();
        return prefix
            + _incrementMessageNumber() + ": "
            + loggingMessage.getMessage()
            + _parseArray(loggingMessage.getParameters())
            + " [" + loggingMessage.getSource().getName() + "]"
            + suffix
            + self.getEndl();
    };

    Message.prototype.prefix = "";
    Message.prototype.suffix = "";

    /**
     * This is a wrapper for an error logging message.
     *
     * Parameters:
     *   loggingMessage - the logging message to be wrapped.
     */
    PlainLoggerOutput.ErrorMessage = function(loggingMessage) {
        this.setLoggingMessage(loggingMessage);
        this.prefix = this.getPrefix();
        this.suffix = this.getSuffix();

        /**
         * The sequence to be used as an error prefix
         */
        var _prefix = "<font color=\"red\"><b>Error: ";
    
        /**
         * The error prefix sequence getter
         * 
         * Return:
         *    The String represenataion of error prefix
         */
        this.getPrefix = function() {
            return _prefix.toString();
        };

        /**
         * The error prefix setter
         *
         * Parameters:
         *    prefix - the sequence to be used as error prefix
         */
        this.setPrefix = function(prefix) {
            _prefix = prefix;
        };

        /**
         * The sequence to be used as an error suffix
         */
        var _suffix = "</b></font>";

        /**
         * The error suffix getter
         *
         * Return:
         *   The String representation of error suffix
         */
        this.getSuffix = function() {
            return _suffix.toString();
        };

        /**
         * The error suffix setter
         *
         * Parameters:
         *    suffix - the sequence to be used as error suffix
         */
        this.setSuffix = function(suffix) {
            _suffix = suffix;
        };

    };
    
    /**
     * ErrorMessage extends the Message
     */
    PlainLoggerOutput.ErrorMessage.prototype = new Message();

    /**
     * This is a wrapper for a warning logging message.
     *
     * Parameters:
     *   loggingMessage - the logging message to be wrapped.
     */
    PlainLoggerOutput.WarningMessage = function(loggingMessage) {
        this.setLoggingMessage(loggingMessage);
        this.prefix = this.getPrefix();
        this.suffix = this.getSuffix();

        /**
         * The sequence to be used as an warning prefix
         */
        var _prefix = "<font color=\"black\"><b>Warning: ";

        /**
         * The warning prefix sequence getter
         * 
         * Return:
         *    The String represenataion of warning prefix
         */
        this.getPrefix = function() {
            return _prefix.toString();
        };

        /**
         * The warning prefix setter
         *
         * Parameters:
         *    prefix - the sequence to be used as warning prefix
         */
        this.setPrefix = function(prefix) {
            _prefix = prefix;
        };

        /**
         * The sequence to be used as an warning suffix
         */
        var _suffix = "</b></font>";

        /**
         * The warning suffix getter
         *
         * Return:
         *   The String representation of warning suffix
         */
        this.getSuffix = function() {
            return _suffix.toString();
        };
 
        /**
         * The warning suffix setter
         *
         * Parameters:
         *    suffix - the sequence to be used as warning suffix
         */
        this.setSuffix = function(suffix) {
            _suffix = suffix;
        };

    };
    
    /**
     * WarningMessage extends the Message
     */
    PlainLoggerOutput.WarningMessage.prototype = new Message();

    /**
     * This is a wrapper for a notify logging message.
     *
     * Parameters:
     *   loggingMessage - the logging message to be wrapped.
     */
    PlainLoggerOutput.NotifyMessage = function(loggingMessage) {
        this.setLoggingMessage(loggingMessage);
        this.prefix = this.getPrefix();
        this.suffix = this.getSuffix();

        /**
         * The sequence to be used as an notify prefix
         */
        var _prefix = "<font color=\"green\">Notify: ";
    
        /**
         * The notify prefix sequence getter
         * 
         * Return:
         *    The String represenataion of notify prefix
         */
        this.getPrefix = function() {
            return _prefix.toString();
        };

        /**
         * The notify prefix setter
         *
         * Parameters:
         *    prefix - the sequence to be used as notify prefix
         */
        this.setPrefix = function(prefix) {
            _prefix = prefix;
        };

        /**
         * The sequence to be used as an notify suffix
         */
        var _suffix = "</font>";

        /**
         * The notify suffix getter
         *
         * Return:
         *   The String representation of notify suffix
         */
        this.getSuffix = function() {
            return _suffix.toString();
        };

        /**
         * The notify suffix setter
         *
         * Parameters:
         *    suffix - the sequence to be used as notify suffix
         */
        this.setSuffix = function(suffix) {
            _suffix = suffix;
        };

    };
    
    /**
     * NotifyMessage extends the Message
     */
    PlainLoggerOutput.NotifyMessage.prototype = new Message();

    /**
     * This is a wrapper for a trace logging message.
     *
     * Parameters:
     *   loggingMessage - the logging message to be wrapped.
     */
    PlainLoggerOutput.TraceMessage = function(loggingMessage) {
        this.setLoggingMessage(loggingMessage);
        this.prefix = this.getPrefix();
        this.suffix = this.getSuffix();

        /**
         * The sequence to be used as an trace prefix
         */
        var _prefix = "<font color=\"blue\">Trace: ";
    
        /**
         * The trace prefix sequence getter
         * 
         * Return:
         *    The String represenataion of trace prefix
         */
        this.getPrefix = function() {
            return _prefix.toString();
        };
    
        /**
         * The trace prefix setter
         *
         * Parameters:
         *    prefix - the sequence to be used as trace prefix
         */
        this.setPrefix = function(prefix) {
            _prefix = prefix;
        };

        /**
         * The sequence to be used as an trace suffix
         */
        var _suffix = "</font>";

        /**
         * The trace suffix getter
         *
         * Return:
         *   The String representation of trace suffix
         */
        this.getSuffix = function() {
            return _suffix.toString();
        };
    
        /**
         * The trace suffix setter
         *
         * Parameters:
         *    suffix - the sequence to be used as trace suffix
         */
        this.setSuffix = function(suffix) {
            _suffix = suffix;
        };

    };
    
    /**
     * TraceMessage extends the Message
     */
    PlainLoggerOutput.TraceMessage.prototype = new Message();

};

/**
 * PlainLggerOutput extends the LoggerOutput
 */
PlainLoggerOutput.prototype = new LoggerOutput();

/**
 * Performs the Logger class unit tests. The caller is responsiple for preparing the output
 * and passing it to this function.
 * 
 * Parameters:
 *   element - the HTML element where the output shall be stored
 */
function _testLogger(element) {
    
    // Test the PlainLoggerOutput
    var plainLogger = Logger.getLogger("Plain Logger");
    var plainLoggerOutput = new PlainLoggerOutput(element);
    plainLoggerOutput.appendError(new LoggingMessage(plainLogger, "Error message"));
    plainLoggerOutput.appendWarning(new LoggingMessage(plainLogger, "Warning message"));
    plainLoggerOutput.appendNotify(new LoggingMessage(plainLogger, "Notify message"));
    plainLoggerOutput.appendTrace(new LoggingMessage(plainLogger, "Trace message"));

    // For all avaliabel levels, create a logger instance, then log messages
    // for each level.
    var loggerOutput = new PlainLoggerOutput(element);
    Logger.removeAllLoggerOutputs();
    var array = {"key1":"value1", "key2":"value2"};
    for (var nLevel = Logger.LEVEL_NONE; nLevel <= Logger.LEVEL_ALL; nLevel++) {
        Logger.removeLoggerOutput(loggerOutput);
        Logger.addLoggerOutput(loggerOutput, nLevel);
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

    // Check that anyone can create a Logger instance by itself
    var factoryLog = Logger.getLogger("Factory Method Testing");
    Logger.removeAllLoggerOutputs();
    Logger.addLoggerOutput(loggerOutput, Logger.LEVEL_ALL);
    try {
        var tmp = new Logger("Creation Failure");
        tmp.error("Factory access vaiolated!");
        factoryLog.error("Factory access vaiolated!");
    } catch (error) {
        factoryLog.notify("Factory access OK: " + error.message);
    }
    
    // Test the LoggerOutput addition and removal
    var multipleOutputsLog = Logger.getLogger("Multiple Outputs");
    Logger.removeAllLoggerOutputs();
    Logger.addLoggerOutput(loggerOutput, Logger.LEVEL_ALL);
    Logger.addLoggerOutput(plainLoggerOutput, Logger.LEVEL_ALL);
    multipleOutputsLog.notify("Many times");
    Logger.removeLoggerOutput(plainLoggerOutput);
    multipleOutputsLog.notify("One time");
};
