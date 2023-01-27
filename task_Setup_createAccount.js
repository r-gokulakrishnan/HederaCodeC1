const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar } = require("@hashgraph/sdk");
require("dotenv").config();

async function createAccount(count) {

    const adminAccount = process.env.ADMIN_ACCOUNT;
    const adminKey = process.env.ADMIN_KEY;

    if (adminAccount == null ||
        adminKey == null) {
        throw new Error("Environment variables AdminAccount or/and AdminKey not present");
    }

    //establishing the connection to the network
    const client = Client.forTestnet();
    client.setOperator(adminAccount, adminKey);


    for (let i = 1; i <= count; i++) {
        const newAccountPrivateKey = PrivateKey.generateED25519();
        const newAccountPublicKey = newAccountPrivateKey.publicKey;
        console.log(`Private Key of Account ${i}: ${newAccountPrivateKey}`);
        console.log(`Public Key of Account ${i}: ${newAccountPublicKey}`);

        const newAccount = await new AccountCreateTransaction()
            .setKey(newAccountPublicKey)
            .setInitialBalance(new Hbar(100))
            .execute(client);

        const getReceipt = await newAccount.getReceipt(client);
        const newAccountId = getReceipt.accountId;
        console.log(`The ID of Account ${i} is: ${newAccountId}`);

        //Verify the account balance
        const accountBalance = await new AccountBalanceQuery()
            .setAccountId(newAccountId)
            .execute(client);

        console.log("The new account balance is: " + accountBalance.hbars.toTinybars() + " tinybar. \n");
    }


}
async function main() {
    await createAccount(5);
    process.exit();
}
main();