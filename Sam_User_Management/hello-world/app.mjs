

export const lambdaHandler = async (event, context) => {
    try {
        return {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'Hi Lokesh New Lambda Function has been created Successfully..! checking in local test',
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }
};
