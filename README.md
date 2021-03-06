## How to run

### Install Geth:

(On Debian-based systems)

```
sudo apt-add-repository -y ppa:ethereum/ethereum
sudo apt-get update
sudo apt-get install ethereum
```

(On OS X)
```
brew tap ethereum/ethereum
brew install ethereum
```

### Install and run Meteor:

```
curl https://install.meteor.com/ | sh
```

`cd` into project directory and then run:

```
meteor npm install
meteor
```

Meteor server will start running on: [http://localhost:3000](http://localhost:3000)

Read [http://guide.meteor.com/](http://guide.meteor.com/) for more information

## You will also need to run your Ethereum private node locally!

### Create custom genesis block

Create the following directory to store your custom genesis block and chain data:

```
mkdir ~/eth
```

`cd` into the created directory `~/eth` and create CustomGenesis.json file with the following content (add in your Ethereum account address where specified - account created in next step):

```
{
    "nonce": "0x0000000000000042",
    "timestamp": "0x0",
    "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "extraData": "0x0",
    "gasLimit": "0x18181818181",
    "difficulty": "0x400",
    "mixhash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "coinbase": "0x3333333333333333333333333333333333333333",
    "alloc":
    {
        "insert ethereum account address here":
        { "balance": "50000000000000000000" }
    }
}
```

### Create Ethereum account

Create an Ethereum account:

```
geth --identity "PrivateNode4507" --genesis ~/eth/CustomGenesis.json --rpc --rpcport "8080" --rpccorsdomain "*" --datadir "~/eth/chain" --port "30303" --nodiscover --ipcapi "admin,db,eth,debug,miner,net,shh,txpool,personal,web3" --rpcapi "db,eth,net,web3" --autodag --networkid 1900 --nat "any" --verbosity 6 account new
```
Add account address to line specified in CustomGenesis.json file.

Start geth console by running this in a terminal:

```
geth --identity "PrivateNode4507" --genesis ~/eth/CustomGenesis.json --rpc --rpcport "8080" --rpccorsdomain "*" --datadir "~/eth/chain" --port "30303" --nodiscover --ipcapi "admin,db,eth,debug,miner,net,shh,txpool,personal,web3" --rpcapi "db,eth,net,web3" --autodag --networkid 1900 --nat "any" --verbosity 6 console
```

In a new tab/window attach to the existing geth console by running:

```
geth --identity "PrivateNode4507" --genesis ~/eth/CustomGenesis.json --rpc --rpcport "8080" --rpccorsdomain "*" --datadir "~/eth/chain" --port "30303" --nodiscover --ipcapi "admin,db,eth,debug,miner,net,shh,txpool,personal,web3" --rpcapi "db,eth,net,web3" --autodag --networkid 1900 --nat "any" --verbosity 0 attach
```

In the attached console, start miner by running:

```
miner.start()
```

Unlock your account/s by running the following (add in your Ethereum account password where specified):

```
personal.unlockAccount(eth.accounts[0], "insert ethereum account password here")
```
