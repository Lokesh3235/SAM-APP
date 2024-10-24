import * as dynamodb from "@aws-sdk/client-dynamodb";
import ddb from "@aws-sdk/lib-dynamodb";
import { v4 as uuid } from "uuid";

const docClient = new dynamodb.DynamoDBClient();
const ddbDocClient = ddb.DynamoDBDocumentClient.from(docClient, {
    marshallOptions: {
        removeUndefinedValues: true,
    },
});

import { AdminCreateUserCommand, AdminDeleteUserCommand, AdminDisableUserCommand, AdminEnableUserCommand, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider"; // ES Modules import
const cognitoClient = new CognitoIdentityProviderClient();

import { CreateBucketCommand, DeleteBucketCommand, DeleteObjectsCommand, ListObjectsV2Command, PutBucketVersioningCommand, PutObjectCommand, S3Client, } from "@aws-sdk/client-s3";

// const bucketParams = async (params) => {
//     let paramsBucket = {
//         accessKeyId: event.project_secret_key,
//         secretAccessKey: event.project_access_key,
//         region: event.project_region_name
//     }

// }
let client = new S3Client();

//==================DYNAMODB COMMANDS ===============//

const query_dynamo_items = async (params) => {
    try {
        let command = new ddb.QueryCommand(params);
        const data = await ddbDocClient.send(command);
        return data;
    }
    catch (err) {
        console.log(params, err);
        throw new Error(err);
    }
};

const scan_dynamo_items = async (params) => {
    try {
        let command = new ddb.ScanCommand(params);
        const data = await ddbDocClient.send(command);
        return data;
    }
    catch (err) {
        console.log(params, err);
        throw new Error(err);
    }
};

const insert_dynamo_item = async (params) => {
    try {
        let command = new ddb.PutCommand(params);
        await ddbDocClient.send(command);
        return "Success";
    }
    catch (err) {
        console.log(params, err);
        throw new Error(err);
    }
};

const update_dynamo_item = async (params) => {
    try {
        let command = new ddb.UpdateCommand(params);
        await ddbDocClient.send(command);
        return "Success";
    }
    catch (err) {
        console.log(params, err);
        throw new Error(err);
    }
};

const delete_dynamo_item = async (params) => {
    try {
        let command = new ddb.DeleteCommand(params);
        await ddbDocClient.send(command);
        return "Success";
    }
    catch (err) {
        console.log(params, err);
        throw new Error(err);
    }
};


//================== COGNITO COMMANDS ===============//

const create_cognito = async (params) => {
    console.log("Params", params);
    try {
        const command = new AdminCreateUserCommand(params);
        await cognitoClient.send(command);
    }
    catch (err) {
        console.log(err);
        return 'Erorr';
    }
};

const delete_cognito = async (params) => {
    try {
        const command = new AdminDeleteUserCommand(params);
        await cognitoClient.send(command);
    }
    catch (err) {
        console.log(err);
        return 'Erorr';
    }
};

const disable_cognitoUser = async (params) => {
    //console.log("email_Id",event);
    const command = new AdminDisableUserCommand(params);
    try {
        await cognitoClient.send(command);
    }
    catch (err) {
        console.log("The Error is:", err);
        throw new Error(err);
    }
};

const enable_cognitoUser = async (params) => {
    console.log("EnableCognitoUserParams", params);
    const command = new AdminEnableUserCommand(params);
    try {
        await cognitoClient.send(command);
    }
    catch (err) {
        console.log("The Error is:", err);
        throw new Error(err);
    }
};


//==================S3-BUCKET COMMANDS ===============//

const create_S3_bucket = async (params) => {
    try {
        const {
            Location
        } = await client.send(new CreateBucketCommand(params));
        console.log(`Bucket created with location ${Location}`);
    }
    catch (err) {
        console.log(err);
        return 'Erorr';
    }
};

const putobject_S3_bucket = async (params) => {
    try {
        const {
            Location
        } = await client.send(new PutObjectCommand(params));
        console.log(`Folder created with location ${Location}`);
    }
    catch (err) {
        console.log(err);
        return 'Erorr';
    }
};

const list_folder_s3_bucket = async (params) => {
    try {

        const data = await client.send(new ListObjectsV2Command(params));
        return data;
        //console.log(`Folder created with location ${Location}`);
    }
    catch (err) {
        console.log(err);
        return 'Erorr';
    }
};

const delete_s3_folder = async (params) => {
    try {
        const result = await client.send(new DeleteObjectsCommand(params));
        return result;
    }
    catch (err) {
        console.log(err);
        return 'Error';

    }
};

// const delete_S3_bucket = async (params) => {
//     try {
//         const {
//             Location
//         } = await client.send(new DeleteBucketCommand(params));
//         console.log(`Bucket created with location ${Location}`);
//     }
//     catch (err) {
//         console.log(err);
//         return 'Erorr';
//     }
// };


const create_bucket_for_project = async (event) => {
    const client2 = new S3Client({
        credentials: {
            secretAccessKey: event.project_secret_key,
            accessKeyId: event.project_access_key,
        },
        region: event.project_region_name,
    });

    let projectBucketParams = {
        Bucket: event.project_bucket_name,
    };
    const Versioningparams = {
        Bucket: event.project_bucket_name,
        VersioningConfiguration: {
            Status: 'Enabled',
        }
    };

    try {
        await client2.send(new CreateBucketCommand(projectBucketParams));
        await client2.send(new PutBucketVersioningCommand(Versioningparams));
        return 'SUCCESS';
    }
    catch (err) {
        // console.log(err);
        return JSON.parse(JSON.stringify(err));
    }
};

const create_s3bucket_project_folder = async (event, projectDetails) => {
    console.log("In s3...... :", projectDetails);
    const client2 = new S3Client({
        credentials: {
            secretAccessKey: projectDetails.Items[0].project_secret_key,
            accessKeyId: projectDetails.Items[0].project_access_key,
        },
        region: projectDetails.Items[0].project_region_name,
    });

    let projectBucketFolderParams = {
        Bucket: projectDetails.Items[0].project_bucket_name,
        Key: event.folderName,
    };
    try {
        await client2.send(new PutObjectCommand(projectBucketFolderParams));
        return 'SUCCESS';
    }
    catch (err) {
        // console.log(err);
        return JSON.parse(JSON.stringify(err));
    }
};

const list_bucket_folders = async (projectDetails) => {
    const client2 = new S3Client({
        credentials: {
            secretAccessKey: projectDetails.Items[0].project_secret_key,
            accessKeyId: projectDetails.Items[0].project_access_key,
        },
        region: projectDetails.Items[0].project_region_name,
    });

    let listProjectBucketFoldersParams = {
        Bucket: projectDetails.Items[0].project_bucket_name,
        Delimiter: '/',
    };

    try {
        const listOfFolders = await client2.send(new ListObjectsV2Command(listProjectBucketFoldersParams));
        return listOfFolders;
    }
    catch (err) {
        // console.log(err);
        return JSON.parse(JSON.stringify(err));
    }
};

const delete_S3_project_bucket = async (projectDetails) => {
    const client2 = new S3Client({
        credentials: {
            secretAccessKey: projectDetails.Items[0].project_secret_key,
            accessKeyId: projectDetails.Items[0].project_access_key,
        },
        region: projectDetails.Items[0].project_region_name,
    });

    let deleteProjectBucketParams = {
        Bucket: projectDetails.Items[0].project_bucket_name,
    };

    try {
        await client2.send(new DeleteBucketCommand(deleteProjectBucketParams));
        return "SUCCESS";
    }
    catch (err) {
        // console.log(err);
        return JSON.parse(JSON.stringify(err));
    }
};



//================== ADMIN MANAGEMENT ===============//

const create_admin = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let admin = await query_dynamo_items(checkAdminParams);
    if (admin.Count > 0) {
        let checkIfUserExistParams = {
            TableName: "prodev_admins",
            KeyConditionExpression: "user_email_id = :user_email_id",
            ExpressionAttributeValues: {
                ":user_email_id": event.user_email_id,
            },
        };
        let user = await query_dynamo_items(checkIfUserExistParams);
        if (user.Count == 0) {
            let CreateUserParams = {
                TableName: "prodev_admins",
                Item: {
                    user_email_id: event.user_email_id.toLowerCase(),
                    user_name: event.user_name,
                    user_status: "ACTIVE",
                    user_created_on: new Date().getTime(),
                },
                ConditionExpression: "attribute_not_exists(user_email_id)",
                ReturnValues: "ALL_OLD",
            };

            let CreateDeveloperParams = {
                TableName: "prodev_developers",
                Item: {
                    developer_id: uuid(),
                    developer_email_id: event.user_email_id.toLowerCase(),
                    developer_name: event.user_name,
                    // developer_phone_no: event.developer_phone_no,
                    developer_status: "ACTIVE",
                    developer_created_on: new Date().getTime(),
                    developer_projects: [],
                    no_of_projects: 0,
                    module_type: "ADMIN",
                },
                ConditionExpression: "attribute_not_exists(developer_email_id)",
                ReturnValues: "ALL_OLD",
            };
            await insert_dynamo_item(CreateUserParams);
            await insert_dynamo_item(CreateDeveloperParams);
            const cognitoparams1 = {
                UserPoolId: "ap-south-1_2XGZBpeP7",
                Username: event.user_email_id,
                UserAttributes: [{
                    Name: "email",
                    Value: event.user_email_id,
                }, ],
                TemporaryPassword: "Admin@1234",
            };
            const cognitoparams2 = {
                UserPoolId: "ap-south-1_FXkGFyTqW",
                Username: event.user_email_id,
                UserAttributes: [{
                    Name: "email",
                    Value: event.user_email_id,
                }, ],
                TemporaryPassword: "Admin@1234",
            };
            await create_cognito(cognitoparams1);
            await create_cognito(cognitoparams2);
            return {
                status: "Success",
                status_message: "Admin created and email invite sent!!",
            };
        }
        else {
            throw new Error("User Already Exists");
        }
    }
    else {
        throw new Error(" Admin not found");
    }

};

