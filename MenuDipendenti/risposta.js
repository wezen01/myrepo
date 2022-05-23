var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var dipendenti = [];
var cache = {};
var mos = 0;
var matricola = 0;
var client;
//ar objDipendenti = { "ID": 0, "Nome": "", "Cognome": "", "Sesso": "", "Datadinascita": "", "Luogodinascita": "", "Codicefiscale": "", "Ruoloaziendale": "", "Titolodistudio": "", "Stipendio": "" }
var etichette = ["Id: ", "Nome: ", "Cognome: ", "Gender: ", "Luogo Di Nascita: ", "Data di nascita: ", "Codice Fiscale: ", "Ruolo Aziendale: ", "Stipendio: ", "Titolo di Studio: "];
//var stringajson = "";
const { Client } = require('pg');
const { vary } = require('express/lib/response');

app.use(cors());

app.listen(8091, function () {
    console.log('listening on port 8091...');
});


function newClient() {
    client = new Client({
        host: "localhost",
        user: "postgres",
        password: "cMWvWtJ!YeoY%4Nef%#z8prqC",
        database: "dipendenti_new"
    });
}


app.get('/', urlencodedParser, function (req, res) {
    var css = fs.readFileSync('css/style.css', 'utf8');
    mos=0;
    newClient();
    client.connect(function (err) {
        if (err) {
            throw err;
        } else{
            console.log("Connessione riuscita");
        }
    });
    stringa = "SELECT * FROM step.dipendenti";
    
    client.query(stringa, (err, result) => {
        if (err) {
            throw err;
        } else {
            client.end();
            console.log("Connessione chiusa");
            res.render(path.join(__dirname, 'ejs', 'stampaFinale.ejs'), {mos:mos, lista: result.rows, etichette:etichette, css: css });
        }
    });
})


//INSERIMENTO
app.post('/javaSc', urlencodedParser, function (req, res) {
    mos=0;
    var css = fs.readFileSync('css/style.css', 'utf8');
    newClient();
    client.connect(function (err) {
        if (err) {
            throw err;
        } else{
            console.log("Connessione riuscita");
        }
    });
    const query = {
        text: "INSERT INTO step.dipendenti (matricola, cognome, nome, sesso, data_di_nascita, luogo_di_nascita, codice_fiscale, citta, provincia, cap, iban, data_assunzione, indirizzo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
        values: [req.body.matricola, req.body.cognome, req.body.nome, req.body.sesso, req.body.data_di_nascita, req.body.luogo_nascita, req.body.codicefiscale, req.body.citta, req.body.provincia, req.body.cap, req.body.iban, req.body.dataassunzione, req.body.indirizzo]
    }
    client.query(query).then(ris => {
        let stringa3 = "SELECT * FROM step.dipendenti";
        client.query(stringa3).then(ris => {
            console.log("Connessione chiusa");
            res.render(path.join(__dirname, 'ejs', 'stampaFinale.ejs'), {mos:mos,  etichette:etichette, lista: ris.rows, css: css });
            client.end();
        }).catch(err => {client.end();throw err;});
        console.log("Connessione chiusa");
    }).catch(err => {client.end();throw err;});

});
    //objDipendenti = { "Matricola": 0, "Cognome": "", "Nome": "", "Sesso": "", "Codicefiscale": "", "Citta": "", "Cap": "", "Provincia": "", "Iban": "", "Dataassunzione": "", "Datadinascita": "", "Luogodinascita": "", "Indirizzo": "" };


//STAMPA
app.get('/formDipendenti', urlencodedParser, function (req, res) {
    newClient();

    client.connect(function (err) {
        if (err) {
            throw err;
        }
        console.log("Connessione riuscita");
    });
    mos = 0;
    let pagina = caricaPaginaStatica("html/formDipendenti.html");
    if (pagina.length != 0) {
        res.send(pagina);
    } else {
        res.end("Error 404: page not found");
    }
    client.end();
})


