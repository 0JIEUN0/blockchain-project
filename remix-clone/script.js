import { PROJECT_ID } from "../.env";

let web3;
let compierVersion;
let compiler;

window.onload = async () => {
    web3 = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/${PROJECT_ID}`));
    compierVersion = await getVersion();
    compiler = await getCompiler(compierVersion);
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