const list_admins = async (event) => {
    let listAdminsParams = {
        TableName: "prodev_admins",
    };
    let admins = await scan_dynamo_items(listAdminsParams);
    if (admins.Count > 0) {

        return {
            status: "Success",
            data: admins.Items
        };
    }
    else {
        throw new Error("No Admins to list");
    }
};

const update_admin = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let updateparams = {
            TableName: "prodev_admins",
            Key: {
                user_email_id: event.user_email_id,
            },
            UpdateExpression: "SET user_name = :user_name", //user_status = :user_status",
            ExpressionAttributeValues: {
                ":user_name": event.user_name,
                //":user_status": event.user_status,
            },
        };
        await update_dynamo_item(updateparams);
        return {
            status: "Success",
            status_message: "Admin updated successfully..!!",
        };
    }
    else {
        throw new Error("No user Found..!");
    }
};

const delete_admin = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let checkAdminExistsParams = {
            TableName: "prodev_admins",
            KeyConditionExpression: "user_email_id = :user_email_id",
            ExpressionAttributeValues: {
                ":user_email_id": event.user_email_id,
            },
        };
        let adminDetails = await query_dynamo_items(checkAdminExistsParams);
        console.log("adminDetails", adminDetails);
        if (adminDetails.Count > 0) {
            let deleteAdminParams = {
                TableName: "prodev_admins",
                Key: {
                    user_email_id: event.user_email_id,
                },
            };
            await delete_dynamo_item(deleteAdminParams);

            let checkIfDeveloperExistParams = {
                TableName: "prodev_developers",
                IndexName: "developer_email_id-index",
                KeyConditionExpression: "developer_email_id = :developer_email_id",
                FilterExpression: "developer_status = :developer_status",
                ExpressionAttributeValues: {
                    ":developer_email_id": event.user_email_id,
                    ":developer_status": "ACTIVE"
                },
            };
            let developer = await query_dynamo_items(checkIfDeveloperExistParams);
            if (developer.Count > 0) {
                let deleteDeveloperParams = {
                    TableName: "prodev_developers",
                    Key: {
                        developer_id: developer.Items[0].developer_id,
                    },
                };
                await delete_dynamo_item(deleteDeveloperParams);
                let cognitoAdminDeleteParams = {
                    UserPoolId: "ap-south-1_2XGZBpeP7",
                    Username: event.user_email_id,
                };
                let cognitoDevDeleteParams = {
                    UserPoolId: "ap-south-1_FXkGFyTqW",
                    Username: event.user_email_id,
                };
                await delete_cognito(cognitoAdminDeleteParams);
                await delete_cognito(cognitoDevDeleteParams);
                return {
                    status: "Success",
                    status_message: "Admin  deleted successfully!!",
                };
            }
            else {
                throw new Error("Developer Already Exists");
            }
        }
        else {
            throw new Error(`Admin with ID ${event.user_email_id} Not Found!!`);
        }
    }
    else {
        throw new Error("No user Found..!");
    }
};


//================== ROLE MANAGEMENT ===============//

const create_role = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let admin = await query_dynamo_items(checkAdminParams);
    if (admin.Count > 0) {
        let checkIfRoleExistsParams = {
            TableName: 'prodev_roles',
            IndexName: 'role_internal_name-index',
            KeyConditionExpression: '#role_internal_name = :role_internal_name',
            ExpressionAttributeNames: { '#role_internal_name': 'role_internal_name' },
            ExpressionAttributeValues: { ':role_internal_name': event.role_name.split(' ').join('').toUpperCase() },
        };
        let role = await query_dynamo_items(checkIfRoleExistsParams);
        if (role.Items.length == 0) {
            let newRoleParams = {
                Item: {
                    role_id: uuid(),
                    role_status: 'ACTIVE',
                    role_internal_name: event.role_name.split(' ').join('').toUpperCase(),
                    role_created_on: new Date().toISOString(),
                    role_name: event.role_name,
                    role_description: event.role_description,
                    accessing_module: event.accessing_module,
                },
                TableName: 'prodev_roles',
                ConditionExpression: 'attribute_not_exists(role_id)',
                ReturnValues: 'ALL_OLD',
            };
            await insert_dynamo_item(newRoleParams);
            return {
                status: 'Success',
                Status_Message: 'Role Created Successfully!!'
            };
        }
        else {
            throw new Error("Role With Name: " + event.role_name + " Already Exists");
        }
    }
    else {
        throw new Error(" Admin not found");
    }
};

const list_role = async (event) => {
    let listRolesParams = {
        TableName: "prodev_roles",
    };
    let roles = await scan_dynamo_items(listRolesParams);
    if (roles.Count > 0) {

        return {
            status: "Success",
            data: roles.Items
        };
    }
    else {
        throw new Error("No Role to list");
    }
};

