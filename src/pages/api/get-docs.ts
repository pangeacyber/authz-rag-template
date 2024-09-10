import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { PangeaConfig, AuthZService } from "pangea-node-sdk";

const token = process.env.PANGEA_TOKEN as string;
const config = new PangeaConfig({ domain: process.env.PANGEA_DOMAIN });


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
  ) {
    const resp = await axios.get(`https://${process.env.CF_WORKERS_HOST}/get-docs`);
    const documents = resp.data;

    await Promise.all(documents.map(async doc => {
        const docCategories = await getDocumentCategories(doc.id.toString());

        doc.category = docCategories;
    }))

    res.status(200).json(documents);
}

const getDocumentCategories = async (documentId: string) => {
    const authz = new AuthZService(token, config);

    let categoryList: string[] = [];

    const docCategory = await authz.tupleList({
        filter: {
            resource_type: "documents",
            resource_id: documentId
        }
    })

    docCategory.result.tuples.map(tuple => {
        if(tuple.subject) {
            categoryList.push(tuple.subject.id);
        }
    })

    return categoryList;
}