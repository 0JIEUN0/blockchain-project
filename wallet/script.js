import { PROJECT_ID, PROJECT_SECREAT } from "../.env";

let web3;

window.onload = async () => {
    web3 = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${PROJECT_ID}`));
    createWallet();
    sendTransaction();
}

const getInfo = () => (
    {
        fromPrivateKey: $('#from-private-key').val(),
        fromAccount: $('#from-account').val(),
        toAccount: $('#to-account').val(),
        value: $('#value').val(),
        gasPrice: $('#gas-price').val(),           
    }
)

const createWallet = () => {
    $('#create-wallet').click(() => {
        console.log('click');
        console.log(web3.eth);
        let createdAccount = web3.eth.accounts.create();
        console.log(createdAccount);
        alert(`
            Wallet Successfully Created!
            Private Key: ${createdAccount.privateKey}
            account: ${createdAccount.address}
        `);
        // keystore 생성: web3.eth.accounts.encrypt("PRIVATE", "PASSWORD")
        // keystore 복구: web3.eth.accounts.encrypt("keystore content", "PASSWORD")
    })
}

const sendTransaction = () => {
    const gasLimit = 21000;
    const gWei = 9;
    $('#submit').click( async () => {
        const { fromPrivateKey, fromAccount, toAccount, value, gasPrice } = getInfo();
        let nonce = await web3.eth.getTransactionCount(fromAccount, "pending");

        let rawTx = {
            nonce: nonce,
            gas: web3.utils.toHex(gasLimit),
            gasPrice: web3.utils.toHex(gasPrice * (10 ** gWei)),
            from: fromAccount,
            to: toAccount,
            value: web3.utils.toHex(web3.utils.toWei(value, 'ether')),
            data: ''
        };
        let tx = new ethereumjs.Tx(rawTx);
        let pk = new ethereumjs.Buffer.Buffer(fromPrivateKey, 'hex');
        tx.sign(pk);
        
        let serializedTx = tx.serialize();

        web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'), (err, hash) => {
            alert(`https://ropsten.etherscan.io/tx/${hash}`)
            console.log(err, hash);
        })
    })
}