const update_role = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let checkIfRoleExistsParams = {
            TableName: 'prodev_roles',
            KeyConditionExpression: '#role_id = :role_id',
            ExpressionAttributeNames: { '#role_id': 'role_id' },
            ExpressionAttributeValues: { ':role_id': event.role_id },
        };
        let role = await query_dynamo_items(checkIfRoleExistsParams);
        if (role.Items.length > 0) {
            let UpdateExpression = 'set';
            let ExpressionAttributeNames = {};
            let ExpressionAttributeValues = {};
            for (const field in event) {
                if (field == "role_description" || field == "role_status" || field == "accessing_module") {
                    UpdateExpression += ` #${field} = :${field} ,`;
                    ExpressionAttributeNames['#' + field] = field;
                    ExpressionAttributeValues[':' + field] = event[field];
                }
                if (field == "role_name" && event.role_name.split(' ').join('').toUpperCase() != role.Items[0].role_internal_name) {
                    let checkIfRoleExistsParams = {
                        TableName: 'prodev_roles',
                        IndexName: 'role_internal_name-index',
                        KeyConditionExpression: '#role_internal_name = :role_internal_name',
                        ExpressionAttributeNames: { '#role_internal_name': 'role_internal_name' },
                        ExpressionAttributeValues: { ':role_internal_name': event.role_name.split(' ').join('').toUpperCase() },
                    };
                    let role = await query_dynamo_items(checkIfRoleExistsParams);
                    if (role.Items.length == 0) {
                        UpdateExpression += ` #${field} = :${field},#role_internal_name = :role_internal_name,`;
                        ExpressionAttributeNames['#role_internal_name'] = 'role_internal_name';
                        ExpressionAttributeValues[':role_internal_name'] = event.role_name.split(' ').join('').toUpperCase();
                        ExpressionAttributeNames['#' + field] = field;
                        ExpressionAttributeValues[':' + field] = event[field];
                    }
                    else {
                        throw new Error("Role With Name " + event.role_name + " Already Exists!!");
                    }
                }
            }
            if (UpdateExpression != 'set') {
                UpdateExpression = UpdateExpression.slice(0, -1);
                let updateRoleParams = {
                    TableName: "prodev_roles",
                    Key: {
                        role_id: event.role_id
                    },
                    UpdateExpression: UpdateExpression,
                    ExpressionAttributeNames: ExpressionAttributeNames,
                    ExpressionAttributeValues: ExpressionAttributeValues,
                    ReturnValues: "UPDATED_NEW"
                };
                await update_dynamo_item(updateRoleParams);
                return {
                    "status": "Success",
                    "Status_Message": "Updated Roles Successfully!!"
                };
            }
            else {
                throw new Error("Nothing To Update!!!");
            }
        }
        else {
            throw new Error("No role Found..!");
        }
    }
    else {
        throw new Error("No user Found..!");
    }
};

const delete_role = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let checkIfRoleExistsParams = {
            TableName: 'prodev_roles',
            //IndexName: 'role_internal_name-index',
            KeyConditionExpression: '#role_id = :role_id',
            ExpressionAttributeNames: { '#role_id': 'role_id' },
            ExpressionAttributeValues: { ':role_id': event.role_id },
        };
        let role = await query_dynamo_items(checkIfRoleExistsParams);
        if (role.Items.length > 0) {
            let deleteRoleParams = {
                TableName: "prodev_roles",
                Key: {
                    role_id: event.role_id,
                },
            };
            await delete_dynamo_item(deleteRoleParams);
            return {
                status: "Success",
                status_message: "Role  deleted successfully!!",
            };
        }
        else {
            throw new Error(`Role with ID ${event.role_id} Not Found!!`);
        }
    }
    else {
        throw new Error("No Role Found..!");
    }
};

//================== MODULE MANAGEMENT ===============//
const create_module = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let admin = await query_dynamo_items(checkAdminParams);
    if (admin.Count > 0) {
        let checkIfModuleExistsParams = {
            TableName: 'prodev_modules',
            IndexName: 'module_internal_name-index',
            KeyConditionExpression: '#module_internal_name = :module_internal_name',
            ExpressionAttributeNames: { '#module_internal_name': 'module_internal_name' },
            ExpressionAttributeValues: { ':module_internal_name': event.module_name.split(' ').join('').toUpperCase() },
        };
        let module = await query_dynamo_items(checkIfModuleExistsParams);
        if (module.Items.length == 0) {
            let newModuleParams = {
                Item: {
                    module_id: uuid(),
                    module_status: 'ACTIVE',
                    module_internal_name: event.module_name.split(' ').join('').toUpperCase(),
                    module_created_on: new Date().toISOString(),
                    module_name: event.module_name,
                    module_description: event.module_description,
                },
                TableName: 'prodev_modules',
                ConditionExpression: 'attribute_not_exists(module_id)',
                ReturnValues: 'ALL_OLD',
            };
            await insert_dynamo_item(newModuleParams);
            return {
                status: 'Success',
                Status_Message: 'Module Created Successfully!!'
            };
        }
        else {
            throw new Error("Module With Name: " + event.module_name + " Already Exists");
        }
    }
    else {
        throw new Error(" Admin not found");
    }
};

const list_modules = async (event) => {
    let listModulesParams = {
        TableName: "prodev_modules",
    };
    let modules = await scan_dynamo_items(listModulesParams);
    if (modules.Count > 0) {

        return {
            status: "Success",
            data: modules.Items
        };
    }
    else {
        throw new Error("No Modules to list");
    }
};

const update_module = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let checkIfModuleExistsParams = {
            TableName: 'prodev_modules',
            KeyConditionExpression: '#module_id = :module_id',
            ExpressionAttributeNames: { '#module_id': 'module_id' },
            ExpressionAttributeValues: { ':module_id': event.module_id },
        };
        let module = await query_dynamo_items(checkIfModuleExistsParams);
        if (module.Items.length > 0) {
            let UpdateExpression = 'set';
            let ExpressionAttributeNames = {};
            let ExpressionAttributeValues = {};
            for (const field in event) {
                if (field == "module_description" || field == "module_status") {
                    UpdateExpression += ` #${field} = :${field} ,`;
                    ExpressionAttributeNames['#' + field] = field;
                    ExpressionAttributeValues[':' + field] = event[field];
                }
                if (field == "module_name" && event.module_name.split(' ').join('').toUpperCase() != module.Items[0].module_internal_name) {
                    let checkIfRoleExistsParams = {
                        TableName: 'prodev_modules',
                        IndexName: 'module_internal_name-index',
                        KeyConditionExpression: '#module_internal_name = :module_internal_name',
                        ExpressionAttributeNames: { '#module_internal_name': 'module_internal_name' },
                        ExpressionAttributeValues: { ':module_internal_name': event.module_name.split(' ').join('').toUpperCase() },
                    };
                    let module = await query_dynamo_items(checkIfRoleExistsParams);
                    if (module.Items.length == 0) {
                        UpdateExpression += ` #${field} = :${field},#module_internal_name = :module_internal_name,`;
                        ExpressionAttributeNames['#module_internal_name'] = 'module_internal_name';
                        ExpressionAttributeValues[':module_internal_name'] = event.module_name.split(' ').join('').toUpperCase();
                        ExpressionAttributeNames['#' + field] = field;
                        ExpressionAttributeValues[':' + field] = event[field];
                    }
                    else {
                        throw new Error("Module With Name " + event.module_name + " Already Exists!!");
                    }
                }
            }
            if (UpdateExpression != 'set') {
                UpdateExpression = UpdateExpression.slice(0, -1);
                let updateModuleParams = {
                    TableName: "prodev_modules",
                    Key: {
                        module_id: event.module_id
                    },
                    UpdateExpression: UpdateExpression,
                    ExpressionAttributeNames: ExpressionAttributeNames,
                    ExpressionAttributeValues: ExpressionAttributeValues,
                    ReturnValues: "UPDATED_NEW"
                };
                await update_dynamo_item(updateModuleParams);
                return {
                    "status": "Success",
                    "Status_Message": "Updated Module Successfully!!"
                };
            }
            else {
                throw new Error("Nothing To Update!!!");
            }
        }
        else {
            throw new Error("Module not found!!!");
        }
    }
    else {
        throw new Error("No user Found..!");
    }
};

const delete_module = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let checkIfModuleExistsParams = {
            TableName: 'prodev_modules',
            KeyConditionExpression: '#module_id = :module_id',
            ExpressionAttributeNames: { '#module_id': 'module_id' },
            ExpressionAttributeValues: { ':module_id': event.module_id },
        };
        let module = await query_dynamo_items(checkIfModuleExistsParams);
        if (module.Items.length > 0) {
            let deleteModuleParams = {
                TableName: "prodev_modules",
                Key: {
                    module_id: event.module_id,
                },
            };
            await delete_dynamo_item(deleteModuleParams);
            return {
                status: "Success",
                status_message: "Module  deleted successfully!!",
            };
        }
        else {
            throw new Error(`Module with ID ${event.module_id} Not Found!!`);
        }
    }
    else {
        throw new Error("No Role Found..!");
    }
};

