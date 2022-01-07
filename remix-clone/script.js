//import { PROJECT_ID } from "../.env";
const PROJECT_ID="e5e0c6620e4f491fb8b6c74d871e952b";

let web3;
let compilerVersion;
let compiler;

window.onload = async () => {
    web3 = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${PROJECT_ID}`));
    compilerVersion = await getVersion();
    compiler = await getCompiler(compilerVersion);
    deploy(compiler);
}

const getVersion = () => {
    return new Promise((resolve, reject) => {
        BrowserSolc.getVersions((allVersion, releaseVersion) => {
            resolve(releaseVersion['0.5.7']);
        })
    })
}

const getCompiler = async (version) => {
    return new Promise((resolve, reject) => {
        BrowserSolc.loadVersion(version, (compiler) => {
            resolve(compiler);
        })
    }) 
}

const getDeployInfo = () => (
    {
        code: $('#solidity').val(),
        privateKey: $('#private-key').val(),
        account: $('#account').val(),
        gasPrice: $('#gas-price').val(),
        gasLimit: $('#gas-limit').val(),
    }
)

const send = (data, privateKey, account, gasPrice, gasLimit) => {
    let gWei = 9;
    return new Promise(async (resolve, reject) => {
        let nonce = await web3.eth.getTransactionCount(account, "pending");

        let rawTx = {
            nonce: nonce,
            gas: web3.utils.toHex(gasLimit),
            gasPrice: web3.utils.toHex(gasPrice * (10 ** gWei)),
            data: data,
            from: account
        };

        let tx = new ethereumjs.Tx(rawTx);
        let pk = new ethereumjs.Buffer.Buffer(privateKey, 'hex');
        tx.sign(pk);
        
        let serializedTx = tx.serialize();

        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), (err, hash) => {
            alert(`https://ropsten.etherscan.io/tx/${hash}`)
            resolve(hash);
            console.log(err, hash);
        })
    })
}

const deploy = async (compiler) => {
    $('#submit').click(() => {
        let { code, privateKey, account, gasPrice, gasLimit } = getDeployInfo();

        try {
            let result = compiler.compile(code, 1);

            let contractName = Object.keys(result.contracts).map(contractName => contractName);
            contractName = contractName[0];
            let bytecode = result.contracts[contractName].bytecode;
            let abi = result.contracts[contractName].interface;
            let opcode = result.contracts[contractName].opcode;

            const contract = new web3.eth.Contract(JSON.parse(abi.toString()));
            
            let deploy = contract.deploy({
                data: `0x${bytecode}`,
                arguments: [1]
            }).encodeABI();
            send(deploy, privateKey, account, gasPrice, gasLimit);

        } catch (err) {
            console.log(err);
        }
    })
}
