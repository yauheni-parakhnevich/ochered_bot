const telegram = require('telegram-bot-api')
const config = require('./config')
const queue = require('./queue')

const api = new telegram({
    token: config.token,
    updates: {
        enabled: true
    }
})

const nodesIndex = {}

config.nodes.forEach(node => {
    node.alias.forEach(alias => nodesIndex[alias] = node)
})

api.on('message', (message) => {
    const chat_id = message.chat.id

    const text = message.text
    const words = text.split(' ')

    words.forEach(element => {
        if(!element.startsWith('/')) {

            const reqId = element.toLowerCase();

            const node = nodesIndex[reqId]

            if (node) {
                queue(node.id, (error, response) => {
                    var replyText = '';
                    if(!error) {
                        replyText = 'По состоянию на ' + response.time + ' в пункте пропуска '
                        replyText +=  node.name + ' (' + node.country + ') ' + response.value + ' машин'
                        console.log(replyText)
                    } else {
                        replyText = 'Пункт пропуска '
                        replyText +=  node.name + ' (' + node.country + '): ' + error
                    }

                    api.sendMessage({
                        chat_id: chat_id, 
                        text: replyText
                    })

                })
            } else {
                const replyText = 'Пункт пропуска не найден: ' + element

                console.log(replyText)

                api.sendMessage({
                    chat_id: chat_id, 
                    text: replyText
                })
            }

        }
    })
})