//================== DEVELOPER MANAGEMENT ===============//

const create_developer = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let admin = await query_dynamo_items(checkAdminParams);
    if (admin.Count > 0) {
        // let checkIfRoleExistParams = {    
        //     TableName: "prodev_roles",
        //     KeyConditionExpression: "role_id = :role_id",
        //     ExpressionAttributeValues: {
        //         ":role_id": event.developer_role_id,
        //     },
        // };
        // let role = await query_dynamo_items(checkIfRoleExistParams);
        // if (role.Count > 0) {
        let checkIfDeveloperExistParams = {
            TableName: "prodev_developers",
            IndexName: "developer_email_id-index",
            KeyConditionExpression: "developer_email_id = :developer_email_id",
            ExpressionAttributeValues: {
                ":developer_email_id": event.developer_email_id,
            },
        };
        let developer = await query_dynamo_items(checkIfDeveloperExistParams);
        if (developer.Count == 0) {
            let CreateDeveloperParams = {
                TableName: "prodev_developers",
                Item: {
                    developer_id: uuid(),
                    // developer_role_id: role.Items[0].role_id,
                    developer_role: event.developer_role,
                    developer_email_id: event.developer_email_id.toLowerCase(),
                    developer_name: event.developer_name,
                    developer_phone_no: event.developer_phone_no,
                    developer_status: "ACTIVE",
                    developer_created_on: new Date().getTime(),
                    developer_projects: [],
                    no_of_projects: 0,
                    module_type: "DEVELOPER",
                },
                ConditionExpression: "attribute_not_exists(developer_email_id)",
                ReturnValues: "ALL_OLD",
            };
            await insert_dynamo_item(CreateDeveloperParams);
            const cognitoparams = {
                UserPoolId: "ap-south-1_FXkGFyTqW",
                Username: event.developer_email_id,
                UserAttributes: [{
                    Name: "email",
                    Value: event.developer_email_id,
                }, ],
                TemporaryPassword: "Dev@1234",
            };
            await create_cognito(cognitoparams);
            return "Developer created and email invite sent!!";
        }
        else {
            throw new Error("Developer Already Exists");
        }
        // }
        // else {
        //     throw new Error("Role Not Exists");
        // }
    }
    else {
        throw new Error(" Admin not found");
    }

};

const list_developer = async (event) => {
    let listDevelopersParams = {
        TableName: "prodev_developers",
    };
    let developers = await scan_dynamo_items(listDevelopersParams);
    if (developers.Count > 0) {

        return {
            status: "Success",
            data: developers.Items
        };
    }
    else {
        throw new Error("No developers to list");
    }
};

const list_developer_names = async (event) => {
    let listDevelopersNamesParams = {
        TableName: "prodev_developers",
    };

    let developers = await scan_dynamo_items(listDevelopersNamesParams);

    if (developers.Count > 0) {
        const developerNames = developers.Items.map(item => ({
            developer_name: item.developer_name,
            developer_id: item.developer_id
        }));
        console.log("developerNames", developerNames);
        return {
            status: "Success",
            data: developerNames,
        };
    }
    else {
        throw new Error("No developers to list");
    }
};

const update_developer = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let checkDeveloperExistsParams = {
            TableName: "prodev_developers",
            KeyConditionExpression: "developer_id = :developer_id",
            ExpressionAttributeValues: {
                ":developer_id": event.developer_id,
            },
        };
        let developer = await query_dynamo_items(checkDeveloperExistsParams);
        if (developer.Count > 0) {
            let UpdateExpression = 'set';
            let ExpressionAttributeNames = {};
            let ExpressionAttributeValues = {};
            for (const field in event) {
                if (field == "developer_name" || field == "developer_role" || field == "developer_status" || field == "developer_phone_no") {
                    UpdateExpression += ` #${field} = :${field} ,`;
                    ExpressionAttributeNames['#' + field] = field;
                    ExpressionAttributeValues[':' + field] = event[field];
                }
                // if (field == "developer_role_id") {
                //     let checkIfRoleExistsParams = {
                //         TableName: 'prodev_roles',
                //         KeyConditionExpression: '#role_id = :role_id',
                //         ExpressionAttributeNames: { '#role_id': 'role_id' },
                //         ExpressionAttributeValues: { ':role_id': event.developer_role_id },
                //     };
                //     let role = await query_dynamo_items(checkIfRoleExistsParams);
                //     if (role.Items.length > 0) {
                //         UpdateExpression += ` #${field} = :${field} ,`;
                //         ExpressionAttributeNames['#' + field] = field;
                //         ExpressionAttributeValues[':' + field] = event[field];
                //     }
                //     else {
                //         throw new Error("Role With ID " + event.developer_role_id + " Not Exists!!");
                //     }
                // }
            }
            if (UpdateExpression != 'set') {
                UpdateExpression = UpdateExpression.slice(0, -1);
                let updateRoleParams = {
                    TableName: "prodev_developers",
                    Key: {
                        developer_id: event.developer_id,
                    },
                    UpdateExpression: UpdateExpression,
                    ExpressionAttributeNames: ExpressionAttributeNames,
                    ExpressionAttributeValues: ExpressionAttributeValues,
                    ReturnValues: "UPDATED_NEW"
                };
                await update_dynamo_item(updateRoleParams);
                if (event.developer_status !== "ACTIVE") {
                    let disableCognitoUserParams = {
                        UserPoolId: "ap-south-1_FXkGFyTqW",
                        Username: developer.Items[0].developer_email_id
                    };
                    await disable_cognitoUser(disableCognitoUserParams);
                }
                return {
                    "status": "Success",
                    "Status_Message": "Updated Developer Successfully!!"
                };
            }
            else {
                throw new Error("Nothing To Update!!!");
            }
        }
        else {
            throw new Error(`Developer with ID ${event.developer_id} Not Found!!`);
        }
    }
    else {
        throw new Error("No User Found..!");
    }
};

const delete_developer = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let checkDeveloperExistsParams = {
            TableName: "prodev_developers",
            KeyConditionExpression: "developer_id = :developer_id",
            ExpressionAttributeValues: {
                ":developer_id": event.developer_id,
            },
        };
        let developer = await query_dynamo_items(checkDeveloperExistsParams);
        console.log("developer", developer);
        if (developer.Count > 0) {
            
            if(developer.Items[0].module_type !== "ADMIN"){
            let deleteDeveloperParams = {
                TableName: "prodev_developers",
                Key: {
                    developer_id: event.developer_id,
                },
            };
            await delete_dynamo_item(deleteDeveloperParams);
            let cognitoDeleteParams = {
                UserPoolId: "ap-south-1_FXkGFyTqW",
                Username: developer.Items[0].developer_email_id,
            };
            await delete_cognito(cognitoDeleteParams);
            return {
                status: "Success",
                status_message: "Developer deleted successfully!!",
            };
            }
        else {
            throw new Error(`Developer with ID ${event.developer_id} is Admin Developer can't delete !!`);
        }
        }
        else {
            throw new Error(`Developer with ID ${event.developer_id} Not Found!!`);
        }
    }
    else {
        throw new Error("No user Found..!");
    }
};


//================== PROJECT MANAGEMENT ===============//

