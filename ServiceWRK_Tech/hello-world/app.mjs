

export const lambdaHandler = async (event, context) => {
    try {
        return {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'Created ServiceWRK_Tech Lambda Function',
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }
};
