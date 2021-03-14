(async () => {

    const express = require('express');
    const bodyParser = require('body-parser');
    const qrcode = require('qrcode-terminal');
    //const NubankApi = require('nubank-api').default;
    const NubankApi = require('../lib/index').default; // Fazer referência ao código fonte da lib para testes
    const fs = require('fs');

    let nubankCache = {};

    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());

    app.get('/login', (re, res) => {

        const page = fs.readFileSync('./src/index.html', 'utf-8');        
        res.send(page);
    });

    app.post('/login', async (req, res) => {

        const api = new NubankApi();

        api.login(req.body.cpf, req.body.password, async (code) => {
            res.send({ code });             
            await deplay(1000);
            console.log('done'); // Criar break point aqui. Quando parar aqui: Ler QRCODE depois pressionar continue
        })
            .then(async loginData => { 
                nubankCache[req.body.cpf] = loginData;
                
                const bills = await api.getBills({ getFutureBillsDetails: true, billsAfterDueDate: new Date(2021, 01, 01) });
                console.log({bills });
            })
            .catch(error => console.log('error: ', error));
    });

    app.get('/qrcode-ok/:cpf', (req, res) => {

        res.send(nubankCache[req.params.cpf] ? { status: 'OK' }  : { status: 'None' });
    }); 

    const deplay = (time) => {

        return new Promise((res) => {

            setTimeout(() => res(), time);
        });
    }

    app.listen(5001, ()  => console.log('listing in port 5001'));
})();