const create_project = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let admin = await query_dynamo_items(checkAdminParams);
    if (admin.Count > 0) {
        //const ProjectId = uuid();
        let checkProjectParams = {
            TableName: "prodev_projects",
            IndexName: "internal_project_name-index",
            KeyConditionExpression: "internal_project_name = :internal_project_name",
            ExpressionAttributeValues: {
                ":internal_project_name": event.project_name.split(' ').join().toLowerCase(),
            },
        };
        let project = await query_dynamo_items(checkProjectParams);
        if (project.Count == 0) {
            let createProjectParams = {
                TableName: "prodev_projects",
                Item: {
                    project_id: uuid(),
                    project_name: event.project_name,
                    internal_project_name: event.project_name.split(' ').join().toLowerCase(),
                    project_description: event.project_description,
                    project_secret_key: event.project_secret_key,
                    project_access_key: event.project_access_key,
                    //project_bucket_name: event.project_bucket_name,  //split(' ').join().toLowerCase(),
                    project_region_name: event.project_region_name,
                    //project_module_type: event.project_module_type,
                    project_status: "ACTIVE",
                    project_created_on: new Date().getTime(),
                    project_developers: [],
                    no_of_developers: 0
                }
            };

            let response = await create_bucket_for_project(event);
            if (response == 'SUCCESS') {
                createProjectParams.Item.project_bucket_name = event.project_bucket_name.split(' ').join().toLowerCase();
                await insert_dynamo_item(createProjectParams);
                return "Project created successfully...!";
            }
            else {
                // console.log("Response :", );
                throw new Error(response["message"]);
            }

            // let config = {
            //     //Bucket: event.project_bucket_name.split(' ').join().toLowerCase(),
            //     secretAccessKey: event.project_secret_key,
            //     accessKeyId:event.project_access_key,
            //     region: event.project_region_name,
            // };

        }
        else {
            throw new Error("Project with name" + event.project_name + "already exist");
        }
    }
    else {
        throw new Error(" Admin not found");
    }
};

const list_projects = async (event) => {
    let listProjectParams = {
        TableName: "prodev_projects",
    };
    let projects = await scan_dynamo_items(listProjectParams);
    if (projects.Count > 0) {

        return {
            status: "Success",
            data: projects.Items
        };
    }
    else {
        throw new Error("No Projects to list");
    }
};

const update_project = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let updateProjectParams = {
            TableName: "prodev_projects",
            Key: {
                project_id: event.project_id,
            },
            UpdateExpression: "SET  project_description = :project_description ",
            ExpressionAttributeValues: {
                //":project_name": event.project_name,
                ":project_description": event.project_description,
            },
        };
        await update_dynamo_item(updateProjectParams);
        return {
            status: "Success",
            status_message: "Project updated successfully..!!",
        };
    }
    else {
        throw new Error("No user Found..!");
    }
};

const delete_project = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let checkProjectExistsParams = {
            TableName: "prodev_projects",
            KeyConditionExpression: "project_id = :project_id",
            ExpressionAttributeValues: {
                ":project_id": event.project_id,
            },
        };
        let projectDetails = await query_dynamo_items(checkProjectExistsParams);
        console.log("projectDetails", projectDetails);
        if (projectDetails.Count > 0) {
            let deleteProjectParams = {
                TableName: "prodev_projects",
                Key: {
                    project_id: event.project_id,
                },
            };
            await delete_dynamo_item(deleteProjectParams);
            await delete_S3_project_bucket(projectDetails);
            return {
                status: "Success",
                status_message: "Project  deleted successfully!!",
            };
        }
        else {
            throw new Error(`Project with ID ${event.project_id} Not Found!!`);
        }
    }
    else {
        throw new Error("No user Found..!");
    }
};


//================== ASSIGN PROJECTS MANAGEMENT ===============//

const assign_project_to_developer = async (event) => {

    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let admin = await query_dynamo_items(checkAdminParams);
    if (admin.Count > 0) {
        let checkDeveloperExistsParams = {
            TableName: "prodev_developers",
            KeyConditionExpression: "developer_id = :developer_id",
            ExpressionAttributeValues: {
                ":developer_id": event.developer_id,
            },
        };
        let developer = await query_dynamo_items(checkDeveloperExistsParams);
        if (developer.Count > 0) {
            let checkProjectExistsParams = {
                TableName: "prodev_projects",
                KeyConditionExpression: "project_id = :project_id",
                ExpressionAttributeValues: {
                    ":project_id": event.project_id,
                },
            };
            let projectDetails = await query_dynamo_items(checkProjectExistsParams);
            console.log("projectDetails", projectDetails);
            if (projectDetails.Count > 0) {
                let project_assigned = {
                    project_id: projectDetails.Items[0].project_id,
                    project_name: projectDetails.Items[0].project_name
                };
                console.log("project_assigned", project_assigned);
                let updateDeveloperDetailsParams = {
                    TableName: "prodev_developers",
                    Key: {
                        developer_id: event.developer_id,
                    },
                    UpdateExpression: "ADD no_of_projects :no_of_projects SET developer_projects = list_append(developer_projects, :project_assigned)",
                    ExpressionAttributeValues: {
                        ":no_of_projects": +1,
                        ":project_assigned": [project_assigned],
                    },
                };
                await update_dynamo_item(updateDeveloperDetailsParams);
                let developer_assigned = {
                    developer_id: event.developer_id,
                    developer_name: developer.Items[0].developer_name,
                };
                let updateDevelopertoProject = {
                    TableName: "prodev_projects",
                    Key: {
                        project_id: event.project_id,
                    },
                    UpdateExpression: "ADD no_of_developers :no_of_developers SET project_developers = list_append(project_developers, :developer_assigned)",
                    ExpressionAttributeValues: {
                        ":no_of_developers": +1,
                        ":developer_assigned": [developer_assigned],
                    },
                };
                await update_dynamo_item(updateDevelopertoProject);
                return {
                    status: "Success",
                    status_message: " Developer added to Project successfully !!",
                };
            }
            else {
                throw new Error("No Project  Exists");
            }
        }
        else {
            throw new Error("No Developer Exists");
        }
    }
    else {
        throw new Error(" Admin not found");
    }

};


const assign_project_to_developers = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let admin = await query_dynamo_items(checkAdminParams);
    if (admin.Count > 0) {
        let checkProjectExistsParams = {
            TableName: "prodev_projects",
            KeyConditionExpression: "project_id = :project_id",
            ExpressionAttributeValues: {
                ":project_id": event.project_id,
            },
        };
        let projectDetails = await query_dynamo_items(checkProjectExistsParams);
        console.log("projectDetails", projectDetails);
        if (projectDetails.Count > 0) {
            let developerID;
            let proceed = true;
            for (var i = 0; i < event.developerDetails.length; i++) {
                let checkDeveloperExistsParams = {
                    TableName: "prodev_developers",
                    KeyConditionExpression: "developer_id = :developer_id",
                    ExpressionAttributeValues: {
                        ":developer_id": event.developerDetails[i].developer_id,
                    },
                };
                let developer = await query_dynamo_items(checkDeveloperExistsParams);
                if (developer.Count > 0) {
                    proceed = true;
                }
                else {
                    proceed = false;
                    developerID = event.developerDetails[i].developer_id;
                    break;
                }
            }
            if (proceed) {
                let project_assigned = {
                    project_id: projectDetails.Items[0].project_id,
                    project_name: projectDetails.Items[0].project_name
                };
                console.log("project_assigned", project_assigned);
                for (var i = 0; i < event.developerDetails.length; i++) {
                    let checkDeveloperExistsParams = {
                        TableName: "prodev_developers",
                        KeyConditionExpression: "developer_id = :developer_id",
                        ExpressionAttributeValues: {
                            ":developer_id": event.developerDetails[i].developer_id,
                        },
                    };
                    let developer = await query_dynamo_items(checkDeveloperExistsParams);
                    let updateDeveloperDetailsParams = {
                        TableName: "prodev_developers",
                        Key: {
                            developer_id: developer.Items[0].developer_id,
                        },
                        UpdateExpression: "ADD no_of_projects :no_of_projects SET developer_projects = list_append(developer_projects, :project_assigned)",
                        ExpressionAttributeValues: {
                            ":no_of_projects": +1,
                            ":project_assigned": [project_assigned],
                        },
                    };
                    await update_dynamo_item(updateDeveloperDetailsParams);
                    let developer_assigned = {
                        developer_id: developer.Items[0].developer_id,
                        developer_name: developer.Items[0].developer_name,
                    };
                    let updateDevelopertoProject = {
                        TableName: "prodev_projects",
                        Key: {
                            project_id: projectDetails.Items[0].project_id,
                        },
                        UpdateExpression: "SET project_developers = list_append(project_developers, :developer_assigned)",
                        ExpressionAttributeValues: {
                            ":developer_assigned": [developer_assigned],
                        },
                    };
                    await update_dynamo_item(updateDevelopertoProject);
                }
                let updateDevelopertoProject = {
                    TableName: "prodev_projects",
                    Key: {
                        project_id: projectDetails.Items[0].project_id,
                    },
                    UpdateExpression: "ADD no_of_developers :no_of_developers",
                    ExpressionAttributeValues: {
                        ":no_of_developers": event.developerDetails.length,
                    },
                };
                await update_dynamo_item(updateDevelopertoProject);
                return {
                    status: "Success",
                    status_message: " Developer added to Project successfully !!",
                };
            }
            else {
                throw new Error(`Developer with ID ${developerID} Not Exists`);
            }

        }
        else {
            throw new Error("No Project  Exists");
        }
    }
    else {
        throw new Error(" Admin not found");
    }

};


