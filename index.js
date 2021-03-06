const express = require("express");
const Eos = require("eosjs");
const app = express();
const { config } = require("./config-dev");

eos = Eos(config.eos);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => res.send("Hello EOSIO chat"));
app.get("/signup/:nick/:activekey/:ownerkey", (req, res) => {
  const nick = req.params.nick;
  const activeKey = req.params.activekey;
  const ownerKey = req.params.ownerkey;
  console.log("req", req.params);
  let tr;
  eos
    .transaction(tr => {
      tr.newaccount({
        creator: config.chat.faucetName,
        name: nick,
        owner: ownerKey,
        active: {
          threshold: 1,
          keys: [
            {
              key: activeKey,
              weight: 1
            }
          ],
          accounts: [
            {
              permission: {
                actor: "eoschat.deal",
                permission: "eosio.code"
              },
              weight: 1
            }
          ]
        }
      });
      tr.transfer({
        from: config.chat.faucetName,
        to: nick,
        quantity: "1000 EOS",
        memo: "faucet giveaway"
      });
    })
    .then(result => {
      console.log("res", result);
      res.json({ ok: true });
    })
    .catch(err => {
      console.log("err", err);
      res.json({ ok: false });
    });
});

app.listen(3000, () =>
  console.log("EOS chat listening on http://localhost:3000/")
);
