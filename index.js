import express from 'express'

const app = express()
app.use('/', express.static('public'))
app.set("views","./views");
app.set("view engine", "ejs");

app.get('/', (req, res) => res.send('Töötab!!'))

const port = process.env.PORT || 8085

app.listen(port, () => console.log("Rakendus töötab ja kuulab pordil " + port))