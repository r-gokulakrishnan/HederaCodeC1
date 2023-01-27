const {
    TopicMessageSubmitTransaction,
    TopicCreateTransaction,
    PrivateKey,
    Client,
    TopicMessageQuery,
    AccountId
} = require("@hashgraph/sdk");
require('dotenv').config();

const adminAccount = process.env.ADMIN_ACCOUNT;
    const adminKey = process.env.ADMIN_KEY;


    const account1 = AccountId.fromString(process.env.ACCOUNT1);
    const key1 = PrivateKey.fromString(process.env.KEY1);

    if (adminAccount == null ||
        adminKey == null || account1 == null || key1 == null ) {
        throw new Error("Environment variables missing");
    }
    const client = Client.forTestnet().setOperator(adminAccount, adminKey);

async function submitConsensusMessage() {
    const createTopic = await new TopicCreateTransaction()
    .setSubmitKey(key1)
    .setAdminKey(PrivateKey.fromString(adminKey))
    .freezeWith(client)
    .execute(client);
    

    const transactionReceipt = await createTopic.getReceipt(client);

    let  topic_Id = transactionReceipt.topicId;
    console.log(`- Topic ID ${topic_Id}`)

    const submitMessageToConsensus =  new TopicMessageSubmitTransaction({
        topicId: topic_Id,
        message: `Current Time:${new Date()}`,
    }).freezeWith(client);


    await submitMessageToConsensus.sign(key1);
    const transactionExecute = await submitMessageToConsensus.execute(client);

    const submitMessagetransactionReceipt = await transactionExecute.getReceipt(client);
    console.log(`- Message Submit Transaction status is ${submitMessagetransactionReceipt.status}`);

     // Wait 5 seconds between consensus topic creation and subscription
     await new Promise((resolve) => setTimeout(resolve, 5000));

    new TopicMessageQuery()
    .setTopicId(topic_Id)
    .setStartTime(0)
    .subscribe(
        client,
        (message) => console.log(Buffer.from(message.contents, "utf8").toString())
    );

    process.exit();
}

submitConsensusMessage();