const express  = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const crypto = require('crypto');
const port = process.env.PORT || 2137;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const pool = mysql.createPool({
    connectionLimit : 50,
    host: 'mysql50.mydevil.net',
    user:'m1124_boarApp',
    password:'xXDzik2Xx',
    database:'m1124_webApp'
});

app.post('/veriUsr',(req,res)=>{
    let phoneNumber = req.body.phoneNumber;
    pool.getConnection((err,connection)=>{
        if(err) 
        return res.send(err);
        connection.query("SELECT NrTel FROM `users` WHERE NrTel like '"+phoneNumber+"'",(err,rows) =>{
            connection.release();
            if(err)
            {
               return res.status(err);
            }
            console.log(rows)
                if(rows.length == 0)
                {
                    if(phoneNumber.length != 9)
                    {
                        return res.status(404).send("Niepoprawny numer telefonu");
                    }
                    let veriCode = '';
                    for(let x=0;x<5;x++)
                    {
                        veriCode += Math.floor(Math.random()*(9-0+1))+0;
                    }
                    pool.getConnection((err,connection) =>{
                        if(err)
                        return res.send(err);
                        connection.query("INSERT INTO `users`(`NrTel`,`KodWer`) VALUES ('"+phoneNumber+"','"+veriCode+"')",(err,rows)=>{
                            if(err)
                            res.send(err);
                            connection.release();
                    })

                    });
                   return res.send(veriCode);
                    
                    
                }else
               return res.status(404).send('Error: Taki telefon istnieje w bazie');
                });});
                    
});


app.post('/getHandshake',(req,res) =>{
    let recCode = req.body.veriCode;
    let phoneNumber = req.body.phoneNumber;
    let name = String(Math.floor(Math.random()*(99999-0+1))+0);
    let hash = crypto.createHash('md5').update(name).digest('hex');
    console.log(recCode,' | ',phoneNumber,' | ',hash);
    if(phoneNumber.length != 9)
    {
        return res.status(404).send("Niepoprawny numer telefonu");
    }
    pool.getConnection((err,connection) =>{
        if(err)
        return res.status(404).send(err);
        connection.query("SELECT NrTel,KodWer from users WHERE NrTel like '"+phoneNumber+"'",(err,rows)=>{
            connection.release();
            if(rows[0].KodWer == recCode && rows[0].NrTel == phoneNumber) {
                console.log('Dobry Kod i Tel');
                pool.getConnection((err,connection)=>{
                    if(err)
                    return res.status(404).send(err)
                    connection.query("UPDATE `users` SET `Handshake`='"+hash+"' WHERE NrTel like '"+phoneNumber+"'",(err,rows)=>{
                        connection.release();
                        if(err){
                            return res.status(404).send(err);
                        }
                        return res.send(hash);
                    });
                })
            }else
            return res.status(404).send('Error');


        })
    })
    
    
});


app.post('/reportSight',(req,res) =>{
    let phoneNumber = req.body.NrTel;
    let handshake = req.body.handshake;
    let DataZg = req.body.Date;
    let Latitude = req.body.Latutude;
    let Longitude = req.body.Longitude;
    let MaleZ = req.body.MaleZ;
    let DuzeZ = req.body.DuzeZ;
    let MaleM = req.body.MaleM;
    let DuzeM = req.body.DuzeM;
    let Wojewodztwo = req.body.Wojewodztwo;
    let Miejscowosc = req.body.Miejscowosc;
    let isAccepted = 0;
    console.log(req.body);

    pool.getConnection((err,connection)=>{
        if(err)
        {
            return res.send(err);
        }
        connection.query("SELECT UID,Handshake,NrTel FROM `users` WHERE NrTel like '"+phoneNumber+"'",(err,rows)=>{
            connection.release();
            console.log(rows);
            let UID = rows[0].UID;
            if(err)
            {
                return res.send(err);
            }else if(rows == 0)
            {
                return res.status(404).send("Brak numeru w bazie")
            }else if(rows[0].Handshake != handshake)
            {
                return res.status(404).send('Błędny handshake');
            }else{
                pool.getConnection((err,connection)=>{
                    if(err)
                    {
                        return res.send(err);
                    }
                    connection.query("INSERT INTO `reports`(`UID`, `Date`, `Latitude`, `Longitude`, `MaleZ`, `DuzeZ`, `MaleM`, `DuzeM`, `Wojewodztwo`, `Miejscowosc`, `isAccepted`) VALUES ("+UID+","+DataZg+","+Latitude+","+Longitude+","+MaleZ+","+DuzeZ+","+MaleM+","+DuzeM+","+Wojewodztwo+","+Miejscowosc+","+isAccepted+")",(err,connection)=>{
                        connection.release();
                        if(err)
                        {
                            return res.send(err)
                        }else
                        return res.send('Dodano rekord!');
                    })
                })
            }


        })
    })
    
})


app.get('/',(req,res) =>{
    return res.send('witam');
});
app.listen(port);