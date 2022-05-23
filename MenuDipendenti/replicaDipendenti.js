var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
const { setPriority } = require('os');
var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var cache ={};
let port = 8091;
var dipendenti=[];
var id = 0;
var mos = 0;
let etichette = ["Id: ", "Nome: ", "Cognome: ", "Gender: ", "Luogo Di Nascita: ", "Data di nascita: ", "Codice Fiscale: ", "Ruolo Aziendale: ", "Stipendio: ","Titolo di Studio: "];
app.set('view engine', 'ejs');
/*Dichiarazione funzioni */
function caricaPaginaStatica(path){
    if(fs.existsSync(path)){
        if (cache[path]){
            return cache[path];
        }else{
            cache[path]=fs.readFileSync(path, {encoding : "utf-8"}); 
            return cache[path];
        }
    }else{
        return "";
    }
}
function validazioni(stringa,controllo){
    const paths=[
        /\d+/,                                                          //id
        /^[a-z ,.'-]+$/i,                                               //nome
        /^[a-z ,.'-]+$/i,                                               //cognome
        /[a-z]/i,                                                       //gender
        /^[a-z ,.'-]+$/i,                                               //luogo di nascita
        /(19|20)\d\d[-/.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])/,//data di nascita
        /[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]/i,                      //codice fiscale
        /^[a-z ,'-]+$/i,                                                //ruolo aziendale
        /\d+\.\d{2}/                                                    //stipendio
    ];
    
    let esito = false;
    if(controllo >=0 && controllo<paths.length){
        esito = paths[controllo].test(stringa);
    }
    return esito;
}
/* fine dichiarazione funzioni*/
app.get('/', urlencodedParser, function (req, res) {
    mos=0;
    var css = fs.readFileSync('css/style.css','utf8');
    res.render(path.join(__dirname,'ejs','stampaFinale.ejs'),{mos:mos, lista:dipendenti, etichette:etichette,css:css});
});
app.get('/formDipendenti',urlencodedParser,function(req, res){
    mos=0;
    let pagina=caricaPaginaStatica("html/formDipendenti.html");
    if(pagina.length!=0){
        res.send(pagina);
    }else{
        res.end("Error 404: page not found");
    }
})
app.post('/javaSc',urlencodedParser,function(req,res){
    mos=0;
    //Applichiamo le validazione sugli input dell' utente
    if(!validazioni(req.body.nome,1)||!validazioni(req.body.cognome,2)||!validazioni(req.body.sesso,3)||!validazioni(req.body.luogoDiNascita,4)||!validazioni(req.body.dataDiNascita,5)||!validazioni(req.body.codiceFiscale,6)||!validazioni(req.body.ruoloAziendale,7)||!validazioni(req.body.stipendio,8)||!validazioni(req.body.titoloDiStudio,7)){
        res.end("Error 500: internal error")
    }
    var css = fs.readFileSync('css/style.css','utf8');  
    var dipendente = "";
    dipendente = {
        idDip : id,
        nome: req.body.nome,
        cognome: req.body.cognome,
        sesso: req.body.sesso,
        luogoDiNascita: req.body.luogoDiNascita,
        dataDiNascita :req.body.dataDiNascita,
        codiceFiscale: req.body.codiceFiscale,
        ruoloAziendale: req.body.ruoloAziendale,
        stipendio: req.body.stipendio,
        titoloDiStudio: req.body.titoloDiStudio
    }
    //dipendente += id+","+req.body.nome+","+req.body.cognome+","+req.body.sesso+","+req.body.luogoDiNascita+","+req.body.dataDiNascita+","+req.body.codiceFiscale+","+req.body.ruoloAziendale+","+req.body.stipendio+","+req.body.titoloDiStudio;
    dipendenti.push(dipendente);
    console.log(dipendenti);
    res.render(path.join(__dirname,'ejs','stampaFinale.ejs'),{mos:mos, lista:dipendenti, etichette:etichette, css:css});
    //Dirname prende il path del command prompt e aggiunge stampaFinale.ejs (cosi non scrivo sempre tutto il path)
    //{lista:dipendenti, etichette:etichette, css:css} ci serve per usare le informazioni di questo file nella stampa eseguita in stampaFinale.ejs (quindi ce le portiamo dietro quando facciamo il render a stampaFinale.ejs)
    id++;
});

app.get('/cancella',urlencodedParser,function(req, res) {
    mos=0;
    var css = fs.readFileSync('css/style.css','utf8');
    let idUtenteCancellare = req.query.id;
    let idCancellazione = 0;
    for (let i = 0; i < dipendenti.length; i++) {
        campi = dipendenti[i].idDip;
        if (parseInt(campi) == idUtenteCancellare) {
            idCancellazione=i;
            //schedaDipendente(campi);
            break;
        }
    }
        dipendenti.splice(idCancellazione, 1);
        res.render(path.join(__dirname,'ejs','stampaFinale.ejs'),{mos:mos, lista:dipendenti, etichette:etichette,css:css}); 
});

app.get('/cancellaSicuro',urlencodedParser,function(req, res) {
    mos=0;
    var campi = "";
    var css = fs.readFileSync('css/style.css','utf8');
    let idUtenteCancellare = req.query.id;
    let idCancellazione = 0;
    for (let i = 0; i < dipendenti.length; i++) {
        campi = dipendenti[i].idDip;
        if (parseInt(campi) == idUtenteCancellare) {
            idCancellazione=i;
            //schedaDipendente(campi);
            break;
        }
    }
        dipendenti.splice(idCancellazione, 1);
        res.render(path.join(__dirname,'ejs','stampaFinale.ejs'),{lista:dipendenti, etichette:etichette,css:css, mos:mos}); 
});

app.get('/mostra',urlencodedParser,function(req, res) {
    var css = fs.readFileSync('css/style.css','utf8');
    mos=2;
    let idUtenteVisualizzare = req.query.id;
    let idVisualizza = 0;
    let dipendenteMostrare = [];
    for (let i = 0; i < dipendenti.length; i++) {
        campoId = dipendenti[i];
        if (parseInt(campoId.idDip) == idUtenteVisualizzare) {
            idVisualizza=i;
            //schedaDipendente(campi);
            break;
        }
    }
    dipendenteMostrare = dipendenti[idVisualizza];
    res.render(path.join(__dirname, 'ejs', 'stampaFinale.ejs'), {mos:mos, lista: dipendenteMostrare, css: css, etichette:etichette});    
});

app.get('/modifica', urlencodedParser, function (req, res) {
    var css = fs.readFileSync('css/style.css','utf8');
    let idModifica = req.query.id;
    var dipMostrato = [];
    let idDaModificare = 0;
    for (let i = 0; i < dipendenti.length; i++) {
        campoId = dipendenti[i].idDip;
        if (parseInt(campoId) == idModifica) {
            idDaModificare=i;
            //schedaDipendente(campi);
            break;
        }
    }
    dipMostrato = dipendenti[idDaModificare];
    mos=1;
    res.render(path.join(__dirname, 'ejs', 'stampaFinale.ejs'), {mos:mos, lista: dipMostrato, css: css, etichette:etichette});
})

app.post('/confermamodifica', urlencodedParser, function (req, res) {
    var css = fs.readFileSync('css/style.css','utf8');
    console.log(req.body.cognome);
    let idConfermaModifica = req.query.id;
    console.log(idConfermaModifica);
    let dipendenteModificato = {
        idDip : req.query.id,
        nome: req.body.nome,
        cognome: req.body.cognome,
        sesso: req.body.sesso,
        luogoDiNascita: req.body.luogoDiNascita,
        dataDiNascita :req.body.dataDiNascita,
        codiceFiscale: req.body.codiceFiscale,
        ruoloAziendale: req.body.ruoloAziendale,
        stipendio: req.body.stipendio,
        titoloDiStudio: req.body.titoloDiStudio
    }
    dipendenti[idConfermaModifica] = dipendenteModificato;
    mos=0;
    res.render(path.join(__dirname, 'ejs', 'stampaFinale.ejs'), {mos:mos, lista: dipendenti, css: css, etichette:etichette});
})


app.listen(port, function () {
    console.log('listening on port:'+port);
});


