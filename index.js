var express = require('express');
var ejs = require('ejs-locals')
var zlib = require('zlib');
var app = express();
var sessionsState = null;
app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/templates');
app.set('view engine', 'ejs');

app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/templates');
app.set('view engine', 'ejs');
var sazParser = require('saz-parser');


function filterFiles(data) {
    return data.filter(function (session) {
        switch (session.response.headers["Content-Type"]) {
            case "application/javascript":
            case "image/png":
            case "font/otf":
            case "font/ttf":
            case "image/x-icon":
            case "application/x-javascript":
            case "image/gif":
            case "image/jpeg": return false;
            default: return true;
        }
    });
}

app.get('/', function (req, res) {
    sazParser('./inputFolder/file.saz', function (err, sessions) {
        sessionsState = sessions;
        var data = [];
        Object.keys(sessions).forEach(function (k) {
            sessions[k].sessionNumber = k;
            data.push(sessions[k]);
        });
        data = filterFiles(data);
        res.render("index", { data: data });
    });
});

app.get('/page/:number', function (req, res) {
    Object.keys(sessionsState).forEach(function (k) {
        if (req.params.number == k) {
            res.render("page", {
                content: sessionsState[k].response.content,
                response: JSON.stringify({
                    headers: sessionsState[k].response.headers
                }),
                request: JSON.stringify({
                    method: sessionsState[k].request.method,
                    url: sessionsState[k].request.url,
                    headers: sessionsState[k].request.headers
                })
            });
        }
    });
});


app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});