
const {
    ContractCallQuery,
    ContractCreateFlow,
    ContractUpdateTransaction,
    Hbar,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    AccountId,
    PrivateKey,
    Client
} = require("@hashgraph/sdk");
require('dotenv').config();


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


 async function deployContract() {
    const contractJSON = require("./abi.json");
    const bytecode = contractJSON.bytecode;
    //const adminAccountID = process.env.OPERATOR_ID;

    const contractCreate = new ContractCreateFlow()
        .setGas(10000000)
        .setAutoRenewAccountId(adminAccount)
        .setAutoRenewPeriod(8000001)//~30 to 92 days   https://hips.hedera.com/hip/hip-372
        .setBytecode(bytecode);

    const txResponse = await contractCreate.execute(client);
    const receipt = await txResponse.getReceipt(client);

    let ContractId =receipt.contractId;

    console.log("The new contract ID is ", ContractId.toString());
    return ContractId;

}



 async function function1Call(Contract_Id) {
    const transaction = new ContractExecuteTransaction()
        .setContractId(Contract_Id)
        .setGas(10000000)
        .setFunction("function1", new ContractFunctionParameters()
            .addUint16(4)
            .addUint16(3))
           
    const txResponse = await transaction.execute(client);
  
    const receipt = await txResponse.getReceipt(client);
    
    const transactionStatus = receipt.status;

    console.log("The transaction of function1 consensus status is " + transactionStatus);
    console.log("Transaction Id:",txResponse.transactionId.toString());

    return txResponse.transactionId.toString();
}
async function function2Call(Contract_Id,function1Response) {
    const transaction = new ContractExecuteTransaction()
        .setContractId(Contract_Id)
        .setGas(10000000)
        .setFunction("function2", new ContractFunctionParameters()
            .addUint16(function1Response))
           
    const txResponse = await transaction.execute(client);
  
    const receipt = await txResponse.getReceipt(client);
    
    const transactionStatus = receipt.status;

    console.log("The transaction of function2 consensus status is " + transactionStatus);
    console.log("Transaction Id:",txResponse.transactionId.toString());
    return txResponse.transactionId.toString();
}

 async function functionResponse( ContractId) {
    const query = new ContractCallQuery()
    .setContractId(ContractId)
    .setGas(100000)
    .setFunction("function1")

//Sign with the client operator private key to pay for the query and submit the query to a Hedera network
const contractCallResult = await query.execute(client);


console.log(contractCallResult);
// Get the function value
const response = contractCallResult.getUint16(0);
console.log("contract message: " + response);
   
}

//contractcallfunction();

async function main(){
    let contracId = await deployContract();
    let function1Response = await function1Call(contracId);
    let function2Response = await function2Call(contracId,7);
    //await functionResponse(contracId);
    process.exit();
}
main();