const remove_developer_from_project = async (event) => {

    // Check if event object is defined and has developer_id property
    if (!event || !event.developer_id) {
        throw new Error("Invalid or missing developer_id in the event object");
    }

    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let admin = await query_dynamo_items(checkAdminParams);

    if (admin.Count > 0) {
        let checkDeveloperExistsParams = {
            TableName: "prodev_developers",
            KeyConditionExpression: "developer_id = :developer_id",
            ExpressionAttributeValues: {
                ":developer_id": event.developer_id,
            },
        };
        let developer = await query_dynamo_items(checkDeveloperExistsParams);

        if (developer.Count > 0) {
            let checkProjectExistsParams = {
                TableName: "prodev_projects",
                KeyConditionExpression: "project_id = :project_id",
                ExpressionAttributeValues: {
                    ":project_id": event.project_id,
                },
            };
            let projectDetails = await query_dynamo_items(checkProjectExistsParams);

            console.log("projectDetails", projectDetails);

            if (projectDetails.Count > 0 && projectDetails.Items[0].project_id) {
                let project_to_remove = {
                    project_id: developer.Items[0].project_id,
                    project_name: developer.Items[0].project_name
                };

                let developerProjectsArray = developer.Items[0].project_developers || [];
                console.log("developerProjectsArray is:", developerProjectsArray);
                console.log("project_to_remove is:", project_to_remove);

                let projectArrayOfDeveloper = developerProjectsArray.filter(obj => obj.project_id !== project_to_remove.project_id);

                let updateDeveloperDetailsParams = {
                    TableName: "prodev_developers",
                    Key: {
                        developer_id: event.developer_id,
                    },
                    UpdateExpression: "ADD no_of_projects :no_of_projects SET developer_projects = :projectArrayOfDeveloper",
                    ExpressionAttributeValues: {
                        ":no_of_projects": -1,
                        ":projectArrayOfDeveloper": projectArrayOfDeveloper,
                    },
                };

                await update_dynamo_item(updateDeveloperDetailsParams);
                let developer_to_remove = {
                    developer_id: projectDetails.Items[0].developer_id,
                    developer_name: projectDetails.Items[0].developer_name,
                };
                let projectDeveloperArray = projectDetails.Items[0].developer_projects || [];
                let newArrayOfDevelopersOfProject = projectDeveloperArray.filter(obj => obj.developer_id !== developer_to_remove.developer_id);

                let updateDevelopertoProject = {
                    TableName: "prodev_projects",
                    Key: {
                        project_id: event.project_id,
                    },
                    UpdateExpression: "ADD no_of_developers :no_of_developers SET project_developers = :newArrayOfDevelopersOfProject",
                    ExpressionAttributeValues: {
                        ":no_of_developers": -1,
                        ":newArrayOfDevelopersOfProject": newArrayOfDevelopersOfProject,
                    },
                };

                await update_dynamo_item(updateDevelopertoProject);

                return {
                    status: "Success",
                    status_message: "Developer removed from Project successfully!",
                };
            }
            else {
                throw new Error("No Project Exists or Project ID is undefined");
            }
        }
        else {
            throw new Error("No Developer Exists");
        }
    }
    else {
        throw new Error("Admin not found");
    }
};


const remove_developer_from_projectS = async (event) => {

    // Check if event object is defined and has developer_id property
    if (!event || !event.developer_id) {
        throw new Error("Invalid or missing developer_id in the event object");
    }

    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let admin = await query_dynamo_items(checkAdminParams);

    if (admin.Count > 0) {
        let checkDeveloperExistsParams = {
            TableName: "prodev_developers",
            KeyConditionExpression: "developer_id = :developer_id",
            ExpressionAttributeValues: {
                ":developer_id": event.developer_id,
            },
        };
        let developer = await query_dynamo_items(checkDeveloperExistsParams);

        if (developer.Count > 0) {
            let checkProjectExistsParams = {
                TableName: "prodev_projects",
                KeyConditionExpression: "project_id = :project_id",
                ExpressionAttributeValues: {
                    ":project_id": event.project_id,
                },
            };
            let projectDetails = await query_dynamo_items(checkProjectExistsParams);

            console.log("projectDetails", projectDetails);

            if (projectDetails.Count > 0 && projectDetails.Items[0].project_id) {
                let project_to_remove = {
                    project_id: developer.Items[0].project_id,
                    project_name: developer.Items[0].project_name
                };

                let developerProjectsArray = developer.Items[0].project_developers || [];
                console.log("developerProjectsArray is:", developerProjectsArray);
                console.log("project_to_remove is:", project_to_remove);

                let projectArrayOfDeveloper = developerProjectsArray.filter(obj => obj.project_id !== project_to_remove.project_id);

                let updateDeveloperDetailsParams = {
                    TableName: "prodev_developers",
                    Key: {
                        developer_id: event.developer_id,
                    },
                    UpdateExpression: "ADD no_of_projects :no_of_projects SET developer_projects = :projectArrayOfDeveloper",
                    ExpressionAttributeValues: {
                        ":no_of_projects": -1,
                        ":projectArrayOfDeveloper": projectArrayOfDeveloper,
                    },
                };

                await update_dynamo_item(updateDeveloperDetailsParams);
                let developer_to_remove = {
                    developer_id: event.developer_id,
                    developer_name: projectDetails.Items[0].developer_name,
                };
                let projectDeveloperArray = projectDetails.Items[0].developer_projects || [];
                let newArrayOfDevelopersOfProject = projectDeveloperArray.filter(obj => obj.developer_id !== developer_to_remove.developer_id);

                let updateDevelopertoProject = {
                    TableName: "prodev_projects",
                    Key: {
                        project_id: event.project_id,
                    },
                    UpdateExpression: "ADD no_of_developers :no_of_developers SET project_developers = :newArrayOfDevelopersOfProject",
                    ExpressionAttributeValues: {
                        ":no_of_developers": -1,
                        ":newArrayOfDevelopersOfProject": newArrayOfDevelopersOfProject,
                    },
                };

                await update_dynamo_item(updateDevelopertoProject);

                return {
                    status: "Success",
                    status_message: "Developer removed from Project successfully!",
                };
            }
            else {
                throw new Error("No Project Exists or Project ID is undefined");
            }
        }
        else {
            throw new Error("No Developer Exists");
        }
    }
    else {
        throw new Error("Admin not found");
    }
};


//================== ACTIVATE-DEACTIVATE COGNITO  MANAGEMENT ===============//

