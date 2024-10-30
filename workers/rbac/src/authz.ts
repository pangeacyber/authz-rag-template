import { PangeaConfig, AuthZService } from "pangea-node-sdk";

const CheckAuthZ = async (env: any, category: string, user_id: string, pangea_token: string) => {
    try {
        console.log("guccigang")
        const token = pangea_token as string;
        const config = new PangeaConfig({ domain: "aws.us.pangea.cloud" });
    
        const authz = new AuthZService(token, config);
        console.log("guccigang2")
        console.log(category);
        const resp = await authz.check({
            resource: { type: category },
            action: 'read',
            subject: { type: 'user', id: user_id }
        });

        return resp.result.allowed;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export { CheckAuthZ }
