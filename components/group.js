const router = require('express').Router();
const { MessageMedia, Location } = require("whatsapp-web.js");
const request = require('request')
const vuri = require('valid-url');
const fs = require('fs');
const { cat } = require('shelljs');

const mediadownloader = (url, path, callback) => {
    request.head(url, (err, res, body) => {
      request(url)
        .pipe(fs.createWriteStream(path))
        .on('close', callback)
    })
  }
  
router.post('/sendmessage/:chatname', async (req, res) => {
    client.getState().then((data) => {
        try{
            let chatname = req.params.chatname;
            let message = req.body.message;

            if (chatname == undefined || message == undefined) {
                res.send({ status: "error", message: "please enter valid chatname and message" })
            } else {
                client.getChats().then((data) => {
                    let isGroupExist =  false;
                    data.forEach(chat => {
                        if (chat.id.server === "g.us" && chat.name === chatname) {
                            
                            client.sendMessage(chat.id._serialized, message).then((response) => {
                                if (response.id.fromMe) {
                                    res.send({ status: 'success', message: `Message successfully send to ${chatname}` })
                                }
                            });
                            isGroupExist = true;
                        }
                    });
                    if (isGroupExist === false){
                        res.send({ status: 'error', message: `group name not exist` })
                    }     
                });
            }
        }
        catch (err){
            res.send({ status:'error', message: err.message })
        }
    }).catch((err) => {
        if (err) {
            res.send({ status:'error', message: `Client DISCONNECTED, Please scan QR` })
            try {
                fs.unlinkSync("./session.json");
            } catch(err) {
                console.log(err)
            }
        }
    })
});

router.post('/sendmessage', async (req, res) => {
    client.getState().then((data) => {
        let chatname = req.body.name;
        let message = req.body.message;

        if (chatname == undefined || message == undefined) {
            res.send({ status: "error", message: "please enter valid chatname and message" })
        } else {
            client.getChats().then((data) => {
                data.forEach(chat => {
                    if (chat.id.server === "g.us" && chat.name === chatname) {
                        client.sendMessage(chat.id._serialized, message).then((response) => {
                            if (response.id.fromMe) {
                                res.send({ status: 'success', message: `Message successfully send to ${chatname}` })
                            }
                        });
                    }
                });     
            });
        }
    }).catch((err) => {
        if (err) {
            res.send({ status:'error', message: `Client DISCONNECTED, Please scan QR` })
            try {
                fs.unlinkSync("./session.json");
            } catch(err) {
                console.log(err)
            }
        }
    })
});

router.post('/sendimage/:chatname', async (req, res) => {
    client.getState().then((data) => {
        var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

        let chatname = req.params.chatname;
        let image = req.body.image;
        let caption = req.body.caption;

        if (chatname == undefined || image == undefined) {
            res.send({status:"error",message:"please enter valid chatname and base64/url of image"})
        } else {
            if (base64regex.test(image)) { 
                client.getChats().then((data) => {
                    data.forEach(chat => {
                        if (chat.id.server === "g.us" && chat.name === chatname) {
                            if (!fs.existsSync('./temp')) {
                                fs.mkdirSync('./temp');
                            }

                            let media = new MessageMedia('image/png', image);
                            client.sendMessage(chat.id._serialized, media, { caption: caption || "" }).then((response) => {
                                if (response.id.fromMe) {
                                    res.send({ status: 'success', message: `Message successfully send to ${chatname}` })
                                    fs.unlinkSync(path)
                                }
                            });
                        }
                    });     
                });
            } else if (vuri.isWebUri(image)) {
                var path = './temp/' + image.split("/").slice(-1)[0]
                client.getChats().then((data) => {
                    data.forEach(chat => {
                        if (chat.id.server === "g.us" && chat.name === chatname) {
                            mediadownloader(image, path, () => {
                                let media = MessageMedia.fromFilePath(path);
                                client.sendMessage(chat.id._serialized, media, { caption: caption || "" }).then((response)=>{
                                    if (response.id.fromMe) {
                                        res.send({ status: 'success', message: `Message successfully send to ${chatname}` })
                                        fs.unlinkSync(path)
                                    }
                                });
                            });
                            
                        }
                    });     
                });            
            } else {
                res.send({ status: 'error', message: 'Invalid URL/Base64 Encoded Media' })
            }
        }
    }).catch((err) => {
        if (err) {
            res.send({ status:'error', message: `Client DISCONNECTED, Please scan QR` })
            try {
                fs.unlinkSync("./session.json");
            } catch(err) {
                console.log(err)
            }
        }
    })
});

router.post('/sendpdf/:chatname', async (req, res) => {
    client.getState().then((data) => {
        var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

        let chatname = req.params.chatname;
        let pdf = req.body.pdf;

        if (chatname == undefined || pdf == undefined) {
            res.send({ status: "error", message: "please enter valid chatname and base64/url of pdf" })
        } else {
            if (base64regex.test(pdf)) {
                client.getChats().then((data) => {
                    data.some(chat => {
                        if (chat.id.server === "g.us" && chat.name === chatname) {
                            if (!fs.existsSync('./temp')) {
                                fs.mkdirSync('./temp');
                            }
                            let media = new MessageMedia('application/pdf', pdf);
                            client.sendMessage(chat.id._serialized, media).then((response) => {
                                if(response.id.fromMe){
                                    res.send({ status: 'success', message: `Message successfully send to ${chatname}` })
                                    fs.unlinkSync(path)
                                }
                            });
                            return true;
                        }
                    });     
                });
            } else if (vuri.isWebUri(pdf)) {
                var path = './temp/' + pdf.split("/").slice(-1)[0]
                client.getChats().then((data) => {
                    data.some(chat => {
                        if (chat.id.server === "g.us" && chat.name === chatname) {
                            mediadownloader(image, path, () => {
                                let media = MessageMedia.fromFilePath(path);
                                client.sendMessage(chat.id._serialized, media).then((response)=>{
                                    if (response.id.fromMe) {
                                        res.send({ status: 'success', message: `Message successfully send to ${chatname}` })
                                        fs.unlinkSync(path)
                                    }
                                });
                            });
                            return true;
                        }
                    });     
                });            
            } else {
                res.send({ status: 'error', message: 'Invalid URL/Base64 Encoded Media' })
            }
        }
    }).catch((err) => {
        if (err) {
            res.send({ status:'error', message: `Client DISCONNECTED, Please scan QR` })
            try {
                fs.unlinkSync("./session.json");
            } catch(err) {
                console.log(err)
            }
        }
    })
});

router.post('/sendlocation/:chatname', async (req, res) => {
    client.getState().then((data) => {
        let chatname = req.params.chatname;
        let latitude = req.body.latitude;
        let longitude = req.body.longitude;
        let desc = req.body.description;

        if (chatname == undefined || latitude == undefined || longitude == undefined) {
            res.send({ status: "error", message: "please enter valid phone, latitude and longitude" })
        } else {
            client.getChats().then((data) => {
                data.some(chat => {
                    if (chat.id.server === "g.us" && chat.name === chatname) {
                        let loc = new Location(latitude, longitude, desc || "");
                        client.sendMessage(chat.id._serialized, loc).then((response) => {
                            if (response.id.fromMe) {
                                res.send({ status: 'success', message: `Message successfully send to ${chatname}` })
                            }
                        });
                        return true;
                    }
                });     
            });
        }
    }).catch((err) => {
        if (err) {
            res.send({ status:'error', message: `Client DISCONNECTED, Please scan QR` })
            try {
                fs.unlinkSync("./session.json");
            } catch(err) {
                console.log(err)
            }
        }
    })
});

module.exports = router;
