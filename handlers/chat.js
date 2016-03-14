var ChatDb = require('../models/message').Message;
var mongoose = require('mongoose');

module.exports = function () {

    this.getMessages = function (req, res, next) {
        console.log('i get messages!');
        //finding all messages for chat
        ChatDb.find({}, function (err, chats) {
            if (err) {
                return next(err);
            }

            res.status(200).send(chats);
        });
    };

    this.sendMessage = function (req, res, next) {
        console.log('i sent message!');
        var message = ChatDb(req.body);

        message.save(function (err, doc) {
            if (err) {
                return next(err);
            }

            res.status(200).send(doc);
        });
    };

    this.delMessage = function (req, res, next) {
        console.log('i delete message!');
        var id = req.params.id;

        function delChatMessage() {
            ChatDb.findByIdAndRemove(id, function (err, delMess) {
                if (err) {
                    return next(err);
                }

                res.status(200).send(delMess);
            });
        }

        ChatDb.findById(id, function (err, mess) {
            if (err) {
                return next(err);
            }
            console.log(req.session.user.username);

            if (req.session.user.username !== 'admin') {
                if (req.session.user.userId !== mess.sender.senderId){
                    res.status(401).send();
                } else {
                    delChatMessage();
                }
            } else {
                delChatMessage();
            }


        });
    };
};


