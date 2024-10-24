import * as dynamodb from "@aws-sdk/client-dynamodb";
import * as ddb from "@aws-sdk/lib-dynamodb";
const docClient = new dynamodb.DynamoDBClient();
const ddbDocClient = ddb.DynamoDBDocumentClient.from(docClient, {
    marshallOptions: {
        removeUndefinedValues: true,
    },
});

const insert_dynamo = async (params) => {
    try {
        await ddbDocClient.send(new ddb.PutCommand({ ...params, removeUndefinedValues: true }));
        return "SUCCESS";
    }
    catch (err) {
        console.log(params, err);
        throw new Error(err);
    }
};

const query_dynamo = async (params) => {
    try {
        const results = await ddbDocClient.send(new ddb.QueryCommand(params));
        return results;
    }
    catch (err) {
        console.log(params);
        console.error(err);
    }
};

const query_all_dynamo = async params => {
    try {
        let data = { Items: [], Count: 0 };
        const query_dynamo = async table_params => {
            let table_data = await ddbDocClient.send(new ddb.QueryCommand(params));
            if (table_data.Count > 0 || table_data.LastEvaluatedKey != undefined) {

                data.Count += table_data.Count;
                data.Items = data.Items.concat(table_data.Items);

                if (table_data.LastEvaluatedKey != undefined || table_data.LastEvaluatedKey != null) {
                    table_params.ExclusiveStartKey = table_data.LastEvaluatedKey;
                    return await query_dynamo(table_params);
                }
                else {
                    return data;
                }
            }
            else {
                return data;
            }
        };
        return await query_dynamo(params);
    }
    catch (err) {
        console.log(params, err);
        throw new Error(err);
    }
};

const scan_dynamo = async (params) => {
    try {
        const results = await ddbDocClient.send(new ddb.ScanCommand(params));
        return results;
    }
    catch (err) {
        console.log(params);
        console.error(err);
    }
};

const update_dynamo = async (params) => {
    try {
        const results = await ddbDocClient.send(new ddb.UpdateCommand(params));
        return results;
    }
    catch (err) {
        console.log(params, err);
        throw new Error(err);
    }
};

const delete_dynamo = async (params) => {
    try {
        await ddbDocClient.send(new ddb.DeleteCommand(params));
        return "SUCCESS";
    }
    catch (err) {
        console.log(params, err);
        throw new Error(err);
    }
};

const check_login_otp = async (event) => {
    let getUserDetailsParams = {
        TableName: "Organization_Users",
        KeyConditionExpression: "user_email-user_number-index",
        ExpressionAttributeValues: {
            ":user_email": event.request.email
        }
    }
    let userDetails = await query_dynamo(getUserDetailsParams);
    if (userDetails.Count > 0) {

        const expectedAnswer = event.request.privateChallengeParameters.secretLoginCode;
        console.log(expectedAnswer, event.request.challengeAnswer);
        if (event.request.challengeAnswer === expectedAnswer) { // or  if (userDetails.Items[0].verifiy_otp == expectedAnswer)
            event.response.answerCorrect = true;
            return event;
        }
    }
}


export const handler = async (event) => {
    console.log("EVENT :", JSON.stringify(event));
    switch (event.triggerSource) {
        case "privateChallengeParameters":
            return await check_login_otp(event);
    }
    
    
    const response = {
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
};

const testing =async(event)=>{
    console.log("Testing this function from the sam deployment.");
    return success
}