const activate_admin_cognito = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let checkAdminToActivateExistsParams = {
            TableName: "prodev_admins",
            KeyConditionExpression: "user_email_id = :user_email_id",
            ExpressionAttributeValues: {
                ":user_email_id": event.user_email_id,
            },
        };
        let adminToActivate = await query_dynamo_items(checkAdminToActivateExistsParams);
        console.log("adminToActivate", adminToActivate);
        if (adminToActivate.Count > 0) {
            let EnableParams = {
                UserPoolId: "ap-south-1_2XGZBpeP7",
                Username: event.user_email_id
            };

            await enable_cognitoUser(EnableParams);
            //Update in users table Userstatus to ACTIVE
            let adminStatusParams = {
                TableName: "prodev_admins",
                Key: {
                    user_email_id: event.user_email_id,
                },
                UpdateExpression: "SET user_status = :user_status",
                ExpressionAttributeValues: {
                    ":user_status": "ACTIVE",
                },
            };
            console.log(" active account id is: ", event.user_email_id);
            await update_dynamo_item(adminStatusParams);
            return {
                status: "Success",
                status_message: " Admin Cognito Enabled successfully !!",
            };
        }
        else {
            throw new Error(`Admin with ID ${event.user_email_id} Not Found!!`);
        }
    }
    else {
        throw new Error("No user Found..!");
    }
};

const deactivate_admin_cognito = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let checkAdminToDeactivateExistsParams = {
            TableName: "prodev_admins",
            KeyConditionExpression: "user_email_id = :user_email_id",
            ExpressionAttributeValues: {
                ":user_email_id": event.user_email_id,
            },
        };
        let admintodeactivate = await query_dynamo_items(checkAdminToDeactivateExistsParams);
        console.log("admintodeactivate", admintodeactivate);
        if (admintodeactivate.Count > 0) {
            let disableCognitoAdminParams = {
                UserPoolId: "ap-south-1_2XGZBpeP7",
                Username: event.user_email_id
            };
            await disable_cognitoUser(disableCognitoAdminParams);
            let adminDeactivateStatusParams = {
                TableName: "prodev_admins",
                Key: {
                    user_email_id: event.user_email_id,
                },
                UpdateExpression: "SET user_status = :user_status",
                ExpressionAttributeValues: {
                    ":user_status": "INACTIVE",
                },
            };
            console.log(" active account id is: ", admintodeactivate.Items[0].user_email_id);
            await update_dynamo_item(adminDeactivateStatusParams);
            return {
                status: "Success",
                status_message: " Admin Cognito Disabled successfully !!",
            };
        }
        else {
            throw new Error(`Admin with ID ${event.user_email_id} Not Found!!`);
        }
    }
    else {
        throw new Error("No user Found..!");
    }
};


const activate_developer_cognito = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let checkDeveloperExistsParams = {
            TableName: "prodev_developers",
            KeyConditionExpression: "developer_id = :developer_id",
            ExpressionAttributeValues: {
                ":developer_id": event.developer_id,
            },
        };
        let developer = await query_dynamo_items(checkDeveloperExistsParams);
        console.log("developer", developer);
        if (developer.Count > 0) {
            let EnableParams = {
                UserPoolId: "ap-south-1_FXkGFyTqW",
                Username: developer.Items[0].developer_email_id
            };

            await enable_cognitoUser(EnableParams);
            //Update in users table Userstatus to ACTIVE
            let developerStatusParams = {
                TableName: "prodev_developers",
                Key: {
                    developer_id: event.developer_id,
                },
                UpdateExpression: "SET developer_status = :developer_status",
                ExpressionAttributeValues: {
                    ":developer_status": "ACTIVE",
                },
            };
            console.log(" active account id is: ", event.Email_id);
            await update_dynamo_item(developerStatusParams);
            return {
                status: "Success",
                status_message: " Developer Cognito Enabled successfully !!",
            };
        }
        else {
            throw new Error(`Developer with ID ${event.developer_id} Not Found!!`);
        }
    }
    else {
        throw new Error("No user Found..!");
    }
};

const deactivate_developer_cognito = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let checkDeveloperExistsParams = {
            TableName: "prodev_developers",
            KeyConditionExpression: "developer_id = :developer_id",
            ExpressionAttributeValues: {
                ":developer_id": event.developer_id,
            },
        };
        let developer = await query_dynamo_items(checkDeveloperExistsParams);
        console.log("developer", developer);
        if (developer.Count > 0) {
            let disableCognitoUserParams = {
                UserPoolId: "ap-south-1_FXkGFyTqW",
                Username: developer.Items[0].developer_email_id
            };
            await disable_cognitoUser(disableCognitoUserParams);
            let developerStatusParams = {
                TableName: "prodev_developers",
                Key: {
                    developer_id: event.developer_id,
                },
                UpdateExpression: "SET developer_status = :developer_status",
                ExpressionAttributeValues: {
                    ":developer_status": "INACTIVE",
                },
            };
            console.log(" active account id is: ", developer.Items[0].developer_email_id);
            await update_dynamo_item(developerStatusParams);
            return {
                status: "Success",
                status_message: " Developer Cognito Disabled successfully !!",
            };
        }
        else {
            throw new Error(`Developer with ID ${event.developer_id} Not Found!!`);
        }
    }
    else {
        throw new Error("No user Found..!");
    }
};


// const list_developer_projects = async (event) => {
//     let checkIfDeveloperExistParams = {
//         TableName: "prodev_developers",
//         IndexName: "developer_email_id-index",
//         KeyConditionExpression: "developer_email_id = :developer_email_id",
//         ExpressionAttributeValues: {
//             ":developer_email_id": event.developer_email_id,
//         },
//     };
//     let developer = await query_dynamo_items(checkIfDeveloperExistParams);
//     let projectDetails = developer.Items[0].developer_projects;
//     let projectID = projectDetails[0]["project_id"];
//     let checkProjectExistsParams = {
//         TableName: "prodev_projects",
//         KeyConditionExpression: "project_id = :project_id",
//         ExpressionAttributeValues: {
//             ":project_id": projectID,
//         },
//     };
//     let projectsDeveloperDetails = await query_dynamo_items(checkProjectExistsParams);
//     console.log("projectsDeveloperDetails:", projectsDeveloperDetails);
//     if (projectsDeveloperDetails.Count > 0) {
//         let projects = projectsDeveloperDetails.Items.map(item => { return item });
//         console.log("projects", projects);
//         return {
//             status: "Success",
//             data: projects,
//         };
//     }
//     else {
//         throw new Error("No Projects to list");
//     }
// };

const list_developer_projects = async (event) => {
    try {
        let checkIfDeveloperExistParams = {
            TableName: "prodev_developers",
            IndexName: "developer_email_id-index",
            KeyConditionExpression: "developer_email_id = :developer_email_id",
            //FilterExpression: "developer_status = :developer_status",
            ExpressionAttributeValues: {
                ":developer_email_id": event.developer_email_id,
                //":developer_status":"ACTIVE"
            },
        };
        let developer = await query_dynamo_items(checkIfDeveloperExistParams);
        console.log("developer:", developer);

        let projectDetails = developer.Items[0].developer_projects;
        console.log("projectDetails", projectDetails);
        const projectResult = [];

        for (let i = 0; i < projectDetails.length; i++) {
            //for each item get id
            //with id [erform query
            let queryParams = {
                TableName: "prodev_projects",
                KeyConditionExpression: "project_id = :project_id",
                ExpressionAttributeValues: {
                    ":project_id": projectDetails[i]["project_id"]
                }
            };
            console.log("Find project params", queryParams);
            let result = await query_dynamo_items(queryParams);
            console.log("project result", result);
            if (result.Count == 0) {
                continue;
            }
            else {
                projectResult.push(result.Items[0]);
            }
        }
        console.log("Final result", projectResult);
        return Promise.resolve({
            status: "Success",
            data: projectResult
        });
    }
    catch (error) {
        return Promise.reject(error);
    }
};

