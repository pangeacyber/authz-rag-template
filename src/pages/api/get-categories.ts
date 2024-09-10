import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { PangeaConfig, AuthZService } from "pangea-node-sdk";

const token = process.env.PANGEA_TOKEN as string;
const config = new PangeaConfig({ domain: process.env.PANGEA_DOMAIN });


export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
  ) {
    const categories = await getCategories();

    res.status(200).json(categories);
}

const getCategories = async () => {
    const authz = new AuthZService(token, config);

    let categoryList: Set<string> = new Set([]);

    const docCategory = await authz.tupleList({
        filter: {
            resource_type: "category"
        }
    })

    docCategory.result.tuples.map(tuple => {
        if(tuple.resource) {
            categoryList.add(tuple.resource.id as string);
        }
    })

    return Array.from(categoryList);
}