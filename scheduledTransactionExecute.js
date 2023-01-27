const {
    ScheduleSignTransaction,
    Client,
    PrivateKey,
    AccountId,
    ScheduleInfoQuery
} = require("@hashgraph/sdk");
require('dotenv').config();

const adminAccount = process.env.ADMIN_ACCOUNT;
const adminKey = process.env.ADMIN_KEY;

const account1 = AccountId.fromString(process.env.ACCOUNT1);
const key1 = PrivateKey.fromString(process.env.KEY1);

const scheduleId = process.env.SCHEDULE_ID;

if (adminAccount == null ||
    adminKey == null || account1 == null || key1 == null ) {
    throw new Error("Environment variables missing");
}

const client = Client.forTestnet().setOperator(adminAccount, adminKey);


async function main() {

    const transaction = await new ScheduleSignTransaction()
        .setScheduleId(scheduleId)
        .freezeWith(client)
        .sign(key1);

    //Sign with the client operator key to pay for the transaction and submit to a Hedera network
    const txResponse = await transaction.execute(client);

    //Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction status
    const transactionStatus = receipt.status;
    console.log("The transaction consensus status is " +transactionStatus);

    process.exit();
}

main();
