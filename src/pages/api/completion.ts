// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosResponse } from "axios";

import { PangeaConfig, AuthZService } from "pangea-node-sdk";

const token = process.env.PANGEA_TOKEN as string;
const config = new PangeaConfig({ domain: process.env.PANGEA_DOMAIN });




type ResponseData = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // if(req?.body?.messages) {
    // run("@cf/meta/llama-3-8b-instruct", {
    //     messages: [
    //       {
    //         role: "system",
    //         content: "You are a friendly assistan that helps write stories",
    //       },
    //       ...req.body.messages
    //     ],
    //     stream: false
    //   }).then((response) => {
    //     // console.log(JSON.stringify(response));
    //     console.log(response.result.response)
    //     res.status(200).send(response.result.response)
    //   }).catch(error => {
    //     console.error(error);
    //     res.status(501).json("Error with Cloudflare LLM");
    //   })
    if (req.headers["user-token"]) {
      const response: AxiosResponse = await axios.post("http://localhost:8787/chat", {
        messages: req.body.messages
      }, {
        headers: {
          "user-token": req.headers["user-token"] as string
        }
      }).catch(err => {
        console.error(err);
      });

      // let userIsAuthorized = true;
      // let unauthroziedDocs: string[] = [];
      // console.log(response.data.sources);
      // await Promise.all(response.data.sources.map(async sourceDocId => {
      //   console.log(sourceDocId)
      //     if(userIsAuthorized == true) {
      //       userIsAuthorized = await checkAuthZ(req.headers["user-token"] as string, sourceDocId)
      //       userIsAuthorized == false ? unauthroziedDocs.push(sourceDocId) : {}
      //     }
      // }))


      return res.status(200).send(response.data.text);
      // console.log(userIsAuthorized);
      // if (userIsAuthorized === true) {
        
      // } else {
      //   return res.status(200).send(`You are unauthorized to access documents: ${unauthroziedDocs}`)

      // }
    } else {
      res.status(304).json({error: "Unauthorized Access!"})
    }
  // }

  // res.status(400).json("Bad body")
}


const checkAuthZ = async (userId: string, docId) => {
  console.log(userId, docId)
  const authz = new AuthZService(token, config);
  console.log(userId, docId);

  const authZCheck = await authz.check({
    resource: { type: 'documents', id: docId.toString() },
    action: 'read',
    subject: {type: 'user', id: userId.toString()}
  })

  // console.log(authZCheck.result.allowed);

  return authZCheck.result.allowed;
}


type Messages = {
    messages: MessagesData[];
    maxTokens?: number;
    stream?: boolean;
}
type MessagesData = {
    role: "system" | "user";
    content: string;
}