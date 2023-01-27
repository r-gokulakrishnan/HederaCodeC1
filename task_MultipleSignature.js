const {
    AccountId,
    PrivateKey,
    Client,
    AccountCreateTransaction,
    TransferTransaction,
    AccountBalanceQuery,
    Hbar,
    KeyList
} = require("@hashgraph/sdk");
require("dotenv").config();

async function multipleSignatureWallet() {

    const adminAccount = process.env.ADMIN_ACCOUNT;
    const adminKey = process.env.ADMIN_KEY;


    const account1 = AccountId.fromString(process.env.ACCOUNT1);
    const key1 = PrivateKey.fromString(process.env.KEY1);
    const account2 = AccountId.fromString(process.env.ACCOUNT2);
    const key2 = PrivateKey.fromString(process.env.KEY2);
    const account3 = AccountId.fromString(process.env.ACCOUNT3);
    const key3 = PrivateKey.fromString(process.env.KEY3);
    const account4 = AccountId.fromString(process.env.ACCOUNT4);
    const key4 = PrivateKey.fromString(process.env.KEY4);
    const account5 = AccountId.fromString(process.env.ACCOUNT5);
    const key5 = PrivateKey.fromString(process.env.KEY5);

    if (adminAccount == null ||
        adminKey == null || account1 == null || key1 == null || account2 == null || key2 == null || account3 == null || key3 == null || account4 == null || key4 == null || account5 == null || key5 == null) {
        throw new Error("Environment variables missing");
    }
    const client = Client.forTestnet().setOperator(adminAccount, adminKey);


    const keyList = [key1.publicKey, key2.publicKey, key3.publicKey];

    // Create our threshold key
    const thresholdKey = new KeyList(keyList, 2);
    console.log("- The 2/3 threshold key structure", thresholdKey.toString());



    const newAccount = await new AccountCreateTransaction()
        .setKey(thresholdKey)
        .setInitialBalance(new Hbar(20))
        .execute(client);

    const getReceipt = await newAccount.getReceipt(client);
    const newAccountId = getReceipt.accountId;
    console.log(`- The ID of Account is: ${newAccountId}`);

    //Verify the account balance
    const accountBalance = await new AccountBalanceQuery()
        .setAccountId(newAccountId)
        .execute(client);

    console.log("- The new account balance is: " + accountBalance.hbars + " hBar. \n");


    let transferHbar = await new TransferTransaction()
        .addHbarTransfer(newAccountId, new Hbar(-10)) //Sending account
        .addHbarTransfer(account4, new Hbar(10)) //Receiving account
        .freezeWith(client)
        .sign(key1);
    let transferHbarExecute = await transferHbar.execute(client);

    console.log("- Invalid Signature transactionId: ", transferHbarExecute.transactionId.toString(),"\n");


    transferHbar = await new TransferTransaction()
        .addHbarTransfer(newAccountId, new Hbar(-10)) //Sending account
        .addHbarTransfer(account4, new Hbar(10)) //Receiving account
        .freezeWith(client)
        .sign(key1);
    await transferHbar.sign(key2);
    transferHbarExecute = await transferHbar.execute(client);

    console.log("- Transfer transaction Id: ", transferHbarExecute.transactionId.toString(),"\n");



}
async function main() {
    await multipleSignatureWallet();
    process.exit();
}
main();