//CANCELLA
app.get('/cancellaSicuro',urlencodedParser,function(req, res) {
    newClient();
    client.connect(function (err) {
        if (err) {
            throw err;
        }
        console.log("Connessione riuscita");
    });

    mos=0;
    var css = fs.readFileSync('css/style.css','utf8');
    let idUtenteCancellare = req.query.id;
    console.log(idUtenteCancellare);

    let stringa = "DELETE FROM step.dipendenti WHERE step.dipendenti.id = "+parseInt(idUtenteCancellare);

    client.query(stringa).then(ris => {
        let stringa2 = "SELECT * FROM step.dipendenti";
        client.query(stringa2).then(ris => {
            console.log("Connessione chiusa");
            res.render(path.join(__dirname, 'ejs', 'stampaFinale.ejs'), {mos:mos,  etichette:etichette, lista: ris.rows, css: css });
            client.end();
        }).catch(err => {client.end();throw err;});
        console.log("Connessione chiusa");
    }).catch(err => {client.end();throw err;});

});


//STAMPA UNO
app.get('/mostra',urlencodedParser,function(req, res) {
    newClient();
    client.connect(function (err) {
        if (err) {
            throw err;
        }
        console.log("Connessione riuscita");
    });
    var css = fs.readFileSync('css/style.css','utf8');
    
    mos=2;
    let idUtenteVisualizzare = req.query.id;


    stringa = "SELECT * FROM step.dipendenti WHERE step.dipendenti.id ="+parseInt(idUtenteVisualizzare);
    
    client.query(stringa, (err, result) => {
        if (err) {
            throw err;
        } else {
            client.end();
            console.log("Connessione chiusa");
            res.render(path.join(__dirname, 'ejs', 'stampaFinale.ejs'), {mos:mos, lista: result.rows, etichette:etichette, css: css });
        }
    });
})

//MODIFICA
app.get('/modifica', urlencodedParser, function (req, res) {

    newClient();
    client.connect(function (err) {
        if (err) {
            throw err;
        }
        console.log("Connessione riuscita");
    });

    var css = fs.readFileSync('css/style.css','utf8');
    let idUtenteModificare = req.query.id;
    console.log(idUtenteModificare);
    mos=1;

    let stringa5 = "SELECT * FROM step.dipendenti WHERE step.dipendenti.id = "+parseInt(idUtenteModificare);

    client.query(stringa5, (err, result) => {
        if (err) {
            throw err;
        } else {
            client.end();
            console.log("Connessione chiusa");
            res.render(path.join(__dirname, 'ejs', 'stampaFinale.ejs'), {mos:mos, lista: result.rows, etichette:etichette, css: css });
        }
    });
})

//CONFERMA LA MODIFICA
app.post('/confermamodifica', urlencodedParser, function (req, res) {
    mos=0;
    var css = fs.readFileSync('css/style.css', 'utf8');
    let idUtenteModificare = req.query.id;
    console.log(idUtenteModificare);
    newClient();
    client.connect(function (err) {
        if (err) {
            throw err;
        } else{
            console.log("Connessione riuscita");
        }
    });
    const query = {
        text: "UPDATE step.dipendenti SET  matricola=$1,cognome=$2,nome=$3,sesso=$4,codice_fiscale=$5,citta=$6,cap=$7,provincia=$8,iban=$9,data_assunzione=$10,data_di_nascita=$11,luogo_di_nascita=$12,indirizzo=$13 WHERE id = "+parseInt(idUtenteModificare),
        values: [req.body.matricola,req.body.cognome,req.body.nome, req.body.sesso,req.body.codice_fiscale, req.body.citta,req.body.cap,req.body.provincia,req.body.iban,req.body.data_assunzione, req.body.data_di_nascita,req.body.luogo_di_nascita,req.body.indirizzo]
        }

    client.query(query).then(ris6 => {
        let stringa3 = "SELECT * FROM step.dipendenti";
        client.query(stringa3).then(ris7 => {
            console.log("Connessione chiusa");
            res.render(path.join(__dirname, 'ejs', 'stampaFinale.ejs'), {mos:mos,  etichette:etichette, lista: ris7.rows, css: css });
            client.end();
        }).catch(err => {client.end();throw err;});
        console.log("Connessione chiusa");
    }).catch(err => {client.end();throw err;});
});



//FUNZIONE CARICA PAGINA
function caricaPaginaStatica(path) {
    if (fs.existsSync(path)) {
        if (cache[path]) {
            return cache[path];
        } else {
            cache[path] = fs.readFileSync(path, { encoding: "utf-8" });
            return cache[path];
        }
    } else {
        return "";
    }
}