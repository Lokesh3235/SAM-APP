

export const lambdaHandler = async (event, context) => {
    try {
        return {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'Hello Lokesh Kumar Lambda Function has been created Successfully..!',
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }
};