const list_project_developers = async (event) => {
    try {
        let checkProjectExistsParams = {
            TableName: "prodev_projects",
            KeyConditionExpression: "project_id = :project_id",
            ExpressionAttributeValues: {
                ":project_id": event.project_id,
            },
        };

        let projectsDeveloperDetails = await query_dynamo_items(checkProjectExistsParams);
        console.log("projectsDeveloperDetails:", projectsDeveloperDetails);

        let developerDetails = projectsDeveloperDetails.Items[0].project_developers;
        console.log("developerDetails", developerDetails);
        const developerResult = [];

        for (let i = 0; i < developerDetails.length; i++) {
            //for each item get id
            //with id [erform query
            let queryParams = {
                TableName: "prodev_developers",
                KeyConditionExpression: "developer_id = :developer_id",
                ExpressionAttributeValues: {
                    ":developer_id": developerDetails[i]["developer_id"]
                }
            };
            console.log("Find dev params", queryParams);
            let result = await query_dynamo_items(queryParams);
            console.log("Dev result", result);
            if (result.Count == 0) {
                continue;
            }
            else {
                developerResult.push(result.Items[0]);
            }
        }
        console.log("Final result", developerResult);
        return Promise.resolve({
            status: "Success",
            data: developerResult
        });
    }
    catch (error) {
        return Promise.reject(error);
    }
};


//================== S3BUCKET-FOLDERS (Branches MANAGEMENT ===============//

const create_folder_s3_bucket = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let checkProjectExistsParams = {
            TableName: "prodev_projects",
            KeyConditionExpression: "project_id = :project_id",
            ExpressionAttributeValues: {
                ":project_id": event.project_id,
            },
        };
        let projectDetails = await query_dynamo_items(checkProjectExistsParams);
        console.log("projectDetails", projectDetails);
        if (projectDetails.Count > 0) {
            await create_s3bucket_project_folder(event, projectDetails);
            return {
                status: "Success",
                status_message: "Folder Created successfully!!",
            };
        }
        else {
            throw new Error(`Project with ID ${event.project_id} Not Found!!`);
        }
    }
    else {
        throw new Error("No user Found..!");
    }
};

const list_s3_bucket_folder = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let checkProjectExistsParams = {
            TableName: "prodev_projects",
            KeyConditionExpression: "project_id = :project_id",
            ExpressionAttributeValues: {
                ":project_id": event.project_id,
            },
        };
        let projectDetails = await query_dynamo_items(checkProjectExistsParams);
        console.log("projectDetails", projectDetails);

        if (projectDetails.Count > 0) {
            const listOfFolders = await list_bucket_folders(projectDetails);
            console.log("listOfFolders", listOfFolders);
            if (listOfFolders.CommonPrefixes) {
                const folders = listOfFolders.CommonPrefixes.map(prefix => {
                    // Remove trailing slash from the folder name
                    return prefix.Prefix.replace(/\/$/, '');
                });

                console.log("folder:", listOfFolders);

                console.log("CommonPrefixes :listOfFolders.CommonPrefixes");
                return {
                    status: "Success",
                    data: listOfFolders.CommonPrefixes,
                };
            }
            else {
                throw new Error(`Currently there are no folder in this project bucket!!`);
            }
        }
        else {
            throw new Error(`Project with ID ${event.project_id} Not Found!!`);
        }
    }
    else {
        throw new Error("No user Found..!");
    }
};

const delete_s3_bucket_folder = async (event) => {
    let checkAdminParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: "user_email_id = :user_email_id",
        FilterExpression: "user_status = :user_status",
        ExpressionAttributeValues: {
            ":user_email_id": event.admin_email_id,
            ":user_status": "ACTIVE",
        },
    };
    let adminDetails = await query_dynamo_items(checkAdminParams);
    console.log("adminDetails:", adminDetails);
    if (adminDetails.Count > 0) {
        let checkProjectExistsParams = {
            TableName: "prodev_projects",
            KeyConditionExpression: "project_id = :project_id",
            ExpressionAttributeValues: {
                ":project_id": event.project_id,
            },
        };
        let projectDetails = await query_dynamo_items(checkProjectExistsParams);
        console.log("projectDetails", projectDetails);

        if (projectDetails.Count > 0) {
            let deleteS3BucketFolderParams = {
                Bucket: projectDetails.Items[0].project_bucket_name,
                Delete: {
                    Objects: event.objects.map(({ Key }) => ({ Key }))
                }
            };
            console.log("deleteS3BucketFolderParams : ", deleteS3BucketFolderParams);
            await delete_s3_folder(deleteS3BucketFolderParams);
            return {
                status: "Success",
                status_message: `S3 Bucket Folder has been deleted successfully`,
            };
        }
        else {
            throw new Error(`Project with ID ${event.project_id} Not Found!!`);
        }
    }
    else {
        throw new Error("No user Found..!");
    }
};


const get_current_user = async (event) => {
    let getCurrentParams = {
        TableName: "prodev_admins",
        KeyConditionExpression: 'user_email_id =:user_email_id',
        ExpressionAttributeValues: {
            ':user_email_id': event.user_email_id,
        },
    };
    let admins = await query_dynamo_items(getCurrentParams);
    if (admins.Count > 0) {
        return {
            status: "Success",
            data: admins.Items
        };
    }
    else {
        throw new Error("No Admins to list");
    }
};


export const handler = async (event) => {
    // TODO implement
    console.log(JSON.stringify(event));
    switch (event.command) {

        //===========ADMIN MANAGEMENT===============//

        case 'createAdmin':
            return await create_admin(event);

        case 'listAdmins':
            return await list_admins(event);

        case 'updateAdmin':
            return await update_admin(event);

        case 'deleteAdmin':
            return await delete_admin(event);

            //=========DEVELOPER MANAGEMENT=========//

        case 'createDeveloper':
            return await create_developer(event);

        case 'listDeveloper':
            return await list_developer(event);

        case 'updateDeveloper':
            return await update_developer(event);

        case 'deleteDeveloper':
            return await delete_developer(event);

            //==========PROJECT MANAGEMENT===============//

        case 'createProject':
            return await create_project(event);

        case 'listProject':
            return await list_projects(event);

        case 'updateProject':
            return await update_project(event);

        case 'deleteProject':
            return await delete_project(event);

            //============PROJECT ASSIGNEMENT=================//

        case 'assignProjectTodeveloper':
            return await assign_project_to_developer(event);

        case 'assignProjectTodevelopers':
            return await assign_project_to_developers(event);

        case 'removeDeveloperFromProject':
            return await remove_developer_from_project(event);

        case 'enableDeveloperCognito':
            return await activate_developer_cognito(event);

        case 'disableDeveloperCognito':
            return await deactivate_developer_cognito(event);

        case 'enableAdminCognito':
            return await activate_admin_cognito(event);

        case 'disableAdminCognito':
            return await deactivate_admin_cognito(event);

        case 'listDeveloperProjects':
            return await list_developer_projects(event);

        case 'listDevelopersNames':
            return await list_developer_names(event);

        case 'listOfProjectDevelopers':
            return await list_project_developers(event);

            //=========S3 BUCKET MANAGEMENT===========//

        case 'createFolderInsideS3Bucket':
            return await create_folder_s3_bucket(event);

        case 'listFoldersOfS3Bucket':
            return await list_s3_bucket_folder(event);

        case 'deleteFolderOfS3Bucket':
            return await delete_s3_bucket_folder(event);

            //=========ROLE MANAGEMENT===========//

        case 'createRole':
            return await create_role(event);

        case 'listRole':
            return await list_role(event);

        case 'updateRole':
            return await update_role(event);

        case 'deletRole':
            return await delete_role(event);

            //=========MODULE MANAGEMENT===========//

        case 'createModule':
            return await create_module(event);

        case 'listmodules':
            return await list_modules(event);

        case 'updatemodule':
            return await update_module(event);

        case 'deletmodule':
            return await delete_module(event);


        case 'getCurrentUser':
            return await get_current_user(event);
    }
};









