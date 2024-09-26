import * as dynamodb from "@aws-sdk/client-dynamodb";
import * as ddb from "@aws-sdk/lib-dynamodb";
const docClient = new dynamodb.DynamoDBClient();
const ddbDocClient = ddb.DynamoDBDocumentClient.from(docClient, {
    marshallOptions: {
        removeUndefinedValues: true,
    },
});

import { v4 as uuidv4 } from 'uuid';

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



const create_user = async (event) => {
    let createUserParams = {
        TableName: "Organization_Users",
        Item: {
            user_id: uuidv4(),
            user_name: event.user_name,
            user_number: event.user_number,
            user_email: event.user_email,
            user_type: "GUEST",
            user_status: "ACTIVE"
        }
    };
    let created = await insert_dynamo(createUserParams);
    if (created == "SUCCESS") {
        return { statu: "SUCCESS", statu_Message: "User has been created successfully..!" };
    }
}

export const lambdaHandler = async (event, context) => {
    console.log("UUIDS :", uuidv4())
    switch (event.command) {

        case "Create_User":
            return await create_user(event);

        case "createMultipleUsers":
            return await createMultipleUsers(event);

        case "listUsers":
            return await listUsers(event);
    }
};
