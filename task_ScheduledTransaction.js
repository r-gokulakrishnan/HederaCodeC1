const {
    TransferTransaction,
    Client,
    ScheduleCreateTransaction,
    PrivateKey,
    Hbar,
    AccountId
} = require("@hashgraph/sdk");
require('dotenv').config();

const adminAccount = process.env.ADMIN_ACCOUNT;
const adminKey = process.env.ADMIN_KEY;

const account1 = AccountId.fromString(process.env.ACCOUNT1);
const key1 = PrivateKey.fromString(process.env.KEY1);
const account2 = AccountId.fromString(process.env.ACCOUNT2);
const key2 = PrivateKey.fromString(process.env.KEY2);

if (adminAccount == null ||
    adminKey == null || account1 == null || key1 == null || account2 == null || key2 == null) {
    throw new Error("Environment variables missing");
}
const client = Client.forTestnet().setOperator(adminAccount, adminKey);



async function createScheduledTransaction() {

    //Create a transaction to schedule
    const transaction = new TransferTransaction()
        .addHbarTransfer(account1, new Hbar(-10))
        .addHbarTransfer(account2, new Hbar(10));

    //Schedule a transaction
    const transactionObj = new ScheduleCreateTransaction()
        .setScheduledTransaction(transaction)
        .setScheduleMemo("Hedera_Cert Scheduled Key!")
        .setAdminKey(PrivateKey.fromString(adminKey))
        .freezeWith(client);

    const transactionObjToBytes = transactionObj.toBytes();
    const transactionObjEncoded =  Buffer.from(transactionObjToBytes).toString('base64');  
    console.log("- Hbar Transaction Encoding : SUCCESS")
    return transactionObjEncoded;
}

async function decodeExecuteTransaction(encodedTransactionObject) {

    const transactionObjDecoded = Buffer.from(encodedTransactionObject, 'base64');
    const transactionObj = ScheduleCreateTransaction.fromBytes(transactionObjDecoded);        
    const signedTransactionObject = await transactionObj.sign(PrivateKey.fromString(adminKey))

    const transactionExecute = await signedTransactionObject.execute(client);        
    const transactionReceipt = await transactionExecute.getReceipt(client);        
    console.log(`- Transaction of Id ${transactionExecute.transactionId.toString()} status: ${transactionReceipt.status}`);

    //Get the schedule ID
    const scheduledTransactionId = transactionReceipt.scheduleId;
    console.log("- The Scheduled transaction Id is: " +scheduledTransactionId.toString());
    
}

async function main() {
    let encodedTransactionObject = await createScheduledTransaction();
    await decodeExecuteTransaction(encodedTransactionObject);
    process.exit();
}

main();