/** Globals */
var FOR_READING = 1;
var FOR_WRITING = 2;
var DEFAULT_FORMAT = -2;
var fs = WScript.CreateObject('Scripting.FileSystemObject');
var wsh = WScript.CreateObject('WScript.Shell');
var APP_DIR = fs.GetParentFolderName(WScript.ScriptFullName) + "\\data";
var CONFIG_PATH = APP_DIR + '\\config.json';
/** --- */

function readAllTextFrom(path) {
    var file = fs.OpenTextFile(path, FOR_READING, false, DEFAULT_FORMAT);
    var contents = file.ReadAll();
    file.Close();
    return contents;
}

function readFirstLineFrom(path) {
    var file = fs.OpenTextFile(path, FOR_READING, false, DEFAULT_FORMAT);
    var contents = file.ReadLine();
    file.Close();
    return contents;
}

function countLines(path) {
    var file = fs.OpenTextFile(path, FOR_READING, false, DEFAULT_FORMAT);
    var count = 0;
    while (!file.AtEndOfStream) {
        file.ReadLine();
        count += 1;
    }
    file.Close();
    return count;
}

function writeToFile(path, content) {
    var file = fs.OpenTextFile(path, FOR_WRITING, true, DEFAULT_FORMAT);
    file.Write(content);
    file.Close();
}

function confirmConfig(prompt, config, configKey) {
    WScript.StdOut.Write("\n" + prompt + ((config[configKey] ? ' (Press enter to keep ' + toJson(config[configKey]) + ')' : '')) + ': ');
    var input = WScript.StdIn.ReadLine();
    if (input.length > 0) {
        config[configKey] = input;
    }
}

function confirmConfigWithOptions(prompt, config, configKey, options) {
    var lastValue = config[configKey];
    if (lastValue && indexOf(options, lastValue) >= 0) {
        WScript.StdOut.Write('\nKeep ' + prompt.toLowerCase() + ' as ' + lastValue + '? (Y/n): ');
        var keepLast = WScript.StdIn.ReadLine();
        if (keepLast == '' || keepLast.toLowerCase() == 'y') {
            return;
        }
    }

    WScript.StdOut.WriteLine('\nPlease choose ' + prompt.toLowerCase() + ' from options below.')
    for (var i = 0; i < options.length; i++) {
        WScript.StdOut.WriteLine('\t' + (i+1) + '. ' + options[i]);
    }
    var optionNumber = NaN;
    while (isNaN(optionNumber)) {
        WScript.StdOut.Write('Your choice: ');
        optionNumber = parseInt(WScript.StdIn.ReadLine(), 10);
    }
    config[configKey] = options[optionNumber - 1];
}

function indexOf(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == value) return i;
    }
    return -1;
}

function getUpdatedConfig(csvPath) {
    var config = {};

    if (fs.FileExists(CONFIG_PATH)) {
        config = fromJson(readAllTextFrom(CONFIG_PATH));
    }

    confirmConfig('Intended recipient', config, 'recipient');
    confirmConfig('Report results to which email?', config, 'contactEmail');
    config.errorsEmail = config.contactEmail;
    config.receiptsEmail = config.contactEmail;

    var columns = readFirstLineFrom(csvPath).split(',');
    confirmConfigWithOptions('Identity column', config, 'identityColumn', columns);


    
    writeToFile(CONFIG_PATH, toJson(config));
    return config;
}

function fromJson(json) {
    var result = {};
    result = eval('result = ' + json + ';');
    return result;
}

function toJson(value) {
    switch (typeof value) {
        case 'string':
            return '"' + value.replace('"', '\\"') + '"';
        case 'number':
            return value + '';
        case 'object':
            if (value instanceof Date) {
                return '"' + value.toISOString() + '"';
            } else if (value instanceof Array) {
                return toJsonArray(value);
            } else {
                return toJsonObject(value);
            }
    }
}

function toJsonObject(obj) {
    var result = '{';
    var separator = '';
    for (var k in obj) {
        result += separator + '"' + k + '": ' + toJson(obj[k]);
        separator = ',';
    }
    result += '}';
    return result;
}

function toJsonArray(arr) {
    var result = '[';
    var separator = '';
    for (var i = 1; i < arr.length; i++) {
        result += separator + toJson(arr[i]);
    }
    result += ']';
    return result;
}

function getHash(path) {
    var certOutputFile = APP_DIR + '\\certUtil.output';
    var cmd = 'cmd /c "certUtil -hashfile ' + path + ' SHA256 > ' + certOutputFile + '"';
    WScript.Echo(cmd);
    wsh.Run(cmd, 0, true);
    var certOutput = readAllTextFrom(certOutputFile);
    fs.DeleteFile(certOutputFile);
    return certOutput.split('\r\n')[1];
}

function getCurrentDateTime() {
    var date = new Date();
    return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

function createManifestFile(path, config) {
    var fileHash = getHash(path);
    var lineCount = countLines(path);
    var header = [];
    var values = [];
    header[0] = 'CreationTime';
    values[0] = getCurrentDateTime();

    header[1] = 'FileName';
    values[1] = path.split('\\').pop();

    header[2] = 'FileHash';
    values[2] = fileHash;

    header[3] = 'RowCount';
    values[3] = lineCount - 1;

    header[4] = 'Delimiter';
    values[4] = '","';

    header[5] = 'IdentityCol';
    values[5] = config['identityColumn'];

    header[6] = 'ContactEmail';
    values[6] = config['contactEmail'];

    header[7] = 'ErrorEmails';
    values[7] = config['errorsEmail'];

    header[8] = 'ReceiptEmails';
    values[8] = config['receiptsEmail'];

    manifestPath = path.replace(/\.csv$/, '.manifest');
    writeToFile(manifestPath, header.join(',') + '\r\n' + values.join(','));
    WScript.StdOut.WriteLine('Manifest file created at ' + manifestPath);
}

function encryptFile(csvPath, config) {
    var cmd = APP_DIR + "\\gpg4usb\\bin\\gpg.exe --homedir " + APP_DIR + "\\gpghome -s -e -r " + config.recipient + " -o " + csvPath+".encrypted " + csvPath;
    WScript.StdOut.WriteLine(cmd);
    wsh.Run(cmd, 0, true);
}

function main(args) {
    var csvPath = args[0];
    WScript.StdOut.WriteLine('Handling ' + csvPath);
    var config = getUpdatedConfig(csvPath);
    createManifestFile(csvPath, config);
    encryptFile(csvPath, config);
    WScript.StdIn.ReadLine();
}

main((function getArgs() {
    var args = [];
    for (var i = 0; i < WScript.Arguments.length; i++) {
        args[i] = WScript.Arguments(i);
    }
    return args;
})());
