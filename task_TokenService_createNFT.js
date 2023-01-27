const {
    AccountId,
    PrivateKey,
    Client,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenMintTransaction,
    TransferTransaction,
    TokenAssociateTransaction,
    CustomRoyaltyFee,
    CustomFixedFee,
    Hbar,
} = require("@hashgraph/sdk");

require("dotenv").config();

const adminAccount = process.env.ADMIN_ACCOUNT;
const adminKey = process.env.ADMIN_KEY;

const account1 = AccountId.fromString(process.env.ACCOUNT1);
const key1 = PrivateKey.fromString(process.env.KEY1);
const account2 = AccountId.fromString(process.env.ACCOUNT2);
const key2 = PrivateKey.fromString(process.env.KEY2);
const account3 = AccountId.fromString(process.env.ACCOUNT3);
const key3 = PrivateKey.fromString(process.env.KEY3);

if (adminAccount == null ||
    adminKey == null || account1 == null || key1 == null || account2 == null || key2 == null || account3 == null || key3 == null) {
    throw new Error("Environment variables missing");
}
const client = Client.forTestnet().setOperator(adminAccount, adminKey);

const supplyKey = PrivateKey.generate();

async function createNFT() {

    let nftCustomFee = new CustomRoyaltyFee()
        .setNumerator(10)
        .setDenominator(100)
        .setFeeCollectorAccountId(account2)
        .setAllCollectorsAreExempt(true)
        .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(200)));


    let tokenCreateTransaction = new TokenCreateTransaction()
        .setTokenName("Accubits_Hedera")
        .setTokenSymbol("AH")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(account1)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(5)
        .setCustomFees([nftCustomFee])
        .setMaxTransactionFee(new Hbar(50))
        .setAdminKey(PrivateKey.fromString(adminKey).publicKey)
        .setSupplyKey(supplyKey)
        .freezeWith(client);

    let nftCreateTxSign = await tokenCreateTransaction.sign(key1);
    let nftCreateSubmit = await nftCreateTxSign.execute(client);
    let nftCreateRx = await nftCreateSubmit.getReceipt(client);
    let tokenId = nftCreateRx.tokenId;
    console.log(`- Created token Id: ${tokenId.toString()}\n`)
    return tokenId;
}

async function mintNFTS(tokenId) {
    let CID = "NFTx"

    //let CID=["NFTx","NFTx","NFTx","NFTx","NFTx"];

    for (let i = 0; i < 5; i++) {
        let tokenMintTransaction = await new TokenMintTransaction()
            .setTokenId(tokenId)
            .setMetadata([Buffer.from(CID)])
            .freezeWith(client);
        let mintTxSigning = await tokenMintTransaction.sign(supplyKey);
        let mintTxExecute = await mintTxSigning.execute(client);
        let mintReceipt = await mintTxExecute.getReceipt(client);
        console.log(`- Serial Id ${mintReceipt.serials[0].low} Status:${mintReceipt.status.toString()}\n`);
    }

    let tokenAssociate = await new TokenAssociateTransaction()
        .setAccountId(account3)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(key3);
    let tokenAssociateTxExecute = await tokenAssociate.execute(client);
    let tokenAssociateTxReceipt = await tokenAssociateTxExecute.getReceipt(client);
    console.log(`- Token association with ${account3}'s : ${tokenAssociateTxReceipt.status} \n`);

    let tokenTransferTx = await new TransferTransaction()
        .addNftTransfer(tokenId, 2, account1, account3)
        .freezeWith(client)
        .sign(key1);
    let tokenTransferTxExecute = await tokenTransferTx.execute(client);
    let tokenTransferReceipt = await tokenTransferTxExecute.getReceipt(client);
    console.log(`- Transfer of Serial Id 2 to ${account3}: ${tokenTransferReceipt.status}`)


}

async function main() {
    let tokenId = await createNFT();
    await mintNFTS(tokenId);
    process.exit();
}

main();