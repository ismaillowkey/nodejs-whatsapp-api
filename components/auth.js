const router = require('express').Router();
const fs = require('fs');
const QRCode = require('qrcode');

router.get('/checkauth', async (req, res) => {
    client.getState().then((data) => {
        console.log(data)
        res.send({ status: "success", message: data })
    }).catch((err) => {
        if (err) {
            res.send({ status: "error", message: "DISCONNECTED" })
            try {
                fs.unlinkSync("./session.json");
            } catch(err) {
                console.log(err)
            }
        }
    })
});

router.post('/logout', async (req, res) => {
    try {
        console.log("client disconnected");
        fs.unlinkSync("./session.json");
        client.destroy();
        client.initialize();
    } catch(err) {
        console.log(err)
    }
    res.send({ status:'success', message: `Client DISCONNECTED, Please scan QR` })
});

router.get('/getqr', (req,res) => {
    var qrjs = fs.readFileSync('components/qrcode.js');

    fs.readFile('components/last.qr', (err,last_qr) => {
        fs.readFile('session.json', (serr, sessiondata) => {
            if (err && sessiondata) {
                res.write("<html><body><h2>Already Authenticated</h2></body></html>");
                res.end();
            } else if (!err && serr) {
                var page = `
                    <html>
                        <body>
                            <script>${qrjs}</script>
                            <div id="qrcode"></div>
                            <script type="text/javascript">
                                new QRCode(document.getElementById("qrcode"), "${last_qr}");
                            </script>
                        </body>
                    </html>
                `
                res.write(page)
                res.end();
            }
        })
    });
});

router.get('/login', (req,res) => {
    var qrjs = fs.readFileSync('components/qrcode.js');

    fs.readFile('components/last.qr', (err,last_qr) => {
        fs.readFile('session.json', (serr, sessiondata) => {
            if (err && sessiondata) {
                res.send({status:"success",message:"Already Authenticated"});
            } else if (!err && serr) {
                console.log(last_qr.toString());

                QRCode.toDataURL(last_qr.toString())
                    .then(url => {
                        console.log(url)
                        res.send(url)
                    })
                    .catch(err => {
                        console.error(err)
                        res.send(err)
                    })
            }
        })
    });
});


module.exports = router;