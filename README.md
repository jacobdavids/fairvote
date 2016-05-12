## How to run

Install Meteor:

```
curl https://install.meteor.com/ | sh
```

cd into project directory and then run:

```
meteor npm install
meteor
```

Meteor server will start running on: http://localhost:3000/

Read http://guide.meteor.com/ for more information

## You will also need to run your ethereum private node locally!

Start geth console by running this in a terminal:

```
geth --identity "PrivateNode4507" --genesis ~/eth/CustomGenesis.json --rpc --rpcport "8080" --rpccorsdomain "*" --datadir "~/eth/chains" --port "30303" --nodiscover --ipcapi "admin,db,eth,debug,miner,net,shh,txpool,personal,web3" --rpcapi "db,eth,net,web3" --autodag --networkid 1900 --nat "any" --verbosity 6  console
```

In a new tab/window attach to the existing geth console by running:

```
geth --identity "PrivateNode4507" --genesis ~/eth/CustomGenesis.json --rpc --rpcport "8080" --rpccorsdomain "*" --datadir "~/eth/chains" --port "30303" --nodiscover --ipcapi "admin,db,eth,debug,miner,net,shh,txpool,personal,web3" --rpcapi "db,eth,net,web3" --autodag --networkid 1900 --nat "any" --verbosity 0 attach
```

In the attached console, start miner by running:

```
miner.start()
```

Unlock your account by running:

```
personal.unlockAccount(eth.accounts[0], "password")
```
