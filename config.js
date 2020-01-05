const dotenv = require('dotenv')
dotenv.config()

module.exports = {
    token: process.env.TELEGRAM_BOT_TOKEN,
    url: 'https://gpk.gov.by/situation-at-the-border/punkty-propuska/',
    nodes : [
        { id: 'bruzgi', name: 'Брузги', country: 'Польша', alias: ['bruzgi', 'брузги'] },
        { id: 'privalka', name: 'Привалка', country: 'Литва', alias: ['privalka', 'привалка'] },
        { id: 'berestovitsa', name: 'Берестовица', country: 'Польша', alias: ['berestovitsa', 'берестовица'] }
    ]
}