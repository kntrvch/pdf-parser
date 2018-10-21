const path = require('path');
const rootPath = path.normalize(__dirname);
const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const pdf = require('pdf-parse');
const tm = require('text-miner');
const formidable = require('formidable');
const _ = require('underscore');
const Researcher = require( "yoastseo" ).Researcher;
const Paper = require( "yoastseo" ).Paper;

app.set('views', rootPath + '/views');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {

    res.render('index', { 
        freq: null, 
        metadata: null, 
        pages: null
    });
});

app.post('/', function (req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req);

    form.on('fileBegin', function (name, file) {
        file.path = __dirname + '/uploads/' + file.name;
    });

    form.on('file', function (name, file) {
        console.log('Uploaded ' + file.name);

        let dataBuffer = fs.readFileSync('uploads/' + file.name);
        var result;

        pdf(dataBuffer).then(function (data) {

            // number of pages
            //console.log(data.numpages);
            // number of rendered pages
            //console.log(data.numrender);
            // PDF info
            //console.log(data.info);
            // PDF metadata
            //console.log(data.metadata);
            // PDF.js version
            // check https://mozilla.github.io/pdf.js/getting_started/
            //console.log(data.version);
            // PDF text
            //console.log(data.text);

            var corpus = new tm.Corpus([]);

            corpus.addDoc(data.text);
            corpus.trim();
            corpus.clean();
            //corpus.removeInterpunctuation();
            //corpus.removeDigits();
            corpus.removeInvalidCharacters();
            corpus.stem();

            var terms = new tm.DocumentTermMatrix(corpus);

            var sortedTerms = _.sortBy(terms.findFreqTerms(1), function(o) { return o.count; });

            sortedTerms = _.filter(sortedTerms, function(term) { return term.word != ''; });

            var finalText = corpus.documents[0].text.replace(/<(?:.|\n)*?>/gm, '');
            console.log('text: ', finalText);
            var researcher = new Researcher( new Paper(finalText) );
            var fleschIndex = researcher.getResearch("calculateFleschReading");
            console.log('flesch: ', fleschIndex);

            result = { 
                filename: file.name,
                freq: sortedTerms.reverse(), 
                info: data.info, 
                pages: data.numrender, 
                chart:sortedTerms.slice(0, 10), 
                flesch: fleschIndex
            };

            

        }).then(function() {
            
res.json(result);
        }).catch(function (error) {
            // handle exceptions
            console.log(error);
        });
    });

});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))