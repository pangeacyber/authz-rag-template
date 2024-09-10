import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { PangeaConfig, AuthZService, AuthZ, PangeaErrors } from "pangea-node-sdk";

const token = process.env.PANGEA_TOKEN as string;
const config = new PangeaConfig({ domain: process.env.PANGEA_DOMAIN });
const authz = new AuthZService(token, config);

type RequestBody = {
    filename: string;
    text: string;
    category: string[];
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
  ) {
    const resp = await axios.post(`${process.env.CF_WORKERS_HOST}/add-docs`, {
        filename: req.body.filename,
        text: req.body.text
    });

    let docId;
    console.log(resp.data);

    if(resp.status === 200) {
        docId = resp.data.id;

        try {
            const addedStatus = await addDocToCategory(docId, req.body.category);
            return res.status(200).json(addedStatus);
        } catch (err) {
            return res.status(502).json({"error": "adding AuthZ policies to doc failed."})
        }
    } else {
        return res.status(502).json({"error": "couldn't post document to cloudflare worker."})
    }
}

const addDocToCategory = async (documentId: string, category: string[]) => {
    let tupleRelations = [] as AuthZ.Tuple[];
    category.map(cat => {
        tupleRelations.push({
            "resource": {
              "type": "documents",
              "id": documentId.toString()
            },
            "subject": {
              "type": "category",
              "id": cat
            },
            "relation": "category"
        })
    })

    try {
        const resp = await authz.tupleCreate({
            tuples: tupleRelations
        });

        return resp.result;
    } catch (err) {
        if (err instanceof PangeaErrors.APIError) {
            console.log(err.toString());
        } else {
            throw err;
        }
    }
}