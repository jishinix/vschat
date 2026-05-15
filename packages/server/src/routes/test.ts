import { Express } from "express";

export const route = (app: Express) => {
    console.log('abc');
    console.log('get: /vsc/test')
    app.get('/vsc/test', (req, res) => {
        console.log(req, res);
        res.send('Hello World!')
    })
}