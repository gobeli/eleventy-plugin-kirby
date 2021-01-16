import * as fs from "fs";
import deepmerge = require("deepmerge");
import fetch from "node-fetch";

export const ENDPOINT = `${process.env.API_KIRBYCMS_PATH}/api/query`;

export const PLACEHOLDER_IMAGE_SRC = "{{IMAGE_SRC}}";
export const PLACEHOLDER_IMAGE_SRCSET = "{{IMAGE_SRCSET}}";
export const DEFAULT_IMAGE_SRC = 1220;
export const DEFAULT_IMAGE_SRCSET = [312, 480, 768, 1024, 1220, 1440];

/**
 * Set these login credentials in your .env file
 */
const basicAuthCredentials = Buffer.from(
  `${process.env.API_KIRBYCMS_USER}:${process.env.API_KIRBYCMS_PASSWORD}`
).toString("base64");

/**
 * Default API fetch options required to get data from Kirby CMS
 */
export const defaultFetchOptions = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Basic ${basicAuthCredentials}`,
  },
};

export function loadQueryFromFile(absolutePath: string): object {
  const transforms = (queryStr) => {
    queryStr = queryStr.replace(PLACEHOLDER_IMAGE_SRC, DEFAULT_IMAGE_SRC);

    queryStr = queryStr.replace(
      PLACEHOLDER_IMAGE_SRCSET,
      `[${DEFAULT_IMAGE_SRCSET.join()}]`
    );

    return queryStr;
  };

  try {
    let queryFile = fs.readFileSync(absolutePath, "utf8");
    queryFile = transforms(queryFile);

    const query = JSON.parse(queryFile);

    return query;
  } catch (e) {
    throw new Error(e);
  }

  return {};
}

/**
 * Get a list of all pages including their children
 */
export async function getData(query, headers = {}) {
  console.log(`Querying ${ENDPOINT}`);
  if (headers !== {}) {
    console.log(headers);
  }

  // @ts-ignore
  const response = await fetch(ENDPOINT, {
    ...defaultFetchOptions,
    headers: {
      ...defaultFetchOptions.headers,
      ...headers,
    },
    body: JSON.stringify(query),
  });

  const json = await response.json();

  if (json.code !== 200) {
    console.error(json.code);
    console.error(json.message);
    console.error(json.exception);
    console.error(json.key);
  }

  return json.result;
}
