<style type="text/css">
    .progressOut{margin:2px 0;border:1px solid #008000;width:200px;height:10px;}
    #progressIn{background:#00d200;width:0;height:100%;}
</style>
<div id="meteogram_div">
    <span style="font-size: 9pt;">__MSG_loading_data__</span>
    <div><div class="progressOut"><div id="progressIn"></div></div></div>
</div>
<!-- Uncoment the following line to see logging messages -->
<div id="logging_div" style="font-size:8pt; padding:5px;"></div>

<script type="text/javascript" src="http://meteo-icm-gadget.googlecode.com/svn/trunk/logging.js"></script>
<script type="text/javascript">

// The logging stuff
var log = Logger.getLogger("meteo-icm-main");
// Uncoment the following line to see logging messages
Logger.addLoggerOutput(new ColorHTMLLoggerOutput(document.getElementById("logging_div")), Logger.LEVEL_ALL);
// Uncomment the following line to perform the logging module tests
//_testLogger(document.getElementById("logging_div"));

var IMAGE_CACHE_TIME = 60 * 60 * 24; // in seconds
var PAGE_CACHE_TIME = 5 * 60; //in seconds
var BASE_URL = 'http://new.meteo.pl';

var responseParsed__MODULE_ID__ = false;
var checkTimeout__MODULE_ID__ = undefined;
var checkAttempt__MODULE_ID__ = 0;
var RESPONSE_PARSED_PROGRESS = 10;
var MANUAL_PROGRESS = RESPONSE_PARSED_PROGRESS + 1;
var LAST_SAVED_PROGRESS = MANUAL_PROGRESS + 1;
var TOTAL_PROGRESS = LAST_SAVED_PROGRESS + 1;

var prefs = new gadgets.Prefs(__MODULE_ID__);
var ga = new _IG_GA("UA-17869623-4");
ga.reportPageview('/gadget');

var model = undefined;
var COAMPS = {
    'request_page' : '/meteorogram_coamps_js.php',
    'parse_sst' : 'var SST="',
    'parse_day' : 'var SDD="',
    'parse_month' : 'var SMM="',
    'parse_year' : 'var SYYYY="',
    'legend_url' : [BASE_URL, '/metco/legenda_', prefs.getString("plotLanguage"), '_2.png'].join(''),
    'image_infix' : '/metco/mgram_pict.php?ntype=2n&fdate=',
    'link_url_infix' : '/php/meteorogram_list_coamps.php?ntype=2n&fdate=',
    'image_width' : '660',
    'image_height' : '660'    
};
var UM = {
    "request_page" : "/meteorogram_um_js.php",
    'parse_sst' : 'var UM_SST="',
    'parse_day' : 'var UM_SDD="',
    'parse_month' : 'var UM_SMM="',
    'parse_year' : 'var UM_SYYYY="',
    'legend_url' : [BASE_URL, '/um/metco/leg_um_', prefs.getString("plotLanguage"), '.png'].join(''),
    'image_infix' : '/um/metco/mgram_pict.php?ntype=0u&fdate=',
    'link_url_infix' : '/um/php/meteorogram_list.php?ntype=0u&fdate=',
    'image_width' : '540',
    'image_height' : '660'
};

function removeAllChildren(_node) {
    log.trace("Enter removeAllChildren()", {"_node": _node});
    if (undefined != _node) {
        while (_node.hasChildNodes()) {
            _node.removeChild(_node.firstChild);
        }
    } else {
        log.error("_node is undefined!");
    }
    log.trace("Exit removeAllChildren()");
}

function setProgress(_progress) {
    log.trace("Enter setProgress()", {"_progress": _progress});
    var percent = _progress * (1 / TOTAL_PROGRESS) * 100;
    var width = percent + "%";
    var bar = document.getElementById("progressIn");
    if (undefined != bar) {
        bar.style.width = width;
    }
    log.trace("Exit setProgress()");
}

function setImage(_img, _startData) {
    log.trace("Enter setImage()", {"_img": _img, "_startData": _startData});
    setProgress(TOTAL_PROGRESS);
    var view = gadgets.views.getCurrentView().getName();
    // scale height and width only for HOME view
    var sHeight = model['image_height'];
    var sWidth = model['image_width'];
    if (view == "HOME") {
        var bScaleHeight = prefs.getBool("scaleHeight");
        var bScaleWidth = prefs.getBool("scaleWidth");
        if (true == bScaleHeight) {
            ga.reportPageview('/scale/height/yes');
            sHeight = "340";
        } else {
            ga.reportPageview('/scale/height/no');
        }
        if (true == bScaleWidth) {
            ga.reportPageview('/scale/width/yes');
            sWidth = "100%";
        } else {
            ga.reportPageview('/scale/width/no');
        }
    }
    var titleAlt = [prefs.getMsg("forecast_for"),
        ' ',
        prefs.getString("cityName")].join('');
    _img.setAttribute("border", 0);
    _img.setAttribute("height", sHeight);
    _img.setAttribute("width", sWidth);
    _img.setAttribute("title", titleAlt);
    _img.setAttribute("alt", titleAlt);
    var sLinkUrl = getLinkUrl(_startData);
    var link = document.createElement("a");
    link.setAttribute("target", "_blank");
    link.setAttribute("href", sLinkUrl);
    link.appendChild(_img);
    var legend = undefined;
    if (view == "canvas") {
        var sPlotLanguage = prefs.getString("plotLanguage");
        var params = {};
        //@todo wait for google fix
        //params[gadgets.io.ProxyUrlRequestParameters.REFRESH_INTERVAL] = IMAGE_CACHE_TIME;
        legend = document.createElement("img");
        legend.src = gadgets.io.getProxyUrl(model['legend_url'], params);
    }
    var div = document.getElementById("meteogram_div");
    removeAllChildren(div);
    if (undefined != legend) {
        div.appendChild(legend);
    }
    div.appendChild(link);
    div.style.width = "100%";
    div.style.height = "auto";
    log.trace("Exit setImage()");
}

function getLinkUrl(_startData) {
    log.trace("Enter getLinkUrl()", {"_startData": _startData});
    var sCol = prefs.getInt("x"); //@todo
    var sRow = prefs.getInt("y"); //@todo
    var sPlotLanguage = prefs.getString("plotLanguage");
    var sCityName = escape(prefs.getString("cityName"));
    var sUrl = [BASE_URL,
        model['link_url_infix'],
        _startData,
        '&row=', sRow,
        '&col=', sCol,
        '&lang=', sPlotLanguage,
        '&cname=', sCityName].join('');
    log.trace("Exit getLinkUrl(): " + sUrl);
    return sUrl;
}

function setErrorPage() {
    log.trace("Enter setErrorPage()");
    ga.reportPageview('/method/error');
    // Mark we are no longer interested in timer method
    responseParsed__MODULE_ID__ = true;
    clearTimeout(checkTimeout__MODULE_ID__);
    setProgress(TOTAL_PROGRESS);
    var errorMessage = createErrorMessage(); 
    var refreshButton = createRefreshButton();
    var div = document.getElementById("meteogram_div");
    removeAllChildren(div);
    div.appendChild(errorMessage);
    div.appendChild(document.createElement("br"));
    div.appendChild(refreshButton);
    log.trace("Exit setErrorPage()");
}

function createErrorMessage() {
    log.trace("Enter createErrorMessage()");
    var message = document.createElement("span");
    message.setAttribute("style", "font-size: 9pt");
    message.innerHTML = prefs.getMsg("error_cannot_load");
    log.trace("Exit createErrorMessage(): " + message);
    return message;
}

function createRefreshButton() {
    log.trace("Enter createRefreshButton()");
    var buttonSpan = document.createElement("span");
    buttonSpan.setAttribute("style", "font-size: 9pt;margin:2px");
    var button = document.createElement("button");
    button.innerHTML = prefs.getMsg("refresh_button_text");
    var tooltip = prefs.getMsg("refresh_button_tooltip");
    button.setAttribute("title", tooltip);
    button.onclick = new Function("reload()");
    buttonSpan.appendChild(button);
    log.trace("Exit createRefreshButton(): " + buttonSpan);
    return buttonSpan;
}

function fetchImage(_imageUrl, _startData, _failureCallback) {
    log.trace("Enter fetchImage()", {"_imageUrl":_imageUrl, "_startData":_startData, "_failureCallback":_failureCallback});
    if (_imageUrl != undefined && _imageUrl != "" && _startData != undefined && _startData != "") {
        var params = {};
        //@todo wait for google fix
        //params[gadgets.io.ProxyUrlRequestParameters.REFRESH_INTERVAL] = IMAGE_CACHE_TIME;
        var img = document.createElement("img");
        //@todo seems like the getProxyUrl return garbage too often. Let's use URL as is.
        img.src = _imageUrl; //gadgets.io.getProxyUrl(_imageUrl, params);
        //@todo image checking is needed for more realiability: if (true == img.complete) {
        if (true) {
            ga.reportPageview('/method/download');
            prefs.set("lastImageUrl", _imageUrl);
            prefs.set("lastStartData", _startData);
            setImage(img, _startData);
        } else {
            log.trace("Cannot load the image: " + _imageUrl);
            _failureCallback();
        }
    } else {
        log.trace("No data to download image!");
        _failureCallback();
    }    
    log.trace("Exit fetchImage()");
}

function fetchLastSavedImage() {
    log.trace("Enter fetchLastSavedImage()");
    ga.reportPageview('/method/lastSaved');
    setProgress(LAST_SAVED_PROGRESS);
    var imageUrl = prefs.getString("lastImageUrl");
    var startData = prefs.getString("lastStartData");
    if (undefined != imageUrl && imageUrl != ""
       && undefined != startData && startData != "") {
        // Fallback to error message
        fetchImage(imageUrl, startData, setErrorPage);
    } else {
        log.trace("No last saved image");
        setErrorPage();
    }
    log.trace("Exit fetchLastSavedImage()");
}

function fetchImageManually() {
    log.trace("Enter fetchImageManually()");
    ga.reportPageview('/method/manually');
    setProgress(MANUAL_PROGRESS);
    var sPlotLanguage = prefs.getString("plotLanguage");
    var now = new Date();
    var sYear = now.getUTCFullYear();
    var nMonth = now.getUTCMonth();
    var sMonth = nMonth + 1;
    var nDay = now.getUTCDate();
    var sDay = nDay;
    if (nDay < 10) {
        sDay = "0" + nDay;
    }
    var nHour = now.getUTCHours();
    var sHour = "00";
    if (nHour > 21 || nHour < 4) {
        sHour = "18";
    } else if (nHour > 3 && nHour < 10) {
        sHour = "00";
    } else if (nHour > 9 && nHour < 16) {
        sHour = "06";
    } else if (nHour > 15 && nHour < 22) {
        sHour = "12";
    } else {
        log.error("Cannot determine sHour!", {"sHour":sHour});
    }
    var sCol = prefs.getInt("x"); //TODO
    var sRow = prefs.getInt("y"); //TODO
    var sStartData = [sYear, sMonth, sDay, sHour].join('');
    var sImageUrl = [BASE_URL,
        model['image_infix'],
        sStartData,
        '&row=', sRow,
        '&col=', sCol,
        '&lang=', sPlotLanguage].join('');
    // Fallback to the last successfully loaded image
    fetchImage(sImageUrl, sStartData, fetchLastSavedImage);
    log.trace("Exit fetchImageManually()");
}

function parseResponse(_response) {
    log.trace("Enter parseResponse()");
    var response = _response.text;
    var iStartTime = response.indexOf(model['parse_sst']);
    var iDay = response.indexOf(model['parse_day']);
    var iMonth = response.indexOf(model['parse_month']);
    var iYear = response.indexOf(model['parse_year']);
    if (iStartTime != -1 && iDay != -1 && iMonth != -1 && iYear != -1 && !responseParsed__MODULE_ID__) {
        // Mark we already parsed the response, so no other will set up the image
        responseParsed__MODULE_ID__ = true;
        clearTimeout(checkTimeout__MODULE_ID__);
        // Set progress bar
        setProgress(RESPONSE_PARSED_PROGRESS);

        var sStartTime = response.substr(iStartTime + model['parse_sst'].length, 2);
        var sDay = response.substr(iDay + model['parse_day'].length, 2);
        var sMonth = response.substr(iMonth + model['parse_month'].length, 2);
        var sYear = response.substr(iYear + model['parse_year'].length, 4);
        var sCol = prefs.getString("x"); //@todo
        var sRow = prefs.getString("y"); //@todo
        var sPlotLanguage = prefs.getString("plotLanguage");
        var sModel = prefs.getString("modelName");
        ga.reportPageview(['/model/', sModel].join(''));
        ga.reportPageview(['/lang/', sPlotLanguage].join(''));
        ga.reportPageview(['/coordinates/', sModel, '/col/', sCol, '/row/', sRow].join(''));
        var sStartData = [sYear, sMonth, sDay, sStartTime].join('');
        var sImageUrl = [BASE_URL,
            model['image_infix'],
            sStartData,
            '&row=', sRow,
            '&col=', sCol,
            '&lang=', sPlotLanguage].join('');
        // Fetch the image
        fetchImage(sImageUrl, sStartData, fetchImageManually);
    } else if (!responseParsed__MODULE_ID__) {
        // Mark we already parsed the response, so no other will set up the image
        responseParsed__MODULE_ID__ = true;
        clearTimeout(checkTimeout__MODULE_ID__);
        // Set progress bar
        setProgress(RESPONSE_PARSED_PROGRESS);

        log.warning("Cannot parse response");
        fetchImageManually();
    }
    log.trace("Exit parseResponse()");
}

function checkIfResponseParsed() {
    log.trace("Enter checkIfResponseParsed()");
    if (false == responseParsed__MODULE_ID__) {
        checkAttempt__MODULE_ID__++;
        if (false == responseParsed__MODULE_ID__) {
            setProgress(checkAttempt__MODULE_ID__);
            if (false == responseParsed__MODULE_ID__) {
                if (checkAttempt__MODULE_ID__ <= RESPONSE_PARSED_PROGRESS) {
                    // make another checking
                    if (false == responseParsed__MODULE_ID__) {
                        checkTimeout__MODULE_ID__ = setTimeout(checkIfResponseParsed, 1000);
                    }
                } else {
                    if (false == responseParsed__MODULE_ID__) {
                        responseParsed__MODULE_ID__ = true;
                        //@todo since error checking doesn't work
                        // fallback to last successfully loaded image
                        // rather than: fetchImageManually();
                        // should be fixed when fetchImage knows whether it donwloaded the image
                        fetchLastSavedImage();
                    }
                }
            }
        }
    }
    log.trace("Exit checkIfResponseParsed()");
}

function reload() {
    log.trace("Enter reload()");
    setInitPage();
    main();
    log.trace("Exit reload()");
}

function setInitPage() {
    log.trace("Enter setInitPage()");
    var mainDiv = document.getElementById("meteogram_div");
    removeAllChildren(mainDiv);
    var message = document.createElement("span");
    message.setAttribute("style", "font-size: 9pt");
    message.innerHTML = prefs.getMsg("loading_data");
    mainDiv.appendChild(message);
    var progressBar = document.createElement("div");
    progressBar.innerHTML = "<div class=\"progressOut\"><div id=\"progressIn\"></div></div>";
    mainDiv.appendChild(progressBar);
    log.trace("Exit setInitPage()");
}

function resetTimeoutParams() {
    log.trace("Enter resetTimeoutParams()");
    responseParsed__MODULE_ID__ = false;
    checkTimeout__MODULE_ID__ = undefined;
    checkAttempt__MODULE_ID__ = 0;
    log.trace("Exit resetTimeoutParams()");
}

function main() {
    log.trace("Enter main()");
    resetTimeoutParams();
    checkTimeout__MODULE_ID__ = setTimeout(checkIfResponseParsed, 1000);
    var sModel = prefs.getString("modelName");
    if (sModel == "COAMPS") {
        model = COAMPS;
    } else if (sModel == "UM") {
        model = UM;
    } else {
        log.error("Don't know model name: " + sModel);
        setErrorPage();
        return;
    }
    var params = {};
    params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.TEXT;
    //@todo wait for google fix params[gadgets.io.RequestParameters.REFRESH_INTERVAL] = PAGE_CACHE_TIME;
    var ts = new Date().getTime();
    var sep = '?';
    if (BASE_URL.indexOf('?') > -1
        || model['request_page'].indexOf('?') > -1) {
        sep = '&';
    }
    ts = Math.floor(ts / (PAGE_CACHE_TIME * 1000));
    var url = [BASE_URL, model['request_page'], sep, 'nocache=', ts].join('');
    log.trace("Use url = " + url);
    gadgets.io.makeRequest(url, parseResponse, params);
    log.trace("Exit main()");
}
gadgets.util.registerOnLoadHandler(main);
</script>
