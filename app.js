const telegram = require('telegram-bot-api')
const config = require('./config')
const queue = require('./queue')
const {Logging} = require('@google-cloud/logging')

const api = new telegram({
    token: config.token,
    updates: {
        enabled: true
    }
})

const logClient = new Logging('leafy-mountain-259708');
const log = logClient.log('ochered_bot.log');

const nodesIndex = {}

config.nodes.forEach(node => {
    node.alias.forEach(alias => nodesIndex[alias] = node)
})

api.on('message', (message) => {
    const chat_id = message.chat.id

    const text = message.text

    log.write(log.entry({
        resource: {type: 'global'}
    }, message)).catch(console.error);

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

                    if(node.camera) {
                        try {
                            api.sendPhoto({
                                chat_id: chat_id,
                                caption: replyText,
                                
                                photo: node.camera + '?rnd=' + Math.random()
                            })
                        } catch (error) {
                            api.sendMessage({
                                chat_id: chat_id, 
                                text: replyText
                            })
                        }
                    } else {
                        api.sendMessage({
                            chat_id: chat_id, 
                            text: replyText
                        })
                    }

                })
            } else {
                const replyText = 'Пункт пропуска не найден: ' + element

                console.log(replyText)

                api.sendMessage({
                    chat_id: chat_id, 
                    text: replyText
                })
            }

        } else if (element == '/info' || element == '/start'){
            var replyText = 'Информация об очередях на границе Республики Беларусь с сайта Государственного пограничного комитета Республики Беларусь https://gpk.gov.by\n\n'
            
            replyText += 'Для получения информации отправьте боту сообщение в виде "Пункт1 Пункт2 Пункт3", например:\nБрузги Берестовица Привалка\n\n'

            replyText += 'Список пунктов пропуска:\n'

            config.nodes.forEach(node => {
                replyText += node.name + ' (' + node.country + '), варианты [ '
                node.alias.forEach(alias => replyText += alias + ' ')
                replyText += ']' + '\n'
            })

            api.sendMessage({
                chat_id: chat_id, 
                text: replyText
            })
        }
    })
})