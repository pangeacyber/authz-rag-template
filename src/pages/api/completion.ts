// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios, { AxiosResponse } from "axios";

type ResponseData = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
    if (req.headers["user-token"] && req.body.messages) {
      const response: AxiosResponse = await axios.post(`${process.env.CF_WORKERS_HOST}/chat`, {
        messages: req.body.messages
      }, {
        headers: {
          "user-token": req.headers["user-token"] as string,
          "Authorization": `Bearer ${process.env.PANGEA_TOKEN}`
        }
      }).catch(err => {
        console.error(err);
      });

      return res.status(200).send(response.data.text);

    } else {
      res.status(304).json({error: "Unauthorized Access!"})
    }
  // }

  // res.status(400).json("Bad body")
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