const request = require('request')
const cherio = require('cheerio')
const config = require('./config')

const queue = (node, callback) => {
    const url = config.url + node + '/'

    request({url: url}, (error, response, body) => {
        if(error) {
            callback("Ошибка подключения к сервису")
        } else {
            try {
                const $ = cherio.load(body)

                const time = $('div .queuesTime').text().trim()
                const value = $('table.queuesTable tbody tr:first-child td:nth-child(2)').text().trim()
    
                callback(undefined, {
                    time: time, 
                    value: value,
                    node: node
                })                
            } catch (error) {
                callback("Ошибка обработки ответа сервиса")
            }
        }
    })
}

module.exports = queue