
var chatURL = "Controllers/chatController.php";
var xmlHttpGetMessages = createXmlHttpRequestObject();
var updateInterval = 1000;
var debugMode = true;
var cache = new Array();
var lastMessageID = -1;
function createXmlHttpRequestObject()
{
    var xmlHttp;
    try
    {
        xmlHttp = new XMLHttpRequest();
    }
    catch (e)
    {
        var XmlHttpVersions = new Array("MSXML2.XMLHTTP.6.0",
            "MSXML2.XMLHTTP.5.0",
            "MSXML2.XMLHTTP.4.0",
            "MSXML2.XMLHTTP.3.0",
            "MSXML2.XMLHTTP",
            "Microsoft.XMLHTTP");
        for (var i = 0; i < XmlHttpVersions.length && !xmlHttp; i++)
        {
            try
            {
                xmlHttp = new ActiveXObject(XmlHttpVersions[i]);
            }
            catch (e) {
            }
        }
    }
    if (!xmlHttp)
        alert("Error creating the XMLHttpRequest object.");
    else
        return xmlHttp;
}
function init()
{
    var oMessageBox = document.getElementById("messageBox");
    oMessageBox.setAttribute("autocomplete", "off");
    checkUsername();
    requestNewMessages();
}
function checkUsername()
{
    var oUser = document.getElementById("userName");
    if (oUser.value == "")
        oUser.value = "Guest" + Math.floor(Math.random() * 1000);
}
function sendMessage()
{
    var oCurrentMessage = document.getElementById("messageBox");
    var currentUser = document.getElementById("userName").value;
    if (trim(oCurrentMessage.value) != "" && trim(currentUser) != "")
    {
        params = "mode=SendAndRetrieveNew" +
            "&id=" + encodeURIComponent(lastMessageID) +
            "&name=" + encodeURIComponent(currentUser) +
            "&message=" + encodeURIComponent(oCurrentMessage.value);
        cache.push(params);
        oCurrentMessage.value = "";
    }
}
function deleteMessages()
{
    params = "mode=DeleteAndRetrieveNew";
    cache.push(params);
}
function requestNewMessages()
{
    var currentUser = document.getElementById("userName").value;
    if (xmlHttpGetMessages)
    {
        try
        {
            if (xmlHttpGetMessages.readyState == 4 ||
                xmlHttpGetMessages.readyState == 0)
            {
                var params = "";
                if (cache.length > 0)
                    params = cache.shift();
                else
                    params = "mode=RetrieveNew" +
                        "&id=" + lastMessageID;
                xmlHttpGetMessages.open("POST", chatURL, true);
                xmlHttpGetMessages.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                xmlHttpGetMessages.onreadystatechange = handleReceivingMessages;
                xmlHttpGetMessages.send(params);
            }
            else
            {
                setTimeout("requestNewMessages();", updateInterval);
            }
        }
        catch (e)
        {
            displayError(e.toString());
        }
    }
}
function handleReceivingMessages()
{
    if (xmlHttpGetMessages.readyState == 4)
    {
        if (xmlHttpGetMessages.status == 200)
        {
            try
            {
                readMessages();
            }
            catch (e)
            {
                displayError(e.toString());
            }
        }
        else
        {
            displayError(xmlHttpGetMessages.statusText);
        }
    }
}
function readMessages()
{

    var response = xmlHttpGetMessages.responseText;

    if (response.indexOf("ERRNO") >= 0
        || response.indexOf("error:") >= 0
        || response.length == 0)
        throw(response.length == 0 ? "Void server response." : response);

    response = xmlHttpGetMessages.responseXML.documentElement;
    clearChat = response.getElementsByTagName("clear").item(0).firstChild.data;
    if (clearChat == "true")
    {
        document.getElementById("scroll").innerHTML = "";
        lastMessageID = -1;
    }
    idArray = response.getElementsByTagName("id");
    nameArray = response.getElementsByTagName("name");
    timeArray = response.getElementsByTagName("time");
    messageArray = response.getElementsByTagName("message");
    displayMessages(idArray,nameArray, timeArray, messageArray);
    if (idArray.length > 0)
        lastMessageID = idArray.item(idArray.length - 1).firstChild.data;
    setTimeout("requestNewMessages();", updateInterval);
}
function displayMessages(idArray,nameArray,
                         timeArray, messageArray)
{
    for (var i = 0; i < idArray.length; i++)
    {
        var time = timeArray.item(i).firstChild.data.toString();
        var name = nameArray.item(i).firstChild.data.toString();
        var message = messageArray.item(i).firstChild.data.toString();
        var htmlMessage = "";
        htmlMessage += "<div class=\"item\">";
        htmlMessage += "[" + time + "] " + name + " dit : <br/>";
        htmlMessage += message.toString();
        htmlMessage += "</div>";
        displayMessage(htmlMessage);
    }
}

function displayMessage(message)
{

    var oScroll = document.getElementById("scroll");

    var scrollDown = (oScroll.scrollHeight - oScroll.scrollTop <=
    oScroll.offsetHeight);

    oScroll.innerHTML += message;
    oScroll.scrollTop = scrollDown ? oScroll.scrollHeight : oScroll.scrollTop;
}

function displayError(message)
{
    displayMessage("Error accessing the server! " +
        (debugMode ? "<br/>" + message : ""));
}
function handleKey(e)
{

    e = (!e) ? window.event : e;
    code = (e.charCode) ? e.charCode :
        ((e.keyCode) ? e.keyCode :
            ((e.which) ? e.which : 0));
    if (e.type == "keydown")
    {
        if (code == 13)
        {
            sendMessage();
        }
    }
}
function trim(s)
{
    return s.replace(/(^\s+)|(\s+$)/g, "")
}