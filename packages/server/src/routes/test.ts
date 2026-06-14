import { Express } from "express";

export const route = (app: Express) => {
    app.get('/vsc/test', (req, res) => {
        res.send('Hello World!')
    })
}